const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const ref = value => ({ value })
const deferred = () => { let resolve; let reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
const latest = () => { let version = 0; return { next: () => ++version, isCurrent: id => id === version, invalidate: () => ++version } }
const message = { success() {}, warning() {}, error() {} }
const vue = { ref, computed: fn => ({ get value() { return fn() } }), watch() {}, nextTick: async () => {}, onMounted() {}, onUnmounted() {} }
const compile = (file, exports, modules, globals = {}) => {
  let source = fs.readFileSync(file, 'utf8')
  if (file.endsWith('.vue')) source = source.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]
  const code = ts.transpileModule(source + '\nmodule.exports = {' + exports + '}', { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const context = { module: { exports: {} }, require: name => { assert.ok(name in modules, 'Missing mock: ' + name); return modules[name] }, console, ...globals }
  context.exports = context.module.exports
  vm.runInNewContext(code, context)
  return context.module.exports
}
async function main() {
  const pages = compile('src/utils/pagination.ts', 'normalizePage,lastPage', {})
  for (const value of ['-1', '0', '1.5', 'Infinity', 'NaN', '1e2', ['2'], '9007199254740992']) assert.equal(pages.normalizePage(value), 1)
  assert.equal(pages.normalizePage('3'), 3)
  assert.equal(pages.lastPage(0, 12), 1)
  assert.equal(pages.lastPage(25, 12), 3)

  let timer
  const searches = []
  const navigations = []
  const search = compile('src/components/SearchOverlay.vue', 'keyword,results,searching,searchError,onInput,goFirst,viewAll', {
    vue, 'vue-router': { useRouter: () => ({ push: target => navigations.push(target) }) },
    '@/api/article': { getArticleList: () => { const request = deferred(); searches.push(request); return request.promise } },
    '@/utils/format': { formatTimestamp() {} }, '@/utils/latestRequest': { createLatestRequest: latest }
  }, { window: {}, setTimeout: fn => { timer = fn; return 1 }, clearTimeout: () => {} })
  search.results.value = [{ id: 'old' }]
  search.keyword.value = 'new'; search.onInput(); search.goFirst()
  assert.equal(navigations.length, 0, 'Enter during pending search must not open old results')
  const first = timer()
  search.keyword.value = 'newer'; search.onInput(); const second = timer()
  searches[1].resolve({ list: [{ id: 'newer', summary: 'matching content' }], total: 25 }); await second
  searches[0].resolve({ list: [{ id: 'old' }], total: 1 }); await first
  assert.equal(search.results.value[0].id, 'newer', 'Old result cannot replace latest search')
  search.viewAll(); assert.equal(navigations[0].query.keyword, 'newer')
  search.onInput(); const failed = timer(); searches[2].reject(new Error('offline')); await failed
  assert.equal(search.searchError.value, true, 'Network failure must differ from no results')

  for (const [file, handler, form, loading] of [
    ['Login', 'handleLogin', 'loginFormRef', 'loginLoading'],
    ['Register', 'handleRegister', 'registerFormRef', 'registerLoading']
  ]) {
    const validation = deferred(); let calls = 0
    const instance = compile('src/views/' + file + '.vue', [handler, form, loading, ...(file === 'Register' ? ['agreeTerms'] : [])].join(','), {
      vue, '@element-plus/icons-vue': {}, 'vue-router': { useRouter: () => ({ currentRoute: { value: { query: {} } }, push: async () => {} }) },
      '@/stores/user': { useUserStore: () => ({ login: async () => { calls++; return true } }) },
      '@/api/article': { register: async () => { calls++ } },
      'element-plus/es/components/message/index': { ElMessage: message }, '@/utils/requestError': { showRequestError() {} }
    })
    if (instance.agreeTerms) instance.agreeTerms.value = true
    instance[form].value = { validate: () => validation.promise }
    const pending = instance[handler](); const repeated = instance[handler]()
    assert.equal(instance[loading].value, true)
    validation.resolve(true); await Promise.all([pending, repeated])
    assert.equal(calls, 1, file + ' must lock before validation')
    assert.equal(instance[loading].value, false)
  }

  const saved = deferred(); let refreshed = 0
  const user = { token: 'first', isLoggedIn: true, user: { nickname: 'reader' }, fetchUserInfo: async () => { refreshed++ } }
  const account = compile('src/views/Profile.vue', 'saveProfile,profileForm,profileLoading', {
    vue, 'vue-router': { useRouter: () => ({ push: async () => {} }) },
    '@/stores/user': { useUserStore: () => user }, '@/api/article': { updateUserProfile: () => saved.promise },
    'element-plus/es/components/message/index': { ElMessage: message }, '@/utils/requestError': { showRequestError() {} }
  })
  account.profileForm.value = { validate: async () => true }
  const save = account.saveProfile(); await Promise.resolve(); await Promise.resolve()
  user.token = 'second'; saved.resolve(true); await save
  assert.equal(refreshed, 0, 'Old profile save cannot refresh another session')
  assert.equal(account.profileLoading.value, false)
  console.log('Feature checks passed: page bounds, search races/errors, submission locks, profile session changes')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
