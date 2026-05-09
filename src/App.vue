<template>
  <ErrorBoundary>
    <div id="app">
      <Header />

      <!-- 回到顶部 -->
      <button class="back-to-top" :class="{ show: showBackToTop }" @click="scrollToTop" title="回到顶部">
        <el-icon :size="20"><Top /></el-icon>
      </button>

      <main class="main-content" :class="{ 'no-padding': isHome }">
        <router-view />
      </main>
      <Footer />
    </div>
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Top } from '@element-plus/icons-vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import { fetchWebsiteConfigWithCache } from '@/utils/websiteConfig'

const route = useRoute()
const showBackToTop = ref(false)
const isHome = computed(() => route.path === '/')

const fetchWebsiteConfig = async () => {
  try {
    const config = await fetchWebsiteConfigWithCache()
    if (config.seo_title) {
      document.title = config.seo_title
    }
  } catch {
    // 静默失败
  }
}

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
  background: var(--bg-primary);
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  padding-top: 64px;

  &.no-padding {
    padding-top: 0;
  }
}

.back-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  z-index: 997;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transform: translateY(12px);
  transition: all 0.2s ease;

  &.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  &:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
    box-shadow: var(--shadow-glow);
  }
}

@media (max-width: 768px) {
  .back-to-top {
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
  }
}
</style>
