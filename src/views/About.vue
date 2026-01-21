<template>
  <div class="about">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-icon">🦋</div>
        <div class="header-text">
          <h1>关于我</h1>
          <p>Hi~ 很高兴认识你</p>
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
              <span class="contact-value">suzzxl_123</span>
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
  padding: 40px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 30px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  
  .header-icon {
    font-size: 60px;
    animation: flutter 3s ease-in-out infinite;
  }
  
  .header-text {
    h1 {
      font-size: 42px;
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 8px 0;
      font-weight: 700;
    }
    
    p {
      font-size: 16px;
      color: #999;
      margin: 0;
    }
  }
}

.about-content {
  padding: 50px;
  
  .intro-section {
    text-align: center;
    margin-bottom: 40px;
    
    .intro-icon {
      font-size: 80px;
      margin-bottom: 20px;
      animation: float 3s ease-in-out infinite;
    }
    
    .intro-title {
      font-size: 32px;
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 30px 0;
      font-weight: 700;
    }
    
    .intro-text {
      font-size: 16px;
      line-height: 1.8;
      color: #666;
      max-width: 600px;
      margin: 0 auto;
      
      p {
        margin: 15px 0;
        
        strong {
          color: #8b5cf6;
          font-weight: 700;
        }
      }
    }
  }
  
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.2), transparent);
    margin: 40px 0;
  }
  
  .tech-section,
  .contact-section {
    margin-bottom: 40px;
    
    .section-title {
      font-size: 24px;
      color: #333;
      margin: 0 0 25px 0;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
  
  .tech-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    
    .tech-tag {
      padding: 10px 20px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
      border: 2px solid rgba(139, 92, 246, 0.3);
      border-radius: 20px;
      color: #8b5cf6;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s;
      
      &:hover {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%);
        border-color: #8b5cf6;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
      }
    }
  }
  
  .contact-text {
    font-size: 16px;
    line-height: 1.8;
    color: #666;
    margin: 0 0 25px 0;
  }
  
  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 20px;
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px 20px;
      background: rgba(139, 92, 246, 0.05);
      border-radius: 12px;
      border-left: 4px solid #8b5cf6;
      
      .contact-icon {
        font-size: 24px;
      }
      
      .contact-label {
        font-weight: 600;
        color: #666;
        min-width: 60px;
      }
      
      .contact-value {
        color: #8b5cf6;
        font-weight: 500;
      }
    }
  }
  
  .footer-note {
    text-align: center;
    margin-top: 40px;
    padding-top: 30px;
    border-top: 1px dashed rgba(139, 92, 246, 0.2);
    
    p {
      font-size: 18px;
      color: #8b5cf6;
      margin: 0;
      font-weight: 600;
    }
  }
}

@keyframes flutter {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(-5deg);
  }
  75% {
    transform: translateY(-5px) rotate(5deg);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
    
    .header-icon {
      font-size: 50px;
    }
    
    .header-text h1 {
      font-size: 32px;
    }
  }
  
  .about-content {
    padding: 30px 20px;
    
    .intro-section {
      .intro-icon {
        font-size: 60px;
      }
      
      .intro-title {
        font-size: 26px;
      }
      
      .intro-text {
        font-size: 15px;
      }
    }
    
    .tech-section,
    .contact-section {
      .section-title {
        font-size: 20px;
      }
    }
    
    .tech-tags {
      gap: 10px;
      
      .tech-tag {
        padding: 8px 16px;
        font-size: 13px;
      }
    }
    
    .contact-info {
      .contact-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 12px 15px;
        
        .contact-label {
          min-width: auto;
        }
      }
    }
    
    .footer-note p {
      font-size: 16px;
    }
  }
}
</style>
