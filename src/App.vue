<template>
  <div id="app">
    <!-- 程序员主题装饰 -->
    <div class="bg-decorations">
      <div class="decoration code" style="top: 10%; left: 5%;">💻</div>
      <div class="decoration terminal" style="top: 20%; right: 10%;">🖥️</div>
      <div class="decoration keyboard" style="top: 55%; left: 8%;">⌨️</div>
      <div class="decoration bug" style="top: 40%; right: 8%;">🐛</div>
      <div class="decoration rocket" style="top: 75%; left: 15%;">🚀</div>
      <div class="decoration chip" style="top: 65%; right: 12%;">🔧</div>
      <div class="decoration database" style="top: 30%; left: 20%;">💾</div>
      <div class="decoration network" style="top: 50%; right: 20%;">🌐</div>
    </div>
    
    <Header />
    
    <!-- 全局公告栏 -->
    <div class="announcement-bar" v-if="announcements.length > 0">
      <div class="announcement-icon">📢</div>
      <div class="announcement-scroll">
        <div class="announcement-content">
          <!-- 重复两次以实现无缝滚动 -->
          <template v-for="n in 2" :key="n">
            <span v-for="(item, index) in announcements" :key="`${n}-${index}`" class="announcement-item">
              <span class="announcement-label" v-if="item.type === 'activity'">活动</span>
              <span class="announcement-label" v-else-if="item.type === 'notice'">公告</span>
              <span class="announcement-label" v-else>通知</span>
              <span class="announcement-text">{{ item.content }}</span>
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
import { getNotificationList } from '@/api/article'

interface Notification {
  id: number
  type: string
  content: string
  status: number
}

const announcements = ref<Notification[]>([])
const showBackToTop = ref(false)

// 获取通知列表
const fetchNotifications = async () => {
  try {
    const response: any = await getNotificationList()
    
    if (response && Array.isArray(response)) {
      // 只显示状态为1的通知
      announcements.value = response.filter((item: Notification) => item.status === 1)
    }
  } catch (error) {
    // 如果接口失败，使用默认通知
    announcements.value = []
  }
}

// 获取网站配置并设置标题
const fetchWebsiteConfig = async () => {
  try {
    const config = await fetchWebsiteConfigWithCache()
    
    if (config.seo_title) {
      document.title = config.seo_title
    }
  } catch (error) {
    // 获取网站配置失败
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
  fetchNotifications()
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
  background: #0a0e27;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  background-attachment: fixed;
  position: relative;
  isolation: isolate;
  
  /* 渐变光效 */
  &::before {
    content: '';
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at 30% 50%,
      rgba(139, 92, 246, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 70% 50%,
      rgba(59, 130, 246, 0.15) 0%,
      transparent 50%
    );
    animation: glow 20s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }
  
  /* 代码雨效果 */
  &::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 255, 255, 0.03) 2px,
        rgba(0, 255, 255, 0.03) 4px
      );
    animation: scan 8s linear infinite;
    pointer-events: none;
    z-index: 0;
    opacity: 0.5;
  }
}

@keyframes glow {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(10%, 10%) rotate(180deg);
  }
}

@keyframes scan {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(50px);
  }
}

@keyframes stars {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
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
    font-size: 50px;
    opacity: 0.3;
    animation: float 12s ease-in-out infinite;
    filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.6));
    
    &.code {
      animation: typing 4s ease-in-out infinite;
    }
    
    &.terminal {
      animation: blink 2s ease-in-out infinite;
    }
    
    &.keyboard {
      animation: press 3s ease-in-out infinite;
    }
    
    &.bug {
      animation: crawl 8s ease-in-out infinite;
    }
    
    &.rocket {
      animation: fly 15s ease-in-out infinite;
    }
    
    &.chip {
      animation: rotate 20s linear infinite;
    }
    
    &.database {
      animation: pulse 3s ease-in-out infinite;
    }
    
    &.network {
      animation: spin 10s linear infinite;
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

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fly {
  0%, 100% {
    transform: translateY(0) translateX(0) rotate(-45deg);
  }
  50% {
    transform: translateY(-20px) translateX(20px) rotate(-45deg);
  }
}

@keyframes typing {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes press {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.3;
  }
  50% {
    transform: translateY(5px);
    opacity: 0.6;
  }
}

@keyframes crawl {
  0%, 100% {
    transform: translateX(0) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateX(20px) rotate(10deg);
    opacity: 0.6;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.7;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    transform: rotate(360deg);
    opacity: 0.3;
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
  border-bottom: 2px solid rgba(59, 130, 246, 0.2);
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
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
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
    box-shadow: 0 12px 35px rgba(59, 130, 246, 0.5);
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
