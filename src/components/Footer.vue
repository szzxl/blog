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
        <div class="footer-links-inline">
          <div class="link-section">
            <span class="section-title">快速导航：</span>
            <router-link to="/">首页</router-link>
            <router-link to="/articles">文章</router-link>
            <router-link to="/about">关于</router-link>
          </div>
          <div class="link-section">
            <span class="section-title">联系方式：</span>
            <span class="contact-item" v-if="socialEmail">📧 {{ socialEmail }}</span>
            <a v-if="socialGitee" :href="socialGitee" target="_blank" class="contact-link">🔗 Gitee</a>
            <a v-if="socialGithub" :href="socialGithub" target="_blank" class="contact-link">🔗 GitHub</a>
          </div>
        </div>
      </div>
      
      <!-- 底部版权和备案 -->
      <div class="footer-bottom">
        <p class="copyright">{{ copyright }}</p>
        <p class="runtime">⏰ {{ runtimeText }}</p>
        <p class="icp" v-if="icpNumber">{{ icpNumber }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { fetchWebsiteConfigWithCache } from '@/utils/websiteConfig'

const year = new Date().getFullYear()

const websiteName = ref('小花的日记本')
const websiteMotto = ref('愿你温柔且有力量')
const copyright = ref(`© ${year} 记录美好生活的每一天`)
const icpNumber = ref('')
const socialEmail = ref('')
const socialGitee = ref('')
const socialGithub = ref('')
const runtimeText = ref('')

// 网站启动时间
const startTime = new Date('2026-01-01 00:00:00').getTime()

// 计算运行时间
const calculateRuntime = () => {
  const now = new Date().getTime()
  const diff = now - startTime
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  runtimeText.value = `${days} 天 ${hours} 小时 ${minutes} 分钟 ${seconds} 秒`
}

let timer: number | null = null

// 获取网站配置
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
  } catch (error) {
    // 获取网站配置失败
  }
}

onMounted(() => {
  fetchWebsiteConfig()
  calculateRuntime()
  // 每秒更新一次运行时间
  timer = window.setInterval(calculateRuntime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped lang="scss">
.footer {
  background: transparent;
  padding: 0;
  margin-top: 20px;
  position: relative;
  
  .footer-wave {
    position: absolute;
    top: -50px;
    left: 0;
    width: 100%;
    height: 60px;
    overflow: hidden;
    display: none;
    
    svg {
      width: 100%;
      height: 100%;
    }
  }
  
  .container {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    padding: 15px 30px 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 60px;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .footer-info {
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      
      .logo-icon {
        font-size: 20px;
      }
      
      .logo-text {
        font-size: 16px;
        font-weight: 700;
        color: #fff;
        text-shadow: 0 2px 10px rgba(139, 92, 246, 0.8);
      }
    }
    
    .motto {
      font-size: 13px;
      color: #fff;
      text-shadow: 0 2px 8px rgba(139, 92, 246, 0.6);
      margin-bottom: 0;
      font-weight: 600;
    }
  }
  
  .footer-links-inline {
    display: flex;
    justify-content: space-between;
    gap: 40px;
    
    .link-section {
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
      
      .section-title {
        font-size: 13px;
        color: #fff;
        font-weight: 600;
        text-shadow: 0 2px 8px rgba(139, 92, 246, 0.6);
      }
      
      a, .contact-item {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        transition: all 0.3s;
        
        &:hover {
          color: #fff;
          text-shadow: 0 2px 8px rgba(139, 92, 246, 0.8);
        }
      }
      
      .contact-item {
        cursor: default;
      }
    }
  }
  
  .footer-bottom {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 8px 30px;
    border-top: 1px solid rgba(139, 92, 246, 0.15);
    position: relative;
    
    .copyright {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
      position: absolute;
      left: 30px;
    }
    
    .runtime {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
      font-weight: 500;
      text-shadow: 0 1px 3px rgba(139, 92, 246, 0.3);
    }
    
    .icp {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
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
    margin-top: 30px;
    
    .footer-wave {
      top: -30px;
      height: 40px;
    }
    
    .container {
      padding: 20px 15px 10px;
    }
    
    .footer-content {
      grid-template-columns: 1fr;
      gap: 20px;
      text-align: center;
      margin-bottom: 15px;
    }
    
    .footer-info {
      .footer-logo {
        justify-content: center;
        margin-bottom: 8px;
        
        .logo-icon {
          font-size: 20px;
        }
        
        .logo-text {
          font-size: 16px;
        }
      }
      
      .motto {
        font-size: 13px;
        margin-bottom: 0;
      }
    }
    
    .footer-links-inline {
      flex-direction: column;
      gap: 15px;
      align-items: center;
      
      .link-section {
        flex-direction: column;
        align-items: center;
        gap: 10px;
        width: 100%;
        
        .section-title {
          font-size: 13px;
          width: 100%;
          text-align: center;
          margin-bottom: 8px;
        }
        
        a, .contact-item {
          font-size: 12px;
          padding: 5px 10px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          transition: all 0.3s;
          width: auto;
          display: block;
          text-align: center;
          
          &:hover {
            background: rgba(139, 92, 246, 0.2);
          }
        }
        
        .contact-item {
          display: block;
        }
      }
    }
    
    .footer-bottom {
      flex-direction: column;
      gap: 8px;
      text-align: center;
      padding: 12px 15px;
      border-top: 1px solid rgba(139, 92, 246, 0.15);
      
      .copyright {
        position: static;
        font-size: 11px;
        order: 1;
      }
      
      .runtime {
        font-size: 11px;
        order: 2;
      }
      
      .icp {
        font-size: 11px;
        order: 3;
      }
    }
  }
}
</style>
