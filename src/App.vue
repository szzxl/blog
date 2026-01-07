<template>
  <div id="app" :class="themeClass">
    <Header />
    <ThemeSwitch />
    <MusicPlayer />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import ThemeSwitch from './components/ThemeSwitch.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()
const themeClass = computed(() => `theme-${themeStore.currentTheme}`)
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background 0.5s ease;
}

.theme-girl {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  background-attachment: fixed;
}

.theme-boy {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
}

.theme-it {
  background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
  background-attachment: fixed;
}

.theme-finance {
  background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
  background-attachment: fixed;
}

.theme-mom {
  background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
  background-attachment: fixed;
}

.main-content {
  flex: 1;
}
</style>
