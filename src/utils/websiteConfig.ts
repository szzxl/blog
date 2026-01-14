import { getWebsiteConfig } from '@/api/article'

const CACHE_KEY = 'website_config'

interface WebsiteConfig {
  site_name?: string
  site_description?: string
  seo_title?: string
  copyright?: string
  icp_number?: string
  website_motto?: string
  social_qq?: string
  social_wechat?: string
  social_email?: string
  social_github?: string
}

let configCache: WebsiteConfig | null = null

/**
 * 获取网站配置（带缓存）
 */
export const fetchWebsiteConfigWithCache = async (): Promise<WebsiteConfig> => {
  // 1. 先检查内存缓存
  if (configCache) {
    return configCache
  }

  // 2. 检查 sessionStorage 缓存
  const cachedData = sessionStorage.getItem(CACHE_KEY)
  if (cachedData) {
    try {
      configCache = JSON.parse(cachedData)
      return configCache as WebsiteConfig
    } catch (error) {
      // 解析缓存配置失败
    }
  }

  // 3. 调用接口获取配置
  try {
    const response: any = await getWebsiteConfig()
    const config: WebsiteConfig = {}

    if (response && Array.isArray(response)) {
      response.forEach((item: any) => {
        const key = item.configKey as keyof WebsiteConfig
        const value = item.configValue
        if (value) {
          config[key] = value
        }
      })
    }

    // 4. 保存到缓存
    configCache = config
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(config))

    return config
  } catch (error) {
    return {}
  }
}

/**
 * 清除配置缓存
 */
export const clearWebsiteConfigCache = () => {
  configCache = null
  sessionStorage.removeItem(CACHE_KEY)
}
