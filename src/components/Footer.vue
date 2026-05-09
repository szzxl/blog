<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-main">
        <div class="footer-brand">
          <span class="brand-name">{{ websiteName }}</span>
          <p class="brand-motto" v-if="websiteMotto">{{ websiteMotto }}</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <span class="group-title">导航</span>
            <router-link to="/">首页</router-link>
            <router-link to="/articles">文章</router-link>
            <router-link to="/about">关于</router-link>
          </div>
          <div class="link-group" v-if="socialEmail || socialGitee || socialGithub">
            <span class="group-title">联系</span>
            <span v-if="socialEmail" class="contact-item">{{ socialEmail }}</span>
            <a v-if="socialGitee" :href="socialGitee" target="_blank">Gitee</a>
            <a v-if="socialGithub" :href="socialGithub" target="_blank">GitHub</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span class="copyright">{{ copyright }}</span>
        <span class="runtime">{{ runtimeText }}</span>
        <span class="icp" v-if="icpNumber">{{ icpNumber }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { fetchWebsiteConfigWithCache } from '@/utils/websiteConfig'

const year = new Date().getFullYear()
const websiteName = ref('博客')
const websiteMotto = ref('')
const copyright = ref(`© ${year}`)
const icpNumber = ref('')
const socialEmail = ref('')
const socialGitee = ref('')
const socialGithub = ref('')
const runtimeText = ref('')

const startTime = new Date('2026-01-01 00:00:00').getTime()

const calculateRuntime = () => {
  const diff = Date.now() - startTime
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  runtimeText.value = `已运行 ${days}d ${hours}h ${minutes}m ${seconds}s`
}

let timer: number | null = null

const fetchWebsiteConfig = async () => {
  try {
    const config = await fetchWebsiteConfigWithCache()
    if (config.site_name) websiteName.value = config.site_name
    if (config.copyright) copyright.value = config.copyright
    if (config.icp_number) icpNumber.value = config.icp_number
    if (config.website_motto) websiteMotto.value = config.website_motto
    if (config.social_email) socialEmail.value = config.social_email
    if (config.social_gitee) socialGitee.value = config.social_gitee
    if (config.social_github) socialGithub.value = config.social_github
  } catch {
    // 静默失败
  }
}

onMounted(() => {
  fetchWebsiteConfig()
  calculateRuntime()
  timer = window.setInterval(calculateRuntime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped lang="scss">
.footer {
  border-top: 1px solid var(--border-color);
  margin-top: 64px;
  background: var(--bg-card);
}

.footer-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 48px;
  padding: 48px 0 32px;
  border-bottom: 1px solid var(--border-color);
}

.footer-brand {
  max-width: 280px;

  .brand-name {
    font-family: var(--font-serif);
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    display: block;
    margin-bottom: 10px;
    letter-spacing: -0.01em;
  }

  .brand-motto {
    font-size: 13px;
    color: var(--text-tertiary);
    margin: 0;
    line-height: 1.6;
  }
}

.footer-links {
  display: flex;
  gap: 56px;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .group-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 2px;
  }

  a, .contact-item {
    font-size: 13px;
    color: var(--text-secondary);
    transition: color 0.15s ease;

    &:hover { color: var(--color-accent); }
  }

  .contact-item {
    cursor: default;
    &:hover { color: var(--text-secondary); }
  }
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px 0;

  span {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .runtime {
    font-variant-numeric: tabular-nums;
  }
}

@media (max-width: 768px) {
  .footer-main {
    flex-direction: column;
    gap: 28px;
    padding: 32px 0 24px;
  }

  .footer-links {
    gap: 28px;
    flex-wrap: wrap;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>

