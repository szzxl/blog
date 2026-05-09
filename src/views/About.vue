<template>
  <div class="about">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-icon">🦋</div>
        <div class="header-text">
          <h1>关于我</h1>
        </div>
      </div>
      
      <!-- 个人介绍 -->
      <div class="about-content card">
        <div class="intro-section">
          <div class="intro-icon">👨‍💻</div>
          <h2 class="intro-title">关于我</h2>
          <div class="intro-text">
            <p>你好！我是一名拥有 <strong>5年经验</strong> 的全栈开发工程师。</p>
            <p>这个博客系统是我独立开发的作品，融合了现代化的技术栈和优雅的设计理念。</p>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="tech-section">
          <h3 class="section-title">💼 技术栈</h3>
          <div class="tech-tags">
            <span class="tech-tag">Vue 3</span>
            <span class="tech-tag">TypeScript</span>
            <span class="tech-tag">Vite</span>
            <span class="tech-tag">Element Plus</span>
            <span class="tech-tag">Pinia</span>
            <span class="tech-tag">Node.js</span>
            <span class="tech-tag">Spring Boot</span>
            <span class="tech-tag">MySQL</span>
            <span class="tech-tag">springboot</span>
            <span class="tech-tag">redis</span>
            <span class="tech-tag">ES</span>
            <span class="tech-tag">docker</span>
            <span class="tech-tag">MQ</span>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="contact-section">
          <h3 class="section-title">📮 联系我</h3>
          <p class="contact-text">
            如果你对这个博客系统感兴趣，或者需要定制开发服务，欢迎联系我！
          </p>
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-icon">📧</span>
              <span class="contact-label">邮箱：</span>
              <span class="contact-value">suz_zxl@126.com</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">💬</span>
              <span class="contact-label">微信：</span>
              <span class="contact-value">Su_zxl</span>
            </div>
          </div>
        </div>
        
        <div class="footer-note">
          <p>✨ 期待与你的合作！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.about {
  min-height: calc(100vh - 200px);
  padding: 32px 0 48px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  border-left: 4px solid var(--color-accent);
  padding-left: 20px;
  margin-bottom: 40px;

  h1 {
    font-family: var(--font-serif);
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin: 0 0 6px 0;
  }

  p {
    font-size: 13px;
    color: var(--text-tertiary);
    margin: 0;
  }
}

.about-content {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 40px;
  box-shadow: var(--shadow-card);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);
  }

  .intro-section {
    text-align: center;
    margin-bottom: 40px;

    .intro-icon {
      font-size: 56px;
      margin-bottom: 16px;
      display: block;
    }

    .intro-title {
      font-family: var(--font-serif);
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 20px 0;
    }

    .intro-text {
      font-size: 15px;
      line-height: 1.8;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto;

      p {
        margin: 12px 0;

        strong {
          color: var(--color-accent);
          font-weight: 600;
        }
      }
    }
  }

  .divider {
    height: 1px;
    background: var(--border-color);
    margin: 32px 0;
  }

  .tech-section,
  .contact-section {
    margin-bottom: 32px;

    .section-title {
      font-family: var(--font-serif);
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .tech-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .tech-tag {
      padding: 6px 14px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-tag);
      color: var(--text-secondary);
      font-size: 13px;
      transition: all 0.15s ease;

      &:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
      }
    }
  }

  .contact-text {
    font-size: 14px;
    line-height: 1.8;
    color: var(--text-secondary);
    margin: 0 0 20px 0;
  }

  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .contact-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-card);
      border-left: 3px solid var(--color-accent);

      .contact-icon { font-size: 18px; }

      .contact-label {
        font-size: 13px;
        color: var(--text-tertiary);
        min-width: 48px;
      }

      .contact-value {
        font-size: 14px;
        color: var(--color-accent);
      }
    }
  }

  .footer-note {
    text-align: center;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);

    p {
      font-size: 14px;
      color: var(--text-tertiary);
      margin: 0;
    }
  }
}
</style>
