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
  margin-top: 48px;

  .container {
    padding-top: 32px;
    padding-bottom: 24px;
  }
}

.footer-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 48px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.footer-brand {
  .brand-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    display: block;
    margin-bottom: 8px;
  }

  .brand-motto {
    font-size: 13px;
    color: var(--text-tertiary);
    margin: 0;
  }
}

.footer-links {
  display: flex;
  gap: 48px;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .group-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }

  a, .contact-item {
    font-size: 13px;
    color: var(--text-secondary);
    transition: color 0.15s ease;

    &:hover {
      color: var(--color-accent);
    }
  }

  .contact-item {
    cursor: default;

    &:hover {
      color: var(--text-secondary);
    }
  }
}

.footer-bottom {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;

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
    gap: 24px;
  }

  .footer-links {
    gap: 24px;
  }

  .footer-bottom {
    gap: 12px;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
