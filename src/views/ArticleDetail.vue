<template>
  <div class="article-detail">
    <div class="container">
      <!-- 骨架屏 -->
      <Skeleton v-if="loading" type="article-detail" />
      
      <!-- 文章内容（包含标题和信息） -->
      <article v-else class="article-content card" v-if="article">
        <h1 class="article-title">{{ article.articleName }}</h1>
        
        <div class="article-info">
          <!-- 左侧：标签 -->
          <span class="info-item tags" v-if="article.articleTag">
            <span
              class="tag" 
              v-for="(tag, index) in parseTags(article.articleTag)" 
              :key="index"
              @click="goToTag(tag)"
            >{{ tag }}</span>
          </span>
          
          <!-- 右侧：阅读数、点赞数、时间 -->
          <div class="info-right">
            <span class="info-item" v-if="article.readNum !== undefined">{{ article.readNum }} 阅读</span>
            <span class="info-item" v-if="article.likeCount">{{ article.likeCount }} 点赞</span>
            <span class="info-divider" v-if="article.createTime">|</span>
            <span class="info-item" v-if="article.createTime">{{ formatTime(article.createTime) }}</span>
          </div>
        </div>
        
        <div class="content" v-html="article.articleContent"></div>
      </article>
      
      <!-- 文章操作栏 - 固定在右侧 -->
      <div class="article-actions" v-if="article">
        <el-button 
          class="action-btn like-btn" 
          size="large"
          :class="{ liked: article.isLiked }"
          @click="handleLikeArticle"
        >
          <span class="text">点赞</span>
          <span class="count">{{ article.likeCount || 0 }}</span>
        </el-button>
        <el-button class="action-btn" size="large">
          <span class="text">收藏</span>
        </el-button>
        <el-button class="action-btn" size="large" @click="handleShare">
          <span class="text">分享</span>
        </el-button>
      </div>
      
      <!-- 评论区 -->
      <Comment v-if="article" :article-id="article.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Comment from '@/components/Comment.vue'
import Skeleton from '@/components/Skeleton.vue'
import { getArticleDetail, addArticleView, likeArticle, getArticleLikeCount } from '@/api/article'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 是否是博主
const isAuthor = computed(() => {
  if (!userStore.isLoggedIn || !userStore.user) return false
  const roles = userStore.user.roles || []
  return roles.some((role: any) => role.name === '博主' || role.name === '超级管理员')
})

interface Article {
  id: string | number
  articleName: string
  articleContent: string
  articleCover?: string
  articleCategory?: string
  articleTag?: string
  readNum?: number
  likeCount?: number
  createTime?: number
  isLiked?: boolean
}

const article = ref<Article | null>(null)
const loading = ref(false)

// 获取文章详情
const fetchArticleDetail = async () => {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('文章ID不存在')
    return
  }
  
  loading.value = true
  try {
    const res: any = await getArticleDetail({ id: id })
    
    if (res) {
      article.value = res
      // 增加查看次数（博主不增加）
      if (!isAuthor.value) {
        incrementViewCount(id)
      }
      // 查询最新点赞数量
      await fetchLikeCount(id)
    }
  } catch (error) {
    ElMessage.error('获取文章详情失败')
  } finally {
    loading.value = false
  }
}

// 查询点赞数量
const fetchLikeCount = async (id: string) => {
  try {
    const res: any = await getArticleLikeCount(id)
    if (article.value && res !== undefined) {
      article.value.likeCount = res
    }
  } catch (error) {
    // 静默失败，不影响用户体验
  }
}

// 增加查看次数
const incrementViewCount = async (id: string) => {
  try {
    await addArticleView({ id })
  } catch (error) {
    // 静默失败，不影响用户体验
  }
}

// 点赞文章
const handleLikeArticle = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    })
    return
  }
  
  if (!article.value) return
  
  // 保存当前状态
  const wasLiked = article.value.isLiked
  
  try {
    await likeArticle({
      articleId: article.value.id,
      type: wasLiked ? 2 : 1  // 已点赞则取消(2)，未点赞则点赞(1)
    })
    
    // 切换本地状态
    if (wasLiked) {
      // 取消点赞
      article.value.isLiked = false
    } else {
      // 点赞
      article.value.isLiked = true
    }
    
    // 查询最新点赞数量
    await fetchLikeCount(article.value.id as string)
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

// 分享文章
const handleShare = async () => {
  try {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制链接')
  }
}

// 格式化时间
const formatTime = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

// 解析标签字符串为数组
const parseTags = (tagStr?: string) => {
  if (!tagStr) return []
  return tagStr.split(',').map(t => t.trim()).filter(t => t)
}

// 跳转到标签文章列表
const goToTag = (tag: string) => {
  router.push(`/tag/articles?tag=${tag}`)
}

onMounted(() => {
  fetchArticleDetail()
})
</script>

<style scoped lang="scss">
.article-detail {
  min-height: calc(100vh - 200px);
  padding: 112px 0 80px;
  position: relative;
}

.container {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 24px;
}

// ── 文章卡片（玻璃态对齐 Home.vue）────────────────────
.article-content {
  padding: 56px 64px;
  margin-bottom: 24px;
  background: var(--bg-card);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);

  .article-title {
    font-family: var(--font-display, var(--font-serif));
    font-size: 38px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--text-primary);
    line-height: 1.25;
    margin: 0 0 24px 0;
    text-align: center;
  }

  .article-info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 10px 18px;
    font-size: 13px;
    color: var(--text-tertiary);
    padding-bottom: 28px;
    margin-bottom: 36px;
    border-bottom: 1px solid var(--border-color);
    font-family: var(--font-sans);

    .info-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;

      &.tags {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        justify-content: center;

        // 与 Home.vue tag 一致
        .tag {
          padding: 2px 10px;
          border-radius: var(--radius-tag);
          background: var(--bg-secondary);
          color: var(--text-tertiary);
          font-size: 11px;
          border: 1px solid transparent;
          transition: all 0.2s;
          cursor: pointer;

          &:hover {
            background: transparent;
            border-color: var(--color-accent);
            color: var(--color-accent);
          }
        }
      }
    }

    .info-right {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .info-divider {
      color: var(--border-strong);
      margin: 0 2px;
      opacity: 0.6;
    }
  }

  .content {
    font-size: 16px;
    line-height: 1.9;
    color: var(--text-secondary);
    font-family: var(--font-sans);

    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      font-family: var(--font-serif);
      font-weight: 700;
      color: var(--text-primary);
    }

    :deep(h2) {
      font-size: 24px;
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 8px;
      margin: 40px 0 16px;
    }

    :deep(h3) {
      font-size: 20px;
      margin: 32px 0 12px;
    }

    :deep(h4) {
      font-size: 17px;
      margin: 24px 0 10px;
    }

    :deep(p) {
      margin: 16px 0;
    }

    :deep(img) {
      max-width: 100%;
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-card);
      margin: 24px 0;
      display: block;
    }

    :deep(blockquote) {
      margin: 24px 0;
      padding: 16px 20px;
      background: var(--bg-secondary);
      border-left: 3px solid var(--color-accent);
      border-radius: 0 var(--radius-btn) var(--radius-btn) 0;
      color: var(--text-secondary);
      font-style: italic;

      p {
        margin: 0;
      }
    }

    :deep(code) {
      padding: 2px 6px;
      background: var(--bg-secondary);
      border-radius: 4px;
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 0.88em;
      color: var(--color-accent);
    }

    :deep(pre) {
      margin: 24px 0;
      padding: 20px 24px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-card);
      overflow-x: auto;

      code {
        padding: 0;
        background: none;
        color: var(--text-secondary);
        font-size: 13px;
        line-height: 1.7;
        border: none;
      }
    }

    :deep(ul), :deep(ol) {
      padding-left: 24px;
      margin: 16px 0;

      li {
        margin: 8px 0;
        color: var(--text-secondary);
      }
    }

    :deep(a) {
      color: var(--color-accent);
      text-decoration: none;
      border-bottom: 1px solid rgba(74, 140, 110, 0.2);
      transition: border-color 0.2s;

      &:hover {
        border-bottom-color: var(--color-accent);
      }
    }

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 14px;

      th {
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-weight: 700;
        padding: 10px 14px;
        border: 1px solid var(--border-color);
        text-align: left;
        font-family: var(--font-sans);
        font-size: 13px;
      }

      td {
        padding: 10px 14px;
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
      }

      tr:hover td {
        background: var(--bg-secondary);
      }
    }

    :deep(hr) {
      border: none;
      border-top: 1px solid var(--border-color);
      margin: 32px 0;
    }
  }
}

// ── 侧边操作栏（精致文字药丸）────────────────────────
.article-actions {
  position: fixed;
  right: calc((100vw - 860px) / 2 - 96px);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;

  .action-btn {
    width: 64px;
    min-height: auto;
    height: auto;
    padding: 14px 8px;
    border-radius: var(--radius-card);
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    backdrop-filter: var(--blur-glass);
    -webkit-backdrop-filter: var(--blur-glass);
    box-shadow: var(--shadow-card);
    color: var(--text-secondary);
    font-family: var(--font-sans);
    transition: box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease, transform 0.25s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    position: relative;

    .text {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 600;
      letter-spacing: 0.04em;
      transition: color 0.2s ease;
    }

    .count {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-tertiary);
      letter-spacing: 0.02em;
      transition: color 0.2s ease;
    }

    &:hover {
      border-color: var(--border-strong);
      box-shadow: var(--shadow-card-hover);
      transform: translateY(-2px);

      .text { color: var(--color-accent); }
      .count { color: var(--color-accent); }
    }

    &.like-btn.liked {
      border-color: var(--color-accent);
      background: rgba(22, 93, 255, 0.08);

      .text { color: var(--color-accent); }
      .count { color: var(--color-accent); }
    }
  }
}

@media (max-width: 1200px) {
  .article-actions {
    display: none;
  }
}

@media (max-width: 768px) {
  .article-detail {
    padding: 24px 0 60px;
  }

  .article-detail .container {
    padding: 0;
  }

  .article-content {
    padding: 32px 22px;
    border-radius: 0;
    margin-bottom: 16px;

    .article-title {
      font-size: 26px;
      letter-spacing: -0.02em;
      margin-bottom: 18px;
    }

    .article-info {
      gap: 8px;
      font-size: 12px;
      padding-bottom: 18px;
      margin-bottom: 24px;
      flex-direction: column;
      align-items: center;

      .info-item.tags {
        width: 100%;
        justify-content: center;
      }

      .info-right {
        flex-wrap: wrap;
        justify-content: center;
        gap: 6px;
      }

      .info-divider {
        display: none;
      }
    }

    .content {
      font-size: 15px;
      line-height: 1.85;

      :deep(h2) {
        font-size: 20px;
        margin: 32px 0 12px;
      }

      :deep(h3) {
        font-size: 17px;
        margin: 24px 0 10px;
      }

      :deep(pre) {
        padding: 14px 16px;
        font-size: 12px;
      }

      :deep(table) {
        display: block;
        overflow-x: auto;
      }
    }
  }

  // 移动端浮动操作条
  .article-actions {
    position: fixed;
    right: 14px;
    bottom: 80px;
    top: auto;
    transform: none;
    flex-direction: row;
    gap: 10px;
    display: flex;

    .action-btn {
      width: 56px;
      padding: 10px 6px;

      .text { font-size: 11px; }
      .count { font-size: 10px; }
    }
  }
}
</style>
