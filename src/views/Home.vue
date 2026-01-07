<template>
  <div class="home">
    <div class="carousel-wrapper">
      <Carousel />
    </div>
    
    <div class="container">
      <div class="section-header">
        <div class="section-icon">💌</div>
        <div class="section-text">
          <h2>最新文章</h2>
          <p>记录生活中的小确幸</p>
        </div>
      </div>
      
      <div class="article-grid">
        <div class="article-card card" v-for="i in 6" :key="i">
          <div class="article-badge">NEW</div>
          <div class="article-cover">
            <img src="https://via.placeholder.com/400x200/fecfef/ffffff?text=♡" alt="文章封面">
            <div class="cover-overlay">
              <span class="read-more">阅读全文 →</span>
            </div>
          </div>
          <div class="article-info">
            <h3 class="article-title">✨ 这是一篇温柔的文章标题</h3>
            <p class="article-desc">记录今天的美好时光，分享生活中的小确幸和温暖瞬间...</p>
            <div class="article-meta">
              <span class="meta-item">
                <span class="icon">📅</span>
                2024-01-06
              </span>
              <span class="meta-item">
                <span class="icon">💗</span>
                123
              </span>
              <span class="meta-item">
                <span class="icon">💬</span>
                5
              </span>
            </div>
            <div class="article-tags">
              <span class="tag-item">🌸 日常</span>
              <span class="tag-item">💕 心情</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Carousel from '@/components/Carousel.vue'
</script>

<style scoped lang="scss">
.home {
  min-height: calc(100vh - 200px);
  position: relative;
  
  .carousel-wrapper {
    position: relative;
    z-index: 1;
    isolation: isolate;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 30px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 50px;
  
  .section-icon {
    font-size: 50px;
    animation: bounce 2s ease-in-out infinite;
  }
  
  .section-text {
    h2 {
      font-size: 36px;
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 5px;
      font-weight: 700;
    }
    
    p {
      color: #999;
      font-size: 16px;
    }
  }
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 40px;
}

.article-card {
  overflow: visible;
  cursor: pointer;
  position: relative;
  
  .article-badge {
    position: absolute;
    top: -10px;
    right: -10px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff9a9e 100%);
    color: #fff;
    padding: 5px 15px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
    z-index: 10;
    animation: pulse 2s ease-in-out infinite;
  }
  
  .article-cover {
    position: relative;
    width: 100%;
    height: 220px;
    overflow: hidden;
    border-radius: 20px;
    margin-bottom: 20px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
    
    .cover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(255, 154, 158, 0.85) 0%, rgba(254, 207, 239, 0.85) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
      
      .read-more {
        color: #fff;
        font-size: 18px;
        font-weight: 700;
        transform: translateY(10px);
        transition: transform 0.3s;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      }
    }
  }
  
  &:hover .article-cover {
    img {
      transform: scale(1.15) rotate(2deg);
    }
    
    .cover-overlay {
      opacity: 1;
      
      .read-more {
        transform: translateY(0);
      }
    }
  }
  
  .article-info {
    .article-title {
      font-size: 20px;
      color: #5a5a5a;
      margin-bottom: 12px;
      font-weight: 700;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .article-desc {
      color: #888;
      font-size: 14px;
      line-height: 1.8;
      margin-bottom: 18px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .article-meta {
      display: flex;
      gap: 20px;
      margin-bottom: 18px;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #aaa;
        
        .icon {
          font-size: 14px;
        }
      }
    }
    
    .article-tags {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      
      .tag-item {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        color: #fff;
        padding: 6px 15px;
        border-radius: 15px;
        font-size: 12px;
        box-shadow: 0 3px 10px rgba(255, 154, 158, 0.3);
        font-weight: 600;
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    text-align: center;
    
    .section-text h2 {
      font-size: 28px;
    }
  }
  
  .article-grid {
    grid-template-columns: 1fr;
  }
}
</style>
