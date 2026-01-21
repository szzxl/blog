/**
 * 图片懒加载指令
 */

interface LazyLoadOptions {
  loading?: string  // 加载中的占位图
  error?: string    // 加载失败的占位图
  threshold?: number // 触发加载的阈值
}

const defaultOptions: LazyLoadOptions = {
  loading: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5sb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==',
  error: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZjU2YzZjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5FcnJvcjwvdGV4dD48L3N2Zz4=',
  threshold: 0.01
}

// 存储观察器实例
const observerMap = new WeakMap<HTMLElement, IntersectionObserver>()

/**
 * 加载图片
 */
function loadImage(el: HTMLImageElement, src: string, options: LazyLoadOptions): void {
  const img = new Image()
  
  // 添加加载中的类
  el.classList.add('lazy-loading')
  
  img.onload = () => {
    el.src = src
    el.classList.remove('lazy-loading')
    el.classList.add('lazy-loaded')
    
    // 添加淡入动画
    el.style.opacity = '0'
    setTimeout(() => {
      el.style.transition = 'opacity 0.3s ease-in-out'
      el.style.opacity = '1'
    }, 10)
  }
  
  img.onerror = () => {
    if (options.error) {
      el.src = options.error
    }
    el.classList.remove('lazy-loading')
    el.classList.add('lazy-error')
  }
  
  img.src = src
}

/**
 * 创建观察器
 */
function createObserver(binding: any): IntersectionObserver {
  const options: LazyLoadOptions = {
    ...defaultOptions,
    ...(typeof binding.value === 'object' ? binding.value : {})
  }
  
  const src = typeof binding.value === 'string' ? binding.value : binding.value?.src
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement
          
          // 加载图片
          if (src) {
            loadImage(target, src, options)
          }
          
          // 停止观察
          observer.unobserve(target)
        }
      })
    },
    {
      threshold: options.threshold,
      rootMargin: '50px'
    }
  )
  
  return observer
}

/**
 * v-lazyload 指令
 * 
 * 使用方式：
 * 1. 简单使用：v-lazyload="imageUrl"
 * 2. 带配置：v-lazyload="{ src: imageUrl, loading: loadingUrl, error: errorUrl }"
 */
export const lazyload = {
  mounted(el: HTMLImageElement, binding: any) {
    // 检查是否支持 IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      // 不支持则直接加载
      const src = typeof binding.value === 'string' ? binding.value : binding.value?.src
      if (src) {
        el.src = src
      }
      return
    }
    
    const options: LazyLoadOptions = {
      ...defaultOptions,
      ...(typeof binding.value === 'object' ? binding.value : {})
    }
    
    // 设置占位图
    if (options.loading && !el.src) {
      el.src = options.loading
    }
    
    // 创建并启动观察器
    const observer = createObserver(binding)
    observer.observe(el)
    
    // 保存观察器实例
    observerMap.set(el, observer)
  },
  
  updated(el: HTMLImageElement, binding: any) {
    // 如果 src 改变，重新加载
    const oldSrc = typeof binding.oldValue === 'string' ? binding.oldValue : binding.oldValue?.src
    const newSrc = typeof binding.value === 'string' ? binding.value : binding.value?.src
    
    if (oldSrc !== newSrc && newSrc) {
      // 停止旧的观察器
      const oldObserver = observerMap.get(el)
      if (oldObserver) {
        oldObserver.unobserve(el)
      }
      
      // 创建新的观察器
      const observer = createObserver(binding)
      observer.observe(el)
      observerMap.set(el, observer)
    }
  },
  
  unmounted(el: HTMLImageElement) {
    // 清理观察器
    const observer = observerMap.get(el)
    if (observer) {
      observer.unobserve(el)
      observerMap.delete(el)
    }
  }
}

/**
 * 背景图懒加载指令
 * 
 * 使用方式：
 * v-lazy-bg="imageUrl"
 */
export const lazyBg = {
  mounted(el: HTMLElement, binding: any) {
    if (!('IntersectionObserver' in window)) {
      el.style.backgroundImage = `url(${binding.value})`
      return
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            const img = new Image()
            
            img.onload = () => {
              target.style.backgroundImage = `url(${binding.value})`
              target.classList.add('lazy-loaded')
            }
            
            img.src = binding.value
            observer.unobserve(target)
          }
        })
      },
      {
        threshold: 0.01,
        rootMargin: '50px'
      }
    )
    
    observer.observe(el)
    observerMap.set(el, observer)
  },
  
  unmounted(el: HTMLElement) {
    const observer = observerMap.get(el)
    if (observer) {
      observer.unobserve(el)
      observerMap.delete(el)
    }
  }
}

/**
 * 批量预加载图片
 * @param urls 图片 URL 数组
 * @returns Promise
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  const promises = urls.map((url) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  })
  
  return Promise.all(promises)
}

/**
 * 获取图片尺寸
 * @param url 图片 URL
 * @returns Promise<{ width: number, height: number }>
 */
export function getImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}
