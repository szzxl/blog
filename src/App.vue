<template>
  <el-config-provider :locale="zhCn">
    <ErrorBoundary>
      <div class="site-shell">
        <a class="skip-link" href="#main-content">跳到正文</a>
        <Header />
        <SearchOverlay />
        <main id="main-content" class="main-content" tabindex="-1"><router-view /></main>
        <button
          v-show="showBackToTop"
          class="back-top-btn"
          @click="scrollToTop"
          aria-label="回到顶部"
          title="回到顶部"
        >
          ↑
        </button>
        <Footer />
      </div>
    </ErrorBoundary>
  </el-config-provider>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import SearchOverlay from './components/SearchOverlay.vue'
import { fetchWebsiteConfigWithCache, useWebsiteConfigRefresh } from '@/utils/websiteConfig'
import { setSiteName, resetSeo } from '@/composables/useSeo'

const route = useRoute()
const showBackToTop = ref(false)

const fetchWebsiteConfig = async () => {
  try {
    const config = await fetchWebsiteConfigWithCache()
    if (config.site_name) setSiteName(config.site_name)
    if (route.name === 'home') document.title = config.seo_title || config.site_name || '时光博客'
    else if (route.meta.title) resetSeo(route.meta.title as string)
  } catch {
    // 静默失败
  }
}

let scrollRaf: number | null = null

const handleScroll = () => {
  if (scrollRaf !== null) return
  scrollRaf = requestAnimationFrame(() => {
    showBackToTop.value = window.scrollY > 300
    scrollRaf = null
  })
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
  })
}

useWebsiteConfigRefresh(() => {
  void fetchWebsiteConfig()
})
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  fetchWebsiteConfig()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (scrollRaf !== null) cancelAnimationFrame(scrollRaf)
})
</script>
<style>
.site-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex: 1;
  min-width: 0;
}
.skip-link {
  position: fixed;
  top: -80px;
  left: 16px;
  background: var(--bg-card);
  padding: 10px 18px;
  z-index: 3000;
}
.skip-link:focus {
  top: 12px;
}
.back-top-btn {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--bg-card);
  color: var(--color-accent);
  font-size: 21px;
  z-index: 10;
}
@media (max-width: 760px) {
  .back-top-btn {
    right: 16px;
    bottom: 82px;
  }
}
</style>
