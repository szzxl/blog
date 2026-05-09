<template>
  <div class="login-page">
    <div class="login-container card">
      <button class="close-btn" @click="goBack">×</button>
      
      <div class="login-header">
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
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  position: relative;
  overflow: hidden;

  // 微弱的玉色光晕（与 Home hero 呼应，但克制）
  &::before {
    content: '';
    position: absolute;
    top: -180px;
    left: -180px;
    width: 480px;
    height: 480px;
    background: radial-gradient(circle, rgba(74, 140, 110, 0.12) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(70px);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -160px;
    right: -160px;
    width: 420px;
    height: 420px;
    background: radial-gradient(circle, rgba(107, 95, 191, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(70px);
    pointer-events: none;
  }
}

.login-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 400px;
  background: var(--bg-card);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card-hover);
  padding: 44px 40px 36px;

  .close-btn {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-btn);
    border: 1px solid var(--border-color);
    background: transparent;
    color: var(--text-tertiary);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;

    &:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
      background: var(--bg-secondary);
    }
  }

  .login-header {
    text-align: center;
    margin-bottom: 32px;

    .title {
      font-family: var(--font-serif);
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 13px;
      color: var(--text-tertiary);
      margin: 0;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    :deep(.el-checkbox__label) {
      font-size: 13px;
      color: var(--text-secondary);
    }

    :deep(.el-link) {
      font-size: 13px;
      color: var(--color-accent);
    }
  }

  // 主按钮：渐变 + hover 加深
  .login-btn {
    width: 100%;
    height: 42px;
    border-radius: var(--radius-btn);
    background: var(--gradient-accent);
    border: none;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      background: var(--color-accent-hover);
      transform: translateY(-1px);
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.14);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .register-tip {
    text-align: center;
    font-size: 13px;
    color: var(--text-tertiary);
    width: 100%;

    :deep(.el-link) {
      color: var(--color-accent);
      margin-left: 4px;
      font-weight: 600;
    }
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 36px 24px 28px;
  }

  .login-container .login-header .title {
    font-size: 22px;
  }
}
</style>
