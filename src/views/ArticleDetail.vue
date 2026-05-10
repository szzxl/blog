<template>
  <div class="article-detail">
    <!-- ── Banner ─────────────────────────────────────── -->
    <div class="page-banner">
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <template v-if="loading">
          <div class="banner-title-skeleton"></div>
          <div class="banner-sub-skeleton"></div>
        </template>
        <template v-else-if="article">
          <h1 class="banner-title">{{ article.articleName }}</h1>
          <p class="banner-sub">
            <span v-if="article.createTime">{{ formatTime(article.createTime) }}</span>
            <span class="banner-sep" v-if="article.createTime && article.articleCategory">·</span>
            <span v-if="article.articleCategory">{{ article.articleCategory }}</span>
            <span class="banner-sep" v-if="article.readNum !== undefined">·</span>
            <span v-if="article.readNum !== undefined">{{ article.readNum }} 阅读</span>
          </p>
        </template>
      </div>
    </div>

    <!-- ── 主内容区 ───────────────────────────────────── -->
    <div class="main-wrap">
      <div class="container">
        <!-- 骨架屏 -->
        <Skeleton v-if="loading" type="article-detail" />

        <!-- 文章内容卡片 -->
        <article v-else-if="article" class="article-content">
          <!-- 标签行 -->
          <div class="article-tags" v-if="article.articleTag">
            <span
              class="tag"
              v-for="(tag, index) in parseTags(article.articleTag)"
              :key="index"
              @click="goToTag(tag)"
            >{{ tag }}</span>
          </div>

          <div class="content" v-html="article.articleContent"></div>
        </article>

        <!-- 评论区 -->
        <Comment v-if="article" :article-id="article.id" />
      </div>
    </div>

    <!-- ── 固定操作栏（右侧） ─────────────────────────── -->
    <div class="article-actions" v-if="article">
      <button
        class="action-btn like-btn"
        :class="{ liked: article.isLiked }"
        @click="handleLikeArticle"
        title="点赞"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span class="count">{{ article.likeCount || 0 }}</span>
      </button>

      <button class="action-btn" title="收藏">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <span class="count">收藏</span>
      </button>

      <button class="action-btn" @click="handleShare" title="分享">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        <span class="count">分享</span>
      </button>
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
// ── Banner ─────────────────────────────────────────────
.page-banner {
  position: relative;
  height: 200px;
  background: url('/bg-banner.png') center 30% / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .banner-overlay {
    position: absolute;
    inset: 0;
    background: rgba(5, 12, 30, 0.62);
  }

  .banner-content {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 0 24px;
    max-width: 860px;
    width: 100%;

    .banner-title {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 800;
      color: #fff;
      text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
      margin: 0 0 10px 0;
      line-height: 1.3;
      letter-spacing: -0.01em;
    }

    .banner-sub {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.65);
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      flex-wrap: wrap;
      font-family: var(--font-sans);

      .banner-sep {
        opacity: 0.5;
      }
    }

    // 骨架占位
    .banner-title-skeleton {
      height: 36px;
      width: 60%;
      margin: 0 auto 12px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .banner-sub-skeleton {
      height: 14px;
      width: 35%;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      animation: pulse 1.5s ease-in-out infinite 0.3s;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  }
}

// ── 主内容包装器 ───────────────────────────────────────
.main-wrap {
  padding-top: 48px;
  padding-bottom: 80px;
}

.container {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 24px;
}

// ── 文章内容卡片 ───────────────────────────────────────
.article-content {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  padding: 52px 64px;
  margin-bottom: 32px;

  .article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 32px;

    .tag {
      padding: 3px 12px;
      border-radius: var(--radius-tag);
      background: var(--bg-secondary);
      color: var(--text-tertiary);
      font-size: 12px;
      border: 1px solid transparent;
      transition: all 0.2s;
      cursor: pointer;
      font-family: var(--font-sans);

      &:hover {
        background: transparent;
        border-color: var(--color-accent);
        color: var(--color-accent);
      }
    }
  }

  .content {
    font-size: 16px;
    line-height: 1.9;
    color: var(--text-secondary);
    font-family: var(--font-article);

    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      font-family: var(--font-article);
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
      border-bottom: 1px solid rgba(22, 93, 255, 0.2);
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

// ── 固定操作栏（右侧） ────────────────────────────────
.article-actions {
  position: fixed;
  right: calc((100vw - 860px) / 2 - 88px);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;

  .action-btn {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    backdrop-filter: var(--blur-glass);
    -webkit-backdrop-filter: var(--blur-glass);
    box-shadow: var(--shadow-card);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    transition: all 0.25s ease;
    padding: 0;

    svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      transition: color 0.2s;
    }

    .count {
      font-size: 10px;
      font-family: var(--font-sans);
      font-weight: 600;
      color: var(--text-tertiary);
      line-height: 1;
      transition: color 0.2s;
    }

    &:hover {
      border-color: var(--color-accent);
      box-shadow: var(--shadow-glow);
      transform: translateY(-2px);
      color: var(--color-accent);

      .count { color: var(--color-accent); }
    }

    &.like-btn.liked {
      border-color: var(--color-accent);
      background: rgba(22, 93, 255, 0.08);
      color: var(--color-accent);

      .count { color: var(--color-accent); }
    }
  }
}

// ── 响应式 ────────────────────────────────────────────
@media (max-width: 1200px) {
  .article-actions {
    display: none;
  }
}

@media (max-width: 768px) {
  .page-banner {
    height: 160px;

    .banner-content .banner-title {
      font-size: 1.6rem;
    }
  }

  .main-wrap {
    padding-top: 32px;
    padding-bottom: 60px;
  }

  .container {
    padding: 0;
  }

  .article-content {
    padding: 32px 22px;
    border-radius: 0;
    margin-bottom: 16px;

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

  // 移动端底部浮动操作条
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
      width: 46px;
      height: 46px;

      svg { width: 16px; height: 16px; }
      .count { font-size: 9px; }
    }
  }
}
</style>
