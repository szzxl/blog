import request from './request'
import type { CommentId, CommentResponse, CommentSubmission, CommentView } from '@/types/comment'
import type { PageParams, PageResult } from '@/types/pagination'

const parseImages = (value: unknown): string[] => {
  try {
    const parsed: unknown = typeof value === 'string' ? JSON.parse(value) : value
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && /^(https?:\/\/|\/)[^\s]+$/i.test(item)) : []
  } catch { return [] }
}
export const toCommentView = (item: CommentResponse): CommentView => ({
  ...item,
  images: parseImages(item.images),
  user: { nickname: item.username || '匿名用户', isAuthor: item.isAuthor === true },
  isLiked: item.isLiked === true,
  likeCount: item.likeCount || 0,
  children: (item.children || []).map(toCommentView)
})
const getPage = (url: string, data: object) => request<unknown, PageResult<CommentResponse>>({ url, method: 'post', data })
export const getCommentReplies = (rootId: CommentId, pageNo = 1, pageSize = 20) =>
  request<unknown, PageResult<CommentResponse>>({ url: `/article/comment/reply/${rootId}/page`, method: 'get', params: { pageNo, pageSize } })
export const getArticleComments = (data: PageParams & { articleId: CommentId }) => getPage('/article/comment/page', data)
export const getPhotoComments = (data: PageParams & { photoId: CommentId }) => getPage('/web/photo/comment/list', data)
export const addArticleComment = (data: CommentSubmission & { articleId: CommentId; parentId?: CommentId; rootId?: CommentId }) =>
  request({ url: '/article/add/comment', method: 'post', data })
export const addPhotoComment = (data: CommentSubmission & { photoId: CommentId; parentId?: CommentId; rootId?: CommentId }) =>
  request({ url: '/web/photo/comment/add', method: 'post', data })
export const deleteArticleComment = (data: { commentId: CommentId }) =>
  request({ url: `/article/comment/${data.commentId}`, method: 'delete' })
export const deletePhotoComment = (data: { commentId: CommentId }) =>
  request({ url: `/web/photo/comment/${data.commentId}`, method: 'delete' })
export const likeArticleComment = (data: { commentArticleId: CommentId; type: 1 | 2 }) =>
  request({ url: '/web/article/comment/like', method: 'post', data })
export const likePhotoComment = (data: { commentId: CommentId; type: 1 | 2 }) =>
  request({ url: '/web/photo/comment/like', method: 'post', data })
