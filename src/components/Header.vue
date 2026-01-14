<template>
  <header class="header">
    <div class="header-bg"></div>
    <div class="container">
      <div class="logo">
        <div class="logo-circle">
          <span class="logo-icon">🌸</span>
        </div>
        <div class="logo-text-wrapper">
          <span class="logo-text">{{ siteName }}</span>
          <span class="logo-subtitle">{{ siteDescription }}</span>
        </div>
      </div>
      <nav class="nav">
        <router-link to="/" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">首页</span>
        </router-link>
        <router-link to="/articles" class="nav-item">
          <span class="nav-icon">✨</span>
          <span class="nav-text">文章</span>
        </router-link>
        <router-link to="/category" class="nav-item">
          <span class="nav-icon">🎀</span>
          <span class="nav-text">分类</span>
        </router-link>
        <router-link to="/tag" class="nav-item">
          <span class="nav-icon">🏷️</span>
          <span class="nav-text">标签</span>
        </router-link>
        <router-link to="/talk" class="nav-item">
          <span class="nav-icon">💕</span>
          <span class="nav-text">说说</span>
        </router-link>
        <router-link to="/guestbook" class="nav-item">
          <span class="nav-icon">💌</span>
          <span class="nav-text">留言板</span>
        </router-link>
        <router-link to="/link" class="nav-item">
          <span class="nav-icon">🌈</span>
          <span class="nav-text">友链</span>
        </router-link>
        <router-link to="/about" class="nav-item">
          <span class="nav-icon">🦋</span>
          <span class="nav-text">关于</span>
        </router-link>
      </nav>
    </div>
    
    <!-- 用户中心 - 移到container外面 -->
    <div class="user-center">
      <template v-if="userStore.isLoggedIn">
        <el-dropdown @command="handleCommand">
          <div class="user-info">
            <img :src="userStore.user?.avatar" alt="头像" class="user-avatar">
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-if="isAuthor" command="admin">
                <span class="menu-icon">⚙️</span>
                管理后台
              </el-dropdown-item>
              <el-dropdown-item v-if="!isAuthor" command="favorites">
                <span class="menu-icon">⭐</span>
                我的收藏
              </el-dropdown-item>
              <el-dropdown-item :divided="isAuthor || !isAuthor" command="profile">
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
          <span class="btn-icon">🌸</span>
          登录
        </el-button>
      </template>
    </div>
  </header>
  
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
          <img :src="userStore.user?.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmOWE5ZTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZWNmZWY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PGNpcmNsZSBjeD0iNjAiIGN5PSI0NSIgcj0iMjAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjkiLz48cGF0aCBkPSJNIDMwIDk1IFEgMzAgNzAgNjAgNzAgUSA5MCA3MCA5MCA5NSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOSIvPjx0ZXh0IHg9IjYwIiB5PSIzNSIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPvCfjLg8L3RleHQ+PC9zdmc+'" alt="头像">
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
import { fetchWebsiteConfigWithCache } from '@/utils/websiteConfig'
import { uploadImage, updateUserProfile, getUserInfo, updatePassword } from '@/api/article'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const siteName = ref('小花的日记本')
const siteDescription = ref('记录美好生活')

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
      validator: (rule: any, value: string, callback: any) => {
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
const showChangePasswordDialog = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  showPasswordDialog.value = true
}

// 显示修改资料弹窗
const showEditProfileDialog = () => {
  editForm.value = {
    nickname: userStore.user?.nickname || userStore.user?.username || '',
    mobile: userStore.user?.mobile || '',
    email: userStore.user?.email || ''
  }
  showEditDialog.value = true
}

// 提交修改资料
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
const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

// 处理头像上传
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
    
    // 尝试多种可能的字段名
    const avatarUrl = uploadResponse?.url || uploadResponse?.data?.url || uploadResponse?.path || uploadResponse?.data?.path || uploadResponse
    
    if (!avatarUrl || typeof avatarUrl !== 'string') {
      loadingMessage.close()
      ElMessage.error('上传失败，请重试')
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
    
    // 延迟关闭弹窗，让用户看到新头像
    setTimeout(() => {
      showProfileDialog.value = false
    }, 1000)
  } catch (error: any) {
    loadingMessage.close()
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
      // 跳转到管理后台 - 同域名根路径
      const hostname = window.location.hostname
      const protocol = window.location.protocol
      const adminUrl = `${protocol}//${hostname}`
      window.open(adminUrl, '_blank')
      ElMessage.success('正在跳转到管理后台...')
      break
    case 'logout':
      await userStore.logout()
      router.push('/')
      break
  }
}

onMounted(() => {
  fetchWebsiteConfig()
})
</script>

<style scoped lang="scss">
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 25px rgba(252, 182, 159, 0.2);
  position: sticky;
  top: 0;
  z-index: 999;
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(90deg, #ff9a9e, #fecfef, #ffd0d0) 1;
  overflow: visible;
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 154, 158, 0.05) 0%, rgba(254, 207, 239, 0.05) 100%);
    pointer-events: none;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 30px;
    display: flex;
    align-items: center;
    min-height: 80px;
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
      width: 55px;
      height: 55px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 5px 20px rgba(255, 154, 158, 0.4);
      animation: pulse 2s ease-in-out infinite;
      
      .logo-icon {
        font-size: 30px;
      }
    }
    
    .logo-text-wrapper {
      display: flex;
      flex-direction: column;
      gap: 3px;
      
      .logo-text {
        font-size: 22px;
        font-weight: 700;
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: 1px;
      }
      
      .logo-subtitle {
        font-size: 12px;
        color: #ff9a9e;
        opacity: 0.8;
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
      gap: 5px;
      padding: 12px 20px;
      color: #7a7a7a;
      border-radius: 20px;
      transition: all 0.3s;
      font-size: 14px;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 3px;
        background: linear-gradient(90deg, #ff9a9e, #fecfef);
        border-radius: 2px;
        transition: width 0.3s;
      }
      
      .nav-icon {
        font-size: 22px;
        transition: transform 0.3s;
      }
      
      .nav-text {
        font-weight: 500;
      }
      
      &:hover {
        background: linear-gradient(135deg, rgba(255, 240, 246, 0.8) 0%, rgba(255, 232, 240, 0.8) 100%);
        color: #ff9a9e;
        transform: translateY(-3px);
        
        .nav-icon {
          transform: scale(1.2) rotate(10deg);
        }
        
        &::before {
          width: 60%;
        }
      }
      
      &.router-link-active {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        color: #fff;
        box-shadow: 0 8px 25px rgba(255, 154, 158, 0.4);
        
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
    top: 15px;
    z-index: 1000;
    
    .user-info {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(255, 154, 158, 0.1) 0%, rgba(254, 207, 239, 0.1) 100%);
      cursor: pointer;
      transition: all 0.3s;
      padding: 3px;
      
      &:hover {
        background: linear-gradient(135deg, rgba(255, 154, 158, 0.2) 0%, rgba(254, 207, 239, 0.2) 100%);
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 4px 15px rgba(255, 154, 158, 0.3);
      }
      
      .user-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid #ff9a9e;
        object-fit: cover;
      }
    }
    
    .el-button {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      border: none;
      box-shadow: 0 5px 20px rgba(255, 154, 158, 0.3);
      
      .btn-icon {
        margin-right: 5px;
      }
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(255, 154, 158, 0.4);
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
    border-top: 1px solid rgba(255, 182, 193, 0.15);
    margin-top: 30px;
    
    .action-btn {
      border-radius: 15px;
      font-size: 13px;
      padding: 10px 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      background: #fff;
      border: 2px solid rgba(255, 182, 193, 0.3);
      color: #ff9a9e;
      
      &:hover {
        background: linear-gradient(135deg, rgba(255, 154, 158, 0.1) 0%, rgba(254, 207, 239, 0.1) 100%);
        border-color: #ff9a9e;
        transform: translateY(-2px);
      }
      
      &[type="primary"] {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        border: none;
        color: #fff;
        
        &:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 154, 158, 0.4);
        }
      }
    }
  }
  
  .dialog-profile {
    .intro-card {
      padding: 50px;
      text-align: center;
      
      .intro-avatar {
        position: relative;
        display: inline-block;
        margin-bottom: 30px;
        cursor: pointer;
        
        img {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 5px solid #fff;
          box-shadow: 0 8px 25px rgba(255, 154, 158, 0.3);
          transition: all 0.3s;
        }
        
        .avatar-decoration {
          position: absolute;
          top: -5px;
          right: -5px;
          font-size: 30px;
          animation: rotate 3s linear infinite;
          pointer-events: none;
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
          }
          
          .upload-text {
            color: #fff;
            font-size: 14px;
            font-weight: 600;
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
      }
      
      .intro-content {
        .intro-title {
          font-size: 28px;
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 25px 0;
          font-weight: 700;
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
          gap: 15px;
          
          .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            background: linear-gradient(135deg, rgba(255, 154, 158, 0.08) 0%, rgba(254, 207, 239, 0.08) 100%);
            border-radius: 15px;
            border: 2px solid rgba(255, 182, 193, 0.15);
            
            .info-icon {
              font-size: 20px;
            }
            
            .info-label {
              font-size: 14px;
              color: #ff9a9e;
              font-weight: 600;
            }
            
            .info-value {
              font-size: 14px;
              color: #666;
              flex: 1;
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
    box-shadow: 0 5px 20px rgba(255, 154, 158, 0.4);
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
  }
  
  .el-dialog__header {
    padding: 20px 40px !important;
    background: linear-gradient(135deg, rgba(255, 154, 158, 0.05) 0%, rgba(254, 207, 239, 0.05) 100%);
  }
  
  .el-dialog__body {
    padding: 30px 40px !important;
  }
  
  .el-dialog__footer {
    padding: 20px 40px 30px !important;
    text-align: center;
    border-top: 1px solid rgba(255, 182, 193, 0.1);
  }
  
  .el-form-item__label {
    color: #ff9a9e;
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
  }
  
  .el-dialog__header {
    padding: 20px 40px !important;
    background: linear-gradient(135deg, rgba(255, 154, 158, 0.05) 0%, rgba(254, 207, 239, 0.05) 100%);
  }
  
  .el-dialog__body {
    padding: 30px 40px !important;
  }
  
  .el-dialog__footer {
    padding: 20px 40px 30px !important;
    text-align: center;
    border-top: 1px solid rgba(255, 182, 193, 0.1);
  }
  
  .el-form-item__label {
    color: #ff9a9e;
    font-weight: 600;
  }
  
  .el-input__wrapper {
    border-radius: 8px;
  }
}

@media (max-width: 768px) {
  .header {
    .container {
      padding: 0 15px;
      min-height: 70px;
      flex-wrap: wrap;
    }
    
    .logo {
      .logo-circle {
        width: 45px;
        height: 45px;
        
        .logo-icon {
          font-size: 24px;
        }
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
    
    .nav {
      flex-wrap: wrap;
      gap: 5px;
      order: 2;
      width: 100%;
      justify-content: flex-start;
      
      .nav-item {
        padding: 8px 12px;
        
        .nav-icon {
          font-size: 18px;
        }
        
        .nav-text {
          display: none;
        }
      }
    }
    
    .user-center {
      position: fixed;
      right: 15px;
      top: 12px;
      
      .user-info {
        width: 45px;
        height: 45px;
      }
    }
  }
}
</style>
