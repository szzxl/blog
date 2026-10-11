/**
 * 图片懒加载指令
 */
import type { ObjectDirective } from 'vue'

interface LazyLoadOptions {
  loading?: string  // 加载中的占位图
  error?: string    // 加载失败的占位图
  threshold?: number // 触发加载的阈值
}

type LazyLoadValue = string | (LazyLoadOptions & { src?: string }) | null | undefined

interface LazyLoadState {
  observer?: IntersectionObserver
  image?: HTMLImageElement
  frame?: number
}

const defaultOptions: LazyLoadOptions = {
  loading: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5sb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==',
  error: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZjU2YzZjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5FcnJvcjwvdGV4dD48L3N2Zz4=',
  threshold: 0.01
}

const states = new WeakMap<HTMLImageElement, LazyLoadState>()

const getSrc = (value: LazyLoadValue) => typeof value === 'string' ? value : value?.src

function cleanup(el: HTMLImageElement): void {
  const state = states.get(el)
  if (!state) return
  state.observer?.disconnect()
  if (state.image) {
    state.image.onload = null
    state.image.onerror = null
  }
  if (state.frame !== undefined) cancelAnimationFrame(state.frame)
  states.delete(el)
}

/**
 * 加载图片
 */
function loadImage(el: HTMLImageElement, src: string, options: LazyLoadOptions, state: LazyLoadState): void {
  const img = new Image()
  state.image = img

  // 添加加载中的类
  el.classList.add('lazy-loading')

  img.onload = () => {
    if (states.get(el) !== state) return
    el.src = src
    el.classList.remove('lazy-loading')
    el.classList.add('lazy-loaded')
    el.style.opacity = '0'
    state.frame = requestAnimationFrame(() => {
      if (states.get(el) !== state || !el.isConnected) return
      el.style.transition = 'opacity 0.3s ease-in-out'
      el.style.opacity = '1'
    })
  }

  img.onerror = () => {
    if (states.get(el) !== state) return
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
function observeImage(el: HTMLImageElement, value: LazyLoadValue): void {
  cleanup(el)
  el.classList.remove('lazy-loading', 'lazy-loaded', 'lazy-error')
  el.style.opacity = ''
  const src = getSrc(value)
  const options: LazyLoadOptions = {
    ...defaultOptions,
    ...(typeof value === 'object' ? value : {})
  }

  if (options.loading) el.src = options.loading
  else el.removeAttribute('src')
  if (!src) return

  const state: LazyLoadState = {}
  states.set(el, state)
  if (!('IntersectionObserver' in window)) {
    loadImage(el, src, options, state)
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement

          // 加载图片
          if (states.get(target) !== state) return
          loadImage(target, src, options, state)

          // 停止观察
          observer.disconnect()
        }
      })
    },
    {
      threshold: options.threshold,
      rootMargin: '50px'
    }
  )

  state.observer = observer
  observer.observe(el)
}

/**
 * v-lazyload 指令
 *
 * 使用方式：
 * 1. 简单使用：v-lazyload="imageUrl"
 * 2. 带配置：v-lazyload="{ src: imageUrl, loading: loadingUrl, error: errorUrl }"
 */
export const lazyload: ObjectDirective<HTMLImageElement, LazyLoadValue> = {
  mounted(el, binding) {
    observeImage(el, binding.value)
  },

  updated(el, binding) {
    if (getSrc(binding.oldValue) !== getSrc(binding.value)) {
      observeImage(el, binding.value)
    }
  },

  unmounted(el: HTMLImageElement) {
    cleanup(el)
  }
}
