import request from './request'
import { cache, generateCacheKey } from '@/utils/cache'

// 用户认证相关
export const login = (data: { username: string; password: string }) => {
  return request({
    url: '/system/auth/login',
    method: 'post',
    data
  })
}

export const register = (data: { username: string; nickname: string; password: string }) => {
  return request({
    url: '/system/auth/register',
    method: 'post',
    data
  })
}

export const getUserInfo = () => {
  return request({
    url: '/system/user/profile/get',
    method: 'get'
  })
}

export const updateUserProfile = (data: { 
  avatar?: string
  nickname?: string
  email?: string
  mobile?: string
}) => {
  return request({
    url: '/system/user/profile/update',
    method: 'put',
    data
  })
}

export const updatePassword = (data: {
  oldPassword: string
  newPassword: string
}) => {
  return request({
    url: '/system/user/profile/update-password',
    method: 'put',
    data
  })
}

export const logout = () => {
  return request({
    url: '/system/auth/logout',
    method: 'post'
  })
}

// 文章相关
export const getArticleList = (data: {
  articleName?: string
  articleCategory?: string
  articleTag?: string
  pageNo?: number
  pageSize?: number
}) => request({ url: '/web/article/list', method: 'post', data })

// 获取月度文章列表（首页使用）
export const getMonthArticleList = (data: {
  pageNo: number
  pageSize: number
}) => request({ url: '/web/month/article', method: 'post', data })

export const getArticleDetail = (data: { id: string | number }) =>
  request({ url: '/web/article/detail', method: 'post', data })

// 增加文章查看次数
export const addArticleView = (data: { id: string | number }) => {
  return request({
    url: '/web/article/addView',
    method: 'post',
    data
  })
}

// 文章点赞
export const likeArticle = (data: {
  articleId: number | string
  type: 1 | 2  // 1=点赞, 2=取消点赞
}) => {
  return request({
    url: '/web/article/like',
    method: 'post',
    data
  })
}

// 查询文章点赞数量
export const getArticleLikeCount = (articleId: number | string) => {
  return request({
    url: '/web/article/like/num',
    method: 'post',
    data: { articleId }
  })
}

// 分类相关
export const getCategoryList = async (data?: { 
  id?: number
  categoryName?: string
  categoryStatus?: number
  pageNo?: number
  pageSize?: number
}) => {
  const cacheKey = generateCacheKey('category_list', data)
  const cached = cache.get(cacheKey)
  if (cached) return cached
  
  const result = await request({ 
    url: '/web/category/list', 
    method: 'post', 
    data: data || {} 
  })
  
  cache.set(cacheKey, result, 60 * 60 * 1000)
  return result
}

// 标签相关
export const getTagList = async (data?: {
  id?: number
  tagName?: string
  pageNo?: number
  pageSize?: number
}) => {
  const cacheKey = generateCacheKey('tag_list', data)
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const result = await request({
    url: '/web/tag/list',
    method: 'post',
    data: data || {}
  })

  cache.set(cacheKey, result, 60 * 60 * 1000)
  return result
}

// 获取标签统计（带文章数量）
export const getTagListCount = (data?: {
  id?: number
  tagName?: string
  tagStatus?: number
  pageNo?: number
  pageSize?: number
}) => {
  return request({
    url: '/web/tag/list/count',
    method: 'post',
    data: data || {}
  })
}

// 文件上传
export const uploadImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/infra/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 30000 // 增加超时时间到30秒
  })
}

// 查询已审核留言列表
export const getApprovedGuestbookMessages = (data: { pageNo: number; pageSize: number }) =>
  request({ url: '/message/guestbook/approved', method: 'post', data })

// 留言板
export const submitGuestbookMessage = (data: {
  username: string
  contact?: string
  content: string
  images?: string[]
}) => {
  return request({
    url: '/message/add/guestbook',
    method: 'post',
    data
  })
}


// 文章评论相关
export const getCommentReplies = (rootId: number | string) =>
  request({ url: `/article/comment/reply/${rootId}`, method: 'get' })

export const getArticleComments = (data: {
  articleId: number | string
  pageNo: number
  pageSize: number
}) => {
  return request({
    url: '/article/comment/page',
    method: 'post',
    data
  })
}

export const addArticleComment = (data: {
  username: string
  articleId: number | string
  content: string
  images?: string[]
  likeCount?: number
  userId: number
  parentId?: number | string
  rootId?: number | string
}) => {
  return request({
    url: '/article/add/comment',
    method: 'post',
    data
  })
}

export const deleteArticleComment = (data: {
  commentId: number
  userId?: number
}) => {
  return request({
    url: `/article/comment/${data.commentId}`,
    method: 'delete'
  })
}

// 文章评论点赞
export const likeArticleComment = (data: {
  commentArticleId: number | string
  type: 1 | 2  // 1=点赞, 2=取消点赞
}) => {
  return request({
    url: '/web/article/comment/like',
    method: 'post',
    data
  })
}

// 收藏相关
export const addFavorite = (data: {
  articleId: string | number
  articleName: string
  articleTime: string
  userId: number
}) => {
  return request({
    url: '/article/add/favorite',
    method: 'post',
    data
  })
}

export const getUserFavorites = (data: {
  userId: string | number
  pageNo: number
  pageSize: number
}) => {
  return request({
    url: '/article/favorite/page',
    method: 'post',
    data
  })
}

export const removeFavorite = (data: { articleId: string | number; userId: string | number }) => {
  return request({
    url: '/article/delete/favorite',
    method: 'post',
    data
  })
}


// 网站配置
export const getWebsiteConfig = () => {
  return request({
    url: '/config/website',
    method: 'get'
  })
}

// 友情链接
export const getFriendLinks = () => {
  return request({
    url: '/config/link',
    method: 'get'
  })
}

// 申请友情链接
export const applyFriendLink = (data: {
  name: string
  author: string
  url: string
  description: string
  email: string
}) => {
  return request({
    url: '/config/link/apply',
    method: 'post',
    data
  })
}

// 获取通知列表
export const getNotificationList = () => {
  return request({
    url: '/config/notification/list',
    method: 'post'
  })
}

// 相册评论
export const getAlbumComments = (data: { albumId: number | string; pageNo: number; pageSize: number }) =>
  request({ url: '/web/album/comment/list', method: 'post', data })

export const addAlbumComment = (data: { username: string; albumId: number | string; content: string; images?: string[]; likeCount?: number; userId: number; parentId?: number | string; rootId?: number | string }) =>
  request({ url: '/web/album/comment/add', method: 'post', data })

export const deleteAlbumComment = (data: { commentId: number; userId?: number }) =>
  request({ url: '/web/album/comment/delete', method: 'delete', data })

export const likeAlbumComment = (data: { commentId: number | string; type: 1 | 2 }) =>
  request({ url: '/web/album/comment/like', method: 'post', data })

// 相册相关
export const getAlbumList = (data?: {
  id?: number
  albumName?: string
  albumStatus?: number
  pageNo?: number
  pageSize?: number
}) => {
  return request({
    url: '/album/list',
    method: 'post',
    data: data || {}
  })
}

export const getAlbumPhotos = (data: {
  id: number
}) => {
  return request({
    url: '/album/photo/list',
    method: 'post',
    data
  })
}
