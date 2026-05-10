<template>
  <footer class="footer">
    <div class="container">

      <!-- 三栏主体 -->
      <div class="footer-main">

        <!-- 左：品牌 -->
        <div class="footer-col footer-brand">
          <span class="brand-name">{{ websiteName }}</span>
          <p class="brand-motto" v-if="websiteMotto">{{ websiteMotto }}</p>
          <p class="brand-motto" v-else>用文字记录技术与生活</p>
          <!-- 社交图标横排 -->
          <div class="social-row">
            <a v-if="socialGithub" :href="socialGithub" target="_blank" class="social-icon-btn github" title="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a v-if="socialGitee" :href="socialGitee" target="_blank" class="social-icon-btn gitee" title="Gitee">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.984 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 01-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 00-.592-.593h-4.15a.592.592 0 01-.592-.592v-1.482a.593.593 0 01.593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 01-4 4H5.926a.593.593 0 01-.593-.593V9.778a4.444 4.444 0 014.445-4.444h8.296z"/></svg>
            </a>
            <a v-if="socialEmail" :href="`mailto:${socialEmail}`" class="social-icon-btn email" title="发送邮件">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </a>
          </div>
        </div>

        <!-- 中：导航 -->
        <div class="footer-col">
          <span class="col-title">导航</span>
          <nav class="footer-nav">
            <router-link to="/">首页</router-link>
            <router-link to="/articles">文章</router-link>
            <router-link to="/category">分类</router-link>
            <router-link to="/tag">标签</router-link>
            <router-link to="/talk">说说</router-link>
            <router-link to="/album">相册</router-link>
            <router-link to="/guestbook">留言板</router-link>
          </nav>
        </div>

        <!-- 右：联系 -->
        <div class="footer-col">
          <span class="col-title">联系</span>
          <div class="contact-list">
            <a v-if="socialGithub" :href="socialGithub" target="_blank" class="contact-item">
              <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              <span>GitHub</span>
            </a>
            <a v-if="socialGitee" :href="socialGitee" target="_blank" class="contact-item">
              <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M11.984 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 01-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 00-.592-.593h-4.15a.592.592 0 01-.592-.592v-1.482a.593.593 0 01.593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 01-4 4H5.926a.593.593 0 01-.593-.593V9.778a4.444 4.444 0 014.445-4.444h8.296z"/></svg>
              <span>Gitee</span>
            </a>
            <a v-if="socialEmail" :href="`mailto:${socialEmail}`" class="contact-item">
              <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              <span>{{ socialEmail }}</span>
            </a>
          </div>
        </div>

      </div>

      <!-- 底部栏：居中 -->
      <div class="footer-bottom">
        <span class="copyright">{{ copyright }}</span>
        <span class="divider">·</span>
        <span class="icp" v-if="icpNumber">{{ icpNumber }}</span>
        <span v-if="icpNumber" class="divider">·</span>
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
    if (config.site_name) websiteName.value = config.site_name.replace(/系统$/u, '')
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
  margin-top: 80px;
  background-image: url('/bg-banner.png');
  background-size: cover;
  background-position: center 80%;
  color: rgba(255,255,255,0.75);

  /* 深色遮罩，让文字清晰 */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(5, 12, 30, 0.72);
    pointer-events: none;
    z-index: 0;
  }

  .container {
    position: relative;
    z-index: 1;
  }

  /* 波浪顶部分隔 */
  &::before {
    content: '';
    position: absolute;
    top: -48px; left: 0; right: 0;
    height: 50px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 50' preserveAspectRatio='none'%3E%3Cpath fill='%23050c1e' d='M0,30 C360,55 1080,5 1440,30 L1440,50 L0,50 Z'/%3E%3C/svg%3E") no-repeat bottom center / 100% 100%;
    pointer-events: none;
    z-index: 1;
  }
}

/* 三栏主体 */
.footer-main {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 48px;
  padding: 52px 0 40px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 左栏：品牌 */
.footer-brand {
  .brand-name {
    font-family: var(--font-serif);
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    display: block;
    margin-bottom: 10px;
    letter-spacing: -0.02em;
  }

  .brand-motto {
    font-size: 13px;
    color: rgba(255,255,255,0.5);
    margin: 0 0 22px;
    line-height: 1.75;
    padding-left: 10px;
    border-left: 2px solid rgba(100,180,255,0.5);
  }
}

/* 社交图标横排 */
.social-row {
  display: flex;
  gap: 10px;
}

.social-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.15);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s, background 0.2s;
  text-decoration: none;

  svg { width: 18px; height: 18px; }

  &:hover { transform: translateY(-3px); }

  &.github {
    background: rgba(255,255,255,0.08);
    color: #e6edf3;
    &:hover { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.3); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
  }
  &.gitee {
    background: rgba(198,32,38,0.2);
    color: #ff9a9a;
    border-color: rgba(198,32,38,0.3);
    &:hover { background: rgba(198,32,38,0.35); border-color: rgba(198,32,38,0.6); box-shadow: 0 6px 20px rgba(198,32,38,0.25); }
  }
  &.email {
    background: rgba(22,93,255,0.18);
    color: #7eb8ff;
    border-color: rgba(22,93,255,0.3);
    &:hover { background: rgba(22,93,255,0.32); border-color: rgba(22,93,255,0.6); box-shadow: 0 6px 20px rgba(22,93,255,0.25); }
  }
}

/* 中栏标题 */
.col-title {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  margin-bottom: 16px;
  display: block;
}

/* 导航网格 */
.footer-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;

  a {
    font-size: 13px;
    color: rgba(255,255,255,0.6);
    text-decoration: none;
    transition: color 0.18s, transform 0.18s;
    display: block;

    &:hover { color: #7eb8ff; transform: translateX(3px); }
  }
}

/* 右栏：联系列表 */
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  transition: color 0.18s;

  .contact-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    opacity: 0.6;
  }

  &:hover { color: #7eb8ff; .contact-icon { opacity: 1; } }
}

/* 底部栏 - 居中 */
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 14px;
  padding: 20px 0 28px;
  border-top: 1px solid rgba(255,255,255,0.08);

  span, .runtime {
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.02em;
  }

  .divider {
    color: rgba(255,255,255,0.2);
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
    background: #00d084;
    box-shadow: 0 0 0 2px rgba(0,208,132,0.25);
    animation: pulse 2s ease-in-out infinite;
    flex-shrink: 0;
  }

  .runtime {
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    font-variant-numeric: tabular-nums;
  }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 2px rgba(0,208,132,0.2); }
  50%       { box-shadow: 0 0 0 5px rgba(0,208,132,0.08); }
}

@media (max-width: 768px) {
  .footer { margin-top: 56px; }
  .footer-main { grid-template-columns: 1fr 1fr; gap: 32px; padding: 36px 0 28px; }
  .footer-brand { grid-column: 1 / -1; }
  .footer-bottom { gap: 6px 10px; padding: 16px 0 22px; }
}

@media (max-width: 480px) {
  .footer-main { grid-template-columns: 1fr; }
}
</style>
