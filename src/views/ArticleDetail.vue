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
            <span class="icon">🏷️</span>
            <span 
              class="tag" 
              v-for="(tag, index) in parseTags(article.articleTag)" 
              :key="index"
              @click="goToTag(tag)"
            >{{ tag }}</span>
          </span>
          
          <!-- 右侧：阅读数、点赞数、时间 -->
          <div class="info-right">
            <span class="info-item" v-if="article.readNum !== undefined">
              <span class="icon">👁️</span>
              {{ article.readNum }} 阅读
            </span>
            <span class="info-item" v-if="article.likeCount">
              <span class="icon">💗</span>
              {{ article.likeCount }} 点赞
            </span>
            <span class="info-divider" v-if="article.createTime">|</span>
            <span class="info-item" v-if="article.createTime">
              <span class="icon">📅</span>
              {{ formatTime(article.createTime) }}
            </span>
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
          <span class="icon">{{ article.isLiked ? '💗' : '🤍' }}</span>
          <span class="text">点赞</span>
          <span class="count">{{ article.likeCount || 0 }}</span>
        </el-button>
        <el-button class="action-btn" size="large">
          <span class="icon">⭐</span>
          <span class="text">收藏</span>
        </el-button>
        <el-button class="action-btn" size="large" @click="handleShare">
          <span class="icon">🔗</span>
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
  padding: 40px 0 60px;
  position: relative;
}

.container {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 24px;
}

.article-content {
  padding: 40px 48px;
  margin-bottom: 20px;

  .article-title {
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.5;
    margin: 0 0 24px 0;
    text-align: center;
    font-family: 'JetBrains Mono', monospace;
  }

  .article-info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    font-size: 13px;
    color: var(--text-tertiary);
    padding-bottom: 24px;
    margin-bottom: 28px;
    border-bottom: 1px solid var(--border-color);
    font-family: 'JetBrains Mono', monospace;

    .info-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;

      &.tags {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex: 1;

        .tag {
          padding: 3px 10px;
          border-radius: var(--radius-tag);
          background: transparent;
          border: 1px solid rgba(0, 212, 170, 0.4);
          color: var(--color-accent);
          font-size: 12px;
          font-weight: 600;
          transition: all 0.15s;
          cursor: pointer;

          &:hover {
            background: rgba(0, 212, 170, 0.1);
            border-color: var(--color-accent);
          }
        }
      }
    }

    .info-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .info-divider {
      color: var(--border-color);
    }
  }

  .content {
    font-size: 16px;
    line-height: 2;
    color: var(--text-secondary);

    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      font-weight: 700;
      color: var(--text-primary);
      margin-top: 36px;
      margin-bottom: 16px;
      font-family: 'JetBrains Mono', monospace;
    }

    :deep(h2) {
      font-size: 22px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-color);
      color: var(--color-accent);
    }

    :deep(h3) {
      font-size: 18px;

      &::before {
        content: '## ';
        color: var(--color-accent);
        opacity: 0.6;
      }
    }

    :deep(p) {
      margin: 16px 0;
    }

    :deep(img) {
      max-width: 100%;
      border-radius: var(--radius-card);
      border: 1px solid var(--border-color);
      margin: 24px 0;
    }

    :deep(blockquote) {
      margin: 24px 0;
      padding: 16px 20px;
      background: rgba(0, 212, 170, 0.04);
      border-left: 3px solid var(--color-accent);
      color: var(--text-tertiary);
      font-style: italic;

      p {
        margin: 0;
      }
    }

    :deep(code) {
      padding: 2px 6px;
      background: rgba(0, 212, 170, 0.08);
      border-radius: 3px;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.88em;
      color: var(--color-accent);
      border: 1px solid rgba(0, 212, 170, 0.2);
    }

    :deep(pre) {
      margin: 24px 0;
      padding: 20px 24px;
      background: var(--bg-secondary);
      border-radius: var(--radius-card);
      overflow-x: auto;
      border: 1px solid var(--border-color);

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
      border-bottom: 1px solid rgba(0, 212, 170, 0.3);
      transition: border-color 0.15s;

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
        color: var(--color-accent);
        font-weight: 700;
        padding: 10px 14px;
        border: 1px solid var(--border-color);
        text-align: left;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        text-transform: uppercase;
      }

      td {
        padding: 10px 14px;
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
      }

      tr:hover td {
        background: rgba(0, 212, 170, 0.03);
      }
    }

    :deep(hr) {
      border: none;
      border-top: 1px solid var(--border-color);
      margin: 32px 0;
    }
  }
}

.article-actions {
  position: fixed;
  right: calc((100vw - 860px) / 2 - 100px);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;

  .action-btn {
    width: 60px;
    height: 60px;
    padding: 0;
    border-radius: var(--radius-card);
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 600;
    transition: all 0.15s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    position: relative;
    font-family: 'JetBrains Mono', monospace;

    .icon {
      font-size: 20px;
    }

    .text {
      font-size: 11px;
      color: var(--text-tertiary);
    }

    .count {
      position: absolute;
      top: -6px;
      right: -6px;
      padding: 1px 6px;
      background: var(--color-accent);
      color: var(--bg-primary);
      border-radius: 10px;
      font-size: 10px;
      font-weight: 700;
      min-width: 18px;
      text-align: center;
    }

    &:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
      box-shadow: var(--shadow-glow);
    }

    &.like-btn.liked {
      background: rgba(0, 212, 170, 0.1);
      border-color: var(--color-accent);
      color: var(--color-accent);
    }
  }
}

@media (max-width: 1200px) {
  .article-actions {
    display: none;
  }
}

@media (max-width: 768px) {
  .article-detail .container {
    padding: 0;
  }

  .article-content {
    padding: 24px 16px;
    border-radius: 0;
    margin-bottom: 16px;

    .article-title {
      font-size: 20px;
      margin-bottom: 16px;
    }

    .article-info {
      gap: 10px;
      font-size: 12px;
      padding-bottom: 14px;
      margin-bottom: 20px;
      flex-direction: column;
      align-items: flex-start;

      .info-item.tags {
        width: 100%;
        flex-wrap: wrap;
      }

      .info-right {
        width: 100%;
        flex-wrap: wrap;
        gap: 10px;
      }

      .info-divider {
        display: none;
      }
    }

    .content {
      font-size: 15px;
      line-height: 1.85;

      :deep(h2) { font-size: 18px; }
      :deep(h3) { font-size: 16px; }

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
      width: 48px;
      height: 48px;

      .icon { font-size: 18px; }
      .text { display: none; }
    }
  }
}
</style>
