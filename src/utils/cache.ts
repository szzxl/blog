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
  private _cleanupStarted = false

  constructor(maxSize = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  set<T>(key: string, data: T, ttl = 5 * 60 * 1000): void {
    if (!this._cleanupStarted) {
      this._cleanupStarted = true
      setInterval(() => this.clearExpired(), 10 * 60 * 1000)
    }
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

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (item.expire < Date.now()) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  clearExpired(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (item.expire < now) {
        this.cache.delete(key)
      }
    }
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

export const cache = new CacheManager()

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
 * 生成缓存键
 * @param prefix 前缀
 * @param params 参数
 * @returns 缓存键
 */
export function generateCacheKey(prefix: string, params?: Record<string, any>): string {
  if (!params) return prefix
  const sorted = Object.keys(params).sort().reduce<Record<string, any>>((acc, k) => {
    acc[k] = params[k]
    return acc
  }, {})
  return `${prefix}:${JSON.stringify(sorted)}`
}
