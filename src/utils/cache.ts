/**
 * 缓存管理工具
 */

interface CacheItem<T> {
  data: T
  expire: number
  timestamp: number
}

class CacheManager {
  private cache: Map<string, CacheItem<any>>
  private maxSize: number

  constructor(maxSize = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 过期时间（毫秒），默认 5 分钟
   */
  set<T>(key: string, data: T, ttl = 5 * 60 * 1000): void {
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      expire: Date.now() + ttl,
      timestamp: Date.now()
    })
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存数据或 null
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // 检查是否过期
    if (item.expire < Date.now()) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  /**
   * 检查缓存是否存在且未过期
   * @param key 缓存键
   * @returns 是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (item.expire < Date.now()) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 清理过期缓存
   */
  clearExpired(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (item.expire < now) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

// 创建全局缓存实例
export const cache = new CacheManager()

// 定期清理过期缓存（每 10 分钟）
setInterval(() => {
  cache.clearExpired()
}, 10 * 60 * 1000)

/**
 * LocalStorage 缓存工具
 */
export const localCache = {
  /**
   * 设置 localStorage 缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 过期时间（毫秒）
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      expire: ttl ? Date.now() + ttl : Infinity,
      timestamp: Date.now()
    }
    try {
      localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.error('LocalStorage set error:', error)
    }
  },

  /**
   * 获取 localStorage 缓存
   * @param key 缓存键
   * @returns 缓存数据或 null
   */
  get<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(key)
      if (!itemStr) return null

      const item: CacheItem<T> = JSON.parse(itemStr)

      // 检查是否过期
      if (item.expire < Date.now()) {
        localStorage.removeItem(key)
        return null
      }

      return item.data
    } catch (error) {
      console.error('LocalStorage get error:', error)
      return null
    }
  },

  /**
   * 删除 localStorage 缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    localStorage.removeItem(key)
  },

  /**
   * 清空所有缓存
   */
  clear(): void {
    localStorage.clear()
  }
}

/**
 * SessionStorage 缓存工具
 */
export const sessionCache = {
  /**
   * 设置 sessionStorage 缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 过期时间（毫秒）
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      expire: ttl ? Date.now() + ttl : Infinity,
      timestamp: Date.now()
    }
    try {
      sessionStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.error('SessionStorage set error:', error)
    }
  },

  /**
   * 获取 sessionStorage 缓存
   * @param key 缓存键
   * @returns 缓存数据或 null
   */
  get<T>(key: string): T | null {
    try {
      const itemStr = sessionStorage.getItem(key)
      if (!itemStr) return null

      const item: CacheItem<T> = JSON.parse(itemStr)

      // 检查是否过期
      if (item.expire < Date.now()) {
        sessionStorage.removeItem(key)
        return null
      }

      return item.data
    } catch (error) {
      console.error('SessionStorage get error:', error)
      return null
    }
  },

  /**
   * 删除 sessionStorage 缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    sessionStorage.removeItem(key)
  },

  /**
   * 清空所有缓存
   */
  clear(): void {
    sessionStorage.clear()
  }
}

/**
 * 缓存装饰器（用于函数结果缓存）
 * @param ttl 过期时间（毫秒）
 */
export function cached<T extends (...args: any[]) => any>(
  ttl = 5 * 60 * 1000
): (_target: any, propertyKey: string, descriptor: PropertyDescriptor) => void {
  return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}_${JSON.stringify(args)}`
      
      // 尝试从缓存获取
      const cachedResult = cache.get<T>(cacheKey)
      if (cachedResult !== null) {
        return cachedResult
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args)
      
      // 缓存结果
      cache.set(cacheKey, result, ttl)
      
      return result
    }

    return descriptor
  }
}

/**
 * 生成缓存键
 * @param prefix 前缀
 * @param params 参数
 * @returns 缓存键
 */
export function generateCacheKey(prefix: string, params?: Record<string, any>): string {
  if (!params) return prefix
  
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  return `${prefix}:${sortedParams}`
}
