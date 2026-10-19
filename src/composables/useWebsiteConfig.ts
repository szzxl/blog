import { onMounted, onScopeDispose, readonly, shallowRef } from 'vue'
import { fetchWebsiteConfigWithCache, useWebsiteConfigRefresh } from '@/utils/websiteConfig'
import type { WebsiteConfig } from '@/types/website'

/** 缓存与并发合并仍由 websiteConfig 工具管理，这里只管理组件订阅与生命周期。 */
export const useWebsiteConfig = () => {
  const config = shallowRef<WebsiteConfig>({})
  let disposed = false
  const refresh = async () => {
    const value = await fetchWebsiteConfigWithCache()
    if (!disposed) config.value = value
  }
  onMounted(refresh)
  useWebsiteConfigRefresh(() => {
    void refresh()
  })
  onScopeDispose(() => {
    disposed = true
  })
  return { config: readonly(config) }
}
