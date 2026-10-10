import { onMounted, onUnmounted } from 'vue'
import { getWebsiteConfig } from '@/api/article'

const CACHE_KEY = 'website_config'
const CACHE_TTL = 60_000
export interface WebsiteConfig {
  site_name?: string
  site_description?: string
  logo?: string
  seo_title?: string
  copyright?: string
  icp_number?: string
  website_motto?: string
  social_email?: string
  social_gitee?: string
  social_github?: string
  social_wechat?: string
  site_start_time?: string
  tool_miniprogram_name?: string
  tool_miniprogram_qr?: string
}
let configCache: WebsiteConfig | null = null
let expiresAt = 0
let pendingRequest: Promise<WebsiteConfig> | null = null
export const fetchWebsiteConfigWithCache = (): Promise<WebsiteConfig> => {
  if (configCache && Date.now() < expiresAt) return Promise.resolve(configCache)
  if (!configCache) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null')
      if (saved?.config && saved.expiresAt > Date.now()) {
        configCache = saved.config
        expiresAt = saved.expiresAt
        return Promise.resolve(saved.config as WebsiteConfig)
      }
    } catch { /* 存储不可用或损坏时，继续读取接口 */ }
  }
  if (pendingRequest) return pendingRequest
  pendingRequest = getWebsiteConfig().then((response: unknown) => {
    if (!Array.isArray(response)) throw new Error('网站配置格式不正确')
    const config: WebsiteConfig = {}
    for (const item of response) {
      if (typeof item.configKey === 'string' && typeof item.configValue === 'string')
        config[item.configKey as keyof WebsiteConfig] = item.configValue
    }
    if (config.site_name) config.site_name = config.site_name.replace(/系统$/u, '')
    const changed = JSON.stringify(configCache) !== JSON.stringify(config)
    configCache = config
    expiresAt = Date.now() + CACHE_TTL
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ config, expiresAt })) } catch { /* 内存缓存仍可使用 */ }
    if (changed) window.dispatchEvent(new Event('website-config-updated'))
    return config
  }).catch(() => {
    expiresAt = Date.now() + 15_000
    return configCache || {}
  }).finally(() => { pendingRequest = null })
  return pendingRequest
}
export const clearWebsiteConfigCache = () => {
  configCache = null
  expiresAt = 0
  try { sessionStorage.removeItem(CACHE_KEY) } catch { /* 忽略存储限制 */ }
}
export const useWebsiteConfigRefresh = (refresh: () => void) => {
  onMounted(() => { window.addEventListener('website-config-updated', refresh) })
  onUnmounted(() => { window.removeEventListener('website-config-updated', refresh) })
}
export const startWebsiteConfigRefresh = () => {
  const refresh = () => { if (document.visibilityState === 'visible') void fetchWebsiteConfigWithCache() }
  window.setInterval(refresh, CACHE_TTL)
  document.addEventListener('visibilitychange', refresh)
  window.addEventListener('focus', refresh)
}
