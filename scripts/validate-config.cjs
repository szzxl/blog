// 定向验证缓存与错误提示，不启动页面或连接后端。
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const ts = require('typescript')
let assertions = 0
const check = (actual, expected) => { assert.deepEqual(actual, expected); assertions++ }
function load(file, modules, globals) {
  const source = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  })
  const exports = {}
  vm.runInNewContext(outputText, { exports, require: (name) => modules[name], ...globals })
  return exports
}
async function main() {
  let now = 1000
  let calls = 0
  let events = 0
  let fail = false
  let config = [{ configKey: 'site_name', configValue: '博客系统' }]
  const cache = load('src/utils/websiteConfig.ts', {
    vue: { onMounted() {}, onUnmounted() {} },
    '@/api/article': { getWebsiteConfig: async () => {
      calls++
      if (fail) throw new Error('offline')
      return config
    } }
  }, {
    Date: { now: () => now }, Event,
    window: { dispatchEvent: () => { events++ } },
    sessionStorage: {
      getItem: () => '{broken',
      setItem: () => { throw new Error('blocked') },
      removeItem: () => { throw new Error('blocked') }
    }
  })
  const [a, b] = await Promise.all([cache.fetchWebsiteConfigWithCache(), cache.fetchWebsiteConfigWithCache()])
  check(a.site_name, '博客'); check(a === b, true); check(calls, 1); check(events, 1)
  now += 59_000
  await cache.fetchWebsiteConfigWithCache(); check(calls, 1)
  now += 1001
  config = [{ configKey: 'site_name', configValue: '新博客' }, { configKey: 'social_email', configValue: '' }]
  const updated = await cache.fetchWebsiteConfigWithCache()
  check(updated.site_name, '新博客'); check(updated.social_email, ''); check(calls, 2); check(events, 2)
  now += 60_001; fail = true
  check((await cache.fetchWebsiteConfigWithCache()).site_name, '新博客')
  check(calls, 3)
  now += 14_000
  await cache.fetchWebsiteConfigWithCache(); check(calls, 3)
  now += 1001; fail = false
  await cache.fetchWebsiteConfigWithCache(); check(calls, 4); check(events, 2)
  cache.clearWebsiteConfigCache()
  await cache.fetchWebsiteConfigWithCache(); check(calls, 5)
  const messages = []
  const errorModule = load('src/utils/requestError.ts', {
    'element-plus/es/components/message/index': { ElMessage: { error: (text) => messages.push(text) } }
  }, { Error, WeakSet })
  const error = new Error('服务器错误')
  errorModule.showRequestError(error)
  errorModule.showRequestError(error, '页面错误')
  check(messages.length, 1); check(messages[0], '服务器错误')
  const silent = new Error('统计失败')
  errorModule.markRequestErrorNotified(silent)
  errorModule.showRequestError(silent)
  check(messages.length, 1)
  errorModule.showRequestError(new Error('Network Error'), '网络连接失败', true)
  check(messages[1], '网络连接失败')
  console.log(`配置缓存与错误提示定向验证通过：${assertions} 项断言`)
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
