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
            <span class="logo-icon">💻</span>
            <span class="logo-text">{{ websiteName }}</span>
          </div>
          <p class="motto" v-if="websiteMotto">✨ {{ websiteMotto }} ✨</p>
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
            <span class="contact-item" v-if="socialQQ">💬 QQ: {{ socialQQ }}</span>
            <span class="contact-item" v-if="socialWechat">📱 微信: {{ socialWechat }}</span>
            <span class="contact-item" v-if="socialEmail">📧 邮箱: {{ socialEmail }}</span>
            <a v-if="socialGithub" :href="socialGithub" target="_blank" class="contact-link">
              🔗 GitHub
            </a>
          </div>
        </div>
      </div>
      <div class="footer-decoration">
        <span class="deco">💻</span>  
        <span class="deco">⌨️</span>
        <span class="deco">🖱️</span>
        <span class="deco">🖥️</span>
        <span class="deco">💾</span>
        <span class="deco">🔧</span>
      </div>
      
      <!-- 底部版权和备案 -->
      <div class="footer-bottom">
        <p class="copyright">{{ copyright }}</p>
        <p class="icp" v-if="icpNumber">{{ icpNumber }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchWebsiteConfigWithCache } from '@/utils/websiteConfig'

const year = new Date().getFullYear()

const websiteName = ref('小花的日记本')
const websiteMotto = ref('愿你温柔且有力量')
const copyright = ref(`© ${year} 记录美好生活的每一天`)
const icpNumber = ref('')
const socialQQ = ref('')
const socialWechat = ref('')
const socialEmail = ref('')
const socialGithub = ref('')

// 获取网站配置
const fetchWebsiteConfig = async () => {
  try {
    const config = await fetchWebsiteConfigWithCache()
    
    if (config.site_name) websiteName.value = config.site_name
    if (config.copyright) copyright.value = config.copyright
    if (config.icp_number) icpNumber.value = config.icp_number
    if (config.website_motto) websiteMotto.value = config.website_motto
    if (config.social_qq) socialQQ.value = config.social_qq
    if (config.social_wechat) socialWechat.value = config.social_wechat
    if (config.social_email) socialEmail.value = config.social_email
    if (config.social_github) socialGithub.value = config.social_github
  } catch (error) {
    // 获取网站配置失败
  }
}

onMounted(() => {
  fetchWebsiteConfig()
})
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
    border-image: linear-gradient(90deg, #8b5cf6, #6366f1, #ffd0d0) 1;
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
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    
    .motto {
      font-size: 18px;
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
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
  
  .footer-bottom {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 40px;
    padding: 20px 30px;
    border-top: 1px solid rgba(139, 92, 246, 0.15);
    position: relative;
    
    .copyright {
      font-size: 13px;
      color: #aaa;
      margin: 0;
      position: absolute;
      left: 30px;
    }
    
    .icp {
      font-size: 13px;
      color: #aaa;
      margin: 0;
    }
  }
  
  .footer-links {
    display: flex;
    gap: 50px;
    
    .link-group {
      h4 {
        font-size: 16px;
        color: #8b5cf6;
        margin-bottom: 15px;
        font-weight: 700;
      }
      
      a {
        display: block;
        color: #888;
        font-size: 14px;
        margin-bottom: 10px;
        transition: all 0.3s;
        text-decoration: none;
        
        &:hover {
          color: #8b5cf6;
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
      
      .contact-link {
        display: block;
        color: #888;
        font-size: 14px;
        margin-bottom: 10px;
        transition: all 0.3s;
        text-decoration: none;
        
        &:hover {
          color: #8b5cf6;
          transform: translateX(5px);
        }
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
    border-top: 2px solid rgba(139, 92, 246, 0.2);
    
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
    margin-top: 60px;
    
    .footer-wave {
      top: -30px;
      height: 40px;
    }
    
    .container {
      padding: 40px 20px 20px;
    }
    
    .footer-content {
      grid-template-columns: 1fr;
      gap: 30px;
      text-align: center;
      margin-bottom: 30px;
    }
    
    .footer-info {
      .footer-logo {
        justify-content: center;
        
        .logo-icon {
          font-size: 28px;
        }
        
        .logo-text {
          font-size: 20px;
        }
      }
      
      .motto {
        font-size: 15px;
      }
    }
    
    .footer-links {
      flex-direction: column;
      gap: 25px;
      align-items: center;
      
      .link-group {
        width: 100%;
        max-width: 300px;
        
        h4 {
          font-size: 15px;
          margin-bottom: 12px;
        }
        
        a, .contact-item, .contact-link {
          font-size: 13px;
          margin-bottom: 8px;
        }
      }
    }
    
    .footer-decoration {
      gap: 15px;
      padding-top: 25px;
      margin-bottom: 25px;
      
      .deco {
        font-size: 20px;
      }
    }
    
    .footer-bottom {
      flex-direction: column;
      gap: 8px;
      text-align: center;
      padding: 20px 15px;
      border-top: 1px solid rgba(139, 92, 246, 0.15);
      
      .copyright {
        position: static;
        font-size: 12px;
        line-height: 1.6;
      }
      
      .icp {
        font-size: 12px;
        line-height: 1.6;
      }
    }
  }
}
</style>
