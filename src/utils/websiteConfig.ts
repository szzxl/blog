import type { WebsiteConfig } from '@/types/website'
import { onMounted, onUnmounted } from 'vue'
import { getWebsiteConfig } from '@/api/website'

const CACHE_KEY = 'website_config'
const CACHE_TTL = 60_000

let configCache: WebsiteConfig | null = null
let expiresAt = 0
let pendingRequest: Promise<WebsiteConfig> | null = null
let cacheVersion = 0
let stopRefresh: (() => void) | null = null

const isWebsiteConfig = (value: unknown): value is WebsiteConfig =>
  value !== null && typeof value === 'object' && !Array.isArray(value) &&
  Object.values(value).every(item => typeof item === 'string')
export const fetchWebsiteConfigWithCache = (): Promise<WebsiteConfig> => {
  if (configCache && Date.now() < expiresAt) return Promise.resolve(configCache)
  if (!configCache) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null')
      if (isWebsiteConfig(saved?.config) && Number.isFinite(saved.expiresAt) && saved.expiresAt > Date.now()) {
        configCache = saved.config
        expiresAt = saved.expiresAt
        return Promise.resolve(saved.config as WebsiteConfig)
      }
    } catch { /* 存储不可用或损坏时，继续读取接口 */ }
  }
  if (pendingRequest) return pendingRequest
  const version = cacheVersion
  const request = Promise.resolve().then(() => getWebsiteConfig()).then((response: unknown) => {
    if (version !== cacheVersion) return fetchWebsiteConfigWithCache()
    if (!Array.isArray(response)) throw new Error('网站配置格式不正确')
    const config: WebsiteConfig = {}
    for (const item of response) {
      if (item && typeof item.configKey === 'string' && typeof item.configValue === 'string' &&
        !['__proto__', 'constructor', 'prototype'].includes(item.configKey))
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
    if (version !== cacheVersion) return fetchWebsiteConfigWithCache()
    configCache ??= {}
    expiresAt = Date.now() + 15_000
    return configCache
  }).finally(() => { if (pendingRequest === request) pendingRequest = null })
  pendingRequest = request
  return request
}
export const clearWebsiteConfigCache = () => {
  cacheVersion++
  pendingRequest = null
  configCache = null
  expiresAt = 0
  try { sessionStorage.removeItem(CACHE_KEY) } catch { /* 忽略存储限制 */ }
}
export const useWebsiteConfigRefresh = (refresh: () => void) => {
  onMounted(() => { window.addEventListener('website-config-updated', refresh) })
  onUnmounted(() => { window.removeEventListener('website-config-updated', refresh) })
}
export const startWebsiteConfigRefresh = () => {
  if (stopRefresh) return stopRefresh
  const refresh = () => { if (document.visibilityState === 'visible') void fetchWebsiteConfigWithCache() }
  const timer = window.setInterval(refresh, CACHE_TTL)
  document.addEventListener('visibilitychange', refresh)
  window.addEventListener('focus', refresh)
  const stop = () => {
    if (stopRefresh !== stop) return
    window.clearInterval(timer)
    document.removeEventListener('visibilitychange', refresh)
    window.removeEventListener('focus', refresh)
    stopRefresh = null
  }
  stopRefresh = stop
  return stop
}
