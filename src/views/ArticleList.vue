<template>
  <div class="article-list">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>📚 文章列表</h1>
        <p class="subtitle">共 {{ total }} 篇文章</p>
      </div>
      
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索文章标题..."
          prefix-icon="Search"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
          @clear="handleClear"
        >
          <template #append>
            <el-button @click="handleSearch" icon="Search">搜索</el-button>
          </template>
        </el-input>
      </div>
      
      <!-- 文章列表 -->
      <div class="articles" v-loading="loading">
        <div class="article-card" v-for="article in articles" :key="article.id" @click="viewArticle(article.id)">
          <div class="card-left">
            <div class="article-cover">
              <img :src="article.articleCover || '/web/default-cover.svg'" alt="封面">
            </div>
          </div>
          <div class="card-right">
            <h2 class="article-title">{{ article.articleName }}</h2>
            <div class="article-tags" v-if="article.articleTag">
              <span class="tag" v-for="(tag, index) in parseTags(article.articleTag)" :key="index">
                🏷️ {{ tag }}
              </span>
            </div>
            <div class="article-footer">
              <div class="meta-info">
                <span class="meta-item">
                  <i class="icon">📅</i>
                  {{ formatTime(article.createTime) }}
                </span>
                <span class="meta-item" v-if="article.articleCategory">
                  <i class="icon">📂</i>
                  {{ article.articleCategory }}
                </span>
                <span class="meta-item">
                  <i class="icon">👁️</i>
                  {{ article.readNum || 0 }}
                </span>
                <span class="meta-item">
                  <i class="icon">💗</i>
                  {{ article.likeCount || 0 }}
                </span>
              </div>
              <div class="read-btn">
                阅读全文 →
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="!loading && articles.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-text">暂无文章</div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination" v-if="total > 0">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="pageNo"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getArticleList } from '@/api/article'
import { ElMessage } from 'element-plus'

const router = useRouter()

interface Article {
  id: number
  articleName: string
  articleAbstract?: string
  articleCover?: string
  articleCategory?: string
  articleTag?: string
  readNum?: number
  likeCount?: number
  createTime?: number
}

const searchKeyword = ref('')
const articles = ref<Article[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 获取文章列表
const fetchArticles = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNo: pageNo.value,
      pageSize: pageSize.value
    }
    
    // 添加搜索关键词
    if (searchKeyword.value) {
      params.articleName = searchKeyword.value
    }
    
    const res: any = await getArticleList(params)
    
    if (res && res.list) {
      articles.value = res.list
      total.value = res.total || 0
    } else if (Array.isArray(res)) {
      articles.value = res
      total.value = res.length
    }
  } catch (error) {
    ElMessage.error('获取文章列表失败')
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

// 搜索
const handleSearch = () => {
  pageNo.value = 1
  fetchArticles()
}

// 清除搜索
const handleClear = () => {
  pageNo.value = 1
  fetchArticles()
}

// 分页变化
const handlePageChange = (page: number) => {
  pageNo.value = page
  fetchArticles()
}

const viewArticle = (id: number) => {
  router.push(`/article/${id}`)
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped lang="scss">
.article-list {
  min-height: 100vh;
  padding: 30px 0 0;
  background: transparent;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    font-size: 28px;
    color: #fff;
    margin: 0 0 8px 0;
    font-weight: 700;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .subtitle {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    text-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
  }
}

.filter-bar {
  margin-bottom: 20px;
  
  .search-input {
    :deep(.el-input-group__append) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      
      .el-button {
        background: transparent;
        border: none;
        color: #fff;
        font-weight: 600;
        
        &:hover {
          background: transparent;
        }
      }
    }
    
    :deep(.el-input__wrapper) {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border-radius: 8px;
      
      &.is-focus {
        box-shadow: 0 2px 16px rgba(102, 126, 234, 0.25);
      }
    }
  }
}

.articles {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  flex: 1;
}

.article-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 180px;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    
    .article-cover img {
      transform: scale(1.05);
    }
    
    .article-title {
      color: #667eea;
    }
    
    .read-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
  }
  
  .card-left {
    width: 240px;
    flex-shrink: 0;
    
    .article-cover {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #f0f0f0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }
    }
  }
  
  .card-right {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    
    .article-title {
      font-size: 17px;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 10px 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.3s ease;
    }
    
    .article-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
      
      .tag {
        padding: 3px 10px;
        border-radius: 5px;
        background: #f0f3ff;
        color: #667eea;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s ease;
        
        &:hover {
          background: #e0e7ff;
        }
      }
    }
    
    .article-footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .meta-info {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #7f8c8d;
          
          .icon {
            font-style: normal;
          }
        }
      }
      
      .read-btn {
        padding: 6px 16px;
        border-radius: 5px;
        background: #f8f9fa;
        color: #667eea;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.3s ease;
        white-space: nowrap;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 12px;
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: 16px;
    color: #95a5a6;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  background: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: auto;
  
  :deep(.el-pagination) {
    .btn-prev, .btn-next, .el-pager li {
      background: #fff;
      border: 1px solid #e0e0e0;
      
      &:hover {
        color: #667eea;
        border-color: #667eea;
      }
      
      &.is-active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        border-color: transparent;
      }
    }
  }
}

@media (max-width: 768px) {
  .article-list {
    .container {
      padding: 20px 15px;
    }
  }
  
  .page-header {
    padding: 30px 20px;
    margin-bottom: 25px;
    
    h1 {
      font-size: 24px;
    }
    
    p {
      font-size: 13px;
    }
  }
  
  .search-bar {
    margin-bottom: 25px;
    
    .el-input {
      font-size: 14px;
    }
  }
  
  .article-list-container {
    gap: 20px;
  }
  
  .article-card {
    flex-direction: column;
    
    .card-left {
      width: 100%;
      height: 200px;
      border-radius: 20px 20px 0 0;
    }
    
    .card-right {
      padding: 20px 15px;
      
      .article-title {
        font-size: 18px;
        margin-bottom: 12px;
      }
      
      .article-abstract {
        font-size: 13px;
        line-height: 1.6;
        margin-bottom: 12px;
        -webkit-line-clamp: 2;
      }
      
      .article-meta {
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 15px;
        
        .meta-item {
          font-size: 12px;
        }
      }
      
      .article-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        
        .article-tags {
          justify-content: flex-start;
          
          .tag {
            font-size: 11px;
            padding: 4px 10px;
          }
        }
        
        .read-btn {
          width: 100%;
          text-align: center;
          justify-content: center;
          padding: 10px 20px;
          font-size: 14px;
        }
      }
    }
  }
  
  .pagination-wrapper {
    margin-top: 30px;
    
    :deep(.el-pagination) {
      justify-content: center;
      
      .el-pager li {
        min-width: 32px;
        height: 32px;
        line-height: 32px;
        font-size: 13px;
      }
      
      button {
        padding: 0 8px;
        font-size: 13px;
      }
    }
  }
}
</style>
