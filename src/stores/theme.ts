import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  // 当前主题模式
  const themeMode = ref<ThemeMode>('auto')

  // 实际应用的主题（auto 模式下根据系统自动切换）
  const appliedTheme = ref<'light' | 'dark'>('light')

  // 从 localStorage 初始化
  const initFromStorage = () => {
    const saved = localStorage.getItem('theme_mode')
    if (saved && ['light', 'dark', 'auto'].includes(saved)) {
      themeMode.value = saved as ThemeMode
    }
    updateAppliedTheme()
  }

  // 更新实际应用的主题
  const updateAppliedTheme = () => {
    if (themeMode.value === 'auto') {
      // 检测系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      appliedTheme.value = prefersDark ? 'dark' : 'light'
    } else {
      appliedTheme.value = themeMode.value
    }

    // 更新 DOM 属性
    document.documentElement.setAttribute('data-theme', appliedTheme.value)
  }

  // 设置主题
  const setTheme = (mode: ThemeMode) => {
    themeMode.value = mode
    localStorage.setItem('theme_mode', mode)
    updateAppliedTheme()
  }

  // 切换主题（在 light 和 dark 之间）
  const toggleTheme = () => {
    const newMode = appliedTheme.value === 'light' ? 'dark' : 'light'
    setTheme(newMode)
  }

  // 监听系统主题变化
  const setupSystemThemeListener = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (themeMode.value === 'auto') {
        appliedTheme.value = e.matches ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', appliedTheme.value)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
  }

  // 监听主题模式变化
  watch(() => themeMode.value, () => {
    updateAppliedTheme()
  })

  return {
    themeMode,
    appliedTheme,
    initFromStorage,
    setTheme,
    toggleTheme,
    setupSystemThemeListener
  }
})
