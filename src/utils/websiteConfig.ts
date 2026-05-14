import { getWebsiteConfig } from '@/api/article'

const CACHE_KEY = 'website_config'

interface WebsiteConfig {
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
}

let configCache: WebsiteConfig | null = null
let pendingRequest: Promise<WebsiteConfig> | null = null

/**
 * 获取网站配置（带缓存），并发调用时共享同一个请求
 */
export const fetchWebsiteConfigWithCache = (): Promise<WebsiteConfig> => {
  if (configCache) return Promise.resolve(configCache)

  const cachedData = sessionStorage.getItem(CACHE_KEY)
  if (cachedData) {
    try {
      configCache = JSON.parse(cachedData)
      return Promise.resolve(configCache as WebsiteConfig)
    } catch {
      // sessionStorage 数据损坏，重新获取
    }
  }

  if (pendingRequest) return pendingRequest

  pendingRequest = getWebsiteConfig()
    .then((response: any) => {
      const config: WebsiteConfig = {}
      if (response && Array.isArray(response)) {
        response.forEach((item: any) => {
          const key = item.configKey as keyof WebsiteConfig
          if (item.configValue) config[key] = item.configValue
        })
      }
      if (config.site_name) config.site_name = config.site_name.replace(/系统$/u, '')
      configCache = config
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(config))
      return config
    })
    .catch(() => ({} as WebsiteConfig))
    .finally(() => { pendingRequest = null })

  return pendingRequest
}

/**
 * 清除配置缓存
 */
export const clearWebsiteConfigCache = () => {
  configCache = null
  sessionStorage.removeItem(CACHE_KEY)
}
