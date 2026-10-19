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
        <ArticleCard v-for="article in articles" :key="article.id" :article="article"
          ><template #actions
            ><el-button
              class="unfavorite-btn"
              size="small"
              :loading="removingIds.has(article.id)"
              @click="handleUnfavorite(article)"
              >取消收藏</el-button
            ></template
          ></ArticleCard
        >
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
import ArticleCard from '@/components/ArticleCard.vue'
import { showRequestError } from '@/utils/requestError'

import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus/es/components/message/index'
import { ElMessageBox } from 'element-plus/es/components/message-box/index'
import { getUserFavorites, removeFavorite } from '@/api/favorite'

import { useUserStore } from '@/stores/user'
import { createLatestRequest } from '@/utils/latestRequest'

const router = useRouter()
const userStore = useUserStore()

const articles = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const favoriteRequest = createLatestRequest()
const removingIds = ref(new Set<string | number>())
let disposed = false

// 加载收藏列表
const loadFavorites = async () => {
  if (disposed) return
  const requestId = favoriteRequest.next()
  if (!userStore.user?.id) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }
  const userId = userStore.user.id

  loading.value = true
  try {
    const response: any = await getUserFavorites({
      userId,
      pageNo: currentPage.value,
      pageSize: pageSize.value
    })

    if (!favoriteRequest.isCurrent(requestId) || userStore.user?.id !== userId) return
    const lastPage = Math.max(1, Math.ceil((response?.total ?? 0) / pageSize.value))
    if (!Array.isArray(response) && currentPage.value > lastPage) {
      currentPage.value = lastPage
      return loadFavorites()
    }
    const list = response?.list ?? response?.records ?? (Array.isArray(response) ? response : [])
    articles.value = list
    total.value = response?.total ?? list.length
  } catch (error) {
    if (favoriteRequest.isCurrent(requestId)) showRequestError(error, '加载收藏列表失败')
  } finally {
    if (favoriteRequest.isCurrent(requestId)) loading.value = false
  }
}

// 取消收藏
const handleUnfavorite = async (article: any) => {
  const userId = userStore.user?.id
  if (!userId || disposed || removingIds.value.has(article.id)) return
  removingIds.value.add(article.id)
  try {
    await ElMessageBox.confirm(`确定要取消收藏《${article.articleName}》吗？`, '取消收藏', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (disposed || userStore.user?.id !== userId) return
    await removeFavorite({ articleId: article.id, userId })
    if (disposed || userStore.user?.id !== userId) return
    // 删除后重新获取分页数据，避免进行中的列表请求恢复已取消的收藏。
    articles.value = articles.value.filter((a) => a.id !== article.id)
    total.value = Math.max(0, total.value - 1)
    currentPage.value = Math.min(
      currentPage.value,
      Math.max(1, Math.ceil(total.value / pageSize.value))
    )
    await loadFavorites()
    ElMessage.success('已取消收藏')
  } catch (error: any) {
    if (
      !disposed &&
      error !== 'cancel' &&
      error !== 'close' &&
      error?.action !== 'cancel' &&
      error?.action !== 'close'
    ) {
      showRequestError(error, '操作失败，请重试')
    }
  } finally {
    removingIds.value.delete(article.id)
  }
}

// 跳转到文章详情
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

onUnmounted(() => {
  disposed = true
  favoriteRequest.invalidate()
})
</script>

<style scoped lang="scss">
.favorites {
  padding-bottom: 50px;
}
.article-list {
  min-height: 100px;
}
.unfavorite-btn {
  font-size: 11px;
}
.pagination {
  margin-top: 20px;
}
</style>
