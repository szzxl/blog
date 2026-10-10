import { ElMessage } from 'element-plus/es/components/message/index'

const notifiedErrors = new WeakSet<object>()

/** 同一次失败由请求层和页面捕获时，只提示一次。 */
export const showRequestError = (error: unknown, fallback = '请求失败，请稍后重试', useFallback = false) => {
  if (error && typeof error === 'object') {
    if (notifiedErrors.has(error)) return
    notifiedErrors.add(error)
  }
  ElMessage.error(!useFallback && error instanceof Error ? error.message || fallback : fallback)
}

export const markRequestErrorNotified = (error: object) => notifiedErrors.add(error)
