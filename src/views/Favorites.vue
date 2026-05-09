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
            <p class="article-desc" v-if="article.articleDesc">{{ article.articleDesc }}</p>
            <div class="article-meta">
              <span class="meta-item">
                <span class="icon">📅</span>
                {{ formatTime(article.createTime) }}
              </span>
              <span class="meta-item">
                <span class="icon">👁️</span>
                {{ article.readNum || 0 }} 阅读
              </span>
              <span class="meta-item">
                <span class="icon">💗</span>
                {{ article.likeCount || 0 }} 点赞
              </span>
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
          <div class="empty-icon">📚</div>
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
      userId: Number(userStore.user.id),
      pageNo: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (response && response.list) {
      articles.value = response.list
      total.value = response.total || 0
    }
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
    
    await removeFavorite({
      userId: Number(userStore.user!.id),
      articleId: article.id
    })
    
    ElMessage.success('已取消收藏')
    loadFavorites()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败，请重试')
    }
  }
}

// 跳转到文章详情
const goToArticle = (id: number) => {
  router.push(`/article/${id}`)
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
const formatTime = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped lang="scss">
.favorites {
  min-height: calc(100vh - 200px);
  padding: 40px 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  padding: 32px 0 24px;
  border-left: 3px solid var(--color-accent);
  padding-left: 16px;
  margin-bottom: 32px;

  h1 {
    font-size: 22px;
    color: var(--text-primary);
    margin: 0 0 6px 0;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;

    &::before {
      content: '> ';
      color: var(--color-accent);
    }
  }

  p {
    font-size: 13px;
    color: var(--text-tertiary);
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
  }
}

.article-list {
  min-height: 300px;

  .article-card {
    display: flex;
    gap: 20px;
    padding: 20px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;

    .article-cover {
      width: 160px;
      height: 110px;
      flex-shrink: 0;
      border-radius: var(--radius-card);
      overflow: hidden;
      border: 1px solid var(--border-color);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
        filter: brightness(0.85);
      }
    }

    &:hover .article-cover img {
      transform: scale(1.05);
      filter: brightness(1);
    }

    .article-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;

      .article-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
        line-height: 1.4;
        transition: color 0.15s;
      }

      .article-desc {
        font-size: 13px;
        color: var(--text-tertiary);
        line-height: 1.6;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .article-meta {
        display: flex;
        gap: 20px;
        margin-top: auto;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--text-tertiary);
          font-family: 'JetBrains Mono', monospace;
        }
      }
    }

    .article-actions {
      display: flex;
      align-items: center;

      .unfavorite-btn {
        border-radius: var(--radius-btn);
        border: 1px solid rgba(248, 113, 113, 0.4);
        color: var(--color-danger);
        background: transparent;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;

        &:hover {
          background: var(--color-danger);
          color: var(--bg-primary);
          border-color: var(--color-danger);
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 100px 20px;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.3;
    }

    .empty-text {
      font-size: 14px;
      color: var(--text-tertiary);
      margin-bottom: 28px;
      font-family: 'JetBrains Mono', monospace;
    }

    .el-button {
      background: transparent;
      border: 1px solid var(--color-accent);
      color: var(--color-accent);
      border-radius: var(--radius-btn);
      font-family: 'JetBrains Mono', monospace;

      &:hover {
        background: var(--color-accent);
        color: var(--bg-primary);
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;

  :deep(.el-pagination) {
    .btn-prev, .btn-next, .el-pager li {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      border-radius: var(--radius-btn);

      &:hover {
        color: var(--color-accent);
        border-color: var(--color-accent);
      }

      &.is-active {
        background: var(--color-accent);
        color: var(--bg-primary);
        border-color: var(--color-accent);
        font-weight: 700;
      }
    }
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .article-card {
    flex-direction: column;

    .article-cover {
      width: 100%;
      height: 180px;
    }

    .article-actions {
      justify-content: flex-end;
    }
  }
}
</style>
