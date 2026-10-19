import request from './request'
import type { SiteNotice } from '@/types/website'
import type { ListResponse } from '@/types/pagination'
import { normalizePageResult } from '@/utils/collection'

export const getWebsiteConfig = () => {
  return request({
    url: '/config/website',
    method: 'get'
  })
}

export const getFriendLinks = () => {
  return request({
    url: '/config/link',
    method: 'get'
  })
}

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

export const getNotificationList = () =>
  request
    .post<ListResponse<SiteNotice>, ListResponse<SiteNotice>>('/config/notification/list')
    .then((response) => normalizePageResult(response).list)
