<template>
  <footer class="footer">
    <div class="footer-wave">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" fill="rgba(255, 255, 255, 0.95)"></path>
      </svg>
    </div>
    <div class="container">
      <div class="footer-content">
        <div class="footer-info">
          <div class="footer-logo">
            <span class="logo-icon">🌸</span>
            <span class="logo-text">小花的日记本</span>
          </div>
          <p class="motto">🌸 愿你温柔且有力量 🌸</p>
          <p class="copyright">© {{ year }} 记录美好生活的每一天</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>快速导航</h4>
            <router-link to="/">首页</router-link>
            <router-link to="/articles">文章</router-link>
            <router-link to="/about">关于</router-link>
          </div>
          <div class="link-group">
            <h4>联系方式</h4>
            <span class="contact-item">💬 QQ: 123456789</span>
            <span class="contact-item">💚 微信: xiahua2024</span>
            <span class="contact-item">💌 邮箱: hello@example.com</span>
          </div>
        </div>
      </div>
      <div class="footer-decoration">
        <span class="deco">🌸</span>
        <span class="deco">💕</span>
        <span class="deco">✨</span>
        <span class="deco">🦋</span>
        <span class="deco">💗</span>
        <span class="deco">🌸</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped lang="scss">
.footer {
  background: transparent;
  padding: 0;
  margin-top: 100px;
  position: relative;
  
  .footer-wave {
    position: absolute;
    top: -50px;
    left: 0;
    width: 100%;
    height: 60px;
    overflow: hidden;
    
    svg {
      width: 100%;
      height: 100%;
    }
  }
  
  .container {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 60px 30px 30px;
    border-top: 3px solid transparent;
    border-image: linear-gradient(90deg, #ff9a9e, #fecfef, #ffd0d0) 1;
  }
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 50px;
    margin-bottom: 40px;
  }
  
  .footer-info {
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      
      .logo-icon {
        font-size: 35px;
      }
      
      .logo-text {
        font-size: 24px;
        font-weight: 700;
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    
    .motto {
      font-size: 18px;
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    .copyright {
      font-size: 14px;
      color: #999;
    }
  }
  
  .footer-links {
    display: flex;
    gap: 50px;
    
    .link-group {
      h4 {
        font-size: 16px;
        color: #ff9a9e;
        margin-bottom: 15px;
        font-weight: 700;
      }
      
      a {
        display: block;
        color: #888;
        font-size: 14px;
        margin-bottom: 10px;
        transition: all 0.3s;
        
        &:hover {
          color: #ff9a9e;
          transform: translateX(5px);
        }
      }
      
      .contact-item {
        display: block;
        color: #888;
        font-size: 14px;
        margin-bottom: 10px;
        cursor: default;
      }
    }
  }
  
  .footer-decoration {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    gap: 30px;
    padding-top: 30px;
    border-top: 2px solid rgba(255, 182, 193, 0.2);
    
    .deco {
      font-size: 24px;
      opacity: 0.6;
      animation: float 3s ease-in-out infinite;
      
      &:nth-child(1) {
        animation-delay: 0s;
      }
      
      &:nth-child(2) {
        animation-delay: 0.5s;
      }
      
      &:nth-child(3) {
        animation-delay: 1s;
      }
      
      &:nth-child(4) {
        animation-delay: 1.5s;
      }
      
      &:nth-child(5) {
        animation-delay: 2s;
      }
      
      &:nth-child(6) {
        animation-delay: 2.5s;
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(10deg);
  }
}

@media (max-width: 768px) {
  .footer {
    .footer-content {
      grid-template-columns: 1fr;
      gap: 30px;
      text-align: center;
    }
    
    .footer-links {
      justify-content: center;
      gap: 30px;
    }
    
    .footer-decoration {
      gap: 15px;
      
      .deco {
        font-size: 18px;
      }
    }
  }
}
</style>
