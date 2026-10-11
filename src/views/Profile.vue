<template>
  <main class="profile">
    <div class="profile-layout">
      <aside class="account-card">
        <span class="eyebrow">我的账号</span>
        <img :src="userStore.user?.avatar || '/default-avatar.svg'" alt="当前头像" class="avatar" />
        <h1>{{ userStore.user?.nickname || userStore.user?.username }}</h1>
        <p>{{ userStore.user?.username }}</p>
        <label class="avatar-upload">{{ avatarLoading ? '正在更新头像…' : '更换头像' }}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" :disabled="busy" @change="uploadAvatar" /></label>
        <router-link to="/favorites" class="favorites-link">我的收藏 →</router-link>
      </aside>
      <div class="settings">
        <section class="settings-card">
          <div class="section-heading"><span>01</span><div><h2>个人资料</h2><p>在评论中使用你的昵称与头像。</p></div></div>
          <el-form ref="profileForm" :model="profile" :rules="profileRules" label-position="top" :disabled="busy">
            <el-form-item label="昵称" prop="nickname"><el-input v-model="profile.nickname" maxlength="30" show-word-limit autocomplete="nickname" /></el-form-item>
            <div class="field-row">
              <el-form-item label="邮箱" prop="email"><el-input v-model="profile.email" type="email" autocomplete="email" /></el-form-item>
              <el-form-item label="手机" prop="mobile"><el-input v-model="profile.mobile" autocomplete="tel" /></el-form-item>
            </div>
            <el-button type="primary" :loading="profileLoading" :disabled="busy && !profileLoading" @click="saveProfile">保存资料</el-button>
          </el-form>
        </section>
        <section class="settings-card">
          <div class="section-heading"><span>02</span><div><h2>修改密码</h2><p>修改成功后，请使用新密码重新登录。</p></div></div>
          <el-form ref="passwordForm" :model="password" :rules="passwordRules" label-position="top" :disabled="busy">
            <el-form-item label="当前密码" prop="oldPassword"><el-input v-model="password.oldPassword" type="password" show-password autocomplete="current-password" /></el-form-item>
            <div class="field-row">
              <el-form-item label="新密码" prop="newPassword"><el-input v-model="password.newPassword" type="password" show-password autocomplete="new-password" @input="revalidatePassword" /></el-form-item>
              <el-form-item label="确认新密码" prop="confirmPassword"><el-input v-model="password.confirmPassword" type="password" show-password autocomplete="new-password" @keyup.enter="savePassword" /></el-form-item>
            </div>
            <el-button :loading="passwordLoading" :disabled="busy && !passwordLoading" @click="savePassword">更新密码</el-button>
          </el-form>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus/es/components/message/index'
import { updatePassword, updateUserProfile, uploadImage } from '@/api/article'
import { useUserStore } from '@/stores/user'
import { showRequestError } from '@/utils/requestError'

const userStore = useUserStore()
const router = useRouter()
const profileForm = ref<FormInstance>()
const passwordForm = ref<FormInstance>()
const profileLoading = ref(false)
const passwordLoading = ref(false)
const avatarLoading = ref(false)
const busy = computed(() => profileLoading.value || passwordLoading.value || avatarLoading.value)
let disposed = false
const currentSession = (token: string) => !disposed && userStore.token === token && userStore.isLoggedIn
const profile = ref({ nickname: userStore.user?.nickname || userStore.user?.username || '', email: userStore.user?.email || '', mobile: userStore.user?.mobile || '' })
const password = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const profileRules: FormRules = {
  nickname: [{ required: true, whitespace: true, min: 1, max: 30, message: '请输入 1 到 30 个字符的昵称', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }],
  mobile: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }]
}
const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [{ required: true, min: 6, max: 50, message: '密码长度为 6 到 50 个字符', trigger: 'blur' }],
  confirmPassword: [{ validator: (_rule, value, callback) => { callback(value && value === password.value.newPassword ? undefined : new Error('两次输入的密码不一致')) }, trigger: ['blur', 'change'] }]
}
const revalidatePassword = () => { if (password.value.confirmPassword) void passwordForm.value?.validateField('confirmPassword').catch(() => {}) }
const saveProfile = async () => {
  if (busy.value || !profileForm.value) return
  const token = userStore.token
  profileLoading.value = true
  try {
    if (!(await profileForm.value.validate().catch(() => false)) || !currentSession(token)) return
    await updateUserProfile({ ...profile.value, nickname: profile.value.nickname.trim() })
    if (!currentSession(token)) return
    await userStore.fetchUserInfo()
    if (currentSession(token)) ElMessage.success('资料已更新')
  } catch (error) { if (currentSession(token)) showRequestError(error, '资料保存失败，请重试') }
  finally { profileLoading.value = false }
}
const savePassword = async () => {
  if (busy.value || !passwordForm.value) return
  const token = userStore.token
  passwordLoading.value = true
  try {
    if (!(await passwordForm.value.validate().catch(() => false)) || !currentSession(token)) return
    await updatePassword({ oldPassword: password.value.oldPassword, newPassword: password.value.newPassword })
    if (!currentSession(token)) return
    password.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    ElMessage.success('密码已更新，请重新登录')
    await userStore.logout()
    if (!disposed && !userStore.isLoggedIn) await router.push('/login')
  } catch (error) { if (currentSession(token)) showRequestError(error, '密码修改失败，请重试') }
  finally { passwordLoading.value = false }
}
const uploadAvatar = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || busy.value) return
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) { ElMessage.warning('请选择不超过 5MB 的 JPG、PNG、WebP 或 GIF 图片'); return }
  const token = userStore.token
  avatarLoading.value = true
  try {
    const response: unknown = await uploadImage(file)
    if (!currentSession(token)) return
    const data = response as { url?: string; path?: string }
    const url = typeof response === 'string' ? response : data?.url || data?.path
    if (!url || !/^(https?:\/\/|\/)[^\s]+$/i.test(url)) throw new Error('上传响应缺少有效图片地址')
    await updateUserProfile({ avatar: url })
    if (!currentSession(token)) return
    await userStore.fetchUserInfo()
    if (currentSession(token)) ElMessage.success('头像已更新')
  } catch (error) { if (currentSession(token)) showRequestError(error, '头像上传失败，请重试') }
  finally { avatarLoading.value = false }
}
onUnmounted(() => { disposed = true; password.value = { oldPassword: '', newPassword: '', confirmPassword: '' } })
</script>

<style scoped lang="scss">
.profile { padding: 56px 24px 80px; min-height: calc(100vh - 200px); }
.profile-layout { max-width: 1000px; margin: auto; display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 32px; align-items: start; }
.account-card, .settings-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-card); }
.account-card { padding: 32px 24px; text-align: center; }
.eyebrow { display: block; font-size: 12px; color: var(--text-tertiary); letter-spacing: .15em; margin-bottom: 28px; }
.avatar { display: block; width: 96px; height: 96px; border-radius: 50%; object-fit: cover; margin: auto; border: 3px solid var(--border-color); }
h1 { font-family: var(--font-serif); font-size: 24px; margin: 20px 0 8px; overflow-wrap: anywhere; }
.account-card p { color: var(--text-tertiary); font-size: 13px; }
.avatar-upload { display: inline-block; cursor: pointer; color: var(--color-accent); font-size: 13px; padding: 12px; }
.avatar-upload input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.favorites-link { display: block; border-top: 1px solid var(--border-color); margin-top: 24px; padding-top: 20px; color: var(--text-primary); font-size: 14px; }
.settings { display: grid; gap: 24px; }
.settings-card { padding: 28px 32px; }
.section-heading { display: flex; gap: 16px; margin-bottom: 24px; }
.section-heading > span { font-family: var(--font-serif); font-size: 26px; color: var(--color-accent); }
h2 { font-family: var(--font-serif); font-size: 20px; margin: 0 0 8px; }
.section-heading p { color: var(--text-tertiary); font-size: 13px; margin: 0; line-height: 1.6; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 768px) { .profile { padding: 24px 16px 40px; } .profile-layout { grid-template-columns: 1fr; gap: 20px; } .settings-card { padding: 24px 20px; } .field-row { grid-template-columns: 1fr; gap: 0; } }
</style>
