import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { showRequestError, markRequestErrorNotified } from '@/utils/requestError'
import router from '@/router'
import { showLoading, hideLoading } from '@/utils/loading'
import { parseToken } from '@/utils/token'
import { useUserStore } from '@/stores/user'

// 公开接口列表（不需要登录的接口）
const PUBLIC_APIS = [
  '/message/add/guestbook',
  '/message/guestbook/approved',
  '/system/auth/register',
  '/system/auth/login',
  '/system/user/profile/get',  // session 恢复检查，401 不跳转登录
  '/web/article/list',
  '/web/article/detail',
  '/web/article/like/num',
  '/web/article/addView',
  '/web/visit',
  '/web/month/article',
  '/web/category/list',
  '/web/tag/list',
  '/article/comment/page',
  '/article/comment/reply',
  '/web/photo/comment/list',
  '/web/album/list',
  '/web/album/photo/page',
  '/config/notification/list',
  '/config/website',
  '/config/link',
  '/config/link/apply'
]

// 静默接口列表（不弹出错误提示）
const SILENT_APIS = [
  '/config/website',
  '/web/article/addView',
  '/web/visit'
]

// 不显示 Loading 的接口
const NO_LOADING_APIS = [
  '/web/article/list',
  '/web/article/detail',
  '/web/month/article',
  '/web/category/list',
  '/web/tag/list',
  '/article/comment/page',
  '/article/comment/reply',
  '/article/favorite/page',
  '/web/photo/comment/list',
  '/web/album/list',
  '/web/album/photo/page',
  '/config/website',
  '/config/link',
  '/config/link/apply',
  '/config/notification/list',
  '/system/user/profile/get',
  '/web/article/addView',
  '/web/article/like',
  '/web/visit'
]

const matchesApi = (url: string, api: string): boolean =>
  url === api || url.startsWith(api + '/') || url.startsWith(api + '?')

const isPublicApi = (url: string): boolean => PUBLIC_APIS.some(api => matchesApi(url, api))
const isSilentApi = (url: string): boolean => SILENT_APIS.some(api => matchesApi(url, api))
const needLoading = (url: string): boolean => !NO_LOADING_APIS.some(api => matchesApi(url, api))

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
    
    const rawToken = localStorage.getItem('ACCESS_TOKEN')
    if (rawToken) {
      const token = parseToken(rawToken)
      if (token && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    return config
  },
  (error) => {
    if (error.config && needLoading(error.config.url || '')) hideLoading()
    showRequestError(error, '请求无法发出，请重试', true)
    return Promise.reject(error)
  }
)

const isCurrentSession = (config?: InternalAxiosRequestConfig) => {
  const current = parseToken(localStorage.getItem('ACCESS_TOKEN'))
  return String(config?.headers?.Authorization || '') === (current ? `Bearer ${current}` : '')
}

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 隐藏 Loading
    if (needLoading(response.config.url || '')) hideLoading()
    
    const res = response.data
    const url = response.config.url || ''
    
    // 根据后端返回的数据结构调整
    // 假设后端返回格式为 { code: 0, data: {}, message: '' }
    if (res.code !== undefined && res.code !== 0) {
      // 公开接口返回 401 表示"未登录但内容仍可访问"，静默处理
      const silent = isSilentApi(url) || (res.code === 401 && isPublicApi(url))
      const failure = Object.assign(new Error(res.message || res.msg || '请求失败'), { code: res.code })
      if (!silent) showRequestError(failure)
      else markRequestErrorNotified(failure)
      
      // 401 未授权，只有非公开接口才跳转登录
      if (res.code === 401 && !isPublicApi(url) && isCurrentSession(response.config)) {
        useUserStore().clearAuth()
        router.push('/login')
      }
      
      return Promise.reject(failure)
    }
    
    // 返回 data 字段，如果 data 不存在则返回整个响应
    return res.data !== undefined ? res.data : res
  },
  (error) => {
    // 隐藏 Loading
    const url = error.config?.url || ''
    if (error.config && needLoading(url)) hideLoading()
    if (isSilentApi(url)) { markRequestErrorNotified(error); return Promise.reject(error) }
    
    if (error.response) {
      const url = error.config?.url || ''
      
      switch (error.response.status) {
        case 401:
          if (!isPublicApi(url) && isCurrentSession(error.config)) {
            showRequestError(error, '未授权，请重新登录', true)
            useUserStore().clearAuth()
            router.push('/login')
          }
          break
        case 403:
          showRequestError(error, '拒绝访问', true)
          break
        case 404:
          showRequestError(error, '请求的资源不存在', true)
          break
        case 500:
          showRequestError(error, '服务器错误', true)
          break
        case 502:
          showRequestError(error, '网关错误', true)
          break
        case 503:
          showRequestError(error, '服务不可用', true)
          break
        case 504:
          showRequestError(error, '网关超时', true)
          break
        default:
          showRequestError(error, error.response.data?.message || error.response.data?.msg || '请求失败', true)
      }
    } else if (error.code === 'ECONNABORTED') {
      showRequestError(error, '请求超时，请稍后重试', true)
    } else {
      showRequestError(error, '网络错误，请检查网络连接', true)
    }
    
    markRequestErrorNotified(error)
    return Promise.reject(error)
  }
)

export default service
