// 定向验证真实统计模块与请求拦截器，不启动服务或访问数据库。
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { webcrypto } = require('node:crypto')
const ts = require('typescript')
const vue = require('vue')

const root = path.resolve(__dirname, '..')
const tick = () => new Promise((resolve) => setImmediate(resolve))
let assertions = 0
const check = (actual, expected) => {
  assert.deepEqual(actual, expected)
  assertions++
}

function loadModule(file, modules, globals = {}, development = false) {
  const source = fs.readFileSync(path.join(root, file), 'utf8')
    .replaceAll('import.meta.env.DEV', String(development))
    .replaceAll('import.meta.env.VITE_API_BASE_URL', 'undefined')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true
    }
  })
  const exports = {}
  vm.runInNewContext(outputText, {
    exports, window: {}, crypto: webcrypto,
    require: (name) => {
      if (!(name in modules)) throw new Error(`未模拟的依赖：${name}`)
      return modules[name]
    },
    ...globals
  }, { filename: file })
  return exports
}

function trackingFixture({ development = false, blockedStorage = false, fail = false } = {}) {
  const reports = []
  const user = { isAuthor: false }
  let reads = 0
  let ready
  let afterEach
  const route = (name, pagePath, query = {}) => ({ name, path: pagePath, query })
  const home = route('home', '/')
  const storage = new Map()
  const api = {
    getVisitSummary: async () => {
      reads++
      if (fail) throw new Error('offline')
      return { totalPv: 20, todayPv: 3, todayUv: 2 }
    },
    reportVisit: async (report) => {
      reports.push(report)
      if (fail) throw new Error('offline')
      return { totalPv: 20 + reports.length, todayPv: 3 + reports.length, todayUv: 2 }
    }
  }
  const tracking = loadModule('src/utils/visit.ts', {
    vue, '@/api/visit': api, '@/stores/user': { useUserStore: () => user }
  }, {
    localStorage: {
      getItem: (key) => {
        if (blockedStorage) throw new Error('blocked')
        return storage.get(key)
      },
      setItem: (key, value) => {
        if (blockedStorage) throw new Error('blocked')
        storage.set(key, value)
      }
    }
  }, development)
  const router = {
    currentRoute: { value: home },
    afterEach: (callback) => { afterEach = callback },
    isReady: () => new Promise((resolve) => { ready = resolve })
  }
  tracking.setupVisitTracking(router)
  return {
    reports, user, route, home, storage, stats: tracking.useVisitStats(),
    reads: () => reads, ready: () => ready(),
    navigate: (to, from = home, failure) => afterEach(to, from, failure)
  }
}

async function validateTracking() {
  const fixture = trackingFixture()
  // 初次 afterEach 与 isReady 同时完成时，仍然只发送一次。
  fixture.navigate(fixture.home, fixture.route(undefined, ''))
  fixture.ready()
  await tick()
  check(fixture.reports.length, 1)
  check(fixture.stats.visitSummary.value.totalPv, 21)
  const first = fixture.reports[0]
  check(first.path, '/')
  check(first.visitorId, fixture.storage.get('blog_visitor_id'))
  check(/^[0-9a-f-]{36}$/.test(first.eventId), true)

  fixture.navigate(fixture.home, fixture.home) // 相同路由及锚点切换
  fixture.navigate(fixture.route('article-detail', '/article/1'), fixture.home, new Error('cancelled'))
  await tick()
  check(fixture.reports.length, 1)
  fixture.navigate(fixture.route('article-detail', '/article/1'))
  await tick()
  check(fixture.reports.length, 2)
  check(fixture.reports[1].visitorId, first.visitorId)
  check(fixture.reports[1].eventId !== first.eventId, true)
  check(fixture.stats.visitSummary.value.totalPv, 22)

  fixture.navigate(fixture.route('login', '/login'))
  await tick()
  check(fixture.reports.length, 2)
  check(fixture.reads(), 1)
  fixture.user.isAuthor = true
  fixture.navigate(fixture.route('about', '/about'))
  await tick()
  check(fixture.reports.length, 2)
  check(fixture.reads(), 2)

  const development = trackingFixture({ development: true })
  development.ready()
  await tick()
  check(development.reports.length, 1)
  check(development.reads(), 0)

  const blocked = trackingFixture({ blockedStorage: true })
  blocked.ready()
  await tick()
  blocked.navigate(blocked.route('articles', '/articles', { page: '2' }))
  await tick()
  check(blocked.reports.length, 2)
  check(blocked.reports[0].visitorId, blocked.reports[1].visitorId)

  const failed = trackingFixture({ fail: true })
  failed.ready()
  await tick()
  check(failed.stats.visitSummary.value, null)
  check(failed.stats.visitStatsLoading.value, false)
  check(failed.reports.length, 1) // 失败不自动重试
}

async function validateInterceptors() {
  let requestHandler, responseHandler, errorHandler
  let shown = 0, hidden = 0, messages = 0, redirects = 0
  const service = {
    interceptors: {
      request: { use: (handler) => { requestHandler = handler } },
      response: { use: (handler, reject) => { responseHandler = handler; errorHandler = reject } }
    }
  }
  loadModule('src/api/request.ts', {
    axios: { create: () => service },
    '@/utils/requestError': {
      showRequestError: () => messages++, markRequestErrorNotified: () => {}
    },
    '@/router': { push: () => redirects++ },
    '@/utils/loading': { showLoading: () => shown++, hideLoading: () => hidden++ },
    '@/utils/token': { parseToken: () => '' }
  }, { localStorage: { getItem: () => null, removeItem: () => {} } })
  const normal = { url: '/system/auth/login', headers: {} }
  const stats = { url: '/web/visit/report', headers: {} }
  requestHandler(normal)
  requestHandler(stats)
  check(shown, 1)
  responseHandler({ config: stats, data: { code: 0, data: {} } })
  check(hidden, 0) // 统计响应不能提前关掉其他请求的 Loading
  responseHandler({ config: normal, data: { code: 0, data: [] } })
  check(hidden, 1)

  await assert.rejects(errorHandler({ config: stats, response: { status: 500 } }))
  await assert.rejects(errorHandler({ config: stats, code: 'ECONNABORTED' }))
  await assert.rejects(errorHandler({ config: stats, response: { status: 401 } }))
  check(messages, 0)
  check(redirects, 0)
  check(hidden, 1)
  await assert.rejects(responseHandler({ config: stats, data: { code: 500, message: 'failed' } }))
  check(messages, 0)
  await assert.rejects(errorHandler({ config: normal, response: { status: 500 } }))
  check(messages, 1)
}

async function main() {
  await validateTracking()
  await validateInterceptors()
  console.log(`访问统计定向验证通过：${assertions} 项断言`)
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
