<template>
  <div class="login-page">
    <div class="bg-overlay"></div>

    <div class="login-container">
      <button class="close-btn" @click="goBack" aria-label="返回首页">&#10005;</button>

      <div class="login-header">
        <div class="logo-ring"></div>
        <h2 class="title">欢迎回来</h2>
        <p class="subtitle">登录以继续访问博客</p>
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
            <span></span>
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
            登 录
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
const loginForm = ref({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度在 6 到 50 个字符', trigger: 'blur' }
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
          // 获取登录前的页面路径（只允许同源内部路径，阻止 //evil.com 等跳转）
          const redirect = router.currentRoute.value.query.redirect as string
          const isSafeRedirect = redirect && /^\/(?!\/)/.test(redirect) && !redirect.includes(':')
          router.push(isSafeRedirect ? redirect : '/')
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
// ── 全页背景 ──────────────────────────────────────────
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
  background: url('/bg-banner.png') center center / cover no-repeat fixed;

  .bg-overlay {
    position: absolute;
    inset: 0;
    background: rgba(5, 12, 30, 0.72);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    z-index: 0;
  }
}

// ── 毛玻璃登录卡片 ────────────────────────────────────
.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  padding: 48px 44px 40px;

  // 关闭按钮
  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.65);
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, border-color 0.2s, color 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.14);
      border-color: rgba(255, 255, 255, 0.36);
      color: #fff;
    }
  }

  // 头部
  .login-header {
    text-align: center;
    margin-bottom: 36px;

    .logo-ring {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-accent) 0%, #7b9eff 100%);
      margin: 0 auto 16px;
      box-shadow: 0 4px 20px rgba(22, 93, 255, 0.45);
    }

    .title {
      font-family: var(--font-display);
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #fff;
      margin: 0 0 6px 0;
      text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
    }

    .subtitle {
      font-family: var(--font-sans);
      font-size: 13px;
      color: rgba(255, 255, 255, 0.72);
      margin: 0;
    }
  }

  // Element Plus 表单项间距
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  // 输入框：毛玻璃风格（!important 防止浅色主题覆盖）
  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.08) !important;
    border-radius: 10px;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.14) inset !important;
    transition: box-shadow 0.2s, background 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.12) !important;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.26) inset !important;
    }

    &.is-focus {
      background: rgba(255, 255, 255, 0.12) !important;
      box-shadow: 0 0 0 1px var(--color-accent) inset, 0 0 12px rgba(22, 93, 255, 0.2) !important;
    }
  }

  :deep(.el-input__inner) {
    color: #fff !important;
    font-family: var(--font-sans);

    &::placeholder { color: rgba(255, 255, 255, 0.62) !important; }
  }

  :deep(.el-input__prefix .el-icon),
  :deep(.el-input__suffix .el-icon) {
    color: rgba(255, 255, 255, 0.55) !important;
  }

  // 记住密码 / 忘记密码行
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    :deep(.el-checkbox__label) {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.65);
    }

    :deep(.el-checkbox__inner) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.25);
    }

    :deep(.el-link) {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.65);

      &:hover { color: #fff; }
    }
  }

  // 登录按钮
  .login-btn {
    width: 100%;
    height: 46px;
    border-radius: 10px;
    background: linear-gradient(90deg, var(--color-accent) 0%, #4d7eff 100%);
    border: none;
    font-family: var(--font-sans);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #fff;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 18px rgba(22, 93, 255, 0.38);

    &:hover {
      opacity: 0.92;
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(22, 93, 255, 0.48);
    }

    &:active { transform: translateY(0); }
  }

  // 注册提示
  .register-tip {
    text-align: center;
    font-family: var(--font-sans);
    font-size: 13px;
    color: rgba(255, 255, 255, 0.72);
    width: 100%;

    :deep(.el-link) {
      color: rgba(255, 255, 255, 0.8);
      margin-left: 4px;
      font-weight: 600;

      &:hover { color: #fff; }
    }
  }
}

// ── 响应式 ────────────────────────────────────────────
@media (max-width: 480px) {
  .login-container {
    padding: 36px 24px 28px;
    border-radius: 16px;
  }

  .login-container .login-header .title { font-size: 22px; }
}
</style>
