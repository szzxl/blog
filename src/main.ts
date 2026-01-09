import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/global.scss'

const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.error('错误信息:', info)
  // 忽略 parentNode 相关的错误，这些通常是 Vue 内部的清理操作
  if (err instanceof Error && err.message.includes('parentNode')) {
    return
  }
}

// 全局警告处理
app.config.warnHandler = (msg, instance, trace) => {
  // 忽略某些不重要的警告
  if (msg.includes('Unhandled error during execution')) {
    return
  }
  console.warn('Vue 警告:', msg)
}

app.use(router)
app.use(pinia)
app.use(ElementPlus)

app.mount('#app')
