import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { login as loginApi, getUserInfo as getUserInfoApi, logout as logoutApi } from '@/api/article'
import { ElMessage } from 'element-plus'
import { parseToken } from '@/utils/token'

export interface User {
  id: string
  username: string
  avatar: string
  email: string
  mobile?: string
  nickname?: string
  roles?: Array<{ id: number; name: string }>  // 添加 roles 字段
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = ref(false)
  const token = ref<string>('')

  // 初始化函数：从 localStorage 恢复登录状态
  const initFromStorage = () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = parseToken(localStorage.getItem('ACCESS_TOKEN'))
    
    if (savedUser && savedToken) {
      try {
        user.value = JSON.parse(savedUser)
        token.value = savedToken
        isLoggedIn.value = true
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('ACCESS_TOKEN')
      }
    }
  }
  
  // 立即初始化
  initFromStorage()

  // 登录
  const login = async (username: string, password: string) => {
    try {
      const res: any = await loginApi({ username, password })
      
      // 保存 token（使用管理后台的格式）
      const accessToken = res.token || res.accessToken || ''
      token.value = accessToken
      
      // 使用管理后台的格式存储：{ c: 创建时间, e: 过期时间, v: token值 }
      const tokenObj = {
        c: Date.now().toString(),
        e: '253402300799000', // 9999年的时间戳
        v: JSON.stringify(accessToken)
      }
      localStorage.setItem('ACCESS_TOKEN', JSON.stringify(tokenObj))
      
      // 获取用户信息
      await fetchUserInfo()
      
      isLoggedIn.value = true
      ElMessage.success('登录成功！欢迎回来')
      return true
    } catch (error) {
      ElMessage.error('登录失败，请检查用户名和密码')
      return false
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    const userInfo: any = await getUserInfoApi()
    user.value = {
      id: userInfo.id || userInfo.userId || '',
      username: userInfo.username || '',
      avatar: userInfo.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogIDwhLS0g6IOM5pmv5ZyGIC0tPg0KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjYwIiByPSI2MCIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4NCiAgDQogIDwhLS0g5riQ5Y+Y5a6a5LmJIC0tPg0KICA8ZGVmcz4NCiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4NCiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0ZmFjZmU7c3RvcC1vcGFjaXR5OjEiIC8+DQogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMGYyZmU7c3RvcC1vcGFjaXR5OjEiIC8+DQogICAgPC9saW5lYXJHcmFkaWVudD4NCiAgPC9kZWZzPg0KICANCiAgPCEtLSDnlKjmiLflm77moIcgLS0+DQogIDxjaXJjbGUgY3g9IjYwIiBjeT0iNDUiIHI9IjIwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+DQogIDxwYXRoIGQ9Ik0gMzAgOTUgUSAzMCA3MCA2MCA3MCBRIDkwIDcwIDkwIDk1IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+DQo8L3N2Zz4NCg==',
      email: userInfo.email || '',
      mobile: userInfo.mobile || userInfo.phone || '',
      nickname: userInfo.nickname || userInfo.username || '',
      roles: userInfo.roles || []
    }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  // 退出登录
  const logout = async () => {
    try {
      await logoutApi()
    } catch (error) {
      // 退出登录失败
    } finally {
      user.value = null
      token.value = ''
      isLoggedIn.value = false
      localStorage.removeItem('ACCESS_TOKEN')
      localStorage.removeItem('user')
      ElMessage.success('已退出登录')
    }
  }

  const isAuthor = computed(() => {
    if (!isLoggedIn.value || !user.value) return false
    const roles = user.value.roles || []
    return roles.some(role => role.name === '博主' || role.name === '超级管理员')
  })

  return {
    user,
    isLoggedIn,
    token,
    isAuthor,
    login,
    logout,
    fetchUserInfo
  }
})
