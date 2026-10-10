// 验证标签切换、认证清理及首页卸载后的延迟响应，不连接后端。
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const vue = require('vue')
const pinia = require('pinia')

function load(file, modules, exposed = '', globals = {}) {
  let source = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8')
  if (file.endsWith('.vue')) source = source.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]
  if (exposed) source += '\nexport const test = { ' + exposed + ' }'
  const output = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022
  } }).outputText
  const exports = {}
  vm.runInNewContext(output, { exports, require: name => {
    if (!(name in modules)) throw new Error('Missing module: ' + name)
    return modules[name]
  }, ...globals })
  return exports
}
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const tick = () => new Promise(resolve => setImmediate(resolve))

async function validateTags() {
  const route = { path: '/tag/articles', query: { tag: 'old' } }
  const requests = []
  let changed, unmount
  const page = load('src/views/TagArticles.vue', {
    vue: { ...vue, watch: (source, callback) => {
      changed = () => callback(source())
      changed()
    }, onUnmounted: callback => { unmount = callback } },
    'vue-router': { useRoute: () => route, useRouter: () => ({ push() {}, replace() {} }) },
    '@/api/article': { getArticleList: params => {
      const request = { ...deferred(), params }; requests.push(request); return request.promise
    } },
    '@/utils/format': { formatTimestamp() {} },
    '@/utils/latestRequest': load('src/utils/latestRequest.ts', {}),
    '@/utils/requestError': { showRequestError() {} },
    'element-plus/es/components/message/index': { ElMessage: { warning() {} } }
  }, 'tagName, articles, currentPage, loading, handlePageChange', {
    window: { scrollTo() {} }
  }).test
  page.handlePageChange(3)
  route.query.tag = 'new'; changed()
  assert.equal(page.tagName.value, 'new')
  assert.equal(page.currentPage.value, 1)
  assert.equal(requests[2].params.articleTag, 'new')
  assert.equal(requests[2].params.pageNo, 1)
  requests[0].resolve({ list: [{ id: 1 }], total: 1 }); await tick()
  assert.equal(page.loading.value, true)
  assert.equal(page.articles.value.length, 0)
  requests[2].resolve({ list: [{ id: 2 }], total: 1 }); await tick()
  requests[1].resolve({ list: [{ id: 3 }], total: 1 }); await tick()
  assert.equal(page.articles.value[0].id, 2)
  page.handlePageChange(2)
  unmount()
  requests[3].resolve({ list: [{ id: 4 }], total: 1 }); await tick()
  assert.equal(page.articles.value[0].id, 2)
}

async function validateAuth() {
  pinia.setActivePinia(pinia.createPinia())
  const storage = new Map()
  let failProfile = false, emptyToken = false
  const store = load('src/stores/user.ts', {
    vue, pinia,
    '@/utils/requestError': { showRequestError() {} },
    'element-plus/es/components/message/index': { ElMessage: { success() {} } },
    '@/utils/token': { parseToken: () => '' },
    '@/api/article': {
      login: async () => ({ accessToken: emptyToken ? '' : 'valid' }),
      getUserInfo: async () => {
        if (failProfile) throw new Error('profile unavailable')
        return { id: 1, username: 'author' }
      },
      logout: async () => { throw new Error('offline') }
    }
  }, '', { localStorage: {
    getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key)
  } }).useUserStore()
  const checkCleared = () => {
    assert.equal(store.user, null)
    assert.equal(store.token, '')
    assert.equal(store.isLoggedIn, false)
    assert.equal(storage.has('ACCESS_TOKEN'), false)
    assert.equal(storage.has('user'), false)
  }
  assert.equal(await store.login('author', 'password'), true)
  assert.equal(store.isLoggedIn, true)
  failProfile = true
  assert.equal(await store.login('author', 'password'), false)
  checkCleared()
  failProfile = false; emptyToken = true
  assert.equal(await store.login('author', 'password'), false)
  checkCleared()
  emptyToken = false
  await store.login('author', 'password')
  store.clearAuth(); checkCleared()
  await store.login('author', 'password')
  await store.logout(); checkCleared()
}

function homeFixture() {
  let mount, unmount, idle
  const article = deferred(), tags = deferred()
  const timers = new Map()
  let nextTimer = 0, categoryCalls = 0, frames = 0
  const page = load('src/views/Home.vue', {
    vue: { ...vue, onMounted: callback => { mount = callback }, onUnmounted: callback => { unmount = callback } },
    'vue-router': { useRouter: () => ({ push() {} }) },
    '@/api/article': {
      getMonthArticleList: () => article.promise, getTagList: () => tags.promise,
      getCategoryList: async () => { categoryCalls++; return [] }, getNotificationList: async () => []
    },
    '@/utils/format': {}, '@element-plus/icons-vue': {},
    '@/utils/websiteConfig': { fetchWebsiteConfigWithCache: async () => ({}), useWebsiteConfigRefresh() {} },
    'element-plus/es/components/message/index': { ElMessage: {} }
  }, 'articles, tags', {
    window: { matchMedia: () => ({ matches: false }) },
    setTimeout: callback => { timers.set(++nextTimer, callback); return nextTimer },
    clearTimeout: id => timers.delete(id),
    requestIdleCallback: callback => { idle = callback; return 1 },
    cancelIdleCallback: () => { idle = null },
    requestAnimationFrame: () => ++frames, cancelAnimationFrame() {}
  }).test
  return { page, article, tags, timers, mount: () => mount(), unmount: () => unmount(),
    idle: () => idle(), categoryCalls: () => categoryCalls, frames: () => frames }
}
async function validateHome() {
  const early = homeFixture()
  const mounted = early.mount()
  early.unmount()
  early.article.resolve({ list: [{ id: 1 }] }); await mounted
  assert.equal(early.categoryCalls(), 0)
  assert.equal(early.timers.size, 0)
  assert.equal(early.page.articles.value.length, 0)

  const late = homeFixture()
  const ready = late.mount()
  late.article.resolve({ list: [] }); await ready
  assert.equal(late.timers.size, 1)
  late.idle()
  late.unmount()
  late.tags.resolve([{ id: 1 }]); await tick()
  assert.equal(late.page.tags.value.length, 0)
  assert.equal(late.frames(), 0)
  assert.equal(late.timers.size, 0)
}
async function main() {
  await validateTags()
  await validateAuth()
  await validateHome()
  console.log('标签切换与乱序、认证清理、首页卸载定向验证通过')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
