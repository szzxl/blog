<template>
  <div class="about">
    <!-- ── Banner ─────────────────────────────────────── -->
    <div class="page-banner">
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <h1 class="banner-title">关于我</h1>
        <p class="banner-sub">认识博主</p>
      </div>
    </div>

    <!-- ── 内容区 ─────────────────────────────────────── -->
    <div class="main-wrap">
      <div class="container">

        <!-- 个人介绍 -->
        <section class="about-card card">
          <div class="intro-section">
            <div class="avatar-wrap">
              <img src="/default-avatar.svg" alt="博主头像" class="avatar-img" />
            </div>
            <div class="intro-text">
              <h2 class="intro-name">博主</h2>
              <p>你好！我是一名拥有 <strong>5年经验</strong> 的全栈开发工程师。</p>
              <p>这个博客系统是我独立开发的作品，融合了现代化的技术栈和优雅的设计理念。</p>
            </div>
          </div>
        </section>

        <!-- 技术栈 -->
        <section class="about-card card">
          <h3 class="card-section-title">
            <span class="title-bar"></span>
            技术栈
          </h3>
          <div class="tech-tags">
            <span class="tech-tag" data-color="blue">Vue 3</span>
            <span class="tech-tag" data-color="blue">TypeScript</span>
            <span class="tech-tag" data-color="purple">Vite</span>
            <span class="tech-tag" data-color="purple">Element Plus</span>
            <span class="tech-tag" data-color="green">Pinia</span>
            <span class="tech-tag" data-color="green">Node.js</span>
            <span class="tech-tag" data-color="orange">Spring Boot</span>
            <span class="tech-tag" data-color="orange">MySQL</span>
            <span class="tech-tag" data-color="orange">springboot</span>
            <span class="tech-tag" data-color="red">redis</span>
            <span class="tech-tag" data-color="red">ES</span>
            <span class="tech-tag" data-color="blue">docker</span>
            <span class="tech-tag" data-color="purple">MQ</span>
          </div>
        </section>

        <!-- 联系方式 -->
        <section class="about-card card">
          <h3 class="card-section-title">
            <span class="title-bar"></span>
            联系我
          </h3>
          <p class="contact-intro">如果你对这个博客系统感兴趣，或者需要定制开发服务，欢迎联系我！</p>
          <div class="contact-list">
            <div class="contact-item" v-if="socialEmail">
              <div class="contact-icon email-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div class="contact-body">
                <span class="contact-label">邮箱</span>
                <a :href="`mailto:${socialEmail}`" class="contact-value">{{ socialEmail }}</a>
              </div>
            </div>
            <div class="contact-item" v-if="socialWechat">
              <div class="contact-icon wechat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div class="contact-body">
                <span class="contact-label">微信</span>
                <span class="contact-value">{{ socialWechat }}</span>
              </div>
            </div>
          </div>

          <div class="footer-note">
            <p>期待与你的合作！</p>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchWebsiteConfigWithCache } from '@/utils/websiteConfig'

const socialEmail = ref('')
const socialWechat = ref('')

onMounted(async () => {
  const config = await fetchWebsiteConfigWithCache()
  if (config.social_email) socialEmail.value = config.social_email
  if (config.social_wechat) socialWechat.value = config.social_wechat
})
</script>

<style scoped lang="scss">
// ── Banner ─────────────────────────────────────────────
.page-banner {
  position: relative;
  height: 200px;
  background: url('/bg-banner.png') center 30% / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .banner-overlay {
    position: absolute;
    inset: 0;
    background: rgba(5, 12, 30, 0.62);
  }

  .banner-content {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 0 24px;

    .banner-title {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 800;
      color: #fff;
      text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
      margin: 0 0 8px 0;
      line-height: 1.3;
    }

    .banner-sub {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.65);
      margin: 0;
      font-family: var(--font-sans);
    }
  }
}

// ── 主内容包装器 ───────────────────────────────────────
.main-wrap {
  padding-top: 48px;
  padding-bottom: 80px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

// ── 通用卡片 ───────────────────────────────────────────
.about-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 36px 40px;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    border-color: var(--border-strong);
  }
}

.card-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 24px 0;
  letter-spacing: -0.01em;

  .title-bar {
    display: block;
    width: 4px;
    height: 18px;
    background: var(--gradient-accent);
    border-radius: 3px;
    flex-shrink: 0;
  }
}

// ── 个人介绍 ───────────────────────────────────────────
.intro-section {
  display: flex;
  align-items: flex-start;
  gap: 28px;

  .avatar-wrap {
    flex-shrink: 0;

    .avatar-img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid var(--border-strong);
      box-shadow: var(--shadow-glow);
      object-fit: cover;
    }
  }

  .intro-text {
    flex: 1;

    .intro-name {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 12px 0;
    }

    p {
      font-size: 15px;
      line-height: 1.85;
      color: var(--text-secondary);
      margin: 8px 0 0 0;
      font-family: var(--font-sans);

      strong {
        color: var(--color-accent);
        font-weight: 700;
      }
    }
  }
}

// ── 技术栈 ─────────────────────────────────────────────
.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .tech-tag {
    padding: 5px 14px;
    border-radius: var(--radius-tag);
    font-size: 13px;
    font-family: var(--font-sans);
    font-weight: 500;
    cursor: default;
    transition: all 0.25s ease;
    border: 1px solid transparent;

    &[data-color="blue"] {
      background: rgba(22, 93, 255, 0.08);
      color: var(--color-accent);
      border-color: rgba(22, 93, 255, 0.2);
      &:hover {
        background: var(--color-accent);
        color: #fff;
        box-shadow: 0 0 12px rgba(22, 93, 255, 0.35);
      }
    }

    &[data-color="purple"] {
      background: rgba(114, 46, 209, 0.08);
      color: var(--color-accent-2);
      border-color: rgba(114, 46, 209, 0.2);
      &:hover {
        background: var(--color-accent-2);
        color: #fff;
        box-shadow: 0 0 12px rgba(114, 46, 209, 0.35);
      }
    }

    &[data-color="green"] {
      background: rgba(0, 180, 42, 0.08);
      color: var(--color-cyan);
      border-color: rgba(0, 180, 42, 0.2);
      &:hover {
        background: var(--color-cyan);
        color: #fff;
        box-shadow: 0 0 12px rgba(0, 180, 42, 0.35);
      }
    }

    &[data-color="orange"] {
      background: rgba(255, 125, 0, 0.08);
      color: var(--color-accent-3);
      border-color: rgba(255, 125, 0, 0.2);
      &:hover {
        background: var(--color-accent-3);
        color: #fff;
        box-shadow: 0 0 12px rgba(255, 125, 0, 0.35);
      }
    }

    &[data-color="red"] {
      background: rgba(245, 63, 63, 0.08);
      color: var(--color-pink);
      border-color: rgba(245, 63, 63, 0.2);
      &:hover {
        background: var(--color-pink);
        color: #fff;
        box-shadow: 0 0 12px rgba(245, 63, 63, 0.35);
      }
    }
  }
}

// ── 联系方式 ───────────────────────────────────────────
.contact-intro {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.85;
  margin: 0 0 20px 0;
  font-family: var(--font-sans);
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  transition: all 0.25s ease;

  &:hover {
    border-color: var(--color-accent);
    box-shadow: var(--shadow-glow);
    transform: translateX(4px);
  }

  .contact-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      width: 18px;
      height: 18px;
    }

    &.email-icon {
      background: rgba(22, 93, 255, 0.1);
      color: var(--color-accent);
    }

    &.wechat-icon {
      background: rgba(0, 180, 42, 0.1);
      color: var(--color-cyan);
    }
  }

  .contact-body {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .contact-label {
      font-size: 11px;
      color: var(--text-tertiary);
      font-family: var(--font-sans);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .contact-value {
      font-size: 15px;
      color: var(--text-primary);
      font-weight: 500;
      font-family: var(--font-sans);
      text-decoration: none;
      transition: color 0.2s;

      &:is(a):hover {
        color: var(--color-accent);
      }
    }
  }
}

.footer-note {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  text-align: center;

  p {
    font-family: var(--font-display);
    font-size: 15px;
    color: var(--text-tertiary);
    margin: 0;
    font-style: italic;
    letter-spacing: 0.02em;
  }
}

// ── 响应式 ────────────────────────────────────────────
@media (max-width: 768px) {
  .page-banner {
    height: 160px;

    .banner-content .banner-title {
      font-size: 1.7rem;
    }
  }

  .main-wrap {
    padding-top: 32px;
    padding-bottom: 60px;
  }

  .container {
    padding: 0 16px;
  }

  .about-card {
    padding: 24px 20px;
  }

  .intro-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }
}
</style>
