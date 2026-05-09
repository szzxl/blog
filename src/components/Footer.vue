<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-main">
        <div class="footer-brand">
          <span class="brand-name">{{ websiteName }}</span>
          <p class="brand-motto" v-if="websiteMotto">{{ websiteMotto }}</p>
          <div class="social-links">
            <a v-if="socialGithub" :href="socialGithub" target="_blank" class="social-btn">
              <span>GitHub</span>
            </a>
            <a v-if="socialGitee" :href="socialGitee" target="_blank" class="social-btn">
              <span>Gitee</span>
            </a>
            <span v-if="socialEmail" class="social-btn email">{{ socialEmail }}</span>
          </div>
        </div>

        <div class="footer-links">
          <div class="link-group">
            <span class="group-title">导航</span>
            <router-link to="/">首页</router-link>
            <router-link to="/articles">文章</router-link>
            <router-link to="/category">分类</router-link>
            <router-link to="/tag">标签</router-link>
          </div>
          <div class="link-group">
            <span class="group-title">更多</span>
            <router-link to="/talk">说说</router-link>
            <router-link to="/album">相册</router-link>
            <router-link to="/guestbook">留言板</router-link>
            <router-link to="/about">关于</router-link>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-bottom-left">
          <span class="copyright">{{ copyright }}</span>
          <span class="icp" v-if="icpNumber">{{ icpNumber }}</span>
        </div>
        <div class="runtime-wrap">
          <span class="runtime-dot"></span>
          <span class="runtime">{{ runtimeText }}</span>
        </div>
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
  runtimeText.value = `已运行 ${days}天 ${hours}时 ${minutes}分 ${seconds}秒`
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
  } catch { /* 静默失败 */ }
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
  position: relative;
  border-top: 1px solid var(--border-color);
  margin-top: 80px;
  background: var(--bg-card);

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: var(--gradient-accent);
    border-radius: 2px;
  }
}

.footer-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 48px;
  padding: 48px 0 36px;
  border-bottom: 1px solid var(--border-color);
}

.footer-brand {
  max-width: 280px;

  .brand-name {
    font-family: var(--font-serif);
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    display: block;
    margin-bottom: 10px;
    letter-spacing: -0.02em;
  }

  .brand-motto {
    font-size: 13px;
    color: var(--text-tertiary);
    margin: 0 0 20px;
    line-height: 1.75;
    border-left: 2px solid var(--color-accent);
    padding-left: 10px;
    opacity: 0.8;
  }
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: var(--radius-tag);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
    background: transparent;
  }

  &.email { cursor: default; &:hover { color: var(--text-secondary); border-color: var(--border-color); background: var(--bg-secondary); } }
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
    letter-spacing: 0.12em;
    margin-bottom: 4px;
  }

  a {
    font-size: 13px;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.18s;
    &:hover { color: var(--color-accent); }
  }
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px 0 24px;

  .footer-bottom-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  span {
    font-size: 12px;
    color: var(--text-tertiary);
    letter-spacing: 0.02em;
  }

  .icp {
    padding-left: 16px;
    border-left: 1px solid var(--border-color);
  }
}

.runtime-wrap {
  display: flex;
  align-items: center;
  gap: 6px;

  .runtime-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-success);
    box-shadow: 0 0 0 2px rgba(0, 180, 42, 0.2);
    animation: pulse 2s ease-in-out infinite;
    flex-shrink: 0;
  }

  .runtime {
    font-size: 12px;
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
  }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 2px rgba(0, 180, 42, 0.2); }
  50%       { box-shadow: 0 0 0 5px rgba(0, 180, 42, 0.08); }
}

@media (max-width: 768px) {
  .footer { margin-top: 56px; }

  .footer-main {
    flex-direction: column;
    gap: 28px;
    padding: 36px 0 28px;
  }

  .footer-links { gap: 32px; }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 16px 0 20px;
  }
}
</style>
