<template>
  <div class="register-page">
    <div class="register-container card">
      <button class="close-btn" @click="goBack">×</button>
      
      <div class="register-header">
        <h2 class="title">注册账号</h2>
      </div>
      
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" size="large">
        <el-form-item prop="username">
          <el-input 
            v-model="registerForm.username" 
            placeholder="用户名"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="nickname">
          <el-input 
            v-model="registerForm.nickname" 
            placeholder="昵称"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="密码"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="确认密码"
            prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleRegister"
          />
        </el-form-item>
        
        <el-form-item>
          <div class="agreement">
            <el-checkbox v-model="agreeTerms">
              我已阅读并同意
              <el-link type="primary" underline="never">《用户协议》</el-link>
              和
              <el-link type="primary" underline="never">《隐私政策》</el-link>
            </el-checkbox>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            class="register-btn"
            :loading="registerLoading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <div class="login-tip">
            已有账号？<el-link type="primary" underline="never" @click="goToLogin">立即登录</el-link>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { register } from '@/api/article'

const router = useRouter()

const registerFormRef = ref<FormInstance>()
const registerLoading = ref(false)
const agreeTerms = ref(false)
const registerForm = ref({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const validatePass = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (registerForm.value.confirmPassword !== '') {
      registerFormRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPass = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.value.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPass, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  if (!agreeTerms.value) {
    ElMessage.warning('请先阅读并同意用户协议和隐私政策')
    return
  }
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      registerLoading.value = true
      
      try {
        await register({
          username: registerForm.value.username,
          nickname: registerForm.value.nickname,
          password: registerForm.value.password
        })
        
        ElMessage.success('注册成功！请登录')
        
        // 跳转到登录页
        router.push('/login')
      } catch (error) {
        ElMessage.error('注册失败，请重试')
      } finally {
        registerLoading.value = false
      }
    }
  })
}

const goToLogin = () => {
  router.push('/login')
}

const goBack = () => {
  router.push('/')
}
</script>

<style scoped lang="scss">
.register-page {
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
    right: -180px;
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
    left: -160px;
    width: 420px;
    height: 420px;
    background: radial-gradient(circle, rgba(107, 95, 191, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(70px);
    pointer-events: none;
  }
}

.register-container {
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

  .register-header {
    text-align: center;
    margin-bottom: 28px;

    .title {
      font-family: var(--font-serif);
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      margin: 0 0 8px 0;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  .agreement {
    width: 100%;

    :deep(.el-checkbox__label) {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    :deep(.el-link) {
      font-size: 13px;
      color: var(--color-accent);
    }
  }

  // 主按钮：渐变 + hover 加深
  .register-btn {
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

  .login-tip {
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
  .register-container {
    padding: 36px 24px 28px;
  }

  .register-container .register-header .title {
    font-size: 22px;
  }
}
</style>
