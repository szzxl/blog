<template>
  <div id="app">
    <!-- 宇宙星辰装饰 -->
    <div class="bg-decorations" style="display: none;">
      <!-- 装饰已隐藏 -->
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
  background: url('@/assets/images/backgrounds/星球.png') center/cover no-repeat fixed;
  position: relative;
  isolation: isolate;
  overflow-x: hidden;
}

@keyframes stars {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -550px -300px;
  }
}

@keyframes shooting-star {
  0% {
    box-shadow: 
      100vw -10vh 2px 1px rgba(255, 255, 255, 0),
      80vw 20vh 2px 1px rgba(255, 255, 255, 0);
  }
  10% {
    box-shadow: 
      100vw -10vh 2px 1px rgba(255, 255, 255, 0.8),
      80vw 20vh 2px 1px rgba(255, 255, 255, 0);
  }
  20% {
    box-shadow: 
      -10vw 50vh 2px 1px rgba(255, 255, 255, 0),
      80vw 20vh 2px 1px rgba(255, 255, 255, 0.8);
  }
  30% {
    box-shadow: 
      -10vw 50vh 2px 1px rgba(255, 255, 255, 0),
      -10vw 80vh 2px 1px rgba(255, 255, 255, 0);
  }
  40% {
    box-shadow: 
      -10vw 50vh 2px 1px rgba(255, 255, 255, 0),
      -10vw 80vh 2px 1px rgba(255, 255, 255, 0.8);
  }
  50% {
    box-shadow: 
      -10vw 50vh 2px 1px rgba(255, 255, 255, 0),
      -10vw 120vh 2px 1px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 
      -10vw 50vh 2px 1px rgba(255, 255, 255, 0),
      -10vw 120vh 2px 1px rgba(255, 255, 255, 0);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
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
  
  /* 行星样式 */
  .planet {
    position: absolute;
    font-size: 60px;
    opacity: 0.7;
    animation: orbit 30s ease-in-out infinite;
    filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.9));
    
    &.mercury {
      font-size: 35px;
      animation: orbit 15s ease-in-out infinite;
      filter: drop-shadow(0 0 15px rgba(169, 169, 169, 0.8));
    }
    
    &.venus {
      font-size: 45px;
      animation: orbit 20s ease-in-out infinite;
      filter: drop-shadow(0 0 20px rgba(255, 198, 73, 0.9));
    }
    
    &.earth {
      font-size: 50px;
      animation: orbit 25s ease-in-out infinite, spin 20s linear infinite;
      filter: drop-shadow(0 0 25px rgba(100, 149, 237, 1));
    }
    
    &.mars {
      font-size: 40px;
      animation: orbit 28s ease-in-out infinite;
      filter: drop-shadow(0 0 20px rgba(255, 69, 0, 0.9));
    }
    
    &.jupiter {
      font-size: 80px;
      animation: orbit 35s ease-in-out infinite, rotate 30s linear infinite;
      filter: drop-shadow(0 0 35px rgba(255, 215, 0, 1));
    }
    
    &.saturn {
      font-size: 75px;
      animation: orbit 40s ease-in-out infinite, rotate 35s linear infinite;
      filter: drop-shadow(0 0 30px rgba(238, 232, 170, 1));
    }
    
    &.uranus {
      font-size: 55px;
      animation: orbit 45s ease-in-out infinite;
      filter: drop-shadow(0 0 25px rgba(64, 224, 208, 0.9));
    }
    
    &.neptune {
      font-size: 55px;
      animation: orbit 50s ease-in-out infinite;
      filter: drop-shadow(0 0 25px rgba(30, 144, 255, 1));
    }
    
    &.pluto {
      font-size: 30px;
      animation: orbit 55s ease-in-out infinite;
      filter: drop-shadow(0 0 15px rgba(192, 192, 192, 0.8));
    }
  }
  
  /* 其他宇宙装饰 */
  .decoration {
    position: absolute;
    font-size: 45px;
    opacity: 0.5;
    animation: float 12s ease-in-out infinite;
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
    
    &.rocket {
      font-size: 50px;
      animation: fly 20s ease-in-out infinite;
      filter: drop-shadow(0 0 30px rgba(255, 200, 100, 1));
    }
    
    &.satellite {
      font-size: 40px;
      animation: orbit 25s ease-in-out infinite, rotate 15s linear infinite;
      filter: drop-shadow(0 0 20px rgba(192, 192, 192, 0.9));
    }
    
    &.moon {
      font-size: 55px;
      animation: orbit 20s ease-in-out infinite;
      filter: drop-shadow(0 0 30px rgba(255, 255, 224, 1));
    }
    
    &.star {
      font-size: 40px;
      animation: pulse 3s ease-in-out infinite;
      filter: drop-shadow(0 0 25px rgba(255, 255, 0, 1));
    }
    
    &.comet {
      font-size: 45px;
      animation: comet-fly 15s ease-in-out infinite;
      filter: drop-shadow(0 0 25px rgba(255, 140, 0, 1));
    }
    
    &.alien {
      font-size: 50px;
      animation: float 10s ease-in-out infinite;
      filter: drop-shadow(0 0 20px rgba(0, 255, 0, 0.8));
    }
  }
}

/* 行星轨道运动 */
@keyframes orbit {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(30px, -20px) rotate(90deg);
  }
  50% {
    transform: translate(0, -40px) rotate(180deg);
  }
  75% {
    transform: translate(-30px, -20px) rotate(270deg);
  }
}

/* 漂浮动画 */
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

/* 旋转动画 */
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 自转动画 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 火箭飞行 */
@keyframes fly {
  0%, 100% {
    transform: translateY(0) translateX(0) rotate(-45deg);
  }
  50% {
    transform: translateY(-30px) translateX(30px) rotate(-45deg);
  }
}

/* 彗星飞行 */
@keyframes comet-fly {
  0% {
    transform: translate(0, 0) rotate(-45deg);
    opacity: 0.5;
  }
  50% {
    transform: translate(100px, 100px) rotate(-45deg);
    opacity: 0.8;
  }
  100% {
    transform: translate(200px, 200px) rotate(-45deg);
    opacity: 0.3;
  }
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.9;
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
  padding: 8px 0;
  position: relative;
  z-index: 998;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  overflow: hidden;
  
  .announcement-icon {
    font-size: 20px;
    padding: 0 15px;
    flex-shrink: 0;
    animation: swing 2s ease-in-out infinite;
  }
  
  .announcement-scroll {
    flex: 1;
    max-width: 1200px;
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
      padding: 3px 10px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }
    
    .announcement-text {
      color: #666;
      font-size: 13px;
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
