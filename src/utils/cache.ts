/**
 * 缓存管理工具
 */

interface CacheItem<T> {
  data: T
  expire: number
}

class CacheManager {
  private cache: Map<string, CacheItem<unknown>>
  private maxSize: number
  private pendingRequests = new Map<string, Promise<unknown>>()

  constructor(maxSize = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  set<T>(key: string, data: T, ttl = 5 * 60 * 1000): void {
    // 缓存已满时淘汰最久未访问的项（LRU）
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      this.clearExpired()
    }
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      const lruKey = this.cache.keys().next().value
      if (lruKey !== undefined) this.cache.delete(lruKey)
    }

    this.cache.delete(key)
    this.cache.set(key, {
      data,
      expire: Date.now() + ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // 检查是否过期
    if (item.expire <= Date.now()) {
      this.cache.delete(key)
      return null
    }

    // Map 按插入顺序保存，命中后移至末尾即可维护 LRU。
    this.cache.delete(key)
    this.cache.set(key, item)
    return item.data as T
  }

  getOrFetch<T>(key: string, fetcher: () => Promise<T>, ttl = 5 * 60 * 1000): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) return Promise.resolve(cached)

    const pending = this.pendingRequests.get(key)
    if (pending) return pending as Promise<T>

    // 延迟调用 fetcher，保证同步抛错也会释放并发请求记录。
    const request = Promise.resolve().then(fetcher).then(result => {
      this.set(key, result, ttl)
      return result
    }).finally(() => {
      this.pendingRequests.delete(key)
    })
    this.pendingRequests.set(key, request)
    return request
  }

  private clearExpired(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (item.expire <= now) {
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
