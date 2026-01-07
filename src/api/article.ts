import request from './request'

export const getArticleList = (params: any) => {
  return request({
    url: '/articles',
    method: 'get',
    params
  })
}

export const getArticleDetail = (id: string) => {
  return request({
    url: `/articles/${id}`,
    method: 'get'
  })
}

export const getCategoryList = () => {
  return request({
    url: '/categories',
    method: 'get'
  })
}

export const getTagList = () => {
  return request({
    url: '/tags',
    method: 'get'
  })
}
