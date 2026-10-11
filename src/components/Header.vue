<template>
  <header class="header" :class="{ scrolled: isScrolled }">
    <div class="container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <img :src="siteLogo" class="logo-img" alt="logo" />
        <span class="logo-name">{{ siteName || '博客' }}</span>
      </router-link>

      <!-- PC 端导航 -->
      <nav class="nav desktop-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
        >
          <span class="nav-icon" :style="{ background: item.color + '22', color: item.color }">
            <el-icon><component :is="item.icon" /></el-icon>
          </span>
          <span class="nav-text">{{ item.text }}</span>
        </router-link>
      </nav>

      <!-- 右侧操作区 -->
      <div class="header-actions">
        <button class="icon-btn" @click="openSearch" title="搜索 Ctrl+K">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.5-4.5"/>
          </svg>
        </button>
        <button class="icon-btn" @click="toggleTheme" :title="themeTooltip">
          <el-icon :size="17"><component :is="themeIconComp" /></el-icon>
        </button>

        <template v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleCommand">
            <img
              :src="userStore.user?.avatar || '/default-avatar.svg'"
              alt="头像"
              class="user-avatar"
            >
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="isAuthor" command="admin">管理后台</el-dropdown-item>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="favorites">我的收藏</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <button class="login-btn" @click="goToLogin">登录</button>
        </template>

        <!-- 移动端汉堡 -->
        <button class="icon-btn mobile-menu-btn" @click="showMobileMenu = true">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
            <rect width="16" height="2" rx="1"/><rect y="5" width="16" height="2" rx="1"/><rect y="10" width="16" height="2" rx="1"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <el-drawer v-model="showMobileMenu" direction="ltr" size="280px" :with-header="false">
      <div class="mobile-menu">
        <div class="mobile-logo">{{ siteName || '博客' }}</div>
        <nav class="mobile-nav">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="mobile-nav-item"
            @click="showMobileMenu = false"
          >
            <span class="mobile-nav-icon" :style="{ background: item.color + '18', color: item.color }">
              <el-icon :size="16"><component :is="item.icon" /></el-icon>
            </span>
            {{ item.text }}
          </router-link>
        </nav>
        <div class="mobile-actions">
          <button class="mobile-action-btn" @click="toggleTheme; showMobileMenu = false">
            <el-icon style="vertical-align:-2px;margin-right:6px"><component :is="themeIconComp" /></el-icon>{{ themeTooltip }}
          </button>
          <template v-if="userStore.isLoggedIn">
            <button v-if="isAuthor" class="mobile-action-btn" @click="handleMobileCommand('admin')">管理后台</button>
            <button class="mobile-action-btn" @click="handleMobileCommand('profile')">个人中心</button>
            <button class="mobile-action-btn" @click="handleMobileCommand('logout')">退出登录</button>
          </template>
          <template v-else>
            <button class="mobile-action-btn accent" @click="handleMobileLogin">登录</button>
          </template>
        </div>
      </div>
    </el-drawer>
  </header>
</template>

<script setup lang="ts">

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { fetchWebsiteConfigWithCache, useWebsiteConfigRefresh } from '@/utils/websiteConfig'
import {
  House, Document, Folder, CollectionTag,
  PictureFilled, EditPen, Connection, Tools, Moon, Sunny,
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const navItems = [
  { to: '/', icon: House, text: '首页', color: '#165dff' },
  { to: '/articles', icon: Document, text: '文章', color: '#722ed1' },
  { to: '/category', icon: Folder, text: '分类', color: '#ff7d00' },
  { to: '/tag', icon: CollectionTag, text: '标签', color: '#f53f3f' },
{ to: '/album', icon: PictureFilled, text: '相册', color: '#0fc6c2' },
  { to: '/guestbook', icon: EditPen, text: '留言板', color: '#f77234' },
  { to: '/link', icon: Connection, text: '友链', color: '#9fdb1d' },
  { to: '/tools', icon: Tools, text: '工具', color: '#00b42a' },
]

const siteName = ref('')
const siteLogo = ref('/logo.svg')
const showMobileMenu = ref(false)
const isScrolled = ref(false)

const themeIconComp = computed(() => themeStore.appliedTheme === 'dark' ? Sunny : Moon)
const themeTooltip = computed(() => themeStore.appliedTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式')
const toggleTheme = () => themeStore.toggleTheme()
const openSearch = () => window.dispatchEvent(new CustomEvent('open-search'))

const fetchWebsiteConfig = async () => {
  try {
    const config = await fetchWebsiteConfigWithCache()
    if (config.site_name) siteName.value = config.site_name
    siteLogo.value = config.logo || '/logo.svg'
  } catch {
    // 静默失败
  }
}

const isAuthor = computed(() => userStore.isAuthor)

const goToLogin = () => {
  router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
}

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      await router.push('/profile')
      break
    case 'favorites':
      router.push('/favorites')
      break
    case 'admin':
      window.open(import.meta.env.VITE_ADMIN_PATH || '/admin', '_blank')
      break
    case 'logout':
      await userStore.logout()
      router.push('/')
      break
  }
}

const handleMobileCommand = async (command: string) => {
  showMobileMenu.value = false
  await handleCommand(command)
}

const handleMobileLogin = () => {
  showMobileMenu.value = false
  goToLogin()
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

useWebsiteConfigRefresh(() => { void fetchWebsiteConfig() })
onMounted(async () => {
  fetchWebsiteConfig()
  window.addEventListener('scroll', handleScroll)
  if (userStore.isLoggedIn && userStore.token) {
    try {
      await userStore.fetchUserInfo()
    } catch {
      userStore.user = null
      userStore.token = ''
      userStore.isLoggedIn = false
      localStorage.removeItem('ACCESS_TOKEN')
      localStorage.removeItem('user')
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 999;
  background-image: url('/bg-banner.jpg');
  background-size: cover;
  background-position: center 20%;
  box-shadow: 0 4px 24px rgba(0,0,0,0.25);
  transition: box-shadow 0.3s ease;

  /* 半透明遮罩，保证导航文字可读 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(8, 18, 40, 0.55);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    pointer-events: none;
  }

  /* 流光底边 */
  &::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #165dff, #0fc6c2, #ff7d00, #f53f3f, #165dff);
    background-size: 300% 100%;
    animation: header-flow 5s linear infinite;
  }

  .container {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 24px;
    position: relative;
  }
}

@keyframes header-flow {
  from { background-position: 0% center; }
  to   { background-position: 300% center; }
}

.logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 900;
  color: #fff;
  text-decoration: none;
  letter-spacing: -0.03em;
  transition: color 0.2s ease;
  text-shadow: 0 1px 8px rgba(0,0,0,0.4);

  &:hover { color: #7eb8ff !important; }

  .logo-img {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
  }
}

.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: var(--radius-btn);
  color: rgba(255,255,255,0.85);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;

  .nav-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
    transition: transform 0.2s ease;
    .el-icon { font-size: 14px; }
  }

  &:hover {
    background: rgba(255,255,255,0.12);
    color: #fff !important;
    .nav-icon { transform: scale(1.15); }
  }

  &.router-link-active {
    color: #7eb8ff !important;
    background: rgba(22, 93, 255, 0.2);
    font-weight: 700;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-btn);
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.85);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(255,255,255,0.5);
    color: #fff;
    background: rgba(255,255,255,0.12);
  }
}

.login-btn {
  padding: 7px 18px;
  border-radius: var(--radius-btn);
  background: rgba(22,93,255,0.75);
  border: 1px solid rgba(22,93,255,0.5);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);

  &:hover { background: rgba(22,93,255,0.95); }
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-strong);
  cursor: pointer;
  transition: all 0.2s ease;
  display: block;

  &:hover { border-color: var(--color-accent); box-shadow: var(--shadow-glow); }
}

.mobile-menu-btn { display: none; }

.mobile-menu {
  padding: 24px 16px;
  height: 100%;
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  gap: 24px;

  .mobile-logo {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 900;
    color: var(--text-primary);
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
    letter-spacing: -0.03em;
  }

  .mobile-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .mobile-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    border-radius: var(--radius-btn);
    color: var(--text-secondary);
    font-size: 15px;
    transition: all 0.2s ease;

    .mobile-nav-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      background: var(--bg-secondary);
    }

    &:hover, &.router-link-active {
      background: var(--bg-secondary);
      color: var(--color-accent);
    }
  }

  .mobile-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
  }

  .mobile-action-btn {
    padding: 11px 14px;
    border-radius: var(--radius-btn);
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    &.accent {
      background: var(--color-accent);
      border-color: var(--color-accent);
      color: #fff;

      &:hover { background: var(--color-accent-hover); }
    }
  }
}

@media (max-width: 1024px) {
  .desktop-nav { display: none; }
  .mobile-menu-btn { display: flex; }
  .header .container { gap: 16px; }
}
</style>
