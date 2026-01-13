import { ref } from 'vue'
import { defineStore } from 'pinia'
import { login as loginApi, getUserInfo as getUserInfoApi, logout as logoutApi } from '@/api/article'
import { ElMessage } from 'element-plus'

export interface User {
  id: string
  username: string
  avatar: string
  email: string
  nickname?: string
  roles?: Array<{ id: number; name: string }>  // 添加 roles 字段
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = ref(false)
  const token = ref<string>('')

  // 从 localStorage 恢复登录状态
  const savedUser = localStorage.getItem('user')
  const savedToken = localStorage.getItem('token')
  if (savedUser && savedToken) {
    user.value = JSON.parse(savedUser)
    token.value = savedToken
    isLoggedIn.value = true
  }

  // 登录
  const login = async (username: string, password: string) => {
    try {
      const res: any = await loginApi({ username, password })
      
      // 保存 token
      token.value = res.token || res.accessToken || ''
      localStorage.setItem('token', token.value)
      
      // 获取用户信息
      await fetchUserInfo()
      
      isLoggedIn.value = true
      ElMessage.success('登录成功！欢迎回来 🌸')
      return true
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error('登录失败，请检查用户名和密码')
      return false
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const userInfo: any = await getUserInfoApi()
      user.value = {
        id: userInfo.id || userInfo.userId || '',
        username: userInfo.username || '',
        avatar: userInfo.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmOWE5ZTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZWNmZWY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PGNpcmNsZSBjeD0iNjAiIGN5PSI0NSIgcj0iMjAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjkiLz48cGF0aCBkPSJNIDMwIDk1IFEgMzAgNzAgNjAgNzAgUSA5MCA3MCA5MCA5NSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOSIvPjx0ZXh0IHg9IjYwIiB5PSIzNSIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPvCfjLg8L3RleHQ+PC9zdmc+',
        email: userInfo.email || '',
        nickname: userInfo.nickname || userInfo.username || '',
        roles: userInfo.roles || []  // 保存 roles 数据
      }
      localStorage.setItem('user', JSON.stringify(user.value))
      console.log('用户信息已更新:', user.value)
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  // 退出登录
  const logout = async () => {
    try {
      await logoutApi()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      user.value = null
      token.value = ''
      isLoggedIn.value = false
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      ElMessage.success('已退出登录')
    }
  }

  // 手动设置用户信息（用于测试）
  const setUser = (userData: User) => {
    user.value = userData
    isLoggedIn.value = true
    localStorage.setItem('user', JSON.stringify(userData))
  }

  return {
    user,
    isLoggedIn,
    token,
    login,
    logout,
    fetchUserInfo,
    setUser
  }
})
