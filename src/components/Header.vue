<template>
  <header class="header" :class="{ scrolled: isScrolled }">
    <div class="container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <img v-if="siteLogo" :src="siteLogo" class="logo-img" alt="logo" />
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

    <!-- 个人中心弹窗 -->
    <el-dialog v-model="showProfileDialog" title="个人中心" width="480px" class="profile-dialog">
      <div class="profile-content">
        <div class="avatar-section">
          <img :src="userStore.user?.avatar || '/default-avatar.svg'" alt="头像" class="profile-avatar">
          <button class="change-avatar-btn" @click="triggerAvatarUpload">更换头像</button>
          <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="handleAvatarUpload">
        </div>
        <div class="profile-info">
          <div class="info-row">
            <span class="info-label">昵称</span>
            <span class="info-value">{{ userStore.user?.nickname || userStore.user?.username }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">手机</span>
            <span class="info-value">{{ userStore.user?.mobile || '未设置' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ userStore.user?.email || '未设置' }}</span>
          </div>
        </div>
        <div class="profile-actions">
          <el-button @click="showEditProfileDialog">修改资料</el-button>
          <el-button @click="showChangePasswordDialog">修改密码</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 修改资料弹窗 -->
    <el-dialog v-model="showEditDialog" title="修改资料" width="420px">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="60px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="420px">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordFormRules" label-width="80px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="submitPasswordForm">确认修改</el-button>
      </template>
    </el-dialog>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { fetchWebsiteConfigWithCache } from '@/utils/websiteConfig'
import { uploadImage, updateUserProfile, getUserInfo, updatePassword } from '@/api/article'
import { ElMessage } from 'element-plus'
import {
  House, Document, Folder, CollectionTag, ChatDotRound,
  PictureFilled, EditPen, Connection, Moon, Sunny,
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const navItems = [
  { to: '/', icon: House, text: '首页', color: '#165dff' },
  { to: '/articles', icon: Document, text: '文章', color: '#722ed1' },
  { to: '/category', icon: Folder, text: '分类', color: '#ff7d00' },
  { to: '/tag', icon: CollectionTag, text: '标签', color: '#f53f3f' },
  { to: '/talk', icon: ChatDotRound, text: '说说', color: '#00b42a' },
  { to: '/album', icon: PictureFilled, text: '相册', color: '#0fc6c2' },
  { to: '/guestbook', icon: EditPen, text: '留言板', color: '#f77234' },
  { to: '/link', icon: Connection, text: '友链', color: '#9fdb1d' },
]

const siteName = ref('')
const siteLogo = ref('')
const showMobileMenu = ref(false)
const isScrolled = ref(false)

const themeIconComp = computed(() => themeStore.appliedTheme === 'dark' ? Sunny : Moon)
const themeTooltip = computed(() => themeStore.appliedTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式')
const toggleTheme = () => themeStore.toggleTheme()

const fetchWebsiteConfig = async () => {
  try {
    const config = await fetchWebsiteConfigWithCache()
    if (config.site_name) siteName.value = config.site_name.replace(/系统$/u, '')
    if (config.logo) siteLogo.value = config.logo
  } catch {
    // 静默失败
  }
}

const isAuthor = computed(() => userStore.isAuthor)

const showProfileDialog = ref(false)
const avatarInput = ref<HTMLInputElement>()
const showEditDialog = ref(false)
const editFormRef = ref()
const editForm = ref({ nickname: '', mobile: '', email: '' })
const editFormRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  mobile: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
  email: [{ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱格式', trigger: 'blur' }]
}

const showPasswordDialog = ref(false)
const passwordFormRef = ref()
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const passwordFormRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value !== passwordForm.value.newPassword) callback(new Error('两次输入的密码不一致'))
        else callback()
      },
      trigger: 'blur'
    }
  ]
}

const showChangePasswordDialog = () => {
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  showPasswordDialog.value = true
}

const showEditProfileDialog = () => {
  editForm.value = {
    nickname: userStore.user?.nickname || userStore.user?.username || '',
    mobile: userStore.user?.mobile || '',
    email: userStore.user?.email || ''
  }
  showEditDialog.value = true
}

const submitEditForm = async () => {
  if (!editFormRef.value) return
  try {
    await editFormRef.value.validate()
    await updateUserProfile({ nickname: editForm.value.nickname, mobile: editForm.value.mobile, email: editForm.value.email })
    if (userStore.user) {
      userStore.user.nickname = editForm.value.nickname
      userStore.user.mobile = editForm.value.mobile
      userStore.user.email = editForm.value.email
      localStorage.setItem('user', JSON.stringify(userStore.user))
    }
    ElMessage.success('资料修改成功')
    showEditDialog.value = false
  } catch (error: any) {
    if (error !== false) ElMessage.error(error.msg || error.message || '修改失败，请重试')
  }
}

const submitPasswordForm = async () => {
  if (!passwordFormRef.value) return
  try {
    await passwordFormRef.value.validate()
    await updatePassword({ oldPassword: passwordForm.value.oldPassword, newPassword: passwordForm.value.newPassword })
    showPasswordDialog.value = false
    showProfileDialog.value = false
    ElMessage.success('密码修改成功，请重新登录')
    setTimeout(async () => {
      await userStore.logout()
      router.push('/login')
    }, 1000)
  } catch (error: any) {
    if (error !== false) ElMessage.error(error.msg || error.message || '修改失败，请重试')
  }
}

const triggerAvatarUpload = () => avatarInput.value?.click()

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { ElMessage.error('请选择图片文件'); return }
  if (file.size > 5 * 1024 * 1024) { ElMessage.error('图片大小不能超过5MB'); return }
  const loadingMsg = ElMessage.info({ message: '正在上传头像...', duration: 0 })
  try {
    const uploadResponse: any = await uploadImage(file)
    const avatarUrl = uploadResponse?.url || uploadResponse?.data?.url || uploadResponse?.path || uploadResponse?.data?.path || uploadResponse?.data || uploadResponse
    if (!avatarUrl || typeof avatarUrl !== 'string') { loadingMsg.close(); ElMessage.error('上传失败：无法获取图片地址'); return }
    await updateUserProfile({ avatar: avatarUrl })
    if (userStore.user) {
      userStore.user.avatar = avatarUrl
      localStorage.setItem('user', JSON.stringify(userStore.user))
      userStore.user = { ...userStore.user }
    }
    loadingMsg.close()
    ElMessage.success('头像更换成功')
  } catch (error: any) {
    loadingMsg.close()
    ElMessage.error(error.msg || error.message || '上传失败，请重试')
  } finally {
    if (target) target.value = ''
  }
}

const goToLogin = () => {
  router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
}

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      try {
        const userInfo: any = await getUserInfo()
        if (userInfo && userStore.user) {
          userStore.user = { ...userStore.user, ...userInfo }
          localStorage.setItem('user', JSON.stringify(userStore.user))
        }
      } catch { /* 静默失败 */ }
      showProfileDialog.value = true
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
  background-image: url('/bg-banner.png');
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

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;

  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .profile-avatar {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--border-strong);
      box-shadow: var(--shadow-glow);
    }

    .change-avatar-btn {
      padding: 6px 16px;
      border-radius: var(--radius-btn);
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover { border-color: var(--color-accent); color: var(--color-accent); }
    }
  }

  .profile-info {
    display: flex;
    flex-direction: column;

    .info-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border-color);

      .info-label { font-size: 13px; color: var(--text-tertiary); width: 40px; flex-shrink: 0; }
      .info-value { font-size: 14px; color: var(--text-primary); }
    }
  }

  .profile-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .desktop-nav { display: none; }
  .mobile-menu-btn { display: flex; }
  .header .container { gap: 16px; }
}
</style>
