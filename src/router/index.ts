import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus/es/components/message/index'
import { parseToken } from '@/utils/token'
import { resetSeo } from '@/composables/useSeo'
import Home from '@/views/Home.vue'

// 根据环境变量动态设置 base 路径
const getBasePath = () => {
  return import.meta.env.VITE_BASE_PATH || '/'
}

const router = createRouter({
  history: createWebHistory(getBasePath()),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    { path: '/login',            name: 'login',            component: () => import('@/views/Login.vue'),      meta: { title: '登录' } },
    { path: '/register',         name: 'register',         component: () => import('@/views/Register.vue'),   meta: { title: '注册' } },
    { path: '/articles',         name: 'articles',         component: () => import('@/views/ArticleList.vue'),meta: { title: '所有文章' } },
    { path: '/article/:id',      name: 'article-detail',   component: () => import('@/views/ArticleDetail.vue') },
    { path: '/category',         name: 'category',         component: () => import('@/views/Category.vue'),   meta: { title: '文章分类' } },
    { path: '/tag',              name: 'tag',              component: () => import('@/views/Tag.vue'),        meta: { title: '标签' } },
    { path: '/tag/articles',     name: 'tag-articles',     component: () => import('@/views/TagArticles.vue'),meta: { title: '标签文章' } },
    { path: '/album',            name: 'album',            component: () => import('@/views/Album.vue'),      meta: { title: '相册' } },
    { path: '/tools',            name: 'tools',            component: () => import('@/views/Tools.vue'),      meta: { title: '工具' } },
    { path: '/guestbook',        name: 'guestbook',        component: () => import('@/views/Guestbook.vue'),  meta: { title: '留言板' } },
    { path: '/link',             name: 'link',             component: () => import('@/views/Link.vue'),       meta: { title: '友情链接' } },
    { path: '/profile',          name: 'profile',          component: () => import('@/views/Profile.vue'),    meta: { requiresAuth: true, title: '个人中心' } },
    { path: '/favorites',        name: 'favorites',        component: () => import('@/views/Favorites.vue'),  meta: { requiresAuth: true, title: '我的收藏' } },
    { path: '/about',            name: 'about',            component: () => import('@/views/About.vue'),      meta: { title: '关于我' } },
    { path: '/:pathMatch(.*)*',  name: 'not-found',        component: () => import('@/views/NotFound.vue'),   meta: { title: '页面未找到' } }
  ]
})

// 路由守卫 - 检查登录状态
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()

  const tokenStr = localStorage.getItem('ACCESS_TOKEN')
  const token = parseToken(tokenStr)

  // token 已被清除（如 401）但 store 未同步，补清 store
  if (!token && (tokenStr || userStore.isLoggedIn || userStore.user)) {
    userStore.clearAuth()
  }

  // 如果有可解析的 token 但没有用户信息，尝试获取用户信息
  if (token && !userStore.user) {
    try {
      userStore.token = token
      await userStore.fetchUserInfo()
    } catch (error) {
      if (parseToken(localStorage.getItem('ACCESS_TOKEN')) === token) userStore.clearAuth()
    }
  }
  
  // 只有明确标记 requiresAuth 的路由才需要登录
  if (to.meta.requiresAuth === true && !userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    next('/login')
  } else {
    next()
  }
})

// 路由切换时更新静态页面 SEO（动态页面由组件内自行调用 useSeo）
router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  if (title) resetSeo(title)
})

// 路由错误处理
router.onError((error) => {
  if (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Unable to preload CSS')
  ) {
    ElMessage.error('页面加载失败，请刷新重试')
  }
})

// 浏览器空闲时预加载高频路由
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  requestIdleCallback(() => {
    import('@/views/ArticleList.vue')
    import('@/views/ArticleDetail.vue')
    import('@/views/Category.vue')
    import('@/views/Tag.vue')
  })
}

export default router
