<template>
  <header class="header">
    <div class="header-bg"></div>
    <div class="container">
      <div class="logo">
        <div class="logo-circle">
          <span class="logo-icon">🌸</span>
        </div>
        <div class="logo-text-wrapper">
          <span class="logo-text">小花的日记本</span>
          <span class="logo-subtitle">记录美好生活</span>
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
      
      <!-- 用户中心 -->
      <div class="user-center">
        <template v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <img :src="userStore.user?.avatar" alt="头像" class="user-avatar">
              <span class="user-name">{{ userStore.user?.username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <span class="menu-icon">👤</span>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="likes">
                  <span class="menu-icon">💗</span>
                  我的点赞
                </el-dropdown-item>
                <el-dropdown-item command="comments">
                  <span class="menu-icon">💬</span>
                  我的评论
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <span class="menu-icon">🚪</span>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" round @click="showLoginDialog = true">
            <span class="btn-icon">🌸</span>
            登录
          </el-button>
        </template>
      </div>
    </div>
    
    <!-- 登录对话框 -->
    <el-dialog
      v-model="showLoginDialog"
      title="用户登录"
      width="420px"
      :close-on-click-modal="false"
      :z-index="9999"
      append-to-body
      class="login-dialog"
    >
      <el-form :model="loginForm" label-width="0" size="large">
        <el-form-item>
          <el-input 
            v-model="loginForm.username" 
            placeholder="用户名"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="密码"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <div class="form-footer">
            <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
            <el-link type="primary" underline="never">忘记密码</el-link>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            style="width: 100%"
            :loading="loginLoading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <div class="register-link">
            还没有账号？<el-link type="primary" underline="never">立即注册</el-link>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const showLoginDialog = ref(false)
const loginLoading = ref(false)
const rememberMe = ref(false)
const loginForm = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码 💕')
    return
  }
  
  loginLoading.value = true
  
  // 模拟登录延迟（实际应该调用 API）
  setTimeout(() => {
    const userData = {
      id: '1',
      username: loginForm.value.username,
      avatar: 'https://via.placeholder.com/40/ff9a9e/ffffff?text=♡',
      email: 'user@example.com'
    }
    
    userStore.login(userData)
    showLoginDialog.value = false
    loginLoading.value = false
    ElMessage.success('登录成功！欢迎回来 🌸')
    
    // 清空表单
    loginForm.value = {
      username: '',
      password: ''
    }
  }, 800)
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'likes':
      router.push('/profile/likes')
      break
    case 'comments':
      router.push('/profile/comments')
      break
    case 'logout':
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/')
      break
  }
}
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
  position: relative;
  overflow: hidden;
  
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
    justify-content: space-between;
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
    flex: 1;
    justify-content: center;
    
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
    flex-shrink: 0;
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 15px;
      border-radius: 25px;
      background: linear-gradient(135deg, rgba(255, 154, 158, 0.1) 0%, rgba(254, 207, 239, 0.1) 100%);
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        background: linear-gradient(135deg, rgba(255, 154, 158, 0.2) 0%, rgba(254, 207, 239, 0.2) 100%);
        transform: translateY(-2px);
      }
      
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid #ff9a9e;
        object-fit: cover;
      }
      
      .user-name {
        font-size: 14px;
        font-weight: 600;
        color: #ff9a9e;
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

// 登录对话框 - 完全使用全局 card 样式
:deep(.login-dialog) {
  .el-dialog__header {
    display: none;
  }
  
  .el-dialog__body {
    padding: 0;
    background: transparent;
    text-align: center;
  }
  
  .login-card {
    padding: 50px 45px 45px;
    text-align: center;
    
    // 禁用 hover 效果，对话框不需要
    &:hover {
      transform: none;
      box-shadow: 0 10px 35px rgba(252, 182, 159, 0.15);
    }
    
    .close-btn {
      position: absolute;
      top: 25px;
      right: 25px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, rgba(255, 154, 158, 0.15) 0%, rgba(254, 207, 239, 0.15) 100%);
      color: #ff9a9e;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      transition: all 0.3s;
      z-index: 10;
      
      &:hover {
        background: linear-gradient(135deg, rgba(255, 154, 158, 0.25) 0%, rgba(254, 207, 239, 0.25) 100%);
        transform: rotate(90deg) scale(1.1);
      }
    }
    
    .login-header {
      text-align: center !important;
      margin-bottom: 40px;
      width: 100%;
      
      .header-icon {
        font-size: 70px;
        margin-bottom: 25px;
        display: block;
        text-align: center;
        animation: bounce 2s ease-in-out infinite;
        filter: drop-shadow(0 5px 15px rgba(255, 154, 158, 0.3));
      }
      
      .title {
        font-size: 36px;
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 auto 15px auto;
        font-weight: 700;
        letter-spacing: 2px;
        text-align: center !important;
        display: block;
        width: 100%;
      }
      
      .subtitle {
        font-size: 16px;
        color: #999;
        margin: 0 auto;
        text-align: center !important;
        display: block;
        width: 100%;
      }
    }
    
    .login-form {
      text-align: left;
      
      .form-item {
        margin-bottom: 25px;
        
        .item-label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          
          .label-icon {
            font-size: 20px;
          }
          
          .label-text {
            font-size: 16px;
            color: #5a5a5a;
            font-weight: 600;
          }
        }
        
        .el-input {
          .el-input__wrapper {
            padding: 16px 20px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 4px 15px rgba(252, 182, 159, 0.12);
            border: 2px solid rgba(255, 182, 193, 0.2);
            transition: all 0.3s;
            
            &:hover {
              box-shadow: 0 6px 20px rgba(252, 182, 159, 0.18);
              border-color: rgba(255, 182, 193, 0.3);
            }
            
            &.is-focus {
              border-color: #ff9a9e;
              box-shadow: 0 6px 25px rgba(255, 154, 158, 0.3);
              background: #fff;
            }
          }
          
          .el-input__inner {
            font-size: 16px;
            color: #5a5a5a;
            
            &::placeholder {
              color: #bbb;
            }
          }
        }
      }
      
      .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 35px;
        padding: 0 5px;
        
        .el-checkbox {
          :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            border-color: #ff9a9e;
          }
          
          :deep(.el-checkbox__inner) {
            border-radius: 6px;
            width: 18px;
            height: 18px;
          }
          
          :deep(.el-checkbox__label) {
            font-size: 15px;
            color: #666;
          }
        }
        
        .forgot-link {
          color: #ff9a9e;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.3s;
          
          &:hover {
            color: #ff7a7e;
            text-decoration: underline;
          }
        }
      }
      
      .login-btn {
        width: 100%;
        height: 56px;
        border-radius: 28px;
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        border: none;
        font-size: 18px;
        font-weight: 700;
        color: #fff;
        box-shadow: 0 10px 30px rgba(255, 154, 158, 0.4);
        transition: all 0.3s;
        margin-bottom: 30px;
        
        .btn-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          letter-spacing: 3px;
          
          .btn-icon {
            font-size: 20px;
          }
        }
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 40px rgba(255, 154, 158, 0.5);
        }
        
        &:active {
          transform: translateY(-2px);
        }
      }
      
      .register-tip {
        text-align: center;
        font-size: 15px;
        color: #999;
        
        .register-link {
          color: #ff9a9e;
          text-decoration: none;
          font-weight: 700;
          margin-left: 5px;
          transition: all 0.3s;
          
          &:hover {
            color: #ff7a7e;
            text-decoration: underline;
          }
        }
      }
    }
  }
}

:deep(.el-overlay) {
  z-index: 9998 !important;
  backdrop-filter: blur(12px);
  background: linear-gradient(135deg, rgba(255, 154, 158, 0.3) 0%, rgba(254, 207, 239, 0.3) 100%);
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
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
      order: 3;
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
      order: 2;
      
      .user-info {
        padding: 5px 10px;
        
        .user-name {
          display: none;
        }
      }
    }
  }
}
</style>
