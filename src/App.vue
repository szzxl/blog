<template>
  <ErrorBoundary>
    <div id="app" :class="{ 'has-video-bg': isVideoBackground }">
      <!-- 视频背景 -->
      <video 
        v-if="isVideoBackground" 
        class="video-background" 
        :src="currentBackground?.url" 
        autoplay 
        loop 
        muted
        playsinline
      ></video>
      
      <!-- 图片背景 -->
      <div 
        v-else 
        class="image-background" 
        :style="{ backgroundImage: `url(${currentBackground?.url || ''})` }"
      ></div>
      
      <!-- 全局雪花效果 -->
      <div class="snowflakes" aria-hidden="true">
        <div class="snowflake" v-for="i in 50" :key="i">❄</div>
      </div>
      
      <!-- 背景选择器 -->
      <div class="bg-selector">
        <button class="bg-toggle" @click="showBgSelector = !showBgSelector" title="切换背景">
          <el-icon :size="22"><Operation /></el-icon>
        </button>
        <transition name="slide-up">
          <div v-if="showBgSelector" class="bg-options">
            <div 
              v-for="(bg, index) in backgrounds" 
              :key="index"
              class="bg-option"
              :class="{ active: currentBgIndex === index }"
              @click="changeBackground(index)"
            >
              <div class="bg-preview">
                <video v-if="bg.type === 'video'" :src="bg.url" muted class="preview-video"></video>
                <img v-else :src="bg.url" :alt="bg.name" class="preview-img">
                <span v-if="bg.type === 'video'" class="video-badge">▶️</span>
              </div>
              <span class="bg-name">{{ bg.name }}</span>
            </div>
          </div>
        </transition>
      </div>
      
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
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Operation } from '@element-plus/icons-vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import { fetchWebsiteConfigWithCache } from '@/utils/websiteConfig'
import { getNotificationList, getBackgroundList } from '@/api/article'

interface Notification {
  id: number
  type: string
  content: string
  status: number
}

interface Background {
  id: number
  name: string
  url: string
  type: 'image' | 'video'
  sort?: number
}

const announcements = ref<Notification[]>([])
const showBackToTop = ref(false)

// 背景图管理
const backgrounds = ref<Background[]>([])
const currentBgIndex = ref(0)
const showBgSelector = ref(false)

const currentBackground = computed(() => {
  if (backgrounds.value.length === 0) {
    // 如果没有背景图，返回一个默认渐变背景
    return {
      id: 0,
      name: '默认背景',
      url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:rgb(99,102,241);stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:rgb(139,92,246);stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grad)" /%3E%3C/svg%3E',
      type: 'image' as const
    }
  }
  
  // 确保索引在有效范围内
  const index = currentBgIndex.value >= backgrounds.value.length ? 0 : currentBgIndex.value
  return backgrounds.value[index]
})

const isVideoBackground = computed(() => currentBackground.value?.type === 'video')

// 获取背景图列表
const fetchBackgrounds = async () => {
  try {
    const response: any = await getBackgroundList()
    
    // request 拦截器已经返回了 res.data，所以 response 直接就是数组
    if (Array.isArray(response) && response.length > 0) {
      backgrounds.value = response.map((item: any) => {
        const imageUrl = item.image || item.url || item.path || item.src || ''
        const isVideo = imageUrl.toLowerCase().endsWith('.mp4') || 
                       imageUrl.toLowerCase().endsWith('.webm') ||
                       item.type === 'video'
        
        return {
          id: item.id,
          name: item.title || item.name || `背景${item.id}`,
          url: imageUrl,
          type: (isVideo ? 'video' : 'image') as 'image' | 'video',
          sort: item.sort || 0
        }
      }).sort((a, b) => (a.sort || 0) - (b.sort || 0))
    }
  } catch (error) {
    // 静默失败
  }
}



// 切换背景
const changeBackground = (index: number) => {
  currentBgIndex.value = index
  localStorage.setItem('selectedBackground', index.toString())
  showBgSelector.value = false
}

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
  
  // 先获取背景图列表
  fetchBackgrounds().then(() => {
    // 背景图加载完成后，恢复上次选择的背景
    const savedBg = localStorage.getItem('selectedBackground')
    if (savedBg) {
      const index = parseInt(savedBg)
      // 确保索引在有效范围内
      if (index >= 0 && index < backgrounds.value.length) {
        currentBgIndex.value = index
      }
    }
  })
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
  position: relative;
  isolation: isolate;
  overflow-x: hidden;
}

/* 视频背景 */
.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}

/* 图片背景 */
.image-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
}

/* 背景选择器 */
.bg-selector {
  position: fixed;
  bottom: 30px;
  left: 30px;
  z-index: 998;
  
  .bg-toggle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(139, 92, 246, 0.3);
    color: #8b5cf6;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.25);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      transform: translateY(-3px) rotate(90deg);
      box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
      border-color: #8b5cf6;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
    }
    
    &:active {
      transform: translateY(-1px) rotate(90deg);
    }
  }
  
  .bg-options {
    position: absolute;
    bottom: 60px;
    left: 0;
    background: var(--bg-card);
    border-radius: 15px;
    padding: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(20px);
    min-width: 200px;
    
    .bg-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .bg-preview {
        position: relative;
        width: 50px;
        height: 50px;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid transparent;
        transition: all 0.3s;
        
        .preview-img,
        .preview-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .video-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          font-size: 10px;
          background: rgba(0, 0, 0, 0.6);
          padding: 2px 4px;
          border-radius: 4px;
        }
      }
      
      .bg-name {
        font-size: 14px;
        color: var(--text-primary);
        font-weight: 500;
      }
      
      &:hover {
        background: rgba(139, 92, 246, 0.1);
        
        .bg-preview {
          transform: scale(1.1);
        }
      }
      
      &.active {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%);
        
        .bg-preview {
          border-color: #8b5cf6;
        }
        
        .bg-name {
          color: #8b5cf6;
          font-weight: 700;
        }
      }
    }
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 768px) {
  .bg-selector {
    bottom: 90px;
    left: 20px;
    
    .bg-toggle {
      width: 45px;
      height: 45px;
      font-size: 20px;
    }
    
    .bg-options {
      min-width: 180px;
      
      .bg-option {
        img {
          width: 40px;
          height: 40px;
        }
        
        .bg-name {
          font-size: 13px;
        }
      }
    }
  }
}

/* 雪花效果 */
.snowflakes {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.snowflake {
  position: absolute;
  top: -10%;
  color: #fff;
  font-size: 1em;
  font-family: Arial, sans-serif;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
  animation: fall linear infinite;
  opacity: 0.8;
}

/* 为每个雪花设置不同的动画参数 */
.snowflake:nth-child(1) { left: 2%; animation-duration: 10s; animation-delay: 0s; font-size: 0.8em; }
.snowflake:nth-child(2) { left: 5%; animation-duration: 12s; animation-delay: 1s; font-size: 1.2em; }
.snowflake:nth-child(3) { left: 8%; animation-duration: 8s; animation-delay: 2s; font-size: 0.9em; }
.snowflake:nth-child(4) { left: 12%; animation-duration: 14s; animation-delay: 0.5s; font-size: 1em; }
.snowflake:nth-child(5) { left: 15%; animation-duration: 11s; animation-delay: 1.5s; font-size: 1.1em; }
.snowflake:nth-child(6) { left: 18%; animation-duration: 9s; animation-delay: 2.5s; font-size: 0.85em; }
.snowflake:nth-child(7) { left: 22%; animation-duration: 13s; animation-delay: 0.8s; font-size: 1.3em; }
.snowflake:nth-child(8) { left: 25%; animation-duration: 10s; animation-delay: 1.8s; font-size: 0.95em; }
.snowflake:nth-child(9) { left: 28%; animation-duration: 12s; animation-delay: 2.2s; font-size: 1.05em; }
.snowflake:nth-child(10) { left: 32%; animation-duration: 11s; animation-delay: 0.3s; font-size: 0.9em; }
.snowflake:nth-child(11) { left: 35%; animation-duration: 9s; animation-delay: 1.3s; font-size: 1.15em; }
.snowflake:nth-child(12) { left: 38%; animation-duration: 13s; animation-delay: 2.8s; font-size: 0.88em; }
.snowflake:nth-child(13) { left: 42%; animation-duration: 10s; animation-delay: 0.6s; font-size: 1.25em; }
.snowflake:nth-child(14) { left: 45%; animation-duration: 12s; animation-delay: 1.6s; font-size: 0.92em; }
.snowflake:nth-child(15) { left: 48%; animation-duration: 8s; animation-delay: 2.6s; font-size: 1.08em; }
.snowflake:nth-child(16) { left: 52%; animation-duration: 14s; animation-delay: 0.4s; font-size: 0.87em; }
.snowflake:nth-child(17) { left: 55%; animation-duration: 11s; animation-delay: 1.4s; font-size: 1.18em; }
.snowflake:nth-child(18) { left: 58%; animation-duration: 9s; animation-delay: 2.4s; font-size: 0.93em; }
.snowflake:nth-child(19) { left: 62%; animation-duration: 13s; animation-delay: 0.7s; font-size: 1.22em; }
.snowflake:nth-child(20) { left: 65%; animation-duration: 10s; animation-delay: 1.7s; font-size: 0.96em; }
.snowflake:nth-child(21) { left: 68%; animation-duration: 12s; animation-delay: 2.7s; font-size: 1.12em; }
.snowflake:nth-child(22) { left: 72%; animation-duration: 11s; animation-delay: 0.2s; font-size: 0.89em; }
.snowflake:nth-child(23) { left: 75%; animation-duration: 9s; animation-delay: 1.2s; font-size: 1.28em; }
.snowflake:nth-child(24) { left: 78%; animation-duration: 13s; animation-delay: 2.9s; font-size: 0.91em; }
.snowflake:nth-child(25) { left: 82%; animation-duration: 10s; animation-delay: 0.9s; font-size: 1.06em; }
.snowflake:nth-child(26) { left: 85%; animation-duration: 12s; animation-delay: 1.9s; font-size: 0.94em; }
.snowflake:nth-child(27) { left: 88%; animation-duration: 8s; animation-delay: 2.3s; font-size: 1.16em; }
.snowflake:nth-child(28) { left: 92%; animation-duration: 14s; animation-delay: 0.1s; font-size: 0.86em; }
.snowflake:nth-child(29) { left: 95%; animation-duration: 11s; animation-delay: 1.1s; font-size: 1.24em; }
.snowflake:nth-child(30) { left: 98%; animation-duration: 9s; animation-delay: 2.1s; font-size: 0.97em; }
.snowflake:nth-child(31) { left: 4%; animation-duration: 13s; animation-delay: 3s; font-size: 1.14em; }
.snowflake:nth-child(32) { left: 10%; animation-duration: 10s; animation-delay: 0.4s; font-size: 0.84em; }
.snowflake:nth-child(33) { left: 16%; animation-duration: 12s; animation-delay: 1.4s; font-size: 1.26em; }
.snowflake:nth-child(34) { left: 20%; animation-duration: 11s; animation-delay: 2.4s; font-size: 0.98em; }
.snowflake:nth-child(35) { left: 26%; animation-duration: 9s; animation-delay: 0.6s; font-size: 1.04em; }
.snowflake:nth-child(36) { left: 30%; animation-duration: 13s; animation-delay: 1.6s; font-size: 0.82em; }
.snowflake:nth-child(37) { left: 36%; animation-duration: 10s; animation-delay: 2.6s; font-size: 1.2em; }
.snowflake:nth-child(38) { left: 40%; animation-duration: 12s; animation-delay: 0.8s; font-size: 0.99em; }
.snowflake:nth-child(39) { left: 46%; animation-duration: 8s; animation-delay: 1.8s; font-size: 1.1em; }
.snowflake:nth-child(40) { left: 50%; animation-duration: 14s; animation-delay: 2.8s; font-size: 0.83em; }
.snowflake:nth-child(41) { left: 56%; animation-duration: 11s; animation-delay: 0.3s; font-size: 1.19em; }
.snowflake:nth-child(42) { left: 60%; animation-duration: 9s; animation-delay: 1.3s; font-size: 0.95em; }
.snowflake:nth-child(43) { left: 66%; animation-duration: 13s; animation-delay: 2.3s; font-size: 1.07em; }
.snowflake:nth-child(44) { left: 70%; animation-duration: 10s; animation-delay: 0.5s; font-size: 0.81em; }
.snowflake:nth-child(45) { left: 76%; animation-duration: 12s; animation-delay: 1.5s; font-size: 1.27em; }
.snowflake:nth-child(46) { left: 80%; animation-duration: 11s; animation-delay: 2.5s; font-size: 1.01em; }
.snowflake:nth-child(47) { left: 86%; animation-duration: 9s; animation-delay: 0.7s; font-size: 1.13em; }
.snowflake:nth-child(48) { left: 90%; animation-duration: 13s; animation-delay: 1.7s; font-size: 0.88em; }
.snowflake:nth-child(49) { left: 96%; animation-duration: 10s; animation-delay: 2.7s; font-size: 1.21em; }
.snowflake:nth-child(50) { left: 99%; animation-duration: 12s; animation-delay: 0.9s; font-size: 0.92em; }

@keyframes fall {
  0% {
    top: -10%;
    opacity: 0.8;
  }
  100% {
    top: 110%;
    opacity: 0.3;
  }
}

/* 移动端减少雪花数量 */
@media (max-width: 768px) {
  .snowflake:nth-child(n+26) {
    display: none;
  }
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
  background: var(--announcement-bg);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid var(--border-color);
  padding: 8px 0;
  position: relative;
  z-index: 998;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  overflow: hidden;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  
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
      background: var(--gradient-primary);
      color: #fff;
      padding: 3px 10px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }
    
    .announcement-text {
      color: var(--announcement-text);
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
  background: var(--gradient-primary);
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
