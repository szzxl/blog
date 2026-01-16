import request from './request'

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
}) => {
  return request({
    url: '/web/article/list',
    method: 'post',
    data
  })
}

export const getArticleDetail = (data: { id: string | number }) => {
  return request({
    url: '/web/article/detail',
    method: 'post',
    data
  })
}

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

// 分类相关
export const getCategoryList = (data?: { 
  id?: number
  categoryName?: string
  categoryStatus?: number
  pageNo?: number
  pageSize?: number
}) => {
  return request({ 
    url: '/web/category/list', 
    method: 'post', 
    data: data || {} 
  })
}

// 标签相关
export const getTagList = (data?: { 
  id?: number
  tagName?: string
  pageNo?: number
  pageSize?: number
}) => {
  return request({ 
    url: '/web/tag/list', 
    method: 'post', 
    data: data || {} 
  })
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

// 根据标签获取文章列表
export const getArticlesByTag = (data: {
  tagName: string
  tagStatus?: number
  pageNo: number
  pageSize: number
}) => {
  return request({
    url: '/web/tag/article/list',
    method: 'post',
    data
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
    }
  })
}

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

// 说说相关
export const getTalkList = (data: {
  userId?: number | null
  pageNo: number
  pageSize: number
}) => {
  return request({
    url: '/web/talk/list',
    method: 'post',
    data
  })
}

export const getTalkDetail = (data: {
  userId?: number | null
  talkId: number
  pageNo: number
  pageSize: number
}) => {
  return request({
    url: '/web/talk/detail',
    method: 'post',
    data
  })
}

// 发表说说
export const publishTalk = (data: {
  userId?: number
  talkContent: string
  talkPic?: string[]
  talkStatus?: number
}) => {
  return request({
    url: '/web/talk',
    method: 'post',
    data
  })
}

// 说说点赞
export const likeTalk = (data: {
  talkId: number
  userId: number
  type: 1 | 2  // 1=点赞, 2=取消点赞
}) => {
  return request({
    url: '/web/like',
    method: 'post',
    data
  })
}

// 删除说说
export const deleteTalk = (talkId: number) => {
  return request({
    url: '/web/del/talk',
    method: 'delete',
    data: { talkId }
  })
}

// 删除评论
export const deleteComment = (data: {
  talkCommentId: number
  userId?: number
}) => {
  return request({
    url: '/web/del/comment',
    method: 'delete',
    data
  })
}

// 发表评论
export const addComment = (data: {
  talkId: number
  userId: number
  content: string
  parentId?: number
  replyToId?: number
  replyToUserId?: number
}) => {
  return request({
    url: '/web/add/comment',
    method: 'post',
    data
  })
}

// 文章评论相关
export const getArticleComments = (data: {
  articleId: number | string
  pageNo: number
  pageSize: number
}) => {
  return request({
    url: '/web/article/comment/list',
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
}) => {
  return request({
    url: '/web/article/comment/add',
    method: 'post',
    data
  })
}

export const deleteArticleComment = (data: {
  commentId: number
  userId?: number
}) => {
  return request({
    url: '/web/article/comment/delete',
    method: 'delete',
    data
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
export const getUserFavorites = (data: {
  userId: number
  pageNo: number
  pageSize: number
}) => {
  return request({
    url: '/web/user/favorites',
    method: 'post',
    data
  })
}

export const removeFavorite = (data: {
  userId: number
  articleId: number
}) => {
  return request({
    url: '/web/user/favorite/remove',
    method: 'delete',
    data
  })
}

// 轮播图
export const getCarousel = () => {
  return request({
    url: '/config/carouse',
    method: 'get'
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
