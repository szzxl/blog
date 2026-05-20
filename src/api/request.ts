import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { showLoading, hideLoading } from '@/utils/loading'
import { parseToken } from '@/utils/token'

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
  '/web/month/article',
  '/web/category/list',
  '/web/tag/list',
  '/article/comment/page',
  '/article/comment/reply/',
  '/web/album/comment/list',
  '/album/list',
  '/album/photo/list',
  '/config/notification/list',
  '/config/website',
  '/config/link'
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
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
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
      // 公开接口返回 401 表示"未登录但内容仍可访问"，静默处理
      const silent = isSilentApi(url) || (res.code === 401 && isPublicApi(url))
      if (!silent) {
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
    
    // 返回 data 字段，如果 data 不存在则返回整个响应
    return res.data !== undefined ? res.data : res
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

export default service
