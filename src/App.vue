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

      <!-- 回到顶部火箭 -->
      <div class="rocket-wrap" :class="{ show: showBackToTop }" @click="scrollToTop" title="回到顶部">
        <div class="rocket">
          <div class="rocket-nose"></div>
          <div class="rocket-body">
            <div class="rocket-window"></div>
          </div>
          <div class="rocket-fins">
            <div class="fin fin-left"></div>
            <div class="fin fin-right"></div>
          </div>
          <div class="rocket-nozzle"></div>
          <div class="rocket-flame">
            <div class="flame flame-1"></div>
            <div class="flame flame-2"></div>
            <div class="flame flame-3"></div>
          </div>
        </div>
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

/* ── 火箭回到顶部 ── */
.rocket-wrap {
  position: fixed;
  bottom: 36px;
  right: 36px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #3a2fff, #1a0a8a);
  box-shadow: 0 0 18px rgba(80, 60, 255, 0.55);
  cursor: pointer;
  z-index: 997;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: opacity 0.35s, visibility 0.35s, transform 0.35s, box-shadow 0.35s;

  &.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  &:hover {
    box-shadow: 0 0 28px rgba(100, 80, 255, 0.8);
    transform: translateY(-8px);

    .rocket {
      animation: rocket-fly 0.6s ease-in-out infinite alternate;
    }

    .flame-1 { animation-duration: 0.3s; }
    .flame-2 { animation-duration: 0.4s; }
    .flame-3 { animation-duration: 0.25s; }
  }
}

.rocket {
  position: relative;
  width: 22px;
  height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 4px;
}

/* 鼻锥 */
.rocket-nose {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 14px solid #ff6b35;
  filter: drop-shadow(0 0 3px rgba(255,107,53,0.6));
}

/* 机身 */
.rocket-body {
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 50%, #e8401a 100%);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 舷窗 */
.rocket-window {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #aee8ff, #3fc4ff);
  box-shadow: 0 0 4px rgba(63,196,255,0.8);
}

/* 翼 */
.rocket-fins {
  position: relative;
  width: 16px;
  height: 8px;
}

.fin {
  position: absolute;
  top: 0;
  width: 0;
  height: 0;
  border-top: 8px solid #e8401a;
}
.fin-left {
  left: -7px;
  border-right: 7px solid #e8401a;
  border-left: 4px solid transparent;
}
.fin-right {
  right: -7px;
  border-left: 7px solid #e8401a;
  border-right: 4px solid transparent;
}

/* 喷嘴 */
.rocket-nozzle {
  width: 10px;
  height: 5px;
  background: linear-gradient(to bottom, #aaa, #666);
  border-radius: 0 0 4px 4px;
}

/* 火焰 */
.rocket-flame {
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
  align-items: flex-start;
}

.flame {
  border-radius: 50% 50% 30% 30%;
  animation: flicker 0.5s ease-in-out infinite alternate;
}

.flame-1 {
  width: 6px; height: 14px;
  background: linear-gradient(to top, #fff5a0, #ffb300, #ff4d00);
  animation-duration: 0.35s;
}
.flame-2 {
  width: 8px; height: 18px;
  background: linear-gradient(to top, #fff, #ffe066, #ff6a00, #e8001a);
  margin-top: -4px;
  animation-duration: 0.45s;
  animation-delay: 0.1s;
}
.flame-3 {
  width: 6px; height: 14px;
  background: linear-gradient(to top, #fff5a0, #ffb300, #ff4d00);
  animation-duration: 0.3s;
  animation-delay: 0.05s;
}

@keyframes flicker {
  0%   { transform: scaleX(1)   scaleY(1);    opacity: 1; }
  100% { transform: scaleX(0.8) scaleY(1.12); opacity: 0.85; }
}

@keyframes rocket-fly {
  from { transform: translateY(0); }
  to   { transform: translateY(-4px); }
}

@media (max-width: 768px) {
  .rocket-wrap {
    bottom: 20px;
    right: 20px;
    width: 46px;
    height: 46px;
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
