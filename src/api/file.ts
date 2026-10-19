import request from './request'

export const uploadImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/infra/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 30000 // 增加超时时间到30秒
  })
}
