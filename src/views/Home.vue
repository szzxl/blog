<template>
  <div class="home">
    <Carousel />
    
    <div class="container">
      <div class="section-header">
        <h2>{{ sectionTitle }}</h2>
        <p>{{ sectionDesc }}</p>
      </div>
      
      <div class="article-grid">
        <div class="article-card card" v-for="i in 6" :key="i">
          <div class="article-cover">
            <img :src="coverImage" alt="文章封面">
            <div class="cover-overlay">
              <span class="read-more">阅读全文 →</span>
            </div>
          </div>
          <div class="article-info">
            <h3 class="article-title">{{ articleTitle }}</h3>
            <p class="article-desc">{{ articleDesc }}</p>
            <div class="article-meta">
              <span class="meta-item">
                <span class="icon">📅</span>
                2024-01-06
              </span>
              <span class="meta-item">
                <span class="icon">{{ likeIcon }}</span>
                123
              </span>
              <span class="meta-item">
                <span class="icon">💬</span>
                5
              </span>
            </div>
            <div class="article-tags">
              <span class="tag-item" v-for="tag in tags" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Carousel from '@/components/Carousel.vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const themeConfig = {
  girl: {
    sectionTitle: '💌 最新文章',
    sectionDesc: '记录生活中的小确幸',
    coverImage: 'https://via.placeholder.com/400x200/fecfef/ffffff?text=♡',
    articleTitle: '✨ 这是一篇温柔的文章标题',
    articleDesc: '记录今天的美好时光，分享生活中的小确幸和温暖瞬间...',
    likeIcon: '💗',
    tags: ['🌸 日常', '💕 心情']
  },
  boy: {
    sectionTitle: '📝 最新文章',
    sectionDesc: '记录学习与成长的点滴',
    coverImage: 'https://via.placeholder.com/400x200/667eea/ffffff?text=Article',
    articleTitle: '💻 这是一篇技术文章标题',
    articleDesc: '深入探讨技术原理，分享开发经验和最佳实践...',
    likeIcon: '👍',
    tags: ['💻 Vue', '⚡ TypeScript']
  },
  it: {
    sectionTitle: '💻 技术文章',
    sectionDesc: '分享IT技术干货与实战经验',
    coverImage: 'https://via.placeholder.com/400x200/00d4ff/ffffff?text=Tech',
    articleTitle: '🔧 深入理解前端架构设计',
    articleDesc: '从零到一构建企业级前端应用，探讨架构设计的最佳实践...',
    likeIcon: '👍',
    tags: ['💻 前端', '🔧 架构']
  },
  finance: {
    sectionTitle: '📊 财经分析',
    sectionDesc: '专业投资理财知识分享',
    coverImage: 'https://via.placeholder.com/400x200/ffd700/ffffff?text=Finance',
    articleTitle: '💰 2024年投资策略分析',
    articleDesc: '深度解析市场趋势，提供专业的投资建议和风险控制策略...',
    likeIcon: '📈',
    tags: ['💰 投资', '📈 理财']
  },
  mom: {
    sectionTitle: '👶 育儿日记',
    sectionDesc: '记录宝宝成长的温馨时刻',
    coverImage: 'https://via.placeholder.com/400x200/ffb6c1/ffffff?text=Baby',
    articleTitle: '🍼 宝宝成长的第一年',
    articleDesc: '记录宝宝从出生到一岁的成长历程，分享育儿心得和温馨瞬间...',
    likeIcon: '💗',
    tags: ['👶 育儿', '💕 成长']
  }
}

const config = computed(() => themeConfig[themeStore.currentTheme])
const sectionTitle = computed(() => config.value.sectionTitle)
const sectionDesc = computed(() => config.value.sectionDesc)
const coverImage = computed(() => config.value.coverImage)
const articleTitle = computed(() => config.value.articleTitle)
const articleDesc = computed(() => config.value.articleDesc)
const likeIcon = computed(() => config.value.likeIcon)
const tags = computed(() => config.value.tags)
</script>

<style scoped lang="scss">
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
  
  h2 {
    font-size: 36px;
    margin-bottom: 10px;
    font-weight: 700;
  }
  
  p {
    color: #999;
    font-size: 16px;
  }
}

.theme-girl {
  .section-header h2 {
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .article-tags .tag-item {
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    box-shadow: 0 3px 10px rgba(255, 154, 158, 0.3);
  }
  
  .article-cover .cover-overlay {
    background: linear-gradient(135deg, rgba(255, 154, 158, 0.8) 0%, rgba(254, 207, 239, 0.8) 100%);
  }
}

.theme-boy {
  .section-header h2 {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .article-tags .tag-item {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
  }
  
  .article-cover .cover-overlay {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
  }
}

.theme-it {
  .section-header h2 {
    background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .article-tags .tag-item {
    background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
    box-shadow: 0 3px 10px rgba(0, 212, 255, 0.3);
  }
  
  .article-cover .cover-overlay {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.8) 0%, rgba(0, 153, 255, 0.8) 100%);
  }
}

.theme-finance {
  .section-header h2 {
    background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .article-tags .tag-item {
    background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
    box-shadow: 0 3px 10px rgba(255, 215, 0, 0.3);
  }
  
  .article-cover .cover-overlay {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.8) 0%, rgba(255, 149, 0, 0.8) 100%);
  }
}

.theme-mom {
  .section-header h2 {
    background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .article-tags .tag-item {
    background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
    box-shadow: 0 3px 10px rgba(255, 182, 193, 0.3);
  }
  
  .article-cover .cover-overlay {
    background: linear-gradient(135deg, rgba(255, 182, 193, 0.8) 0%, rgba(255, 192, 203, 0.8) 100%);
  }
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 35px;
}

.article-card {
  overflow: hidden;
  cursor: pointer;
  
  .article-cover {
    position: relative;
    width: 100%;
    height: 220px;
    overflow: hidden;
    border-radius: 15px;
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
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
      
      .read-more {
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        transform: translateY(10px);
        transition: transform 0.3s;
      }
    }
  }
  
  &:hover .article-cover {
    img {
      transform: scale(1.1);
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
      font-weight: 600;
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
        color: #fff;
        padding: 6px 15px;
        border-radius: 15px;
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 768px) {
  .article-grid {
    grid-template-columns: 1fr;
  }
}
</style>
