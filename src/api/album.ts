import request from './request'

export const getAlbumList = (data?: {
  id?: number
  albumName?: string
  albumStatus?: number
  pageNo?: number
  pageSize?: number
}) => {
  return request({
    url: '/web/album/list',
    method: 'post',
    data: data || {}
  })
}

export const getAlbumPhotos = (data: { pageNo: number; pageSize: number; id: number }) => {
  return request({
    url: '/web/album/photo/page',
    method: 'post',
    data
  })
}
