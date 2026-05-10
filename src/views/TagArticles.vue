<template>
  <div class="tag-articles">
    <!-- ── Banner ──────────────────────────────────────── -->
    <div class="page-banner">
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <h1 class="banner-title">#{{ tagName }}</h1>
        <p class="banner-subtitle">共 {{ total }} 篇文章</p>
      </div>
    </div>

    <!-- ── 主体内容 ─────────────────────────────────────── -->
    <div class="container main-body">

      <!-- 文章卡片网格 -->
      <div class="articles-grid" v-loading="loading">

        <!-- 文章卡片（每行3列） -->
        <div
          class="article-card"
          v-for="(article, index) in articles"
          :key="article.id"
          @click="goToArticle(article)"
        >
          <!-- 封面 -->
          <div class="card-cover">
            <img
              v-lazyload="article.articleCover || '/default-cover.svg'"
              :alt="article.articleName"
            />
            <div class="cover-overlay"></div>
            <span class="card-index">{{ (currentPage - 1) * pageSize + index + 1 }}</span>
          </div>

          <!-- 内容 -->
          <div class="card-body">
            <h3 class="card-title">{{ article.articleName }}</h3>
            <div class="card-meta">
              <span class="meta-item">{{ formatTime(article.createTime) }}</span>
              <span class="meta-sep">·</span>
              <span class="meta-item">{{ article.readNum || 0 }} 阅读</span>
              <span class="meta-sep">·</span>
              <span class="meta-item">{{ article.likeCount || 0 }} 喜欢</span>
            </div>
            <div class="card-action">阅读全文 →</div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="articles.length === 0 && !loading" class="empty-state">
          <div class="empty-text">该标签下暂无文章</div>
          <button class="back-btn" @click="goBack">返回标签页</button>
        </div>
      </div>

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
// ── Banner ────────────────────────────────────────────
.page-banner {
  position: relative;
  height: 200px;
  background: url('/bg-banner.png') center 30% / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;

  .banner-overlay {
    position: absolute;
    inset: 0;
    background: rgba(5, 12, 30, 0.62);
  }

  .banner-content {
    position: relative;
    z-index: 1;
    text-align: center;

    .banner-title {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
      margin: 0 0 8px 0;
      line-height: 1.2;
    }

    .banner-subtitle {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.65);
      margin: 0;
      font-family: var(--font-sans);
    }
  }
}

// ── 容器 ──────────────────────────────────────────────
.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

.main-body {
  padding-top: 48px;
  padding-bottom: 80px;
}

// ── 文章卡片网格（每行3列）───────────────────────────
.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.article-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.35s ease, transform 0.35s ease, border-color 0.35s ease;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-4px);
    border-color: var(--color-accent);

    .card-cover img {
      transform: scale(1.06);
    }

    .card-title {
      color: var(--color-accent);
    }

    .card-action {
      opacity: 1;
      transform: translateX(0);
    }
  }

  // 封面图
  .card-cover {
    position: relative;
    width: 100%;
    height: 180px;
    overflow: hidden;
    background: var(--bg-secondary);
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .cover-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(5, 12, 30, 0.45) 0%, transparent 60%);
    }

    .card-index {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 28px;
      height: 28px;
      background: var(--gradient-accent);
      color: #fff;
      border-radius: var(--radius-tag);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      font-family: var(--font-sans);
      letter-spacing: 0.02em;
    }
  }

  // 内容区
  .card-body {
    flex: 1;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .card-title {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.5;
      letter-spacing: -0.01em;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 0;
      transition: color 0.2s ease;
    }

    .card-meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: auto;

      .meta-item {
        font-size: 12px;
        color: var(--text-tertiary);
        font-family: var(--font-sans);
      }

      .meta-sep {
        font-size: 12px;
        color: var(--text-tertiary);
        opacity: 0.5;
      }
    }

    .card-action {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-accent);
      font-family: var(--font-sans);
      letter-spacing: 0.02em;
      opacity: 0;
      transform: translateX(-4px);
      transition: opacity 0.25s ease, transform 0.25s ease;
    }
  }
}

// ── 空状态 ────────────────────────────────────────────
.empty-state {
  text-align: center;
  padding: 72px 0;
  grid-column: 1 / -1;
  color: var(--text-tertiary);

  .empty-text {
    font-family: var(--font-display);
    font-size: 15px;
    margin-bottom: 24px;
  }

  .back-btn {
    display: inline-block;
    padding: 10px 24px;
    border-radius: var(--radius-btn);
    background: transparent;
    border: 1px solid var(--color-accent);
    color: var(--color-accent);
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: background 0.25s ease, color 0.25s ease;

    &:hover {
      background: var(--color-accent);
      color: #fff;
    }
  }
}

// ── 分页 ──────────────────────────────────────────────
.pagination {
  display: flex;
  justify-content: center;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);

  :deep(.el-pagination) {
    .el-pager li {
      border-radius: var(--radius-btn);
      font-family: var(--font-sans);
      transition: background 0.2s ease, color 0.2s ease;

      &.is-active {
        background: var(--color-accent);
        color: #fff;
      }
    }

    .btn-prev,
    .btn-next {
      border-radius: var(--radius-btn);
    }

    .el-pagination__total,
    .el-pagination__jump {
      color: var(--text-tertiary);
      font-family: var(--font-sans);
      font-size: 13px;
    }
  }
}

// ── 响应式 ────────────────────────────────────────────
@media (max-width: 1024px) {
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-banner {
    height: 160px;

    .banner-content .banner-title {
      font-size: 1.8rem;
    }
  }

  .main-body {
    padding-top: 36px;
    padding-bottom: 60px;
  }

  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .article-card .card-cover {
    height: 140px;
  }
}

@media (max-width: 480px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }
}
</style>
