import { readonly, shallowRef } from 'vue'
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router'
import { getVisitSummary, reportVisit } from '@/api/visit'
import type { VisitSummary } from '@/api/visit'
import { useUserStore } from '@/stores/user'

const VISITOR_KEY = 'blog_visitor_id'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const CONTENT_ROUTES = new Set([
  'home', 'articles', 'article-detail', 'category', 'tag', 'tag-articles',
  'album', 'guestbook', 'link', 'about'
])

const summary = shallowRef<VisitSummary | null>(null)
const loading = shallowRef(false)
let memoryVisitorId = ''
let started = false
let pending = Promise.resolve()

const createUuid = (): string => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

const getVisitorId = (): string => {
  if (memoryVisitorId) return memoryVisitorId
  try {
    const saved = localStorage.getItem(VISITOR_KEY)
    if (saved && UUID_PATTERN.test(saved)) memoryVisitorId = saved
  } catch { /* 存储不可用时，在本次页面生命周期内保持访客标识 */ }
  if (!memoryVisitorId) {
    memoryVisitorId = createUuid()
    try {
      localStorage.setItem(VISITOR_KEY, memoryVisitorId)
    } catch { /* 不影响页面浏览 */ }
  }
  return memoryVisitorId
}

const updateSummary = (data: VisitSummary) => {
  if ([data.totalPv, data.todayPv, data.todayUv].every(
    (value) => Number.isSafeInteger(value) && value >= 0
  )) summary.value = data
}

export const useVisitStats = () => ({
  visitSummary: readonly(summary),
  visitStatsLoading: readonly(loading)
})

export const setupVisitTracking = (router: Router) => {
  if (started || typeof window === 'undefined') return
  started = true

  const track = (route: RouteLocationNormalizedLoaded) => {
    const shouldReport = !import.meta.env.DEV && !useUserStore().isAuthor &&
      typeof route.name === 'string' && CONTENT_ROUTES.has(route.name)
    // 在导航发生时固定事件和路径；串行发送，避免旧响应覆盖新统计。
    const report = shouldReport ? {
      eventId: createUuid(), visitorId: getVisitorId(), path: route.path
    } : null
    if (!summary.value) loading.value = true
    pending = pending.then(async () => {
      try {
        updateSummary(report ? await reportVisit(report) : await getVisitSummary())
      } catch { /* 统计失败时保留已有数据，不阻塞导航或自动重试 */ }
      finally { loading.value = false }
    })
  }

  let initialTracked = false
  router.afterEach((to, from, failure) => {
    if (failure) return
    if (initialTracked && to.path === from.path &&
      JSON.stringify(to.query) === JSON.stringify(from.query)) return
    initialTracked = true
    track(to)
  })
  void router.isReady().then(() => {
    if (!initialTracked) {
      initialTracked = true
      track(router.currentRoute.value)
    }
  }).catch(() => { /* 初始导航失败不统计 */ })
}
