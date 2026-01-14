<template>
  <div class="register-page">
    <div class="register-container card">
      <button class="close-btn" @click="goBack">×</button>
      
      <div class="register-header">
        <div class="logo">🌸</div>
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
        
        ElMessage.success('注册成功！请登录 🌸')
        
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
}

.register-container {
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
  
  .register-header {
    text-align: center;
    margin-bottom: 25px;
    
    .logo {
      font-size: 60px;
      animation: bounce 2s ease-in-out infinite;
      filter: drop-shadow(0 5px 15px rgba(255, 154, 158, 0.3));
    }
  }
  
  .el-form {
    .el-form-item {
      margin-bottom: 18px;
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
    
    .agreement {
      width: 100%;
      
      .el-checkbox {
        :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          border-color: #ff9a9e;
        }
        
        :deep(.el-checkbox__label) {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
        }
      }
      
      .el-link {
        font-size: 14px;
        color: #ff9a9e;
        
        &:hover {
          color: #ff7a7e;
        }
      }
    }
    
    .register-btn {
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
    
    .login-tip {
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
  .register-container {
    padding: 40px 30px 35px;
    
    .register-header {
      .logo {
        font-size: 60px;
      }
      
      .title {
        font-size: 28px;
      }
    }
  }
}
</style>
