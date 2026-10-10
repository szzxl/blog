/**
 * 缓存管理工具
 */

interface CacheItem<T> {
  data: T
  expire: number
  timestamp: number
}

class CacheManager {
  private cache: Map<string, CacheItem<unknown>>
  private maxSize: number
  private _cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor(maxSize = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  set<T>(key: string, data: T, ttl = 5 * 60 * 1000): void {
    if (this._cleanupTimer === null) {
      this._cleanupTimer = setInterval(() => this.clearExpired(), 10 * 60 * 1000)
    }
    // 缓存已满时淘汰最久未访问的项（LRU）
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      this.clearExpired()
    }
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      let lruKey: string | null = null
      let lruTime = Infinity
      for (const [k, v] of this.cache.entries()) {
        if (v.timestamp < lruTime) {
          lruTime = v.timestamp
          lruKey = k
        }
      }
      if (lruKey !== null) this.cache.delete(lruKey)
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

    // 更新最后访问时间（LRU）
    item.timestamp = Date.now()
    return item.data as T
  }

  private clearExpired(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (item.expire < now) {
        this.cache.delete(key)
      }
    }
  }
}

export const cache = new CacheManager()

/**
 * 生成缓存键
 * @param prefix 前缀
 * @param params 参数
 * @returns 缓存键
 */
export function generateCacheKey(prefix: string, params?: Record<string, unknown>): string {
  if (!params) return prefix
  const sorted = Object.keys(params).sort().reduce<Record<string, unknown>>((acc, k) => {
    acc[k] = params[k]
    return acc
  }, {})
  return `${prefix}:${JSON.stringify(sorted)}`
}
