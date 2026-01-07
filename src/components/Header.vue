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
              <el-dropdown-item command="admin">
                <span class="menu-icon">⚙️</span>
                管理后台
              </el-dropdown-item>
              <el-dropdown-item divided command="profile">
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
    width="700px"
    :show-close="true"
    class="profile-dialog"
  >
    <div class="dialog-profile">
      <div class="intro-card">
        <div class="intro-avatar">
          <img :src="userStore.user?.avatar || 'https://via.placeholder.com/120/ff9a9e/ffffff?text=♡'" alt="头像">
          <div class="avatar-decoration">✨</div>
        </div>
        <div class="intro-content">
          <h2 class="intro-title">Hi~ 我是{{ userStore.user?.username || '小花' }} 🌸</h2>
          <p class="intro-desc">一个热爱生活、喜欢记录的女生，在这里分享我的日常、心情和小确幸~</p>
          
          <!-- 标签编辑区域 -->
          <div class="tags-section">
            <div class="intro-tags">
              <span 
                v-for="(tag, index) in userTags" 
                :key="index" 
                class="tag"
              >
                {{ tag }}
                <span class="tag-remove" @click="removeTag(index)">×</span>
              </span>
              <el-button 
                v-if="!isAddingTag" 
                class="add-tag-btn" 
                size="small" 
                @click="isAddingTag = true"
              >
                + 添加标签
              </el-button>
            </div>
            
            <div v-if="isAddingTag" class="tag-input-wrapper">
              <el-input 
                v-model="newTag" 
                placeholder="输入标签（如：🎨 手账爱好者）"
                maxlength="20"
                @keyup.enter="addTag"
              />
              <el-button type="primary" @click="addTag">确定</el-button>
              <el-button @click="cancelAddTag">取消</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 用户标签
const userTags = ref(['🎨', '📷', '☕', '🎵'])

// 个人中心弹窗
const showProfileDialog = ref(false)
const isAddingTag = ref(false)
const newTag = ref('')

const addTag = () => {
  if (!newTag.value.trim()) {
    ElMessage.warning('请输入标签内容')
    return
  }
  
  if (userTags.value.length >= 8) {
    ElMessage.warning('最多只能添加8个标签')
    return
  }
  
  userTags.value.push(newTag.value.trim())
  newTag.value = ''
  isAddingTag.value = false
  ElMessage.success('标签添加成功')
}

const removeTag = (index: number) => {
  userTags.value.splice(index, 1)
  ElMessage.success('标签已删除')
}

const cancelAddTag = () => {
  newTag.value = ''
  isAddingTag.value = false
}

const goToLogin = () => {
  router.push('/login')
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      showProfileDialog.value = true
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
  }
  
  .dialog-profile {
    .intro-card {
      padding: 50px;
      text-align: center;
      
      .intro-avatar {
        position: relative;
        display: inline-block;
        margin-bottom: 30px;
        
        img {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 5px solid #fff;
          box-shadow: 0 8px 25px rgba(255, 154, 158, 0.3);
        }
        
        .avatar-decoration {
          position: absolute;
          top: -5px;
          right: -5px;
          font-size: 30px;
          animation: rotate 3s linear infinite;
        }
      }
      
      .intro-content {
        .intro-title {
          font-size: 28px;
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 15px;
          font-weight: 700;
        }
        
        .intro-desc {
          color: #666;
          font-size: 15px;
          line-height: 1.8;
          margin-bottom: 30px;
        }
        
        .tags-section {
          .intro-tags {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
            margin-bottom: 20px;
            
            .tag {
              background: linear-gradient(135deg, rgba(255, 154, 158, 0.15) 0%, rgba(254, 207, 239, 0.15) 100%);
              color: #ff9a9e;
              padding: 8px 14px;
              border-radius: 18px;
              font-size: 14px;
              border: 2px solid rgba(255, 154, 158, 0.2);
              transition: all 0.3s;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 6px;
              
              &:hover {
                background: linear-gradient(135deg, rgba(255, 154, 158, 0.2) 0%, rgba(254, 207, 239, 0.2) 100%);
                border-color: #ff9a9e;
                transform: translateY(-2px);
              }
              
              .tag-remove {
                cursor: pointer;
                font-size: 16px;
                font-weight: 700;
                opacity: 0.6;
                transition: all 0.2s;
                
                &:hover {
                  opacity: 1;
                  color: #ff6b6b;
                  transform: scale(1.2);
                }
              }
            }
            
            .add-tag-btn {
              background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
              color: #fff;
              border: none;
              border-radius: 18px;
              padding: 8px 14px;
              font-weight: 600;
              box-shadow: 0 4px 15px rgba(255, 154, 158, 0.3);
              
              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(255, 154, 158, 0.4);
              }
            }
          }
          
          .tag-input-wrapper {
            display: flex;
            gap: 10px;
            justify-content: center;
            align-items: center;
            
            .el-input {
              flex: 1;
              max-width: 300px;
              
              :deep(.el-input__wrapper) {
                border-radius: 15px;
                box-shadow: 0 2px 12px rgba(252, 182, 159, 0.1);
                border: 2px solid rgba(255, 182, 193, 0.2);
                
                &:hover {
                  border-color: rgba(255, 182, 193, 0.3);
                }
                
                &.is-focus {
                  border-color: #ff9a9e;
                  box-shadow: 0 4px 20px rgba(255, 154, 158, 0.25);
                }
              }
            }
            
            .el-button {
              border-radius: 15px;
              
              &[type="primary"] {
                background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
                border: none;
                box-shadow: 0 4px 15px rgba(255, 154, 158, 0.3);
                
                &:hover {
                  opacity: 0.9;
                }
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
