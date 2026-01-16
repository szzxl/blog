<template>
  <div class="about">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-icon">🦋</div>
        <div class="header-text">
          <h1>关于我</h1>
          <p>Hi~ 很高兴认识你</p>
        </div>
      </div>
      
      <!-- 空状态提示 -->
      <div class="empty-state card">
        <div class="empty-icon">✨</div>
        <p class="empty-text">内容正在准备中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.about {
  min-height: calc(100vh - 200px);
  padding: 40px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 30px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  
  .header-icon {
    font-size: 60px;
    animation: flutter 3s ease-in-out infinite;
  }
  
  .header-text {
    h1 {
      font-size: 42px;
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 8px 0;
      font-weight: 700;
    }
    
    p {
      font-size: 16px;
      color: #999;
      margin: 0;
    }
  }
}

.empty-state {
  padding: 100px 50px;
  text-align: center;
  
  .empty-icon {
    font-size: 80px;
    margin-bottom: 20px;
    opacity: 0.6;
    animation: float 3s ease-in-out infinite;
  }
  
  .empty-text {
    font-size: 18px;
    color: #999;
    margin: 0;
  }
}

@keyframes flutter {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(-5deg);
  }
  75% {
    transform: translateY(-5px) rotate(5deg);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
    
    .header-text h1 {
      font-size: 32px;
    }
  }
  
  .empty-state {
    padding: 80px 30px;
    
    .empty-icon {
      font-size: 60px;
    }
    
    .empty-text {
      font-size: 16px;
    }
  }
}
</style>
