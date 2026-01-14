import { ref } from 'vue'
import { defineStore } from 'pinia'
import { login as loginApi, getUserInfo as getUserInfoApi, logout as logoutApi } from '@/api/article'
import { ElMessage } from 'element-plus'

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

  // 从 localStorage 恢复登录状态（使用管理后台的 key）
  const savedUser = localStorage.getItem('user')
  const savedTokenStr = localStorage.getItem('ACCESS_TOKEN')
  
  // 解析管理后台的 token 格式（可能是 JSON 对象）
  let savedToken = ''
  if (savedTokenStr) {
    try {
      const tokenObj = JSON.parse(savedTokenStr)
      // 管理后台的 token 格式：{ c: 创建时间, e: 过期时间, v: token值 }
      savedToken = tokenObj.v ? JSON.parse(tokenObj.v) : savedTokenStr
    } catch {
      // 如果解析失败，直接使用原始值
      savedToken = savedTokenStr
    }
  }
  
  if (savedUser && savedToken) {
    user.value = JSON.parse(savedUser)
    token.value = savedToken
    isLoggedIn.value = true
  }

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
      ElMessage.success('登录成功！欢迎回来 🌸')
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
      avatar: userInfo.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmOWE5ZTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZWNmZWY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PGNpcmNsZSBjeD0iNjAiIGN5PSI0NSIgcj0iMjAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjkiLz48cGF0aCBkPSJNIDMwIDk1IFEgMzAgNzAgNjAgNzAgUSA5MCA3MCA5MCA5NSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOSIvPjx0ZXh0IHg9IjYwIiB5PSIzNSIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPvCfjLg8L3RleHQ+PC9zdmc+',
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
