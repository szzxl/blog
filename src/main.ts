import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { useThemeStore } from './stores/theme'
import { lazyload, lazyBg } from './directives/lazyload'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import './styles/global.scss'

const app = createApp(App)

// 注册全局指令
app.directive('lazyload', lazyload)
app.directive('lazy-bg', lazyBg)

// 全局错误处理
app.config.errorHandler = (err) => {
  // 忽略 parentNode 相关的错误，这些通常是 Vue 内部的清理操作
  if (err instanceof Error && err.message.includes('parentNode')) {
    return
  }
  
  // 忽略一些不影响功能的错误
  if (err instanceof Error && (
    err.message.includes('ResizeObserver') ||
    err.message.includes('Non-Error promise rejection')
  )) {
    return
  }
}

// 全局警告处理
app.config.warnHandler = (msg) => {
  // 忽略某些不重要的警告
  if (
    msg.includes('Unhandled error during execution') ||
    msg.includes('Extraneous non-props attributes')
  ) {
    return
  }
}

app.use(router)
app.use(pinia)
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')

// 初始化主题
const themeStore = useThemeStore()
themeStore.initFromStorage()
themeStore.setupSystemThemeListener()

