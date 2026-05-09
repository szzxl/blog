<template>
  <div class="tag-articles">
    <div class="container">
      <!-- 标签标题 -->
      <div class="tag-header">
        <h1 class="tag-name">{{ tagName }}</h1>
        <p class="tag-desc">共 {{ total }} 篇文章</p>
      </div>
      
      <!-- 文章表格 - PC端 -->
      <div class="articles-table card desktop-view">
        <el-table 
          :data="articles" 
          v-loading="loading"
          style="width: 100%"
          @row-click="goToArticle"
        >
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="articleName" label="文章标题" min-width="300">
            <template #default="{ row }">
              <div class="article-title">{{ row.articleName }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="发布时间" width="180" align="center">
            <template #default="{ row }">
              {{ formatTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="readNum" label="阅读量" width="120" align="center">
            <template #default="{ row }">
              <span class="stat-item">{{ row.readNum || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="likeCount" label="点赞数" width="120" align="center">
            <template #default="{ row }">
              <span class="stat-item">{{ row.likeCount || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click.stop="goToArticle(row)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination" v-if="total > 0">
          <el-pagination
            background
            layout="total, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
          />
        </div>
      </div>
      
      <!-- 文章卡片 - 移动端 -->
      <div class="articles-cards mobile-view" v-loading="loading">
        <div class="article-card card" v-for="(article, index) in articles" :key="article.id" @click="goToArticle(article)">
          <div class="card-header">
            <span class="card-index">{{ (currentPage - 1) * pageSize + index + 1 }}</span>
            <h3 class="card-title">{{ article.articleName }}</h3>
          </div>
          <div class="card-meta">
            <span class="meta-item">{{ formatTime(article.createTime) }}</span>
            <span class="meta-item">{{ article.readNum || 0 }} 阅读</span>
            <span class="meta-item">{{ article.likeCount || 0 }} 喜欢</span>
          </div>
          <div class="card-action">
            <span class="view-text">查看详情 →</span>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="articles.length === 0 && !loading" class="empty-state">
          <div class="empty-text">该标签下暂无文章</div>
          <el-button type="primary" @click="goBack">返回标签页</el-button>
        </div>
        
        <!-- 分页 -->
        <div class="pagination" v-if="total > 0">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
            small
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticleList } from '@/api/article'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const tagName = ref('')
const articles = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

// 加载文章列表
const loadArticles = async () => {
  if (!tagName.value) return
  
  loading.value = true
  try {
    const response: any = await getArticleList({
      articleTag: tagName.value,
      pageNo: currentPage.value,
      pageSize: pageSize.value
    })
    
    // 处理分页数据
    if (response) {
      // 如果返回的是分页对象 {list: [], total: 0}
      if (response.list && Array.isArray(response.list)) {
        articles.value = response.list
        total.value = response.total || 0
      } 
      // 如果直接返回数组
      else if (Array.isArray(response)) {
        articles.value = response
        total.value = response.length
      }
      // 其他格式
      else {
        articles.value = []
        total.value = 0
      }
    } else {
      articles.value = []
      total.value = 0
    }
  } catch (error) {
    ElMessage.error('加载文章列表失败')
    articles.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 跳转到文章详情
const goToArticle = (row: any) => {
  router.push(`/article/${row.id}`)
}

// 返回标签页
const goBack = () => {
  router.push('/tag')
}

// 分页
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadArticles()
  window.scrollTo({ top: 0, behavior: 'smooth' })
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

onMounted(() => {
  tagName.value = route.query.tag as string || ''
  if (tagName.value) {
    loadArticles()
  } else {
    ElMessage.warning('标签参数缺失')
    router.push('/tag')
  }
})

// 监听路由变化，当返回到此页面时重新加载数据
watch(() => route.fullPath, (newPath) => {
  if (newPath.startsWith('/tag/articles')) {
    loadArticles()
  }
})
</script>

<style scoped lang="scss">
.tag-articles {
  min-height: calc(100vh - 200px);
  padding: 48px 0 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

// ── 标签标题（与 Home.vue page-header 一致）────────────
.tag-header {
  border-left: 4px solid var(--color-accent);
  padding-left: 20px;
  margin-bottom: 40px;

  .tag-name {
    font-family: var(--font-serif);
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin: 0 0 8px 0;
    line-height: 1.2;
  }

  .tag-desc {
    font-size: 14px;
    color: var(--text-tertiary);
    margin: 0;
    font-family: var(--font-sans);
  }
}

// ── 桌面端表格 ────────────────────────────────────────
.articles-table {
  padding: 0;
  overflow: hidden;
  background: var(--bg-card);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    border-color: var(--color-accent);
  }

  :deep(.el-table) {
    background: transparent;
    color: var(--text-secondary);
    font-size: 14px;
    font-family: var(--font-sans);
    border: none;

    &::before {
      display: none;
    }

    .el-table__header-wrapper {
      th.el-table__cell {
        background: var(--bg-secondary);
        color: var(--text-tertiary);
        font-weight: 700;
        font-size: 12px;
        border-bottom: 1px solid var(--border-color);
        border-right: none;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-family: var(--font-sans);
      }
    }

    .el-table__body-wrapper {
      td.el-table__cell {
        background: transparent;
        border-bottom: 1px solid var(--border-color);
        border-right: none;
        color: var(--text-secondary);
        padding: 14px 0;
      }
    }

    .el-table__row {
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover td.el-table__cell {
        background: rgba(74, 140, 110, 0.05) !important;
      }

      .article-title {
        font-family: var(--font-serif);
        font-weight: 700;
        color: var(--text-primary);
        transition: color 0.2s ease;
        font-size: 15px;
        letter-spacing: -0.01em;

        &:hover {
          color: var(--color-accent);
        }
      }

      .stat-item {
        font-size: 12px;
        color: var(--text-tertiary);
      }
    }

    .el-button {
      background: transparent;
      border: 1px solid var(--color-accent);
      color: var(--color-accent);
      border-radius: var(--radius-btn);
      font-weight: 600;
      padding: 5px 12px;
      font-size: 12px;
      font-family: var(--font-sans);
      letter-spacing: 0.02em;
      transition: all 0.2s ease;

      &:hover {
        background: var(--color-accent);
        color: #fff;
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 72px 0;

    .empty-text {
      font-family: var(--font-serif);
      font-size: 15px;
      color: var(--text-tertiary);
      margin-bottom: 24px;
    }

    .el-button {
      background: transparent;
      border: 1px solid var(--color-accent);
      color: var(--color-accent);
      border-radius: var(--radius-btn);
      font-family: var(--font-sans);
      padding: 10px 22px;

      &:hover {
        background: var(--color-accent);
        color: #fff;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    padding: 24px;
    border-top: 1px solid var(--border-color);
  }
}

// ── 通用分页 ──────────────────────────────────────────
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

:deep(.el-pagination) {
  .btn-prev, .btn-next, .el-pager li {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    border-radius: var(--radius-btn);
    font-family: var(--font-sans);
    transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;

    &:hover {
      color: var(--color-accent);
      border-color: var(--color-accent);
    }

    &.is-active {
      background: var(--color-accent);
      color: #fff;
      border-color: var(--color-accent);
      font-weight: 700;
    }
  }

  .el-pagination__jump, .el-pagination__total {
    color: var(--text-tertiary);
    font-family: var(--font-sans);
    font-size: 13px;
  }
}

// 桌面端表格视图（默认显示）
.desktop-view {
  display: block !important;
}

// 移动端卡片视图（默认隐藏）
.mobile-view {
  display: none !important;
}

// ── 移动端文章卡片（对齐 Home.vue article-item）───────
.articles-cards {
  flex-direction: column;
  gap: 16px;

  .article-card {
    padding: 20px 22px;
    background: var(--bg-card);
    backdrop-filter: var(--blur-glass);
    -webkit-backdrop-filter: var(--blur-glass);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    cursor: pointer;
    transition: box-shadow 0.35s ease, transform 0.35s ease, border-color 0.35s ease;

    &:hover {
      box-shadow: var(--shadow-card-hover);
      transform: translateY(-3px);
      border-color: var(--color-accent);

      .card-title {
        color: var(--color-accent);
      }
    }

    &:active {
      transform: scale(0.99);
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 14px;

      .card-index {
        flex-shrink: 0;
        width: 30px;
        height: 30px;
        background: var(--gradient-accent);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 12px;
        font-family: var(--font-sans);
        border-radius: var(--radius-tag);
        letter-spacing: 0.02em;
      }

      .card-title {
        flex: 1;
        font-family: var(--font-serif);
        font-size: 17px;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.45;
        letter-spacing: -0.01em;
        margin: 0;
        transition: color 0.2s ease;
      }
    }

    .card-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 14px;
      margin-bottom: 12px;
      padding-left: 42px;

      .meta-item {
        font-size: 12px;
        color: var(--text-tertiary);
        font-family: var(--font-sans);
      }
    }

    .card-action {
      padding-left: 42px;

      .view-text {
        color: var(--color-accent);
        font-size: 13px;
        font-weight: 600;
        font-family: var(--font-sans);
        letter-spacing: 0.02em;
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 72px 0;

    .empty-text {
      font-family: var(--font-serif);
      font-size: 15px;
      color: var(--text-tertiary);
      margin-bottom: 24px;
    }

    .el-button {
      background: transparent;
      border: 1px solid var(--color-accent);
      color: var(--color-accent);
      border-radius: var(--radius-btn);
      font-family: var(--font-sans);
      padding: 10px 22px;

      &:hover {
        background: var(--color-accent);
        color: #fff;
      }
    }
  }

  .pagination {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }
}

// ── 响应式 ────────────────────────────────────────────
@media (max-width: 768px) {
  .tag-articles { padding: 28px 0 60px; }

  .container {
    padding: 0 16px;
  }

  .tag-header {
    margin-bottom: 28px;

    .tag-name {
      font-size: 26px;
    }
  }

  .desktop-view {
    display: none !important;
  }

  .mobile-view {
    display: flex !important;
  }
}
</style>
