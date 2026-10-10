<template>
  <div class="profile">
    <div class="container">
      <section class="intro-card card">
        <img class="intro-avatar" :src="userStore.user?.avatar || '/default-avatar.svg'" alt="头像" />
        <h1>{{ userStore.user?.nickname || userStore.user?.username || '个人中心' }}</h1>
        <dl class="account-info">
          <div><dt>用户名</dt><dd>{{ userStore.user?.username || '—' }}</dd></div>
          <div><dt>邮箱</dt><dd>{{ userStore.user?.email || '未设置' }}</dd></div>
        </dl>
        <router-link class="favorites-link" to="/favorites">查看我的收藏 →</router-link>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<style scoped lang="scss">
.profile {
  min-height: calc(100vh - 200px);
  padding: 48px 0 64px;
}
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}
.intro-card {
  padding: 48px 40px;
  text-align: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}
.intro-avatar {
  width: 104px;
  height: 104px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-strong);
}
h1 {
  margin: 24px 0;
  font-family: var(--font-serif);
  font-size: 24px;
  color: var(--text-primary);
}
.account-info {
  margin: 24px auto;
  max-width: 400px;
  text-align: left;
  div {
    display: grid;
    grid-template-columns: 80px minmax(0, 1fr);
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-color);
  }
  dt { color: var(--text-tertiary); }
  dd {
    margin: 0;
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }
}
.favorites-link {
  display: inline-block;
  margin-top: 16px;
  color: var(--text-primary);
}
@media (max-width: 768px) {
  .profile { padding: 24px 0 40px; }
  .container { padding: 0 16px; }
  .intro-card { padding: 32px 20px; }
}
</style>
