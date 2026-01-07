<template>
  <div class="carousel">
    <el-carousel :interval="4000" height="500px" arrow="always">
      <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
        <div class="carousel-item" :style="{ backgroundImage: `url(${item.image})` }">
          <div class="carousel-content">
            <h2 class="carousel-title">{{ item.title }}</h2>
            <p class="carousel-desc">{{ item.desc }}</p>
            <el-button type="primary" size="large" round>
              {{ item.buttonText }}
            </el-button>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const carouselData = {
  girl: [
    {
      image: 'https://via.placeholder.com/1200x500/fecfef/ffffff?text=Welcome',
      title: '✨ 欢迎来到我的小世界',
      desc: '记录美好生活的每一刻',
      buttonText: '开始阅读'
    },
    {
      image: 'https://via.placeholder.com/1200x500/ffd0d0/ffffff?text=Share',
      title: '💕 分享生活中的小确幸',
      desc: '用文字温暖彼此的心',
      buttonText: '查看更多'
    },
    {
      image: 'https://via.placeholder.com/1200x500/ffe8f0/ffffff?text=Dream',
      title: '🌸 追逐梦想的旅程',
      desc: '每一步都值得被记录',
      buttonText: '了解详情'
    }
  ],
  boy: [
    {
      image: 'https://via.placeholder.com/1200x500/667eea/ffffff?text=Tech',
      title: '⚡ 探索技术的无限可能',
      desc: '用代码改变世界',
      buttonText: '开始探索'
    },
    {
      image: 'https://via.placeholder.com/1200x500/764ba2/ffffff?text=Code',
      title: '💻 分享编程经验',
      desc: '记录成长的每一步',
      buttonText: '查看文章'
    },
    {
      image: 'https://via.placeholder.com/1200x500/5a67d8/ffffff?text=Learn',
      title: '🚀 持续学习，不断进步',
      desc: '技术之路永无止境',
      buttonText: '了解更多'
    }
  ],
  it: [
    {
      image: 'https://via.placeholder.com/1200x500/00d4ff/ffffff?text=IT',
      title: '💻 IT技术分享平台',
      desc: '深入浅出，技术干货',
      buttonText: '开始学习'
    },
    {
      image: 'https://via.placeholder.com/1200x500/0099ff/ffffff?text=Code',
      title: '🔧 实战项目经验',
      desc: '从理论到实践的完整指南',
      buttonText: '查看项目'
    },
    {
      image: 'https://via.placeholder.com/1200x500/0066cc/ffffff?text=Tech',
      title: '🚀 前沿技术探索',
      desc: '紧跟技术潮流，持续创新',
      buttonText: '探索更多'
    }
  ],
  finance: [
    {
      image: 'https://via.placeholder.com/1200x500/ffd700/ffffff?text=Finance',
      title: '💰 财富管理智慧',
      desc: '理性投资，稳健增值',
      buttonText: '了解更多'
    },
    {
      image: 'https://via.placeholder.com/1200x500/ffb700/ffffff?text=Investment',
      title: '📈 投资理财指南',
      desc: '专业分析，精准决策',
      buttonText: '查看分析'
    },
    {
      image: 'https://via.placeholder.com/1200x500/ff9500/ffffff?text=Wealth',
      title: '💎 财富自由之路',
      desc: '科学规划，实现目标',
      buttonText: '开始规划'
    }
  ],
  mom: [
    {
      image: 'https://via.placeholder.com/1200x500/ffb6c1/ffffff?text=Mom',
      title: '👶 宝妈成长日记',
      desc: '记录宝宝成长的每一刻',
      buttonText: '查看日记'
    },
    {
      image: 'https://via.placeholder.com/1200x500/ffc0cb/ffffff?text=Baby',
      title: '🍼 育儿经验分享',
      desc: '科学育儿，快乐成长',
      buttonText: '学习经验'
    },
    {
      image: 'https://via.placeholder.com/1200x500/ffd0e0/ffffff?text=Family',
      title: '💕 温馨家庭时光',
      desc: '陪伴是最长情的告白',
      buttonText: '了解更多'
    }
  ]
}

const carouselItems = computed(() => {
  return carouselData[themeStore.currentTheme] || carouselData.girl
})
</script>

<style scoped lang="scss">
.carousel {
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  
  :deep(.el-carousel) {
    border-radius: 20px;
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
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
    }
    
    .carousel-content {
      position: relative;
      z-index: 2;
      text-align: center;
      color: #fff;
      padding: 20px;
      
      .carousel-title {
        font-size: 48px;
        margin-bottom: 20px;
        font-weight: 700;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        animation: fadeInUp 0.8s ease;
      }
      
      .carousel-desc {
        font-size: 20px;
        margin-bottom: 30px;
        opacity: 0.95;
        animation: fadeInUp 0.8s ease 0.2s both;
      }
      
      .el-button {
        animation: fadeInUp 0.8s ease 0.4s both;
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .carousel {
    :deep(.el-carousel) {
      height: 350px !important;
    }
    
    .carousel-item {
      .carousel-content {
        .carousel-title {
          font-size: 28px !important;
        }
        
        .carousel-desc {
          font-size: 16px !important;
        }
      }
    }
  }
}
</style>
