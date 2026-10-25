<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus/es/components/message/index'
import type { FormInstance, FormRules } from 'element-plus'
import AuthCard from '@/components/AuthCard.vue'
import { register } from '@/api/auth'
import { showRequestError } from '@/utils/requestError'

const router = useRouter()
const route = useRoute()
const registerFormRef = ref<FormInstance>()
const registerLoading = ref(false)
const registerError = ref('')
const registerForm = ref({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})
const redirectQuery = computed(() => {
  const value = route.query.redirect
  return typeof value === 'string' && /^\/(?!\/)/.test(value) && !value.includes(':')
    ? { redirect: value }
    : {}
})
const rules: FormRules = {
  username: [
    { required: true, whitespace: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, whitespace: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度在 6 到 50 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    {
      required: true,
      validator: (_rule, value, callback) => {
        if (!value) callback(new Error('请再次输入密码'))
        else if (value !== registerForm.value.password) callback(new Error('两次输入密码不一致'))
        else callback()
      },
      trigger: 'blur'
    }
  ],
  agreeTerms: [
    {
      validator: (_rule, value, callback) =>
        callback(value === true ? undefined : new Error('请先阅读并同意用户协议和隐私政策')),
      trigger: 'change'
    }
  ]
}
watch(
  () => registerForm.value.password,
  () => {
    if (registerForm.value.confirmPassword)
      registerFormRef.value?.validateField('confirmPassword').catch(() => {})
  }
)
const handleRegister = async () => {
  if (!registerFormRef.value || registerLoading.value) return
  registerLoading.value = true
  registerError.value = ''
  try {
    if (!(await registerFormRef.value.validate().catch(() => false))) return
    const { username, nickname, password } = registerForm.value
    await register({ username, nickname, password })
    ElMessage.success('注册成功！请登录')
    await router.push({ path: '/login', query: redirectQuery.value })
  } catch (error) {
    registerError.value = '注册未成功，已填写的内容已保留，请稍后重试。'
    showRequestError(error, '注册失败，请重试')
  } finally {
    registerLoading.value = false
  }
}
</script>

<template>
  <AuthCard title="注册账号" description="给自己一个名字，一起记录与交流。">
    <el-form
      ref="registerFormRef"
      :model="registerForm"
      :rules="rules"
      :disabled="registerLoading"
      :aria-busy="registerLoading"
      label-position="top"
      size="large"
      @submit.prevent="handleRegister"
    >
      <el-form-item label="用户名" prop="username"
        ><el-input
          id="register-username"
          v-model="registerForm.username"
          name="username"
          autocomplete="username"
          placeholder="3–20 个字符，用于登录"
          @input="registerError = ''"
      /></el-form-item>
      <el-form-item label="昵称" prop="nickname"
        ><el-input
          id="register-nickname"
          v-model="registerForm.nickname"
          name="nickname"
          autocomplete="nickname"
          placeholder="2–20 个字符，显示在评论和留言中"
          @input="registerError = ''"
      /></el-form-item>
      <el-form-item label="密码" prop="password"
        ><el-input
          id="register-password"
          v-model="registerForm.password"
          name="password"
          autocomplete="new-password"
          type="password"
          show-password
          placeholder="6–50 个字符"
          @input="registerError = ''"
      /></el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword"
        ><el-input
          id="register-confirm-password"
          v-model="registerForm.confirmPassword"
          name="confirm-password"
          autocomplete="new-password"
          type="password"
          show-password
          placeholder="请再次输入密码"
          @input="registerError = ''"
      /></el-form-item>
      <el-form-item prop="agreeTerms" class="auth-agreement">
        <el-checkbox v-model="registerForm.agreeTerms"
          >我已阅读并同意用户协议和隐私政策</el-checkbox
        >
        <p class="auth-policies">
          <router-link to="/terms" target="_blank" rel="noopener">查看用户协议</router-link
          ><span> · </span
          ><router-link to="/privacy" target="_blank" rel="noopener">查看隐私政策</router-link>
        </p>
      </el-form-item>
      <p v-if="registerError" class="auth-error" role="alert">{{ registerError }}</p>
      <el-button
        type="primary"
        native-type="submit"
        class="auth-submit"
        :loading="registerLoading"
        >{{ registerLoading ? '正在注册…' : '注册' }}</el-button
      >
    </el-form>
    <template #footer
      >已有账号？<router-link :to="{ path: '/login', query: redirectQuery }"
        >立即登录</router-link
      ></template
    >
  </AuthCard>
</template>
