import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory('/web/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue')
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('@/views/ArticleList.vue')
    },
    {
      path: '/article/:id',
      name: 'article-detail',
      component: () => import('@/views/ArticleDetail.vue')
    },
    {
      path: '/category',
      name: 'category',
      component: () => import('@/views/Category.vue')
    },
    {
      path: '/tag',
      name: 'tag',
      component: () => import('@/views/Tag.vue')
    },
    {
      path: '/talk',
      name: 'talk',
      component: () => import('@/views/Talk.vue')
    },
    {
      path: '/guestbook',
      name: 'guestbook',
      component: () => import('@/views/Guestbook.vue')
    },
    {
      path: '/link',
      name: 'link',
      component: () => import('@/views/Link.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/About.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/likes',
      name: 'profile-likes',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/comments',
      name: 'profile-comments',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫 - 检查登录状态
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    next('/')
  } else {
    next()
  }
})

export default router
