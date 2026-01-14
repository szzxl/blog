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
      
      <div class="article-grid" v-loading="loading">
        <div class="article-card card" v-for="article in articles" :key="article.id" @click="viewArticle(article.id)">
          <div class="article-badge">NEW</div>
          <div class="article-cover">
            <img :src="article.articleCover || '/web/default-cover.svg'" alt="文章封面">
            <div class="cover-overlay">
              <span class="read-more">阅读全文 →</span>
            </div>
          </div>
          <div class="article-info">
            <h3 class="article-title">✨ {{ article.articleName }}</h3>
            <p class="article-desc" v-if="article.articleCategory">
              <span class="category-badge">📂 {{ article.articleCategory }}</span>
            </p>
            <div class="article-meta">
              <span class="meta-item">
                <span class="icon">📅</span>
                {{ formatTime(article.createTime) }}
              </span>
              <span class="meta-item" v-if="article.readNum !== undefined">
                <span class="icon">👁️</span>
                {{ article.readNum }}
              </span>
              <span class="meta-item" v-if="article.likeCount">
                <span class="icon">💗</span>
                {{ article.likeCount }}
              </span>
              <span class="meta-item" v-if="article.commentCount">
                <span class="icon">💬</span>
                {{ article.commentCount }}
              </span>
            </div>
            <div class="article-tags" v-if="article.articleTag">
              <span class="tag-item" v-for="(tag, index) in parseTags(article.articleTag).slice(0, 2)" :key="index">🌸 {{ tag }}</span>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="!loading && articles.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-text">暂无文章</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Carousel from '@/components/Carousel.vue'
import { getArticleList } from '@/api/article'

const router = useRouter()

interface Article {
  id: number
  articleName: string
  articleAbstract?: string
  articleCover?: string
  articleTag?: string
  articleCategory?: string
  readNum?: number
  likeCount?: number
  commentCount?: number
  createTime?: number
}

const articles = ref<Article[]>([])
const loading = ref(false)

// 获取最新文章（首页只显示3篇）
const fetchArticles = async () => {
  loading.value = true
  try {
    const res: any = await getArticleList({
      pageNo: 1,
      pageSize: 3
    })
    
    if (res && res.list) {
      articles.value = res.list
    } else if (Array.isArray(res)) {
      articles.value = res.slice(0, 3)
    }
  } catch (error) {
    // 获取文章列表失败
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 解析标签字符串为数组
const parseTags = (tagStr?: string) => {
  if (!tagStr) return []
  return tagStr.split(',').map(t => t.trim()).filter(t => t)
}

const viewArticle = (id: number) => {
  router.push(`/article/${id}`)
}

onMounted(() => {
  fetchArticles()
})
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
      
      .category-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(255, 154, 158, 0.15) 0%, rgba(254, 207, 239, 0.15) 100%);
        color: #ff9a9e;
        font-size: 13px;
        font-weight: 600;
      }
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

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 20px;
  
  .empty-icon {
    font-size: 80px;
    margin-bottom: 20px;
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: 18px;
    color: #999;
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
