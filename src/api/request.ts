import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '/admin-api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    
    // 根据后端返回的数据结构调整
    // 假设后端返回格式为 { code: 0, data: {}, message: '' }
    if (res.code !== undefined && res.code !== 0) {
      // 增加查看次数接口不弹错误提示
      const url = response.config.url || ''
      const isSilentApi = url.includes('/web/article/addView')
      
      if (!isSilentApi) {
        ElMessage.error(res.message || res.msg || '请求失败')
      }
      
      // 401 未授权，跳转登录（但留言板和注册接口除外）
      const isPublicApi = url.includes('/message/add/guestbook') || 
                          url.includes('/system/auth/register') ||
                          url.includes('/system/auth/login')
      
      if (res.code === 401 && !isPublicApi) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.message || res.msg || '请求失败'))
    }
    
    return res.data || res
  },
  (error) => {
    console.error('响应错误:', error)
    
    if (error.response) {
      const url = error.config?.url || ''
      const isPublicApi = url.includes('/message/add/guestbook') || 
                          url.includes('/system/auth/register') ||
                          url.includes('/system/auth/login')
      
      switch (error.response.status) {
        case 401:
          if (!isPublicApi) {
            ElMessage.error('未授权，请重新登录')
            localStorage.removeItem('token')
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
        default:
          ElMessage.error(error.response.data?.message || error.response.data?.msg || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default service
