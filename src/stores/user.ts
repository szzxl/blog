import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: string
  username: string
  avatar: string
  email: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = ref(false)

  // 从 localStorage 恢复登录状态
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    user.value = JSON.parse(savedUser)
    isLoggedIn.value = true
  }

  const login = (userData: User) => {
    user.value = userData
    isLoggedIn.value = true
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    user.value = null
    isLoggedIn.value = false
    localStorage.removeItem('user')
  }

  return {
    user,
    isLoggedIn,
    login,
    logout
  }
})
