<template>
  <ErrorBoundary>
    <div id="app">
      <!-- 全局枫叶飘落 -->
      <div class="leaves-container" aria-hidden="true">
        <div v-for="(lf, i) in leafData" :key="i" class="leaf-wrap" :style="lf.wrap">
          <div class="leaf-sway" :style="lf.sway">
            <span class="leaf-spin" :style="lf.spin">🍁</span>
          </div>
        </div>
      </div>

      <Header />
      <SearchOverlay />

      <!-- 回到顶部 -->
      <div class="back-top-btn" :class="{ show: showBackToTop }" @click="scrollToTop" title="回到顶部">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C9.5 6 8 10.5 8 14a4 4 0 008 0c0-3.5-1.5-8-4-12z" fill="white"/>
          <path d="M9 16.5L6.5 21 10 20M15 16.5L17.5 21 14 20" fill="rgba(255,255,255,0.75)"/>
          <circle cx="12" cy="12" r="2" fill="rgba(22,93,255,0.55)"/>
          <circle cx="12" cy="20.5" r="1.2" fill="rgba(255,255,255,0.85)"/>
          <circle cx="10.5" cy="21.5" r="0.8" fill="rgba(255,255,255,0.6)"/>
          <circle cx="13.5" cy="21.5" r="0.8" fill="rgba(255,255,255,0.6)"/>
        </svg>
      </div>

      <main class="main-content" :class="{ 'no-padding': isHome }">
        <router-view />
      </main>
      <Footer />
    </div>
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const rnd = (min: number, max: number) => Math.random() * (max - min) + min
const LEAF_FILTERS = [
  'hue-rotate(-20deg) saturate(1.8) brightness(0.85)',
  'hue-rotate(-10deg) saturate(1.6) brightness(0.9)',
  'hue-rotate(0deg)   saturate(1.4) brightness(1.0)',
  'hue-rotate(12deg)  saturate(1.3) brightness(1.05)',
  'hue-rotate(25deg)  saturate(1.2) brightness(1.1)',
]
const leafData = Array.from({ length: 45 }, () => {
  const fallDur   = rnd(5, 10).toFixed(1) + 's'
  const fallDelay = '-' + rnd(0, 12).toFixed(1) + 's'
  const swayDur   = rnd(2, 4).toFixed(1) + 's'
  const swayAmp   = rnd(25, 65).toFixed(0) + 'px'
  const spinDur   = rnd(3, 8).toFixed(1) + 's'
  const spinDir   = Math.random() < 0.5 ? 'normal' : 'reverse'
  const size      = rnd(13, 26).toFixed(0) + 'px'
  const opacity   = rnd(0.5, 0.85).toFixed(2)
  const left      = rnd(0, 100).toFixed(1) + '%'
  return {
    wrap: { left, '--fall-dur': fallDur, '--fall-delay': fallDelay },
    sway: { '--sway-dur': swayDur, '--sway-amp': swayAmp },
    spin: { fontSize: size, opacity, '--spin-dur': spinDur, '--spin-dir': spinDir, '--leaf-filter': LEAF_FILTERS[Math.floor(Math.random() * LEAF_FILTERS.length)] },
  }
})
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import SearchOverlay from './components/SearchOverlay.vue'
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

/* ── 回到顶部 ── */
.back-top-btn {
  position: fixed;
  bottom: 36px;
  right: 36px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
  box-shadow: 0 4px 16px rgba(22, 93, 255, 0.32);
  cursor: pointer;
  z-index: 997;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transform: translateY(16px);
  transition: opacity 0.3s, visibility 0.3s, transform 0.3s, box-shadow 0.3s;

  svg {
    width: 22px;
    height: 22px;
    transition: transform 0.3s ease;
  }

  &.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  &:hover {
    box-shadow: 0 8px 28px rgba(22, 93, 255, 0.48);
    transform: translateY(-5px);

    svg { animation: rocket-boost 0.55s ease-in-out infinite alternate; }
  }
}

@keyframes rocket-boost {
  from { transform: translateY(0); }
  to   { transform: translateY(-3px); }
}

@media (max-width: 768px) {
  .back-top-btn {
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }
}

/* ── 全局枫叶飘落 ── */
.leaves-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.leaf-wrap {
  position: absolute;
  top: -40px;
  animation: leaf-fall var(--fall-dur) linear var(--fall-delay) infinite;
  will-change: transform;
}

.leaf-sway {
  animation: leaf-sway var(--sway-dur) ease-in-out infinite alternate;
  will-change: transform;
}

.leaf-spin {
  display: block;
  line-height: 1;
  filter: var(--leaf-filter, none);
  animation: leaf-spin var(--spin-dur) linear infinite;
  animation-direction: var(--spin-dir, normal);
  will-change: transform;
}

@keyframes leaf-fall {
  from { transform: translateY(-40px); }
  to   { transform: translateY(110vh); }
}

@keyframes leaf-sway {
  from { transform: translateX(calc(-1 * var(--sway-amp))); }
  to   { transform: translateX(var(--sway-amp)); }
}

@keyframes leaf-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
