import request from './request'

export const getApprovedGuestbookMessages = (data: { pageNo: number; pageSize: number }) =>
  request({ url: '/message/guestbook/approved', method: 'post', data })

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
