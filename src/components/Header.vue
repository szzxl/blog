<template>
  <header class="header">
    <div class="container">
      <div class="logo">
        <span class="logo-icon">{{ logoIcon }}</span>
        <span class="logo-text">{{ logoText }}</span>
      </div>
      <nav class="nav">
        <router-link to="/">
          <span class="nav-icon">🏠</span>
          <span>首页</span>
        </router-link>
        <router-link to="/articles">
          <span class="nav-icon">{{ articlesIcon }}</span>
          <span>文章</span>
        </router-link>
        <router-link to="/category">
          <span class="nav-icon">{{ categoryIcon }}</span>
          <span>分类</span>
        </router-link>
        <router-link to="/tag">
          <span class="nav-icon">🏷️</span>
          <span>标签</span>
        </router-link>
        <router-link to="/talk">
          <span class="nav-icon">{{ talkIcon }}</span>
          <span>说说</span>
        </router-link>
        <router-link to="/guestbook">
          <span class="nav-icon">{{ guestbookIcon }}</span>
          <span>留言板</span>
        </router-link>
        <router-link to="/link">
          <span class="nav-icon">{{ linkIcon }}</span>
          <span>友链</span>
        </router-link>
        <router-link to="/about">
          <span class="nav-icon">{{ aboutIcon }}</span>
          <span>关于</span>
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const themeConfig = {
  girl: {
    logoIcon: '🌸',
    logoText: '小花的日记本',
    articlesIcon: '✨',
    categoryIcon: '🎀',
    talkIcon: '💕',
    guestbookIcon: '💌',
    linkIcon: '🌈',
    aboutIcon: '🦋'
  },
  boy: {
    logoIcon: '💻',
    logoText: '技术成长笔记',
    articlesIcon: '📝',
    categoryIcon: '📂',
    talkIcon: '💭',
    guestbookIcon: '✍️',
    linkIcon: '🔗',
    aboutIcon: '👤'
  },
  it: {
    logoIcon: '💻',
    logoText: 'IT技术博客',
    articlesIcon: '📄',
    categoryIcon: '📁',
    talkIcon: '💬',
    guestbookIcon: '✉️',
    linkIcon: '🔗',
    aboutIcon: '👨‍💻'
  },
  finance: {
    logoIcon: '💰',
    logoText: '财富管理笔记',
    articlesIcon: '📊',
    categoryIcon: '📈',
    talkIcon: '💡',
    guestbookIcon: '📝',
    linkIcon: '🤝',
    aboutIcon: '👔'
  },
  mom: {
    logoIcon: '👶',
    logoText: '宝妈成长日记',
    articlesIcon: '📖',
    categoryIcon: '🎨',
    talkIcon: '💗',
    guestbookIcon: '💌',
    linkIcon: '🌟',
    aboutIcon: '👩‍👧'
  }
}

const config = computed(() => themeConfig[themeStore.currentTheme])
const logoIcon = computed(() => config.value.logoIcon)
const logoText = computed(() => config.value.logoText)
const articlesIcon = computed(() => config.value.articlesIcon)
const categoryIcon = computed(() => config.value.categoryIcon)
const talkIcon = computed(() => config.value.talkIcon)
const guestbookIcon = computed(() => config.value.guestbookIcon)
const linkIcon = computed(() => config.value.linkIcon)
const aboutIcon = computed(() => config.value.aboutIcon)
</script>

<style scoped lang="scss">
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 22px;
    font-weight: 600;
    transition: all 0.3s;
    
    .logo-icon {
      font-size: 32px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
  }
  
  .nav {
    display: flex;
    gap: 8px;
    
    a {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      color: #7a7a7a;
      border-radius: 25px;
      transition: all 0.3s;
      font-size: 15px;
      
      .nav-icon {
        font-size: 18px;
      }
      
      &:hover {
        transform: translateY(-3px);
      }
      
      &.router-link-active {
        color: #fff;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

/* 女生主题 */
.theme-girl {
  .header {
    border-bottom-color: rgba(255, 182, 193, 0.2);
    
    .logo {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .nav a {
      &:hover {
        background: linear-gradient(135deg, #fff0f6 0%, #ffe8f0 100%);
        color: #ff9a9e;
      }
      
      &.router-link-active {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        box-shadow: 0 6px 20px rgba(255, 154, 158, 0.4);
      }
    }
  }
}

/* 男生主题 */
.theme-boy {
  .header {
    border-bottom-color: rgba(102, 126, 234, 0.2);
    
    .logo {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .nav a {
      &:hover {
        background: linear-gradient(135deg, #f0f0ff 0%, #e8e8ff 100%);
        color: #667eea;
      }
      
      &.router-link-active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }
    }
  }
}

/* IT主题 */
.theme-it {
  .header {
    border-bottom-color: rgba(0, 212, 255, 0.2);
    
    .logo {
      background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .nav a {
      &:hover {
        background: linear-gradient(135deg, #e6f7ff 0%, #d0f0ff 100%);
        color: #00d4ff;
      }
      
      &.router-link-active {
        background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
        box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
      }
    }
  }
}

/* 金融主题 */
.theme-finance {
  .header {
    border-bottom-color: rgba(255, 215, 0, 0.2);
    
    .logo {
      background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .nav a {
      &:hover {
        background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
        color: #ffd700;
      }
      
      &.router-link-active {
        background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
        box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
      }
    }
  }
}

/* 宝妈主题 */
.theme-mom {
  .header {
    border-bottom-color: rgba(255, 182, 193, 0.2);
    
    .logo {
      background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .nav a {
      &:hover {
        background: linear-gradient(135deg, #fff0f5 0%, #ffe4e9 100%);
        color: #ffb6c1;
      }
      
      &.router-link-active {
        background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
        box-shadow: 0 6px 20px rgba(255, 182, 193, 0.4);
      }
    }
  }
}

@media (max-width: 768px) {
  .nav {
    flex-wrap: wrap;
    gap: 5px;
    
    a {
      padding: 8px 12px;
      font-size: 13px;
      
      span:not(.nav-icon) {
        display: none;
      }
    }
  }
}
</style>
