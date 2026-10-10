import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { useThemeStore } from './stores/theme'
import { lazyload, lazyBg } from './directives/lazyload'
import { ElLoading } from 'element-plus/es/components/loading/index'
import 'element-plus/es/components/base/style/css'
import 'element-plus/es/components/loading/style/css'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import './styles/global.scss'
import { setSiteName } from '@/composables/useSeo'
import { fetchWebsiteConfigWithCache, startWebsiteConfigRefresh } from '@/utils/websiteConfig'
import { setupVisitTracking } from '@/utils/visit'

const app = createApp(App)

// 注册全局指令
app.directive('lazyload', lazyload)
app.directive('lazy-bg', lazyBg)

// 全局错误处理
app.config.errorHandler = (err) => {
  console.error('[博客运行错误]', err)
}

// 全局警告处理
app.config.warnHandler = (msg) => { console.warn('[博客组件警告]', msg) }

app.use(router)
app.use(pinia)
app.use(ElLoading)

setupVisitTracking(router)

app.mount('#app')

// 初始化主题
const themeStore = useThemeStore()
themeStore.initFromStorage()
themeStore.setupSystemThemeListener()
startWebsiteConfigRefresh()

// 预加载网站配置并同步 SEO 站点名
fetchWebsiteConfigWithCache().then(config => {
  if (config.site_name) setSiteName(config.site_name.replace(/系统$/u, ''))
})

