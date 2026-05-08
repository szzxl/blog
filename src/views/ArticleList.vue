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
      <div class="articles">
        <!-- 骨架屏 -->
        <Skeleton v-if="loading" type="article-list" :count="6" />
        
        <!-- 文章列表 -->
        <div v-else class="article-card" v-for="article in articles" :key="article.id" @click="viewArticle(article.id)">
          <!-- 标识标签 -->
          <div class="badges" v-if="article.isTop === 1 || article.isRecommend === 1">
            <span class="badge badge-top" v-if="article.isTop === 1">📌 置顶</span>
            <span class="badge badge-recommend" v-if="article.isRecommend === 1">⭐ 推荐</span>
          </div>
          
          <div class="card-left">
            <div class="article-cover">
              <img v-lazyload="article.articleCover || '/default-cover.svg'" alt="封面">
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
import { ref, onMounted, onActivated, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getArticleList } from '@/api/article'
import { ElMessage } from 'element-plus'
import Skeleton from '@/components/Skeleton.vue'

const router = useRouter()
const route = useRoute()

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
  isRecommend?: number  // 是否推荐 1=是 0=否
  isTop?: number  // 是否置顶 1=是 0=否
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
    
    // 添加分类筛选（从URL参数获取）
    const categoryParam = route.query.category as string
    if (categoryParam) {
      params.articleCategory = categoryParam
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

// 页面激活时重新加载数据（从详情页返回时）
onActivated(() => {
  fetchArticles()
})

// 监听路由变化，当返回到此页面时重新加载数据
watch(() => route.path, (newPath) => {
  if (newPath === '/articles') {
    fetchArticles()
  }
})
</script>

<style scoped lang="scss">
.article-list {
  min-height: 100vh;
  padding: 32px 0 48px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  border-left: 3px solid var(--color-accent);
  padding-left: 16px;
  margin-bottom: 32px;

  h1 {
    font-size: 24px;
    color: var(--text-primary);
    margin: 0 0 6px 0;
    font-weight: 700;
  }
  
  .subtitle {
    font-size: 13px;
    color: var(--text-tertiary);
    margin: 0;
  }
}

.filter-bar {
  margin-bottom: 24px;

  .search-input {
    :deep(.el-input-group__append) {
      background: var(--bg-secondary);
      border-color: var(--border-color);

      .el-button {
        color: var(--text-secondary);

        &:hover {
          color: var(--color-accent);
        }
      }
    }
  }
}

.articles {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.article-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  overflow: hidden;
  display: flex;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  height: 160px;
  position: relative;

  &:hover {
    border-color: var(--color-accent);
    box-shadow: var(--shadow-glow);
    transform: translateY(-2px);

    .article-cover img {
      transform: scale(1.04);
    }

    .article-title {
      color: var(--color-accent);
    }
  }

  .badges {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    gap: 6px;
    z-index: 2;

    .badge {
      padding: 2px 8px;
      border-radius: var(--radius-tag);
      font-size: 11px;
      font-weight: 600;

      &.badge-top {
        background: var(--color-danger);
        color: #fff;
      }

      &.badge-recommend {
        background: var(--color-warning);
        color: var(--text-inverse);
      }
    }
  }

  .card-left {
    width: 200px;
    flex-shrink: 0;

    .article-cover {
      width: 100%;
      height: 100%;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
    }
  }

  .card-right {
    flex: 1;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;

    .article-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.15s ease;
    }

    .article-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      .tag {
        padding: 2px 8px;
        border-radius: var(--radius-tag);
        border: 1px solid var(--color-accent);
        color: var(--color-accent);
        font-size: 11px;
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
          color: var(--text-tertiary);

          .icon { font-style: normal; }
        }
      }

      .read-btn {
        font-size: 12px;
        color: var(--color-accent);
        white-space: nowrap;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 64px 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 24px 0 0;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 640px) {
  .article-card {
    flex-direction: column;
    height: auto;

    .card-left {
      width: 100%;
      height: 180px;
    }

    .card-right {
      padding: 14px;
    }
  }
}
</style>
