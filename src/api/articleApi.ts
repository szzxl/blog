import request from './request'

export const login = (data: { username: string; password: string }) => {
  return request({ url: '/system/auth/login', method: 'post', data })
}

export const register = (data: { username: string; nickname: string; password: string }) => {
  return request({ url: '/system/auth/register', method: 'post', data })
}

export const getUserInfo = () => {
  return request({ url: '/system/user/profile/get', method: 'get' })
}

export const logout = () => {
  return request({ url: '/system/auth/logout', method: 'post' })
}

export const getArticleList = (data: { 
  articleName?: string
  articleCategory?: string
  articleTag?: string
  pageNo?: number
  pageSize?: number
}) => {
  return request({ url: '/web/article/list', method: 'post', data })
}

export const getArticleDetail = (data: { id: string | number }) => {
  return request({ url: '/web/article/detail', method: 'post', data })
}

export const addArticleView = (data: { id: string | number }) => {
  return request({ url: '/web/article/addView', method: 'post', data })
}

export const getCategoryList = (data?: { 
  id?: number
  categoryName?: string
  categoryStatus?: number
  pageNo?: number
  pageSize?: number
}) => {
  return request({ url: '/article/category/list', method: 'post', data: data || {} })
}

export const getTagList = (data?: { 
  id?: number
  tagName?: string
  pageNo?: number
  pageSize?: number
}) => {
  return request({ url: '/article/tag/list', method: 'post', data: data || {} })
}

export const uploadImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/infra/file/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const submitGuestbookMessage = (data: {
  username: string
  contact?: string
  content: string
  images?: string[]
}) => {
  return request({ url: '/message/add/guestbook', method: 'post', data })
}
