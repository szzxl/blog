<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import AuthCard from '@/components/AuthCard.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loginFormRef = ref<FormInstance>()
const loginLoading = ref(false)
const loginError = ref('')
const loginForm = ref({ username: '', password: '' })
const redirect = computed(() => {
  const value = route.query.redirect
  return typeof value === 'string' && /^\/(?!\/)/.test(value) && !value.includes(':')
    ? value
    : undefined
})
const rules: FormRules = {
  username: [
    { required: true, whitespace: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度在 6 到 50 个字符', trigger: 'blur' }
  ]
}
const handleLogin = async () => {
  if (!loginFormRef.value || loginLoading.value) return
  loginLoading.value = true
  loginError.value = ''
  try {
    if (!(await loginFormRef.value.validate().catch(() => false))) return
    const credentials = { ...loginForm.value }
    const success = await userStore.login(credentials.username, credentials.password)
    if (success) await router.push(redirect.value || '/')
    else loginError.value = '登录未成功，请检查用户名、密码或稍后重试。'
  } catch {
    loginError.value = '暂时无法完成登录，请稍后重试。'
  } finally {
    loginLoading.value = false
  }
}
</script>

<template>
  <AuthCard title="欢迎回来" description="登录后收藏喜欢的文章，参与评论与留言。">
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="rules"
      :disabled="loginLoading"
      :aria-busy="loginLoading"
      label-position="top"
      size="large"
      @submit.prevent="handleLogin"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          id="login-username"
          v-model="loginForm.username"
          name="username"
          autocomplete="username"
          placeholder="请输入用户名"
          @input="loginError = ''"
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          id="login-password"
          v-model="loginForm.password"
          name="password"
          autocomplete="current-password"
          placeholder="请输入密码"
          type="password"
          show-password
          @input="loginError = ''"
        />
      </el-form-item>
      <div class="auth-help"><router-link to="/guestbook">账号问题？联系博主</router-link></div>
      <p v-if="loginError" class="auth-error" role="alert">{{ loginError }}</p>
      <el-button type="primary" native-type="submit" class="auth-submit" :loading="loginLoading">{{
        loginLoading ? '正在登录…' : '登录'
      }}</el-button>
    </el-form>
    <template #footer
      >还没有账号？<router-link :to="{ path: '/register', query: redirect ? { redirect } : {} }"
        >注册账号</router-link
      ></template
    >
  </AuthCard>
</template>
