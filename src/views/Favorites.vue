<template>
  <div class="favorites">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>我的收藏</h1>
        <p>这里是你收藏的所有文章~</p>
      </div>
      
      <!-- 文章列表 -->
      <div class="article-list" v-loading="loading">
        <div
          v-for="article in articles"
          :key="article.id"
          class="article-card card"
          @click="goToArticle(article.id)"
        >
          <div class="article-cover" v-if="article.articleCover">
            <img :src="article.articleCover" :alt="article.articleName">
          </div>
          <div class="article-content">
            <h3 class="article-title">{{ article.articleName }}</h3>
            <div class="article-meta">
              <span class="meta-item">{{ formatTimestamp(article.createTime) }}</span>
              <span class="meta-item" v-if="article.articleCategory">{{ article.articleCategory }}</span>
              <span class="meta-item">{{ article.readNum || 0 }} 阅读</span>
            </div>
          </div>
          <div class="article-actions">
            <el-button
              class="unfavorite-btn"
              size="small"
              @click.stop="handleUnfavorite(article)"
            >
              取消收藏
            </el-button>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="articles.length === 0 && !loading" class="empty-state">
          <div class="empty-text">还没有收藏任何文章</div>
          <el-button type="primary" @click="goToHome">去首页看看</el-button>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination" v-if="total > pageSize">
        <el-pagination
          background
          layout="prev, pager, next"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserFavorites, removeFavorite } from '@/api/article'
import { formatTimestamp } from '@/utils/format'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const articles = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 加载收藏列表
const loadFavorites = async () => {
  if (!userStore.user?.id) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }
  
  loading.value = true
  try {
    const response: any = await getUserFavorites({
      userId: userStore.user.id,
      pageNo: currentPage.value,
      pageSize: pageSize.value
    })
    
    const list = response?.list ?? response?.records ?? (Array.isArray(response) ? response : [])
    articles.value = list
    total.value = response?.total ?? list.length
  } catch (error) {
    ElMessage.error('加载收藏列表失败')
  } finally {
    loading.value = false
  }
}

// 取消收藏
const handleUnfavorite = async (article: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消收藏《${article.articleName}》吗？`,
      '取消收藏',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await removeFavorite({ articleId: article.id, userId: userStore.user!.id })
    articles.value = articles.value.filter(a => a.id !== article.id)
    total.value = Math.max(0, total.value - 1)
    ElMessage.success('已取消收藏')
  } catch (error: any) {
    if (error !== 'cancel' && error?.action !== 'cancel') {
      ElMessage.error('操作失败，请重试')
    }
  }
}

// 跳转到文章详情
const goToArticle = (articleId: string | number) => {
  router.push({ path: `/article/${articleId}`, state: { isFavorited: true } })
}

// 跳转到首页
const goToHome = () => {
  router.push('/')
}

// 分页
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadFavorites()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 格式化时间

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped lang="scss">
.favorites {
  min-height: calc(100vh - 200px);
  padding: 48px 0 80px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

// ── 页面标题（与 Home.vue page-header 一致）────────────
.page-header {
  border-left: 4px solid var(--color-accent);
  padding-left: 20px;
  margin-bottom: 40px;

  h1 {
    font-family: var(--font-serif);
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin: 0 0 8px 0;
    line-height: 1.2;
  }

  p {
    font-size: 14px;
    color: var(--text-tertiary);
    margin: 0;
    font-family: var(--font-sans);
  }
}

// ── 收藏文章列表（对齐 Home.vue article-item）─────────
.article-list {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .article-card {
    display: flex;
    background: var(--bg-card);
    backdrop-filter: var(--blur-glass);
    -webkit-backdrop-filter: var(--blur-glass);
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
      border-color: var(--border-strong);

      .article-cover img {
        transform: scale(1.07);
      }

      .article-title {
        color: var(--color-accent);
      }
    }

    .article-cover {
      width: 180px;
      flex-shrink: 0;
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

    .article-content {
      flex: 1;
      padding: 22px 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;

      .article-title {
        font-family: var(--font-serif);
        font-size: 17px;
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

      .article-desc {
        font-size: 14px;
        color: var(--text-tertiary);
        line-height: 1.7;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .article-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 14px;
        margin-top: auto;

        .meta-item {
          font-size: 12px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }
      }
    }

    .article-actions {
      display: flex;
      align-items: center;
      padding: 0 22px 0 0;

      .unfavorite-btn {
        border-radius: var(--radius-btn);
        border: 1px solid var(--border-color);
        color: var(--color-danger);
        background: transparent;
        font-family: var(--font-sans);
        font-size: 12px;
        padding: 8px 14px;
        font-weight: 500;
        letter-spacing: 0.02em;
        transition: all 0.2s ease;

        &:hover {
          background: var(--color-danger);
          color: #fff;
          border-color: var(--color-danger);
        }
      }
    }
  }

  // ── 空状态（对齐 Home.vue）────────────────────────
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
      font-weight: 500;
      letter-spacing: 0.02em;
      transition: all 0.25s ease;

      &:hover {
        background: var(--color-accent);
        color: #fff;
      }
    }
  }
}

// ── 分页 ──────────────────────────────────────────────
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 36px;

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
  }
}

// ── 响应式 ────────────────────────────────────────────
@media (max-width: 768px) {
  .favorites { padding: 28px 0 60px; }

  .container {
    padding: 0 16px;
  }

  .page-header {
    margin-bottom: 28px;
    h1 { font-size: 26px; }
  }

  .article-list .article-card {
    flex-direction: column;

    .article-cover {
      width: 100%;
      height: 180px;
    }

    .article-content {
      padding: 18px 20px 14px;
    }

    .article-actions {
      justify-content: flex-end;
      padding: 0 20px 18px;
    }
  }
}
</style>
