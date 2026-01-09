<template>
  <div class="article-list">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-icon">📝</div>
        <div class="header-text">
          <h1>文章列表</h1>
          <p>共 {{ total }} 篇文章</p>
        </div>
      </div>
      
      <!-- 筛选栏 -->
      <div class="filter-bar card">
        <div class="search-row">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索文章标题..."
            prefix-icon="Search"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
            @clear="handleClear"
          />
          <el-button type="primary" class="search-btn" @click="handleSearch">
            搜索
          </el-button>
        </div>
        <div class="filter-row">
          <el-select v-model="selectedCategory" placeholder="选择分类" clearable>
            <el-option label="全部分类" value="" />
          </el-select>
          <el-select v-model="selectedTag" placeholder="选择标签" clearable>
            <el-option label="全部标签" value="" />
          </el-select>
        </div>
      </div>
      
      <!-- 文章列表 -->
      <div class="articles" v-loading="loading">
        <div class="article-item card" v-for="article in articles" :key="article.id" @click="viewArticle(article.id)">
          <div class="article-cover">
            <img :src="article.articleCover || '/web/default-cover.svg'" alt="封面">
            <div class="cover-overlay">
              <span class="read-more">阅读全文 →</span>
            </div>
          </div>
          <div class="article-info">
            <h3 class="article-title">{{ article.articleName }}</h3>
            <p class="article-desc" v-if="article.articleCategory">
              <span class="category-badge">📂 {{ article.articleCategory }}</span>
            </p>
            <div class="article-meta">
              <span class="meta-item">
                <span class="icon">📅</span>
                {{ formatTime(article.createTime) }}
              </span>
              <span class="meta-item" v-if="article.articleCategory">
                <span class="icon">📂</span>
                {{ article.articleCategory }}
              </span>
              <span class="meta-item" v-if="article.readNum !== undefined">
                <span class="icon">👁️</span>
                {{ article.readNum }}
              </span>
              <span class="meta-item" v-if="article.likeCount">
                <span class="icon">💗</span>
                {{ article.likeCount }}
              </span>
            </div>
            <div class="article-tags" v-if="article.articleTag">
              <span class="tag" v-for="(tag, index) in parseTags(article.articleTag)" :key="index">{{ tag }}</span>
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
          layout="prev, pager, next, jumper"
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
import { ref, onMounted, watch } from 'vue'
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
const selectedCategory = ref('')
const selectedTag = ref('')
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
    console.error('获取文章列表失败:', error)
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
  min-height: calc(100vh - 200px);
  padding: 40px 0;
}

.container {
  max-width: 1200px;
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
    animation: bounce 2s ease-in-out infinite;
  }
  
  .header-text {
    h1 {
      font-size: 42px;
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
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

.filter-bar {
  padding: 25px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  
  .search-row {
    display: flex;
    gap: 15px;
    
    .search-input {
      flex: 1;
    }
    
    .search-btn {
      height: 40px;
      border-radius: 15px;
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      border: none;
      color: #fff;
      font-weight: 600;
      padding: 0 30px;
      box-shadow: 0 4px 15px rgba(255, 154, 158, 0.3);
      cursor: pointer;
    }
  }
  
  .filter-row {
    display: flex;
    gap: 15px;
    
    .el-select {
      flex: 1;
    }
  }
  
  .el-input, .el-select {
    :deep(.el-input__wrapper) {
      border-radius: 15px;
      box-shadow: 0 2px 12px rgba(252, 182, 159, 0.1);
      border: 2px solid rgba(255, 182, 193, 0.2);
    }
  }
}

.articles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.article-item {
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(255, 154, 158, 0.25);
    
    .article-cover {
      .cover-overlay {
        opacity: 1;
      }
      
      img {
        transform: scale(1.1);
      }
    }
  }
  
  .article-cover {
    position: relative;
    width: 100%;
    height: 220px;
    overflow: hidden;
    border-radius: 25px 25px 0 0;
    
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
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 154, 158, 0.9) 0%, rgba(254, 207, 239, 0.9) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
      
      .read-more {
        color: #fff;
        font-size: 18px;
        font-weight: 700;
      }
    }
  }
  
  .article-info {
    padding: 25px;
    
    .article-title {
      font-size: 20px;
      font-weight: 700;
      color: #5a5a5a;
      margin: 0 0 15px 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .article-desc {
      font-size: 14px;
      color: #999;
      line-height: 1.8;
      margin: 0 0 15px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
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
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 15px;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 13px;
        color: #999;
        
        .icon {
          font-size: 14px;
        }
      }
    }
    
    .article-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .tag {
        padding: 4px 12px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(255, 154, 158, 0.15) 0%, rgba(254, 207, 239, 0.15) 100%);
        color: #ff9a9e;
        font-size: 12px;
        font-weight: 600;
      }
    }
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

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 50px;
  padding: 30px 0;
  
  :deep(.el-pagination) {
    display: flex;
    gap: 10px;
    
    .btn-prev, .btn-next {
      background: #fff;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(252, 182, 159, 0.15);
      border: 2px solid rgba(255, 182, 193, 0.2);
      min-width: 45px;
      height: 45px;
      font-weight: 600;
      transition: all 0.3s;
      
      &:hover:not(.is-disabled) {
        background: linear-gradient(135deg, rgba(255, 154, 158, 0.1) 0%, rgba(254, 207, 239, 0.1) 100%);
        border-color: #ff9a9e;
        color: #ff9a9e;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 154, 158, 0.25);
      }
      
      &.is-disabled {
        background: #f5f5f5;
        border-color: #e0e0e0;
        color: #ccc;
      }
    }
    
    .el-pager {
      display: flex;
      gap: 8px;
      
      li {
        background: #fff;
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(252, 182, 159, 0.15);
        border: 2px solid rgba(255, 182, 193, 0.2);
        min-width: 45px;
        height: 45px;
        line-height: 41px;
        font-weight: 600;
        transition: all 0.3s;
        
        &:hover {
          background: linear-gradient(135deg, rgba(255, 154, 158, 0.1) 0%, rgba(254, 207, 239, 0.1) 100%);
          border-color: #ff9a9e;
          color: #ff9a9e;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 154, 158, 0.25);
        }
        
        &.is-active {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 6px 25px rgba(255, 154, 158, 0.4);
          transform: translateY(-2px);
        }
        
        &.more {
          border: none;
          box-shadow: none;
          background: transparent;
          
          &:hover {
            background: transparent;
            color: #ff9a9e;
            transform: none;
            box-shadow: none;
          }
        }
      }
    }
    
    .el-pagination__jump {
      margin-left: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #666;
      font-weight: 500;
      
      .el-input {
        width: 60px;
        
        .el-input__wrapper {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(252, 182, 159, 0.15);
          border: 2px solid rgba(255, 182, 193, 0.2);
          padding: 8px 12px;
          
          &:hover {
            border-color: rgba(255, 182, 193, 0.3);
          }
          
          &.is-focus {
            border-color: #ff9a9e;
            box-shadow: 0 4px 20px rgba(255, 154, 158, 0.25);
          }
          
          .el-input__inner {
            text-align: center;
            font-weight: 600;
            color: #5a5a5a;
          }
        }
      }
    }
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
    
    .header-text h1 {
      font-size: 32px;
    }
  }
  
  .filter-bar {
    flex-direction: column;
    
    .search-row {
      flex-direction: column;
      
      .search-btn {
        width: 100%;
      }
    }
    
    .filter-row {
      flex-direction: column;
    }
  }
  
  .articles {
    grid-template-columns: 1fr;
  }
}
</style>
