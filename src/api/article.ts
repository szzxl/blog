import request from './request'
import type { ArticleDetail, ArticleSummary } from '@/types/article'
import type { ListResponse, PageParams } from '@/types/pagination'
import { normalizePageResult } from '@/utils/collection'

export const getArticleList = (data: {
  keyword?: string
  articleName?: string
  articleCategory?: string
  articleTag?: string
  pageNo?: number
  pageSize?: number
}) =>
  request
    .post<ListResponse<ArticleSummary>, ListResponse<ArticleSummary>>('/web/article/list', data)
    .then(normalizePageResult<ArticleSummary>)

export const getMonthArticleList = (data: PageParams) =>
  request
    .post<ListResponse<ArticleSummary>, ListResponse<ArticleSummary>>('/web/month/article', data)
    .then(normalizePageResult<ArticleSummary>)

export const getArticleDetail = (data: { id: string | number }) =>
  request.post<ArticleDetail, ArticleDetail>('/web/article/detail', data)

export const addArticleView = (data: { id: string | number }) => {
  return request({
    url: '/web/article/addView',
    method: 'post',
    data
  })
}

export const likeArticle = (data: {
  articleId: number | string
  type: 1 | 2 // 1=点赞, 2=取消点赞
}) => {
  return request({
    url: '/web/article/like',
    method: 'post',
    data
  })
}

export const getArticleLikeCount = (articleId: number | string) => {
  return request({
    url: '/web/article/like/num',
    method: 'post',
    data: { articleId }
  })
}
