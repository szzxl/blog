<template>
  <div id="app">
    <!-- 可爱的背景装饰 -->
    <div class="bg-decorations">
      <div class="decoration heart" style="top: 10%; left: 5%;">💗</div>
      <div class="decoration star" style="top: 20%; right: 10%;">⭐</div>
      <div class="decoration flower" style="top: 60%; left: 8%;">🌸</div>
      <div class="decoration butterfly" style="top: 40%; right: 5%;">🦋</div>
      <div class="decoration sparkle" style="top: 80%; left: 15%;">✨</div>
      <div class="decoration heart" style="top: 70%; right: 12%;">💕</div>
    </div>
    
    <Header />
    
    <!-- 全局公告栏 -->
    <div class="announcement-bar">
      <div class="announcement-icon">📢</div>
      <div class="announcement-scroll">
        <div class="announcement-content">
          <!-- 重复两次以实现无缝滚动 -->
          <template v-for="n in 2" :key="n">
            <span v-for="(item, index) in announcements" :key="`${n}-${index}`" class="announcement-item">
              <span class="announcement-label">{{ item.label }}</span>
              <span class="announcement-text">{{ item.text }}</span>
            </span>
          </template>
        </div>
      </div>
    </div>
    
    <!-- 回到顶部按钮 -->
    <button class="back-to-top" :class="{ show: showBackToTop }" @click="scrollToTop">
      ↑
    </button>
    
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { fetchWebsiteConfigWithCache } from '@/utils/websiteConfig'

const announcements = ref([
  { label: '公告', text: '欢迎来到小花的日记本，一起记录美好生活~ 🌸' },
  { label: '更新', text: '网站持续更新中，感谢大家的支持！ ✨' },
  { label: '活动', text: '新年特别活动即将开启，敬请期待！ 🎉' },
  { label: '提示', text: '记得每天来看看，分享你的心情和故事 💕' }
])

const showBackToTop = ref(false)

// 获取网站配置并设置标题
const fetchWebsiteConfig = async () => {
  try {
    const config = await fetchWebsiteConfigWithCache()
    
    if (config.seo_title) {
      document.title = config.seo_title
    }
  } catch (error) {
    console.error('获取网站配置失败:', error)
  }
}

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  fetchWebsiteConfig()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ffd1dc 100%);
  background-attachment: fixed;
  position: relative;
  isolation: isolate;
}

.bg-decorations {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  
  .decoration {
    position: absolute;
    font-size: 40px;
    opacity: 0.2;
    animation: float 8s ease-in-out infinite;
    
    &.heart {
      animation-delay: 0s;
    }
    
    &.star {
      animation-delay: 1s;
    }
    
    &.flower {
      animation-delay: 2s;
    }
    
    &.butterfly {
      animation-delay: 3s;
    }
    
    &.sparkle {
      animation-delay: 4s;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-15px) rotate(5deg);
  }
  50% {
    transform: translateY(-30px) rotate(-5deg);
  }
  75% {
    transform: translateY(-15px) rotate(5deg);
  }
}

.main-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.announcement-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(255, 182, 193, 0.2);
  padding: 12px 0;
  position: relative;
  z-index: 998;
  display: flex;
  align-items: center;
  gap: 15px;
  overflow: hidden;
  
  .announcement-icon {
    font-size: 24px;
    padding: 0 20px;
    flex-shrink: 0;
    animation: swing 2s ease-in-out infinite;
  }
  
  .announcement-scroll {
    flex: 1;
    overflow: hidden;
    position: relative;
    
    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 0;
      width: 50px;
      height: 100%;
      z-index: 2;
      pointer-events: none;
    }
    
    &::before {
      left: 0;
      background: linear-gradient(to right, rgba(255, 255, 255, 0.95), transparent);
    }
    
    &::after {
      right: 0;
      background: linear-gradient(to left, rgba(255, 255, 255, 0.95), transparent);
    }
  }
  
  .announcement-content {
    display: flex;
    gap: 50px;
    animation: scroll-left 30s linear infinite;
    white-space: nowrap;
    
    &:hover {
      animation-play-state: paused;
    }
  }
  
  .announcement-item {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    
    .announcement-label {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      color: #fff;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    
    .announcement-text {
      color: #666;
      font-size: 14px;
    }
  }
}

@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes swing {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-15deg);
  }
  75% {
    transform: rotate(15deg);
  }
}

@media (max-width: 768px) {
  .announcement-bar {
    padding: 10px 0;
    
    .announcement-icon {
      font-size: 20px;
      padding: 0 15px;
    }
    
    .announcement-item {
      .announcement-label {
        font-size: 11px;
        padding: 3px 10px;
      }
      
      .announcement-text {
        font-size: 13px;
      }
    }
  }
}

.back-to-top {
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(255, 154, 158, 0.4);
  transition: all 0.3s;
  z-index: 997;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  
  &.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 35px rgba(255, 154, 158, 0.5);
  }
  
  &:active {
    transform: translateY(-3px);
  }
}

@media (max-width: 768px) {
  .back-to-top {
    bottom: 80px;
    right: 20px;
    width: 45px;
    height: 45px;
    font-size: 20px;
  }
}
</style>
