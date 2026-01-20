<template>
  <div class="login-page">
    <div class="login-container card">
      <button class="close-btn" @click="goBack">×</button>
      
      <div class="login-header">
        <div class="logo">🌸</div>
        <h2 class="title">欢迎回来</h2>
      </div>
      
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" size="large">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="用户名"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="密码"
            prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <div class="form-options">
            <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
            <el-link type="primary" underline="never">忘记密码？</el-link>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            class="login-btn"
            :loading="loginLoading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <div class="register-tip">
            还没有账号？<el-link type="primary" underline="never" @click="goToRegister">立即注册</el-link>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loginLoading = ref(false)
const rememberMe = ref(false)
const loginForm = ref({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loginLoading.value = true
      
      try {
        const success = await userStore.login(loginForm.value.username, loginForm.value.password)
        
        if (success) {
          // 获取登录前的页面路径
          const redirect = router.currentRoute.value.query.redirect as string
          // 如果有重定向路径，跳转到该路径，否则跳转到首页
          router.push(redirect || '/')
        }
      } catch (error) {
        // 登录失败
      } finally {
        loginLoading.value = false
      }
    }
  })
}

const goToRegister = () => {
  router.push('/register')
}

const goBack = () => {
  router.push('/')
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 35px 40px 35px;
  position: relative;
  
  &:hover {
    transform: none;
    box-shadow: 0 10px 35px rgba(252, 182, 159, 0.15);
  }
  
  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, rgba(255, 154, 158, 0.15) 0%, rgba(254, 207, 239, 0.15) 100%);
    color: #ff9a9e;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    transition: all 0.3s;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background: linear-gradient(135deg, rgba(255, 154, 158, 0.25) 0%, rgba(254, 207, 239, 0.25) 100%);
      transform: rotate(90deg) scale(1.1);
    }
  }
  
  .login-header {
    text-align: center;
    margin-bottom: 30px;
    
    .logo {
      font-size: 60px;
      margin-bottom: 15px;
      animation: bounce 2s ease-in-out infinite;
      filter: drop-shadow(0 5px 15px rgba(255, 154, 158, 0.3));
    }
    
    .title {
      font-size: 28px;
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 10px 0;
      font-weight: 700;
      letter-spacing: 2px;
    }
    
    .subtitle {
      font-size: 14px;
      color: #999;
      margin: 0;
    }
  }
  
  .el-form {
    .el-form-item {
      margin-bottom: 20px;
    }
    
    .el-input {
      :deep(.el-input__wrapper) {
        padding: 12px 18px;
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
      
      :deep(.el-input__inner) {
        font-size: 16px;
        color: #5a5a5a;
        
        &::placeholder {
          color: #bbb;
        }
      }
      
      :deep(.el-input__prefix) {
        color: #ff9a9e;
      }
    }
    
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      
      .el-checkbox {
        :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          border-color: #ff9a9e;
        }
        
        :deep(.el-checkbox__label) {
          font-size: 15px;
          color: #666;
        }
      }
      
      .el-link {
        font-size: 15px;
        color: #ff9a9e;
        
        &:hover {
          color: #ff7a7e;
        }
      }
    }
    
    .login-btn {
      width: 100%;
      height: 48px;
      border-radius: 24px;
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      border: none;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      box-shadow: 0 10px 30px rgba(255, 154, 158, 0.4);
      transition: all 0.3s;
      letter-spacing: 3px;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 15px 40px rgba(255, 154, 158, 0.5);
        background: linear-gradient(135deg, #ff8a8e 0%, #fedcdf 100%);
      }
      
      &:active {
        transform: translateY(-2px);
      }
    }
    
    .register-tip {
      text-align: center;
      font-size: 15px;
      color: #999;
      width: 100%;
      
      .el-link {
        color: #ff9a9e;
        font-weight: 700;
        margin-left: 5px;
        
        &:hover {
          color: #ff7a7e;
        }
      }
    }
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

@media (max-width: 768px) {
  .login-page {
    padding: 20px 15px;
  }
  
  .login-container {
    padding: 35px 25px 30px;
    max-width: 100%;
    
    .login-header {
      margin-bottom: 30px;
      
      .logo {
        font-size: 50px;
        margin-bottom: 15px;
      }
      
      .title {
        font-size: 24px;
        margin-bottom: 8px;
      }
      
      .subtitle {
        font-size: 13px;
      }
    }
    
    .login-form {
      .el-form-item {
        margin-bottom: 20px;
      }
      
      .el-input__inner {
        height: 45px;
        font-size: 14px;
      }
      
      .login-btn {
        height: 45px;
        font-size: 15px;
        margin-top: 10px;
      }
    }
    
    .login-footer {
      margin-top: 25px;
      font-size: 13px;
      
      .register-link {
        font-size: 13px;
      }
    }
  }
}
</style>
