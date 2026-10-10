// 定向验证请求响应乱序、清空搜索及离开相册，不连接后端。
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const vue = require('vue')
const root = path.resolve(__dirname, '..')
const lifecycle = { ...vue, onMounted() {}, onUnmounted() {}, watch() {} }
function load(file, modules, exposed = '', globals = {}) {
  let source = fs.readFileSync(path.join(root, file), 'utf8')
  if (file.endsWith('.vue')) source = source.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]
  source += exposed ? '\nexport const test = { ' + exposed + ' }' : ''
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
const latest = load('src/utils/latestRequest.ts', {})
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const tick = () => new Promise(resolve => setImmediate(resolve))
async function main() {
  let timer
  const requests = []
  const search = load('src/components/SearchOverlay.vue', {
    vue: lifecycle,
    'vue-router': { useRouter: () => ({ push() {} }) },
    '@/api/article': { getArticleList: () => { const d = deferred(); requests.push(d); return d.promise } },
    '@/utils/format': { formatTimestamp() {} }, '@/utils/latestRequest': latest
  }, 'keyword, searching, results, onInput, close, open', {
    setTimeout: callback => { timer = callback; return 1 }, clearTimeout: () => { timer = null }
  }).test
  search.keyword.value = 'old'
  search.onInput(); timer()
  search.keyword.value = 'new'
  search.onInput(); timer()
  requests[1].resolve({ list: [{ id: 2 }] }); await tick()
  requests[0].resolve({ list: [{ id: 1 }] }); await tick()
  assert.equal(search.results.value[0].id, 2)
  search.keyword.value = 'pending'
  search.onInput(); timer()
  search.keyword.value = ''
  search.onInput()
  requests[2].resolve({ list: [{ id: 3 }] }); await tick()
  assert.equal(search.results.value.length, 0)
  assert.equal(search.searching.value, false)
  search.keyword.value = 'closed'
  search.onInput(); timer(); search.close()
  requests[3].resolve({ list: [{ id: 4 }] }); await tick()
  assert.equal(search.results.value.length, 0)

  const photos = []
  const album = load('src/views/Album.vue', {
    vue: lifecycle, '@/utils/requestError': { showRequestError() {} },
    '@/api/article': { getAlbumList() {}, getAlbumPhotos: () => { const d = deferred(); photos.push(d); return d.promise } },
    '@/components/Comment.vue': {}, '@/utils/latestRequest': latest
  }, 'loadAlbumPhotos, backToAlbums, photos, currentAlbum, photosLoading', { window: { scrollTo() {} } }).test
  const old = album.loadAlbumPhotos({ id: 1 })
  const recent = album.loadAlbumPhotos({ id: 2 })
  photos[0].resolve([{ id: 10 }]); await old
  assert.equal(album.photos.value.length, 0)
  assert.equal(album.photosLoading.value, true)
  photos[1].resolve([{ id: 20 }]); await recent
  assert.equal(album.photos.value[0].id, 20)
  const leave = album.loadAlbumPhotos({ id: 3 })
  album.backToAlbums()
  photos[2].resolve([{ id: 30 }]); await leave
  assert.equal(album.currentAlbum.value, null)
  assert.equal(album.photos.value.length, 0)
  assert.equal(album.photosLoading.value, false)
  console.log('搜索乱序、清空、关闭与相册切换、离开验证通过')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
