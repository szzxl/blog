<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">😢</div>
      <h2 class="error-title">哎呀，出错了</h2>
      <p class="error-message">{{ error.message }}</p>
      <div class="error-actions">
        <button class="retry-btn" @click="handleRetry">
          <span class="btn-icon">🔄</span>
          重试
        </button>
        <button class="home-btn" @click="goHome">
          <span class="btn-icon">🏠</span>
          返回首页
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  console.error('Component error:', err)
  return false
})

const handleRetry = () => {
  error.value = null
}

const goHome = () => {
  error.value = null
  router.push('/')
}
</script>

<style scoped lang="scss">
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .error-content {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 25px;
    padding: 60px 40px;
    text-align: center;
    max-width: 500px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    
    @media (max-width: 768px) {
      padding: 40px 30px;
    }
    
    .error-icon {
      font-size: 80px;
      margin-bottom: 20px;
      animation: shake 0.5s ease-in-out;
      
      @media (max-width: 768px) {
        font-size: 60px;
      }
    }
    
    .error-title {
      font-size: 28px;
      color: #333;
      margin-bottom: 15px;
      font-weight: 700;
      
      @media (max-width: 768px) {
        font-size: 24px;
      }
    }
    
    .error-message {
      font-size: 16px;
      color: #666;
      margin-bottom: 30px;
      line-height: 1.6;
      
      @media (max-width: 768px) {
        font-size: 14px;
      }
    }
    
    .error-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      
      @media (max-width: 768px) {
        flex-direction: column;
      }
      
      button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 28px;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        
        @media (max-width: 768px) {
          width: 100%;
          justify-content: center;
          padding: 14px 28px;
        }
        
        .btn-icon {
          font-size: 18px;
        }
        
        &.retry-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          }
        }
        
        &.home-btn {
          background: #fff;
          color: #667eea;
          border: 2px solid #667eea;
          
          &:hover {
            background: #667eea;
            color: #fff;
            transform: translateY(-2px);
          }
        }
        
        &:active {
          transform: translateY(0);
        }
      }
    }
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}
</style>
