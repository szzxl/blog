<template>
  <header class="header">
    <div class="header-bg"></div>
    <div class="container">
      <!-- 移动端汉堡菜单按钮（左侧） -->
      <button class="mobile-menu-btn-left" @click="showMobileMenu = true">
        <span class="menu-icon">☰</span>
      </button>
      
      <div class="logo">
        <div class="logo-circle">
          <img v-if="siteLogo.startsWith('http')" :src="siteLogo" alt="logo" class="logo-image">
          <span v-else class="logo-icon">{{ siteLogo }}</span>
        </div>
        <div class="logo-text-wrapper">
          <span class="logo-text">{{ siteName }}</span>
          <span class="logo-subtitle">{{ siteDescription }}</span>
        </div>
      </div>
      
      <!-- PC 端导航 -->
      <nav class="nav desktop-nav">
        <router-link to="/" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">首页</span>
        </router-link>
        <router-link to="/articles" class="nav-item">
          <span class="nav-icon">📝</span>
          <span class="nav-text">文章</span>
        </router-link>
        <router-link to="/category" class="nav-item">
          <span class="nav-icon">📂</span>
          <span class="nav-text">分类</span>
        </router-link>
        <router-link to="/tag" class="nav-item">
          <span class="nav-icon">🏷️</span>
          <span class="nav-text">标签</span>
        </router-link>
        <router-link to="/talk" class="nav-item">
          <span class="nav-icon">💬</span>
          <span class="nav-text">说说</span>
        </router-link>
        <router-link to="/guestbook" class="nav-item">
          <span class="nav-icon">✍️</span>
          <span class="nav-text">留言板</span>
        </router-link>
        <router-link to="/link" class="nav-item">
          <span class="nav-icon">🔗</span>
          <span class="nav-text">友链</span>
        </router-link>
        <router-link to="/about" class="nav-item">
          <span class="nav-icon">👨‍💻</span>
          <span class="nav-text">关于</span>
        </router-link>
      </nav>
    </div>
    
    <!-- 用户中心 -->
    <div class="user-center">
      <!-- 主题切换按钮 -->
      <button class="theme-toggle" @click="toggleTheme" :title="themeTooltip">
        <span class="theme-icon">{{ themeIcon }}</span>
      </button>
      
      <template v-if="userStore.isLoggedIn">
        <el-dropdown @command="handleCommand">
          <div class="user-info">
            <img :src="userStore.user?.avatar || '/default-avatar.svg'" alt="头像" class="user-avatar">
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-if="isAuthor" command="admin">
                <span class="menu-icon">⚙️</span>
                管理后台
              </el-dropdown-item>
              <el-dropdown-item command="profile">
                <span class="menu-icon">👤</span>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item command="logout">
                <span class="menu-icon">🚪</span>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template v-else>
        <el-button type="primary" round @click="goToLogin">
          登录
        </el-button>
      </template>
    </div>
  </header>
  
  <!-- 移动端导航抽屉 -->
  <el-drawer
    v-model="showMobileMenu"
    direction="ltr"
    size="280px"
    :show-close="false"
    class="mobile-nav-drawer"
  >
    <template #header>
      <div class="drawer-header">
        <div class="drawer-logo">
          <img v-if="siteLogo.startsWith('http')" :src="siteLogo" alt="logo" class="logo-image">
          <span v-else class="logo-icon">{{ siteLogo }}</span>
          <span class="logo-text">{{ siteName }}</span>
        </div>
      </div>
    </template>
    
    <nav class="mobile-nav">
      <router-link to="/" class="mobile-nav-item" @click="showMobileMenu = false">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">首页</span>
        <span class="nav-arrow">›</span>
      </router-link>
      <router-link to="/articles" class="mobile-nav-item" @click="showMobileMenu = false">
        <span class="nav-icon">📝</span>
        <span class="nav-text">文章</span>
        <span class="nav-arrow">›</span>
      </router-link>
      <router-link to="/category" class="mobile-nav-item" @click="showMobileMenu = false">
        <span class="nav-icon">📂</span>
        <span class="nav-text">分类</span>
        <span class="nav-arrow">›</span>
      </router-link>
      <router-link to="/tag" class="mobile-nav-item" @click="showMobileMenu = false">
        <span class="nav-icon">🏷️</span>
        <span class="nav-text">标签</span>
        <span class="nav-arrow">›</span>
      </router-link>
      <router-link to="/talk" class="mobile-nav-item" @click="showMobileMenu = false">
        <span class="nav-icon">💬</span>
        <span class="nav-text">说说</span>
        <span class="nav-arrow">›</span>
      </router-link>
      <router-link to="/guestbook" class="mobile-nav-item" @click="showMobileMenu = false">
        <span class="nav-icon">✍️</span>
        <span class="nav-text">留言板</span>
        <span class="nav-arrow">›</span>
      </router-link>
      <router-link to="/link" class="mobile-nav-item" @click="showMobileMenu = false">
        <span class="nav-icon">🔗</span>
        <span class="nav-text">友链</span>
        <span class="nav-arrow">›</span>
      </router-link>
      <router-link to="/about" class="mobile-nav-item" @click="showMobileMenu = false">
        <span class="nav-icon">👨‍💻</span>
        <span class="nav-text">关于</span>
        <span class="nav-arrow">›</span>
      </router-link>
      
      <!-- 移动端用户操作 -->
      <div class="mobile-user-actions" v-if="userStore.isLoggedIn">
        <div class="divider"></div>
        <button class="mobile-nav-item" @click="handleMobileThemeToggle">
          <span class="nav-icon">{{ themeIcon }}</span>
          <span class="nav-text">{{ themeStore.appliedTheme === 'dark' ? '浅色模式' : '深色模式' }}</span>
          <span class="nav-arrow">›</span>
        </button>
        <button class="mobile-nav-item" @click="handleMobileCommand('admin')" v-if="isAuthor">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text">管理后台</span>
          <span class="nav-arrow">›</span>
        </button>
        <button class="mobile-nav-item" @click="handleMobileCommand('profile')">
          <span class="nav-icon">👤</span>
          <span class="nav-text">个人中心</span>
          <span class="nav-arrow">›</span>
        </button>
        <button class="mobile-nav-item" @click="handleMobileCommand('logout')">
          <span class="nav-icon">🚪</span>
          <span class="nav-text">退出登录</span>
          <span class="nav-arrow">›</span>
        </button>
      </div>
      <div class="mobile-user-actions" v-else>
        <div class="divider"></div>
        <button class="mobile-nav-item" @click="handleMobileThemeToggle">
          <span class="nav-icon">{{ themeIcon }}</span>
          <span class="nav-text">{{ themeStore.appliedTheme === 'dark' ? '浅色模式' : '深色模式' }}</span>
          <span class="nav-arrow">›</span>
        </button>
        <button class="mobile-nav-item login-btn" @click="handleMobileLogin">
          <span class="nav-text">登录</span>
          <span class="nav-arrow"></span>
        </button>
      </div>
    </nav>
  </el-drawer>
  
  <!-- 个人中心弹窗 -->
  <el-dialog 
    v-model="showProfileDialog" 
    title="" 
    width="500px"
    :show-close="true"
    class="profile-dialog"
  >
    <div class="dialog-profile">
      <div class="intro-card">
        <div class="intro-avatar" @click="triggerAvatarUpload">
          <img :src="userStore.user?.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogIDwhLS0g6IOM5pmv5ZyGIC0tPg0KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjYwIiByPSI2MCIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4NCiAgDQogIDwhLS0g5riQ5Y+Y5a6a5LmJIC0tPg0KICA8ZGVmcz4NCiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4NCiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0ZmFjZmU7c3RvcC1vcGFjaXR5OjEiIC8+DQogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMGYyZmU7c3RvcC1vcGFjaXR5OjEiIC8+DQogICAgPC9saW5lYXJHcmFkaWVudD4NCiAgPC9kZWZzPg0KICANCiAgPCEtLSDnlKjmiLflm77moIcgLS0+DQogIDxjaXJjbGUgY3g9IjYwIiBjeT0iNDUiIHI9IjIwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+DQogIDxwYXRoIGQ9Ik0gMzAgOTUgUSAzMCA3MCA2MCA3MCBRIDkwIDcwIDkwIDk1IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+DQo8L3N2Zz4NCg=='" alt="头像">
          <div class="avatar-decoration">✨</div>
          <div class="avatar-overlay">
            <span class="upload-icon">📷</span>
            <span class="upload-text">更换头像</span>
          </div>
        </div>
        <input 
          ref="avatarInput" 
          type="file" 
          accept="image/*" 
          style="display: none" 
          @change="handleAvatarUpload"
        />
        <div class="intro-content">
          <h2 class="intro-title">{{ userStore.user?.nickname || userStore.user?.username || 'zxl123' }}</h2>
          
          <!-- 用户信息 -->
          <div class="user-info">
            <div class="info-item">
              <span class="info-icon">📱</span>
              <span class="info-label">手机号码：</span>
              <span class="info-value">{{ userStore.user?.mobile || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-icon">📧</span>
              <span class="info-label">邮箱：</span>
              <span class="info-value">{{ userStore.user?.email || '未设置' }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 底部按钮 -->
      <div class="dialog-actions">
        <el-button class="action-btn" size="small" @click="showChangePasswordDialog">
          🔒 修改密码
        </el-button>
        <el-button class="action-btn" size="small" type="primary" @click="showEditProfileDialog">
          ✏️ 修改资料
        </el-button>
      </div>
    </div>
  </el-dialog>
  
  <!-- 修改资料弹窗 -->
  <el-dialog
    v-model="showEditDialog"
    title="✏️ 修改资料"
    width="450px"
    :close-on-click-modal="false"
    class="edit-dialog"
  >
    <el-form
      ref="editFormRef"
      :model="editForm"
      :rules="editFormRules"
      label-width="90px"
    >
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
      </el-form-item>
      
      <el-form-item label="手机号码" prop="mobile">
        <el-input v-model="editForm.mobile" placeholder="请输入手机号码" />
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="editForm.email" placeholder="请输入邮箱" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="showEditDialog = false">取消</el-button>
      <el-button type="primary" @click="submitEditForm">保存</el-button>
    </template>
  </el-dialog>
  
  <!-- 修改密码弹窗 -->
  <el-dialog
    v-model="showPasswordDialog"
    title="🔒 修改密码"
    width="450px"
    :close-on-click-modal="false"
    class="password-dialog"
  >
    <el-form
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="passwordFormRules"
      label-width="90px"
    >
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="passwordForm.oldPassword"
          type="password"
          placeholder="请输入旧密码"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="passwordForm.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="passwordForm.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="showPasswordDialog = false">取消</el-button>
      <el-button type="primary" @click="submitPasswordForm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { fetchWebsiteConfigWithCache } from '@/utils/websiteConfig'
import { uploadImage, updateUserProfile, getUserInfo, updatePassword } from '@/api/article'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const siteName = ref('')
const siteDescription = ref('')
const siteLogo = ref('🌸')

// 移动端菜单状态
const showMobileMenu = ref(false)

// 主题切换
const themeIcon = computed(() => {
  return themeStore.appliedTheme === 'dark' ? '🌙' : '☀️'
})

const themeTooltip = computed(() => {
  return themeStore.appliedTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'
})

const toggleTheme = () => {
  themeStore.toggleTheme()
}

// 获取网站配置
const fetchWebsiteConfig = async () => {
  try {
    const config = await fetchWebsiteConfigWithCache()
    
    if (config.site_name) {
      siteName.value = config.site_name
    }
    if (config.site_description) {
      siteDescription.value = config.site_description
    }
    if (config.logo) {
      siteLogo.value = config.logo
    }
  } catch (error) {
    // 获取网站配置失败
  }
}

// 是否是博主或超级管理员
const isAuthor = computed(() => {
  if (!userStore.isLoggedIn || !userStore.user) return false
  const roles = userStore.user.roles || []
  return roles.some((role: any) => role.name === '博主' || role.name === '超级管理员')
})

// 个人中心弹窗
const showProfileDialog = ref(false)
const avatarInput = ref<HTMLInputElement>()

// 修改资料弹窗
const showEditDialog = ref(false)
const editFormRef = ref()
const editForm = ref({
  nickname: '',
  mobile: '',
  email: ''
})

// @ts-ignore - 在模板中使用
const editFormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  mobile: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 修改密码弹窗
const showPasswordDialog = ref(false)
const passwordFormRef = ref()
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// @ts-ignore - 在模板中使用
const passwordFormRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 显示修改密码弹窗
// @ts-ignore - 在模板中使用
const showChangePasswordDialog = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  showPasswordDialog.value = true
}

// 显示修改资料弹窗
// @ts-ignore - 在模板中使用
const showEditProfileDialog = () => {
  editForm.value = {
    nickname: userStore.user?.nickname || userStore.user?.username || '',
    mobile: userStore.user?.mobile || '',
    email: userStore.user?.email || ''
  }
  showEditDialog.value = true
}

// 提交修改资料
// @ts-ignore - 在模板中使用
const submitEditForm = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    
    // 调用修改资料接口
    await updateUserProfile({
      nickname: editForm.value.nickname,
      mobile: editForm.value.mobile,
      email: editForm.value.email
    })
    
    // 更新本地用户信息
    if (userStore.user) {
      userStore.user.nickname = editForm.value.nickname
      userStore.user.mobile = editForm.value.mobile
      userStore.user.email = editForm.value.email
      localStorage.setItem('user', JSON.stringify(userStore.user))
    }
    
    ElMessage.success('资料修改成功')
    showEditDialog.value = false
  } catch (error: any) {
    if (error !== false) { // 不是表单验证错误
      ElMessage.error(error.msg || error.message || '修改失败，请重试')
    }
  }
}

// 提交修改密码
// @ts-ignore - 在模板中使用
const submitPasswordForm = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    
    // 调用修改密码接口
    await updatePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    // 关闭修改密码弹窗
    showPasswordDialog.value = false
    // 关闭个人中心弹窗
    showProfileDialog.value = false
    
    // 先显示成功提示
    ElMessage.success('密码修改成功，请重新登录')
    
    // 等待提示显示后再跳转
    setTimeout(async () => {
      await userStore.logout()
      router.push('/login')
    }, 1000)
  } catch (error: any) {
    if (error !== false) { // 不是表单验证错误
      ElMessage.error(error.msg || error.message || '修改失败，请重试')
    }
  }
}

// 触发头像上传
// @ts-ignore - 在模板中使用
const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

// 处理头像上传
// @ts-ignore - 在模板中使用
const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  
  // 验证文件大小（限制5MB）
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB')
    return
  }
  
  // 显示加载提示
  const loadingMessage = ElMessage.info({
    message: '正在上传头像...',
    duration: 0 // 不自动关闭
  })
  
  try {
    // 1. 上传图片
    const uploadResponse: any = await uploadImage(file)
    
    console.log('上传响应:', uploadResponse) // 调试日志
    
    // 尝试多种可能的字段名
    const avatarUrl = uploadResponse?.url || 
                     uploadResponse?.data?.url || 
                     uploadResponse?.path || 
                     uploadResponse?.data?.path || 
                     uploadResponse?.data || 
                     uploadResponse
    
    console.log('解析的头像URL:', avatarUrl) // 调试日志
    
    if (!avatarUrl || typeof avatarUrl !== 'string') {
      loadingMessage.close()
      console.error('无效的上传响应:', uploadResponse)
      ElMessage.error('上传失败：无法获取图片地址')
      return
    }
    
    // 2. 调用更新用户资料接口
    await updateUserProfile({ avatar: avatarUrl })
    
    // 3. 更新本地用户信息
    if (userStore.user) {
      userStore.user.avatar = avatarUrl
      // 保存到 localStorage
      localStorage.setItem('user', JSON.stringify(userStore.user))
      
      // 强制触发响应式更新
      userStore.user = { ...userStore.user }
    }
    
    loadingMessage.close()
    ElMessage.success('头像更换成功')
    
    // 不自动关闭弹窗，让用户继续查看或编辑其他信息
  } catch (error: any) {
    loadingMessage.close()
    console.error('头像上传错误:', error)
    ElMessage.error(error.msg || error.message || '上传失败，请重试')
  } finally {
    // 清空 input，允许重复选择同一文件
    if (target) {
      target.value = ''
    }
  }
}

const goToLogin = () => {
  router.push({
    path: '/login',
    query: { redirect: router.currentRoute.value.fullPath }
  })
}

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      // 打开个人中心前，重新获取用户信息
      try {
        const userInfo: any = await getUserInfo()
        
        if (userInfo && userStore.user) {
          // 更新用户信息
          userStore.user = {
            ...userStore.user,
            ...userInfo
          }
          // 保存到 localStorage
          localStorage.setItem('user', JSON.stringify(userStore.user))
        }
      } catch (error) {
        // 获取用户信息失败
      }
      
      showProfileDialog.value = true
      break
    case 'favorites':
      router.push('/favorites')
      break
    case 'admin':
      // 跳转到管理后台 - 使用环境变量配置
      const adminPath = import.meta.env.VITE_ADMIN_PATH || '/admin'
      const { protocol, hostname, port } = window.location
      
      // 构建管理后台 URL
      const adminUrl = `${protocol}//${hostname}${port ? ':' + port : ''}${adminPath}`
      
      window.open(adminUrl, '_blank')
      ElMessage.success('正在跳转到管理后台...')
      break
    case 'logout':
      await userStore.logout()
      router.push('/')
      break
  }
}

// 移动端菜单命令处理
const handleMobileCommand = async (command: string) => {
  showMobileMenu.value = false
  await handleCommand(command)
}

// 移动端登录
const handleMobileLogin = () => {
  showMobileMenu.value = false
  goToLogin()
}

// 移动端主题切换
const handleMobileThemeToggle = () => {
  toggleTheme()
}

onMounted(async () => {
  fetchWebsiteConfig()
  
  // 如果已登录，自动刷新用户信息
  if (userStore.isLoggedIn && userStore.token) {
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      // 如果获取用户信息失败（比如 token 过期），清除登录状态
      console.error('获取用户信息失败:', error)
    }
  }
})
</script>

<style scoped lang="scss">
.header {
  background: var(--bg-header);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 999;
  border-bottom: 1px solid var(--border-light);
  overflow: visible;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    pointer-events: none;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 30px;
    display: flex;
    align-items: center;
    min-height: 60px;
    position: relative;
    z-index: 2;
    gap: 20px;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-shrink: 0;
    
    .logo-circle {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 5px 20px rgba(139, 92, 246, 0.4);
      animation: pulse 2s ease-in-out infinite;
      overflow: hidden;
      
      .logo-icon {
        font-size: 24px;
      }
      
      .logo-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .logo-text-wrapper {
      display: flex;
      flex-direction: column;
      gap: 3px;
      
      .logo-text {
        font-size: 18px;
        font-weight: 700;
        color: #fff;
        text-shadow: 0 2px 10px rgba(139, 92, 246, 0.8);
        letter-spacing: 1px;
      }
      
      .logo-subtitle {
        font-size: 11px;
        color: #fff;
        opacity: 0.9;
        text-shadow: 0 1px 5px rgba(139, 92, 246, 0.6);
      }
    }
  }
  
  .nav {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex: 1;
    
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 8px 16px;
      color: rgba(255, 255, 255, 0.9);
      border-radius: 20px;
      transition: all 0.3s;
      font-size: 13px;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 3px;
        background: linear-gradient(90deg, #8b5cf6, #6366f1);
        border-radius: 2px;
        transition: width 0.3s;
      }
      
      .nav-icon {
        font-size: 18px;
        transition: transform 0.3s;
      }
      
      .nav-text {
        font-weight: 500;
      }
      
      &:hover {
        background: rgba(139, 92, 246, 0.3);
        color: #fff;
        transform: translateY(-3px);
        
        .nav-icon {
          transform: scale(1.2) rotate(10deg);
        }
        
        &::before {
          width: 60%;
        }
      }
      
      &.router-link-active {
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
        color: #fff;
        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
        
        .nav-icon {
          transform: scale(1.1);
        }
        
        &::before {
          display: none;
        }
      }
    }
  }
  
  .user-center {
    position: fixed;
    right: 30px;
    top: 10px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 12px;
    
    .theme-toggle {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
      border: 2px solid rgba(139, 92, 246, 0.2);
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .theme-icon {
        font-size: 20px;
        transition: transform 0.3s;
      }
      
      &:hover {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%);
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        
        .theme-icon {
          transform: rotate(20deg) scale(1.1);
        }
      }
      
      &:active {
        transform: translateY(0) scale(0.95);
      }
    }
    
    .user-info {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
      cursor: pointer;
      transition: all 0.3s;
      padding: 3px;
      
      &:hover {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%);
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
      }
      
      .user-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid #4facfe;
        object-fit: cover;
      }
    }
    
    .el-button {
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      border: none;
      box-shadow: 0 5px 20px rgba(139, 92, 246, 0.3);
      
      .btn-icon {
        margin-right: 5px;
      }
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
      }
    }
  }
}

:deep(.el-dropdown-menu__item) {
  .menu-icon {
    margin-right: 8px;
    font-size: 16px;
  }
}

:deep(.el-overlay) {
  z-index: 9998 !important;
  backdrop-filter: blur(4px);
}

.profile-dialog {
  :deep(.el-dialog) {
    border-radius: 25px;
    overflow: hidden;
    
    @media (max-width: 768px) {
      width: 95vw !important;
      margin: 0 auto;
      border-radius: 20px;
    }
  }
  
  :deep(.el-dialog__header) {
    display: none;
  }
  
  :deep(.el-dialog__body) {
    padding: 0;
    position: relative;
  }
  
  .dialog-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    padding: 20px 0 0;
    border-top: 1px solid rgba(139, 92, 246, 0.15);
    margin-top: 30px;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 10px;
      padding: 15px 0 0;
      margin-top: 20px;
    }
    
    .action-btn {
      border-radius: 15px;
      font-size: 13px;
      padding: 10px 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      background: #fff;
      border: 2px solid rgba(139, 92, 246, 0.3);
      color: #8b5cf6;
      
      @media (max-width: 768px) {
        width: 100%;
        padding: 12px 24px;
        font-size: 14px;
      }
      
      &:hover {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
        border-color: #8b5cf6;
        transform: translateY(-2px);
      }
      
      &[type="primary"] {
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
        border: none;
        color: #fff;
        
        &:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
      }
    }
  }
  
  .dialog-profile {
    .intro-card {
      padding: 50px;
      text-align: center;
      
      @media (max-width: 768px) {
        padding: 30px 20px;
      }
      
      .intro-avatar {
        position: relative;
        display: inline-block;
        margin-bottom: 30px;
        cursor: pointer;
        
        @media (max-width: 768px) {
          margin-bottom: 20px;
        }
        
        img {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 5px solid #fff;
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
          transition: all 0.3s;
          
          @media (max-width: 768px) {
            width: 90px;
            height: 90px;
            border: 3px solid #fff;
          }
        }
        
        .avatar-decoration {
          position: absolute;
          top: -5px;
          right: -5px;
          font-size: 30px;
          animation: rotate 3s linear infinite;
          pointer-events: none;
          
          @media (max-width: 768px) {
            font-size: 24px;
            top: -3px;
            right: -3px;
          }
        }
        
        .avatar-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(255, 154, 158, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          opacity: 0;
          transition: opacity 0.3s;
          
          .upload-icon {
            font-size: 32px;
            
            @media (max-width: 768px) {
              font-size: 24px;
            }
          }
          
          .upload-text {
            color: #fff;
            font-size: 14px;
            font-weight: 600;
            
            @media (max-width: 768px) {
              font-size: 12px;
            }
          }
        }
        
        &:hover {
          img {
            transform: scale(1.05);
          }
          
          .avatar-overlay {
            opacity: 1;
          }
        }
        
        // 移动端点击显示上传提示
        @media (max-width: 768px) {
          &:active {
            .avatar-overlay {
              opacity: 1;
            }
          }
        }
      }
      
      .intro-content {
        .intro-title {
          font-size: 28px;
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 25px 0;
          font-weight: 700;
          
          @media (max-width: 768px) {
            font-size: 22px;
            margin: 0 0 20px 0;
          }
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
          gap: 15px;
          
          @media (max-width: 768px) {
            gap: 12px;
          }
          
          .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%);
            border-radius: 15px;
            border: 2px solid rgba(139, 92, 246, 0.15);
            
            @media (max-width: 768px) {
              padding: 10px 15px;
              border-radius: 12px;
            }
            
            .info-icon {
              font-size: 20px;
              
              @media (max-width: 768px) {
                font-size: 18px;
              }
            }
            
            .info-label {
              font-size: 14px;
              color: #8b5cf6;
              font-weight: 600;
              
              @media (max-width: 768px) {
                font-size: 13px;
              }
            }
            
            .info-value {
              font-size: 14px;
              color: #666;
              flex: 1;
              
              @media (max-width: 768px) {
                font-size: 13px;
              }
            }
          }
        }
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 5px 20px rgba(139, 92, 246, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 8px 30px rgba(255, 154, 158, 0.6);
  }
}

// 修改资料弹窗样式
:deep(.edit-dialog) {
  .el-dialog {
    border-radius: 15px;
    
    @media (max-width: 768px) {
      width: 95vw !important;
      margin: 0 auto;
    }
  }
  
  .el-dialog__header {
    padding: 20px 40px !important;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%);
    
    @media (max-width: 768px) {
      padding: 15px 20px !important;
    }
  }
  
  .el-dialog__body {
    padding: 30px 40px !important;
    
    @media (max-width: 768px) {
      padding: 20px 15px !important;
    }
  }
  
  .el-dialog__footer {
    padding: 20px 40px 30px !important;
    text-align: center;
    border-top: 1px solid rgba(255, 182, 193, 0.1);
    
    @media (max-width: 768px) {
      padding: 15px 20px 20px !important;
    }
  }
  
  .el-form-item__label {
    color: #8b5cf6;
    font-weight: 600;
  }
  
  .el-input__wrapper {
    border-radius: 8px;
  }
}

// 修改密码弹窗样式
:deep(.password-dialog) {
  .el-dialog {
    border-radius: 15px;
    
    @media (max-width: 768px) {
      width: 95vw !important;
      margin: 0 auto;
    }
  }
  
  .el-dialog__header {
    padding: 20px 40px !important;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%);
    
    @media (max-width: 768px) {
      padding: 15px 20px !important;
    }
  }
  
  .el-dialog__body {
    padding: 30px 40px !important;
    
    @media (max-width: 768px) {
      padding: 20px 15px !important;
    }
  }
  
  .el-dialog__footer {
    padding: 20px 40px 30px !important;
    text-align: center;
    border-top: 1px solid rgba(255, 182, 193, 0.1);
    
    @media (max-width: 768px) {
      padding: 15px 20px 20px !important;
    }
  }
  
  .el-form-item__label {
    color: #8b5cf6;
    font-weight: 600;
  }
  
  .el-input__wrapper {
    border-radius: 8px;
  }
}

// 移动端汉堡菜单按钮（左侧）
.mobile-menu-btn-left {
  display: none;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  border: none;
  border-radius: 12px;
  width: 45px;
  height: 45px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
  transition: all 0.3s;
  flex-shrink: 0;
  margin-right: 12px;
  
  .menu-icon {
    font-size: 24px;
    color: #fff;
  }
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

// 移动端汉堡菜单按钮（右侧 - 废弃）
.mobile-menu-btn {
  display: none;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  border: none;
  border-radius: 12px;
  width: 45px;
  height: 45px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
  transition: all 0.3s;
  position: fixed !important;
  right: 15px !important;
  top: 12px !important;
  z-index: 1001 !important;
  
  .menu-icon {
    font-size: 24px;
    color: #fff;
  }
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

// 移动端导航抽屉样式
:deep(.mobile-nav-drawer) {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 25px 20px;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  }
  
  .el-drawer__body {
    padding: 0;
  }
}

.drawer-header {
  .drawer-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .logo-icon {
      font-size: 32px;
    }
    
    .logo-image {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
    }
  }
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  
  .mobile-nav-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 18px 20px;
    color: #5a5a5a;
    border-bottom: 1px solid rgba(255, 182, 193, 0.1);
    transition: all 0.3s;
    background: none;
    border-left: none;
    border-right: none;
    border-top: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    font-size: 16px;
    
    .nav-icon {
      font-size: 22px;
      flex-shrink: 0;
    }
    
    .nav-text {
      flex: 1;
      font-weight: 500;
    }
    
    .nav-arrow {
      font-size: 20px;
      color: #ccc;
      transition: transform 0.3s;
    }
    
    &:hover {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%);
      padding-left: 25px;
      
      .nav-arrow {
        transform: translateX(5px);
        color: #8b5cf6;
      }
    }
    
    &:active {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
    }
    
    &.router-link-active {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
      color: #8b5cf6;
      border-left: 4px solid #8b5cf6;
      padding-left: 16px;
      
      .nav-arrow {
        color: #8b5cf6;
      }
    }
  }
  
  .mobile-user-actions {
    margin-top: 10px;
    
    .divider {
      height: 8px;
      background: rgba(255, 182, 193, 0.05);
      margin: 10px 0;
    }
    
    .login-btn {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
      color: #8b5cf6;
      font-weight: 600;
    }
  }
}

@media (max-width: 768px) {
  .header {
    .container {
      padding: 0 15px;
      min-height: 70px;
      justify-content: flex-start;
      align-items: center;
    }
    
    // 显示左侧汉堡菜单按钮
    .mobile-menu-btn-left {
      display: flex !important;
      align-items: center;
      justify-content: center;
    }
    
    .logo {
      // 隐藏小花图标
      .logo-circle {
        display: none;
      }
      
      .logo-text-wrapper {
        .logo-text {
          font-size: 18px;
        }
        
        .logo-subtitle {
          font-size: 10px;
        }
      }
    }
    
    // 隐藏 PC 端导航
    .desktop-nav {
      display: none !important;
    }
    
    .user-center {
      right: 15px !important;
      top: 12px !important;
      
      .user-info {
        width: 45px;
        height: 45px;
      }
      
      .el-button {
        padding: 10px 20px;
        font-size: 14px;
      }
    }
  }
  
  // 隐藏右侧汉堡菜单按钮（废弃）
  .mobile-menu-btn {
    display: none !important;
  }
}

</style>
