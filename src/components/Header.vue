<template>
  <header class="header" :class="{ scrolled: isScrolled }">
    <div class="container header-inner">
      <router-link to="/" class="logo"
        ><img :src="siteLogo" alt="" width="34" height="34" @error="handleLogoError" /><span
          >{{ siteName || '时光博客' }}</span
        ></router-link
      >
      <nav class="desktop-nav" aria-label="主导航">
        <router-link
          v-for="item in navItems.filter((item) =>
            ['/', '/articles', '/category', '/album', '/tools'].includes(item.to)
          )"
          :key="item.to"
          :to="item.to"
          >{{ item.text }}</router-link
        >
        <el-dropdown trigger="click" @command="(path: string) => router.push(path)"
          ><button class="more-btn">更多 <span aria-hidden="true">⌄</span></button
          ><template #dropdown
            ><el-dropdown-menu
              ><el-dropdown-item
                v-for="item in navItems.filter(
                  (item) => !['/', '/articles', '/category', '/album', '/tools'].includes(item.to)
                )"
                :key="item.to"
                :command="item.to"
                >{{ item.text }}</el-dropdown-item
              ><el-dropdown-item command="/about">关于我</el-dropdown-item></el-dropdown-menu
            ></template
          ></el-dropdown
        >
      </nav>
      <div class="header-actions">
        <button
          class="search-btn icon-btn"
          @click="openSearch"
          aria-label="搜索文章"
          title="搜索文章 Ctrl+K"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
            <circle cx="10.5" cy="10.5" r="7" />
            <path d="m16 16 5 5" /></svg
          ><span>搜索文章</span><kbd>Ctrl K</kbd>
        </button>
        <el-dropdown trigger="click" @command="setTheme"
          ><button
            class="icon-btn theme-btn"
            :aria-label="`主题模式：${themeStore.themeMode === 'auto' ? '跟随系统' : themeStore.themeMode === 'dark' ? '深色' : '浅色'}，选择主题`"
          >
            <el-icon :size="19"><component :is="themeIconComp" /></el-icon></button
          ><template #dropdown
            ><el-dropdown-menu
              ><el-dropdown-item
                v-for="mode in [
                  { value: 'light', label: '浅色模式' },
                  { value: 'dark', label: '深色模式' },
                  { value: 'auto', label: '跟随系统' }
                ]"
                :key="mode.value"
                :command="mode.value"
                >{{ themeStore.themeMode === mode.value ? '✓ ' : ''
                }}{{ mode.label }}</el-dropdown-item
              ></el-dropdown-menu
            ></template
          ></el-dropdown
        >
        <el-dropdown v-if="userStore.isLoggedIn" trigger="click" @command="handleCommand"
          ><button class="account-btn" aria-label="打开账号菜单">
            <img
              :src="userStore.user?.avatar || '/default-avatar.svg'"
              alt=""
              class="user-avatar"
            /><span>{{
              userStore.user?.nickname || userStore.user?.username || '我的账号'
            }}</span></button
          ><template #dropdown
            ><el-dropdown-menu
              ><el-dropdown-item v-if="isAuthor" command="admin">管理后台</el-dropdown-item
              ><el-dropdown-item command="profile">个人资料</el-dropdown-item
              ><el-dropdown-item command="favorites">我的收藏</el-dropdown-item
              ><el-dropdown-item command="logout">退出登录</el-dropdown-item></el-dropdown-menu
            ></template
          ></el-dropdown
        >
        <button v-else class="login-btn" @click="goToLogin">登录</button>
        <button
          class="icon-btn mobile-menu-btn"
          @click="showMobileMenu = true"
          aria-label="打开导航菜单"
          :aria-expanded="showMobileMenu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
    <el-drawer v-model="showMobileMenu" direction="rtl" size="min(320px, 100vw)" title="导航">
      <div class="mobile-menu">
        <router-link to="/" class="mobile-brand" @click="showMobileMenu = false">{{
          siteName || '时光博客'
        }}</router-link>
        <nav class="mobile-nav" aria-label="手机导航">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            @click="showMobileMenu = false"
            ><el-icon><component :is="item.icon" /></el-icon>{{ item.text }}</router-link
          ><router-link to="/about" @click="showMobileMenu = false">关于我</router-link>
        </nav>
        <div class="mobile-actions">
          <p>显示主题</p>
          <div class="mobile-themes">
            <button
              v-for="mode in [
                { value: 'light', label: '浅色' },
                { value: 'dark', label: '深色' },
                { value: 'auto', label: '自动' }
              ]"
              :key="mode.value"
              :aria-pressed="themeStore.themeMode === mode.value"
              @click="setTheme(mode.value)"
            >
              {{ mode.label }}
            </button>
          </div>
          <template v-if="userStore.isLoggedIn"
            ><button v-if="isAuthor" @click="handleMobileCommand('admin')">管理后台</button
            ><button @click="handleMobileCommand('profile')">个人资料</button
            ><button @click="handleMobileCommand('favorites')">我的收藏</button
            ><button @click="handleMobileCommand('logout')">退出登录</button></template
          ><button v-else @click="handleMobileLogin">登录账号</button>
        </div>
      </div>
    </el-drawer>
  </header>
</template>
<script setup lang="ts">
import { watch, ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { useWebsiteConfig } from '@/composables/useWebsiteConfig'
import {
  House,
  Document,
  Folder,
  CollectionTag,
  PictureFilled,
  EditPen,
  Connection,
  Tools,
  Moon,
  Sunny,
  Monitor
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
  { to: '/tools', icon: Tools, text: '工具', color: '#00b42a' }
]

const siteName = ref('')
const DEFAULT_SITE_LOGO = '/logo.svg?v=paper-plane-1'
const siteLogo = ref(DEFAULT_SITE_LOGO)
const showMobileMenu = ref(false)
const isScrolled = ref(false)

const themeIconComp = computed(() =>
  themeStore.themeMode === 'auto' ? Monitor : themeStore.appliedTheme === 'dark' ? Moon : Sunny
)

const setTheme = (mode: string) => {
  if (mode === 'light' || mode === 'dark' || mode === 'auto') themeStore.setTheme(mode)
}
const openSearch = () => window.dispatchEvent(new CustomEvent('open-search'))

const handleLogoError = () => {
  siteLogo.value = DEFAULT_SITE_LOGO
}

const { config: websiteConfig } = useWebsiteConfig()
watch(websiteConfig, (config) => {
  if (config.site_name) siteName.value = config.site_name
  siteLogo.value = config.logo?.trim() || DEFAULT_SITE_LOGO
})

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

onMounted(async () => {
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
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
}
.header.scrolled {
  box-shadow: 0 2px 10px #00000005;
}
.header-inner {
  display: flex;
  align-items: center;
  gap: 36px;
  min-height: 78px;
}
.logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 11px;
  color: var(--text-primary);
  font-size: 21px;
  font-weight: 650;
}
.logo img {
  width: 34px;
  height: 34px;
  object-fit: contain;
}
.desktop-nav {
  display: flex;
  gap: 16px;
  align-items: center;
}
.desktop-nav > a {
  padding: 26px 9px 23px;
  font-size: 13px;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}
.desktop-nav > a.router-link-exact-active {
  border-bottom-color: var(--text-primary);
  color: var(--text-primary);
  font-weight: 600;
}
.more-btn {
  background: transparent;
  border: 0;
  min-height: 44px;
  padding: 8px;
  font-size: 13px;
  color: var(--text-tertiary);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.icon-btn,
.login-btn,
.account-btn {
  min-height: 44px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  border-radius: 5px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  color: var(--text-primary);
}
.icon-btn {
  width: 44px;
  padding: 0;
}
.icon-btn svg {
  width: 19px;
  height: 19px;
}
.search-btn {
  width: auto;
  padding: 0 12px;
  color: var(--text-secondary);
  background: transparent;
  font-size: 12px;
}
.search-btn kbd {
  font: 10px var(--font-sans);
  background: var(--bg-soft);
  padding: 1px 4px;
  color: var(--text-tertiary);
}
.login-btn {
  padding: 0 19px;
  font-size: 13px;
}
.account-btn {
  padding: 5px 10px;
  font-size: 12px;
}
.account-btn span {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}
.mobile-menu-btn {
  display: none;
}
.mobile-brand {
  display: block;
  font: 24px var(--font-serif);
  padding-bottom: 20px;
  color: var(--text-primary);
}
.mobile-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.mobile-nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  min-height: 48px;
  padding: 10px;
}
.mobile-nav .router-link-exact-active {
  color: var(--color-accent);
  background: var(--bg-soft);
  border-radius: 4px;
}
.mobile-actions {
  margin-top: 24px;
  border-top: 1px solid var(--border-color);
  padding-top: 22px;
  font-size: 13px;
}
.mobile-actions > button {
  display: block;
  min-height: 44px;
  background: transparent;
  border: 0;
  width: 100%;
  text-align: left;
}
.mobile-themes {
  display: flex;
  gap: 6px;
  margin: 12px 0 18px;
}
.mobile-themes button {
  flex: 1;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  min-height: 44px;
}
.mobile-themes button[aria-pressed='true'] {
  color: var(--color-accent);
  background: var(--bg-soft);
  border-color: var(--color-accent);
}
@media (max-width: 1100px) {
  .header-inner {
    gap: 20px;
  }
  .desktop-nav {
    gap: 7px;
  }
  .search-btn {
    width: 44px;
    padding: 0;
  }
  .search-btn span,
  .search-btn kbd {
    display: none;
  }
}
@media (max-width: 850px) {
  .desktop-nav {
    display: none;
  }
  .mobile-menu-btn {
    display: inline-flex;
  }
  .header-inner {
    min-height: 72px;
  }
}
@media (max-width: 500px) {
  .logo {
    font-size: 18px;
    gap: 8px;
  }
  .logo img {
    width: 28px;
    height: 28px;
  }
  .header-inner {
    gap: 8px;
    min-height: 68px;
  }
  .header-actions {
    gap: 5px;
  }
  .login-btn,
  .account-btn {
    display: none;
  }
}
</style>
