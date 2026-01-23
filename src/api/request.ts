import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { showLoading, hideLoading } from '@/utils/loading'
import { sanitizeInput } from '@/utils/security'

// 公开接口列表（不需要登录的接口）
const PUBLIC_APIS = [
  '/message/add/guestbook',
  '/system/auth/register',
  '/system/auth/login',
  '/web/article/list',
  '/web/article/detail',
  '/web/category/list',
  '/web/tag/list'
]

// 静默接口列表（不弹出错误提示）
const SILENT_APIS = [
  '/web/article/addView'
]

// 不显示 Loading 的接口
const NO_LOADING_APIS = [
  '/web/article/addView',
  '/web/article/like'
]

// 检查是否是公开接口
const isPublicApi = (url: string): boolean => {
  return PUBLIC_APIS.some(api => url.includes(api))
}

// 检查是否是静默接口
const isSilentApi = (url: string): boolean => {
  return SILENT_APIS.some(api => url.includes(api))
}

// 检查是否需要显示 Loading
const needLoading = (url: string): boolean => {
  return !NO_LOADING_APIS.some(api => url.includes(api))
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/admin-api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 显示 Loading
    if (needLoading(config.url || '')) {
      showLoading()
    }
    
    // 从 localStorage 获取 token（使用管理后台的 key）
    const tokenStr = localStorage.getItem('ACCESS_TOKEN')
    
    // 解析管理后台的 token 格式
    let token = ''
    if (tokenStr) {
      try {
        const tokenObj = JSON.parse(tokenStr)
        // 管理后台的 token 格式：{ c: 创建时间, e: 过期时间, v: token值 }
        token = tokenObj.v ? JSON.parse(tokenObj.v) : tokenStr
      } catch {
        // 如果解析失败，直接使用原始值
        token = tokenStr
      }
    }
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // XSS 防护：清理请求数据（跳过 FormData）
    if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
      config.data = sanitizeRequestData(config.data)
    }
    
    return config
  },
  (error) => {
    hideLoading()
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 隐藏 Loading
    hideLoading()
    
    const res = response.data
    const url = response.config.url || ''
    
    // 根据后端返回的数据结构调整
    // 假设后端返回格式为 { code: 0, data: {}, message: '' }
    if (res.code !== undefined && res.code !== 0) {
      // 不弹错误提示的接口
      if (!isSilentApi(url)) {
        ElMessage.error(res.message || res.msg || '请求失败')
      }
      
      // 401 未授权，只有非公开接口才跳转登录
      if (res.code === 401 && !isPublicApi(url)) {
        localStorage.removeItem('ACCESS_TOKEN')
        localStorage.removeItem('user')
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.message || res.msg || '请求失败'))
    }
    
    return res.data || res
  },
  (error) => {
    // 隐藏 Loading
    hideLoading()
    
    if (error.response) {
      const url = error.config?.url || ''
      
      switch (error.response.status) {
        case 401:
          if (!isPublicApi(url)) {
            ElMessage.error('未授权，请重新登录')
            localStorage.removeItem('ACCESS_TOKEN')
            localStorage.removeItem('user')
            router.push('/login')
          } else {
            ElMessage.error('操作失败，请重试')
          }
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        case 502:
          ElMessage.error('网关错误')
          break
        case 503:
          ElMessage.error('服务不可用')
          break
        case 504:
          ElMessage.error('网关超时')
          break
        default:
          ElMessage.error(error.response.data?.message || error.response.data?.msg || '请求失败')
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请稍后重试')
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

/**
 * 清理请求数据，防止 XSS
 */
const sanitizeRequestData = (data: any): any => {
  if (typeof data === 'string') {
    return sanitizeInput(data)
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeRequestData(item))
  }
  
  if (typeof data === 'object' && data !== null) {
    const cleaned: any = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        cleaned[key] = sanitizeRequestData(data[key])
      }
    }
    return cleaned
  }
  
  return data
}

export default service
