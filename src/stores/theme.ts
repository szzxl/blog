import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ThemeType = 'girl' | 'boy' | 'it' | 'finance' | 'mom'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeType>(
    (localStorage.getItem('theme') as ThemeType) || 'girl'
  )

  const setTheme = (theme: ThemeType) => {
    currentTheme.value = theme
    localStorage.setItem('theme', theme)
  }

  const toggleTheme = () => {
    const themes: ThemeType[] = ['girl', 'boy', 'it', 'finance', 'mom']
    const currentIndex = themes.indexOf(currentTheme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  return {
    currentTheme,
    setTheme,
    toggleTheme
  }
})
