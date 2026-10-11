const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

const deferred = () => {
  let resolve
  const promise = new Promise(r => { resolve = r })
  return { promise, resolve }
}
const ref = value => ({ value })
const hooks = []
const vue = {
  ref,
  computed: fn => ({ get value() { return fn() } }),
  watch: () => {},
  onMounted: () => {},
  onUnmounted: fn => hooks.push(fn)
}
const storage = new Map()
const localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: key => storage.delete(key)
}
const token = value => JSON.stringify({ v: JSON.stringify(value) })
const parseToken = raw => raw ? JSON.parse(JSON.parse(raw).v) : ''
const message = { success() {}, error() {}, warning() {} }
const latest = () => {
  let seq = 0
  return { next: () => ++seq, isCurrent: n => n === seq, invalidate: () => ++seq }
}
const compile = (file, additions, mocks, globals = {}) => {
  let source = fs.readFileSync(file, 'utf8')
  if (file.endsWith('.vue')) source = source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  const code = ts.transpileModule(source + '\n' + additions, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText
  const exports = {}
  vm.runInNewContext(code, {
    exports, module: { exports },
    require: name => {
      if (name in mocks) return mocks[name]
      throw new Error('Missing mock: ' + name)
    },
    localStorage, console, setTimeout, clearTimeout,
    ...globals
  }, { filename: file })
  return exports
}
const common = {
  vue,
  '@/utils/token': { parseToken },
  '@/utils/requestError': { showRequestError() {}, markRequestErrorNotified() {} },
  'element-plus/es/components/message/index': { ElMessage: message }
}

async function main() {
  let profileCalls = 0
  let profile = deferred()
  let login = deferred()
  const store = compile('src/stores/user.ts', '', {
    ...common,
    pinia: { defineStore: (_name, setup) => setup },
    '@/api/article': {
      getUserInfo: () => { profileCalls++; return profile.promise },
      login: () => login.promise,
      logout: async () => {}
    }
  }).useUserStore()
  localStorage.setItem('ACCESS_TOKEN', token('first'))
  store.token.value = 'first'
  const first = store.fetchUserInfo()
  const second = store.fetchUserInfo()
  assert.equal(first, second, 'profile requests should coalesce')
  await Promise.resolve()
  assert.equal(profileCalls, 1)
  store.clearAuth()
  profile.resolve({ id: 1, username: 'old' })
  assert.equal(await first, false)
  assert.equal(store.user.value, null, 'logout must reject stale profile')
  assert.equal(localStorage.getItem('user'), null)
  profile = deferred()
  localStorage.setItem('ACCESS_TOKEN', token('second'))
  store.token.value = 'second'
  const fresh = store.fetchUserInfo()
  profile.resolve({ id: 2, username: 'new' })
  assert.equal(await fresh, true)
  assert.equal(store.user.value.username, 'new')
  const pendingLogin = store.login('old', 'password')
  await store.logout()
  login.resolve({ accessToken: 'late' })
  assert.equal(await pendingLogin, false, 'late login must not undo logout')
  assert.equal(localStorage.getItem('ACCESS_TOKEN'), null)

  const upload = deferred()
  const submission = deferred()
  let revoked = 0
  let uploads = 0
  const guest = compile('src/views/Guestbook.vue',
    'exports.test = { handleFiles, imageList, messageForm, submitMessage };', {
      ...common,
      '@element-plus/icons-vue': {},
      '@/stores/user': { useUserStore: () => ({ isLoggedIn: true, user: { id: '1' } }) },
      '@/utils/latestRequest': { createLatestRequest: latest },
      '@/api/article': {
        uploadImage: () => { uploads++; return upload.promise },
        submitGuestbookMessage: () => submission.promise,
        getApprovedGuestbookMessages: async () => ({ list: [], total: 0 })
      }
    }, {
      URL: { createObjectURL: () => 'blob:' + uploads, revokeObjectURL: () => { revoked++ } }
    }).test
  const image = { name: 'image.png', type: 'image/png', size: 12 }
  guest.handleFiles(Array(6).fill(image))
  guest.handleFiles(Array(6).fill(image))
  assert.equal(guest.imageList.value.length, 9, 'pending uploads must reserve slots')
  assert.equal(uploads, 9)
  upload.resolve('https://example.com/image.png')
  await new Promise(resolve => setTimeout(resolve, 0))
  guest.messageForm.value = { name: 'author', email: '', content: 'submitted' }
  const submitting = guest.submitMessage()
  guest.messageForm.value.content = 'new draft'
  submission.resolve(true)
  await submitting
  assert.equal(guest.messageForm.value.content, 'new draft', 'submission must preserve newer input')
  assert.equal(guest.imageList.value.length, 0)
  assert.equal(revoked, 9, 'submitted previews must be released')
  for (const hook of hooks) hook()
  console.log('Joint frontend checks passed: auth coalescing, stale sessions, upload slots, draft preservation')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
