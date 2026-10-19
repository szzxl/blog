import request from './request'

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

export const deleteArticleComment = (data: { commentId: number; userId?: number }) => {
  return request({
    url: `/article/comment/${data.commentId}`,
    method: 'delete'
  })
}

export const likeArticleComment = (data: {
  commentArticleId: number | string
  type: 1 | 2 // 1=点赞, 2=取消点赞
}) => {
  return request({
    url: '/web/article/comment/like',
    method: 'post',
    data
  })
}

export const getPhotoComments = (data: {
  photoId: number | string
  pageNo: number
  pageSize: number
}) => request({ url: '/web/photo/comment/list', method: 'post', data })

export const addPhotoComment = (data: {
  username: string
  photoId: number | string
  content: string
  images?: string[]
  likeCount?: number
  userId: number
  parentId?: number | string
  rootId?: number | string
}) => request({ url: '/web/photo/comment/add', method: 'post', data })

export const deletePhotoComment = (data: { commentId: number; userId?: number }) =>
  request({ url: `/web/photo/comment/${data.commentId}`, method: 'delete' })

export const likePhotoComment = (data: { commentId: number | string; type: 1 | 2 }) =>
  request({ url: '/web/photo/comment/like', method: 'post', data })
