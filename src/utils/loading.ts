import { ElLoading } from 'element-plus'
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading'

let loadingInstance: LoadingInstance | null = null
let loadingCount = 0

/**
 * 显示全局 Loading
 * @param text 加载文本
 */
export const showLoading = (text = '加载中...') => {
  loadingCount++
  
  if (loadingInstance) {
    return
  }
  
  loadingInstance = ElLoading.service({
    lock: true,
    text,
    background: 'rgba(0, 0, 0, 0.7)',
    customClass: 'global-loading'
  })
}

/**
 * 隐藏全局 Loading
 */
export const hideLoading = () => {
  loadingCount--
  
  if (loadingCount <= 0) {
    loadingCount = 0
    loadingInstance?.close()
    loadingInstance = null
  }
}

/**
 * 强制关闭 Loading
 */
export const forceHideLoading = () => {
  loadingCount = 0
  loadingInstance?.close()
  loadingInstance = null
}
