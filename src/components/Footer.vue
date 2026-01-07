<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-info">
          <p class="motto">{{ motto }}</p>
          <p class="copyright">© {{ year }} {{ siteName }} · {{ siteDesc }}</p>
        </div>
        <div class="footer-links">
          <a href="https://github.com" target="_blank">{{ githubText }}</a>
          <span>·</span>
          <a href="mailto:example@email.com">{{ emailText }}</a>
          <span>·</span>
          <a href="#">{{ rssText }}</a>
        </div>
      </div>
      <div class="footer-decoration">
        <span class="deco" v-for="(icon, index) in decoIcons" :key="index">{{ icon }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const year = new Date().getFullYear()

const themeConfig = {
  girl: {
    motto: '🌸 愿你温柔且有力量 🌸',
    siteName: '小花的日记本',
    siteDesc: '记录美好生活',
    githubText: '💗 GitHub',
    emailText: '💌 联系我',
    rssText: '🌈 RSS',
    decoIcons: ['🌸', '💕', '✨', '🦋', '🌸']
  },
  boy: {
    motto: '💻 代码改变世界，技术成就梦想 💻',
    siteName: '技术成长笔记',
    siteDesc: '记录技术成长',
    githubText: '⚡ GitHub',
    emailText: '📧 联系我',
    rssText: '📡 RSS',
    decoIcons: ['💻', '⚡', '🚀', '🔥', '💻']
  },
  it: {
    motto: '💻 技术驱动创新，代码创造价值 💻',
    siteName: 'IT技术博客',
    siteDesc: '分享技术干货',
    githubText: '🔧 GitHub',
    emailText: '📧 联系我',
    rssText: '📡 RSS',
    decoIcons: ['💻', '🔧', '⚙️', '🖥️', '💻']
  },
  finance: {
    motto: '💰 理性投资，智慧理财，财富自由 💰',
    siteName: '财富管理笔记',
    siteDesc: '专业财经分析',
    githubText: '📊 GitHub',
    emailText: '📧 联系我',
    rssText: '📈 RSS',
    decoIcons: ['💰', '📈', '💎', '💵', '💰']
  },
  mom: {
    motto: '👶 陪伴是最长情的告白，记录成长每一刻 👶',
    siteName: '宝妈成长日记',
    siteDesc: '记录育儿点滴',
    githubText: '💗 GitHub',
    emailText: '💌 联系我',
    rssText: '🌟 RSS',
    decoIcons: ['👶', '💗', '🍼', '🎈', '👶']
  }
}

const config = computed(() => themeConfig[themeStore.currentTheme])
const motto = computed(() => config.value.motto)
const siteName = computed(() => config.value.siteName)
const siteDesc = computed(() => config.value.siteDesc)
const githubText = computed(() => config.value.githubText)
const emailText = computed(() => config.value.emailText)
const rssText = computed(() => config.value.rssText)
const decoIcons = computed(() => config.value.decoIcons)
</script>

<style scoped lang="scss">
.footer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 40px 0 30px;
  margin-top: 80px;
  border-top: 2px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 25px;
    margin-bottom: 25px;
  }
  
  .footer-info {
    .motto {
      font-size: 17px;
      margin-bottom: 10px;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .copyright {
      font-size: 14px;
      color: #999;
    }
  }
  
  .footer-links {
    display: flex;
    gap: 15px;
    align-items: center;
    
    a {
      transition: all 0.3s;
      font-size: 14px;
      
      &:hover {
        transform: translateY(-3px);
      }
    }
    
    span {
      color: #ddd;
    }
  }
  
  .footer-decoration {
    display: flex;
    justify-content: center;
    gap: 30px;
    padding-top: 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    
    .deco {
      font-size: 20px;
      opacity: 0.6;
      animation: float 3s ease-in-out infinite;
      
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
    }
  }
}

/* 女生主题 */
.theme-girl {
  .footer {
    border-top-color: rgba(255, 182, 193, 0.2);
    
    .footer-info .motto {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .footer-links a {
      color: #ff9a9e;
      
      &:hover {
        color: #fecfef;
      }
    }
    
    .footer-decoration {
      border-top-color: rgba(255, 182, 193, 0.15);
    }
  }
}

/* 男生主题 */
.theme-boy {
  .footer {
    border-top-color: rgba(102, 126, 234, 0.2);
    
    .footer-info .motto {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .footer-links a {
      color: #667eea;
      
      &:hover {
        color: #764ba2;
      }
    }
    
    .footer-decoration {
      border-top-color: rgba(102, 126, 234, 0.15);
    }
  }
}

/* IT主题 */
.theme-it {
  .footer {
    border-top-color: rgba(0, 212, 255, 0.2);
    
    .footer-info .motto {
      background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .footer-links a {
      color: #00d4ff;
      
      &:hover {
        color: #0099ff;
      }
    }
    
    .footer-decoration {
      border-top-color: rgba(0, 212, 255, 0.15);
    }
  }
}

/* 金融主题 */
.theme-finance {
  .footer {
    border-top-color: rgba(255, 215, 0, 0.2);
    
    .footer-info .motto {
      background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .footer-links a {
      color: #ffd700;
      
      &:hover {
        color: #ff9500;
      }
    }
    
    .footer-decoration {
      border-top-color: rgba(255, 215, 0, 0.15);
    }
  }
}

/* 宝妈主题 */
.theme-mom {
  .footer {
    border-top-color: rgba(255, 182, 193, 0.2);
    
    .footer-info .motto {
      background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .footer-links a {
      color: #ffb6c1;
      
      &:hover {
        color: #ffc0cb;
      }
    }
    
    .footer-decoration {
      border-top-color: rgba(255, 182, 193, 0.15);
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-decoration {
    gap: 15px;
    
    .deco {
      font-size: 16px;
    }
  }
}
</style>
