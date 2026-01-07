<template>
  <div class="carousel">
    <el-carousel :interval="5000" height="550px" arrow="always" indicator-position="outside">
      <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
        <div class="carousel-item" :style="{ backgroundImage: `url(${item.image})` }">
          <div class="carousel-overlay"></div>
          <div class="carousel-content">
            <div class="content-decoration">
              <span class="deco-icon">{{ item.icon }}</span>
            </div>
            <h2 class="carousel-title">{{ item.title }}</h2>
            <p class="carousel-desc">{{ item.desc }}</p>
            <div class="carousel-tags">
              <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <el-button type="primary" size="large" round class="carousel-btn">
              {{ item.buttonText }}
            </el-button>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
const carouselItems = [
  {
    image: 'https://via.placeholder.com/1200x550/fecfef/ffffff?text=Welcome',
    icon: '🌸',
    title: '欢迎来到我的小世界',
    desc: '在这里记录生活的美好瞬间，分享温暖的故事',
    tags: ['生活', '记录', '分享'],
    buttonText: '开始阅读'
  },
  {
    image: 'https://via.placeholder.com/1200x550/ffd0d0/ffffff?text=Share',
    icon: '💕',
    title: '分享生活中的小确幸',
    desc: '用文字和图片记录每一个值得珍藏的时刻',
    tags: ['日常', '心情', '美好'],
    buttonText: '查看更多'
  },
  {
    image: 'https://via.placeholder.com/1200x550/ffe8f0/ffffff?text=Dream',
    icon: '✨',
    title: '追逐梦想的旅程',
    desc: '每一步都值得被记录，每一天都充满希望',
    tags: ['梦想', '成长', '努力'],
    buttonText: '了解详情'
  }
]
</script>

<style scoped lang="scss">
.carousel {
  width: 100%;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 15px 50px rgba(252, 182, 159, 0.3);
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
  isolation: isolate;
  
  :deep(.el-carousel) {
    border-radius: 30px;
    position: relative;
    z-index: 1;
    
    .el-carousel__container {
      position: relative;
      z-index: 1;
    }
    
    .el-carousel__arrow {
      z-index: 2;
    }
    
    .el-carousel__indicator {
      button {
        background: rgba(255, 255, 255, 0.5);
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
      
      &.is-active button {
        background: #ff9a9e;
        width: 30px;
        border-radius: 6px;
      }
    }
  }
  
  .carousel-item {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    .carousel-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(255, 154, 158, 0.7) 0%, rgba(254, 207, 239, 0.7) 100%);
    }
    
    .carousel-content {
      position: relative;
      z-index: 2;
      text-align: center;
      color: #fff;
      padding: 40px;
      max-width: 800px;
      
      .content-decoration {
        margin-bottom: 20px;
        
        .deco-icon {
          font-size: 80px;
          display: inline-block;
          animation: bounce 2s ease-in-out infinite;
          filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3));
        }
      }
      
      .carousel-title {
        font-size: 52px;
        margin-bottom: 25px;
        font-weight: 800;
        text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        animation: fadeInUp 0.8s ease;
        letter-spacing: 2px;
      }
      
      .carousel-desc {
        font-size: 22px;
        margin-bottom: 30px;
        opacity: 0.95;
        animation: fadeInUp 0.8s ease 0.2s both;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        line-height: 1.6;
      }
      
      .carousel-tags {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-bottom: 35px;
        animation: fadeInUp 0.8s ease 0.3s both;
        
        .tag {
          background: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          padding: 10px 25px;
          border-radius: 25px;
          font-size: 15px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          transition: all 0.3s;
          
          &:hover {
            background: rgba(255, 255, 255, 0.5);
            transform: translateY(-3px);
          }
        }
      }
      
      .carousel-btn {
        animation: fadeInUp 0.8s ease 0.5s both;
        background: #fff;
        color: #ff9a9e;
        border: none;
        padding: 15px 40px;
        font-size: 16px;
        font-weight: 700;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        
        &:hover {
          background: #ff9a9e;
          color: #fff;
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
        }
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@media (max-width: 768px) {
  .carousel {
    border-radius: 20px;
    
    :deep(.el-carousel) {
      height: 450px !important;
    }
    
    .carousel-item {
      .carousel-content {
        padding: 20px;
        
        .content-decoration .deco-icon {
          font-size: 50px;
        }
        
        .carousel-title {
          font-size: 32px !important;
        }
        
        .carousel-desc {
          font-size: 16px !important;
        }
        
        .carousel-tags {
          flex-wrap: wrap;
          
          .tag {
            font-size: 13px;
            padding: 8px 18px;
          }
        }
      }
    }
  }
}
</style>
