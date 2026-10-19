import request from './request'

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
