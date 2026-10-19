import { onScopeDispose, ref, shallowRef } from 'vue'
import { createLatestRequest } from '@/utils/latestRequest'

/** 页面只负责加载与展示；迟到请求及卸载后的结果不会更新状态。 */
export const useAsyncResource = <T>(
  loader: () => Promise<T>,
  initialValue: T,
  options: { onError?: (error: unknown) => void } = {}
) => {
  const data = shallowRef<T>(initialValue)
  const loading = ref(false)
  const loadError = ref(false)
  const request = createLatestRequest()
  let disposed = false

  const execute = async () => {
    if (disposed) return
    const id = request.next()
    loading.value = true
    loadError.value = false
    try {
      const result = await loader()
      if (!disposed && request.isCurrent(id)) data.value = result
    } catch (error) {
      if (!disposed && request.isCurrent(id)) {
        loadError.value = true
        options.onError?.(error)
      }
    } finally {
      if (!disposed && request.isCurrent(id)) loading.value = false
    }
  }

  onScopeDispose(() => {
    disposed = true
    request.invalidate()
  })

  return { data, loading, loadError, execute }
}
