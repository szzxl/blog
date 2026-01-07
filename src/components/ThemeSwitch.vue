<template>
  <div class="theme-switch">
    <el-select 
      v-model="themeStore.currentTheme" 
      @change="handleChange"
      class="theme-selector"
      size="large"
    >
      <el-option
        v-for="theme in themes"
        :key="theme.value"
        :label="theme.label"
        :value="theme.value"
      >
        <span class="theme-option">
          <span class="theme-icon">{{ theme.icon }}</span>
          <span class="theme-name">{{ theme.label }}</span>
        </span>
      </el-option>
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import type { ThemeType } from '@/stores/theme'

const themeStore = useThemeStore()

const themes = [
  { value: 'girl' as ThemeType, label: '女生版', icon: '🌸' },
  { value: 'boy' as ThemeType, label: '男生版', icon: '⚡' },
  { value: 'it' as ThemeType, label: 'IT版', icon: '💻' },
  { value: 'finance' as ThemeType, label: '金融版', icon: '💰' },
  { value: 'mom' as ThemeType, label: '宝妈版', icon: '👶' }
]

const handleChange = (value: ThemeType) => {
  themeStore.setTheme(value)
}
</script>

<style scoped lang="scss">
.theme-switch {
  position: fixed;
  top: 90px;
  right: 30px;
  z-index: 1000;
  
  .theme-selector {
    width: 140px;
    
    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      border-radius: 25px;
      padding: 8px 15px;
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
      }
    }
    
    :deep(.el-input__inner) {
      font-weight: 600;
      color: #5a5a5a;
    }
  }
  
  .theme-option {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .theme-icon {
      font-size: 18px;
    }
    
    .theme-name {
      font-size: 14px;
    }
  }
}

@media (max-width: 768px) {
  .theme-switch {
    top: 80px;
    right: 15px;
    
    .theme-selector {
      width: 120px;
    }
  }
}
</style>
