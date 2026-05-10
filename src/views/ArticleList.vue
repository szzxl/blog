<template>
  <div class="article-list">
    <!-- ── Banner ──────────────────────────────────────── -->
    <div class="page-banner">
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <h1 class="banner-title">所有文章</h1>
        <p class="banner-subtitle">共 {{ total }} 篇</p>
      </div>
    </div>

    <!-- ── 筛选栏（重叠在 Banner 底部）─────────────────── -->
    <div class="filter-wrap">
      <div class="container">
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
      </div>
    </div>

    <!-- ── 主体内容 ─────────────────────────────────────── -->
    <div class="container main-body">
      <!-- 文章列表 -->
      <div class="articles">
        <!-- 骨架屏 -->
        <Skeleton v-if="loading" type="article-list" :count="6" />

        <!-- 文章卡片 -->
        <div
          v-else
          class="article-card"
          v-for="article in articles"
          :key="article.id"
          @click="viewArticle(article.id)"
        >
          <!-- 角标 -->
          <div class="badges" v-if="article.isTop === 1 || article.isRecommend === 1">
            <span class="badge badge-top" v-if="article.isTop === 1">置顶</span>
            <span class="badge badge-recommend" v-if="article.isRecommend === 1">推荐</span>
          </div>

          <div class="card-left">
            <div class="article-cover">
              <img v-lazyload="article.articleCover || '/default-cover.svg'" alt="封面" />
            </div>
          </div>

          <div class="card-right">
            <h2 class="article-title">{{ article.articleName }}</h2>
            <div class="article-tags" v-if="article.articleTag">
              <span class="tag" v-for="tag in parseTags(article.articleTag)" :key="tag">
                {{ tag }}
              </span>
            </div>
            <div class="article-footer">
              <div class="meta-info">
                <span class="meta-item">{{ formatTimestamp(article.createTime) }}</span>
                <span class="meta-item" v-if="article.articleCategory">{{ article.articleCategory }}</span>
                <span class="meta-item">{{ article.readNum || 0 }} 阅读</span>
                <span class="meta-item">{{ article.likeCount || 0 }} 喜欢</span>
              </div>
              <div class="read-btn">阅读全文 →</div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && articles.length === 0" class="empty-state">
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
import { useRouter, useRoute } from 'vue-router'
import { getArticleList } from '@/api/article'
import { formatTimestamp, parseTags } from '@/utils/format'
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

// 解析标签字符串为数组
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

// ── 筛选栏（Banner 底部重叠）─────────────────────────
.filter-wrap {
  position: relative;
  z-index: 10;
  margin-top: -24px;

  .filter-bar {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    padding: 18px 24px;

    .search-input {
      :deep(.el-input__wrapper) {
        border-radius: var(--radius-btn);
        background: var(--bg-secondary);
        transition: box-shadow 0.25s ease;

        &.is-focus {
          box-shadow: 0 0 0 1px var(--color-accent) inset;
        }
      }

      :deep(.el-input-group__append) {
        background: var(--bg-secondary);
        border-color: var(--border-color);
        border-radius: 0 var(--radius-btn) var(--radius-btn) 0;

        .el-button {
          color: var(--text-secondary);
          font-family: var(--font-sans);

          &:hover {
            color: var(--color-accent);
          }
        }
      }
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

// ── 文章列表 ──────────────────────────────────────────
.articles {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 36px;
}

.article-card {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: box-shadow 0.35s ease, transform 0.35s ease, border-color 0.35s ease;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-4px);
    border-color: var(--color-accent);

    .article-cover img {
      transform: scale(1.07);
    }

    .article-title {
      color: var(--color-accent);
    }

    .read-btn {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .badges {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    gap: 6px;
    z-index: 2;

    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: var(--radius-tag);
      letter-spacing: 0.04em;
      color: #fff;

      &.badge-top {
        background: var(--gradient-accent);
      }

      &.badge-recommend {
        background: linear-gradient(135deg, rgba(22, 93, 255, 0.85) 0%, rgba(114, 46, 209, 0.85) 100%);
      }
    }
  }

  .card-left {
    width: 200px;
    height: 140px;
    flex-shrink: 0;

    .article-cover {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--bg-secondary);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
      }
    }
  }

  .card-right {
    flex: 1;
    padding: 22px 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;

    .article-title {
      font-family: var(--font-display);
      font-size: 19px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.45;
      letter-spacing: -0.01em;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.2s ease;
    }

    .article-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      .tag {
        padding: 2px 10px;
        border-radius: var(--radius-tag);
        background: var(--bg-secondary);
        color: var(--text-tertiary);
        font-size: 11px;
        border: 1px solid transparent;
        transition: all 0.2s;

        &:hover {
          background: transparent;
          border-color: var(--color-accent);
          color: var(--color-accent);
        }
      }
    }

    .article-footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      .meta-info {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 12px;

        .meta-item {
          font-size: 12px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }
      }

      .read-btn {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-accent);
        white-space: nowrap;
        opacity: 0;
        transform: translateX(-6px);
        transition: opacity 0.25s ease, transform 0.25s ease;
        letter-spacing: 0.02em;
        font-family: var(--font-sans);
      }
    }
  }
}

// ── 空状态 ────────────────────────────────────────────
.empty-state {
  text-align: center;
  padding: 72px 0;
  color: var(--text-tertiary);
  font-size: 15px;

  .empty-text {
    font-family: var(--font-display);
  }
}

// ── 分页 ──────────────────────────────────────────────
.pagination {
  display: flex;
  justify-content: center;
  padding: 32px 0 0;
  border-top: 1px solid var(--border-color);

  :deep(.el-pagination) {
    .el-pager li {
      border-radius: var(--radius-btn);
      transition: background 0.2s ease, color 0.2s ease;
      font-family: var(--font-sans);

      &.is-active {
        background: var(--color-accent);
        color: #fff;
      }
    }

    .btn-prev,
    .btn-next {
      border-radius: var(--radius-btn);
    }
  }
}

// ── 响应式 ────────────────────────────────────────────
@media (max-width: 768px) {
  .page-banner {
    height: 160px;

    .banner-content .banner-title {
      font-size: 1.8rem;
    }
  }

  .filter-wrap .filter-bar {
    padding: 14px 16px;
  }

  .main-body {
    padding-top: 36px;
    padding-bottom: 60px;
  }

  .article-card {
    flex-direction: column;

    .card-left {
      width: 100%;
      height: 180px;
    }

    .card-right {
      padding: 18px;
    }
  }
}
</style>
