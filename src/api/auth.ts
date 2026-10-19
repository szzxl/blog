import request from './request'

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

export const updatePassword = (data: { oldPassword: string; newPassword: string }) => {
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
