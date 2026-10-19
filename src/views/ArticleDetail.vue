<template>
  <div class="article-detail container" :class="{ 'focus-mode': focusMode }">
    <button v-if="focusMode" class="focus-exit" @click="focusMode = false">退出专注阅读 ×</button>
    <div
      class="read-progress-bar"
      :style="{ width: readProgress + '%' }"
      role="progressbar"
      aria-label="正文阅读进度"
      :aria-valuenow="readProgress"
      :aria-valuemin="0"
      :aria-valuemax="100"
    ></div>
    <nav class="breadcrumb" aria-label="阅读位置">
      <router-link to="/">首页</router-link><span>/</span
      ><router-link :to="articleIndex">文章索引</router-link><span>/</span
      ><span aria-current="page">正文</span>
    </nav>
    <Skeleton v-if="loading" type="article-detail" />
    <div v-else-if="loadError" class="load-error" role="alert">
      <p>文章暂时无法加载，也可能尚未发布或已被删除。</p>
      <el-button @click="fetchArticleDetail">重新加载</el-button
      ><router-link to="/articles">返回文章索引 →</router-link>
    </div>
    <div v-else-if="article" class="reading-layout">
      <nav class="toc-panel" aria-label="文章目录">
        <strong>本篇目录</strong>
        <ul v-if="tocItems.length">
          <li
            v-for="item in tocItems"
            :key="item.id"
            :class="[`toc-h${item.level}`, { active: activeId === item.id }]"
          >
            <button
              @click="scrollToHeading(item.id)"
              :aria-current="activeId === item.id ? 'location' : undefined"
            >
              {{ item.text }}
            </button>
          </li>
        </ul>
        <p v-else class="toc-empty">这篇文章没有分节。</p>
        <button class="toc-comment" @click="scrollToComments">参与评论 ↓</button>
        <p class="toc-progress">阅读进度 {{ readProgress }}%</p>
      </nav>
      <div class="reading-main">
        <article class="article-content">
          <header class="article-heading">
            <router-link
              v-if="article.articleCategory"
              class="category-link"
              :to="{ path: '/articles', query: { category: article.articleCategory } }"
              >{{ article.articleCategory }}</router-link
            >
            <h1>{{ article.articleName }}</h1>
            <div class="article-meta">
              <time v-if="article.createTime">{{ formatTime(article.createTime) }}</time
              ><span v-if="article.readNum !== undefined">{{ article.readNum }} 次阅读</span
              ><span v-if="readingTime">约 {{ readingTime }} 分钟</span>
            </div>
          </header>
          <div class="reading-options" aria-label="阅读设置">
            <span>字号</span
            ><button :aria-pressed="readingSize === 16" @click="readingSize = 16">标准</button
            ><button :aria-pressed="readingSize === 18" @click="readingSize = 18">大字</button
            ><button class="focus-toggle" :aria-pressed="focusMode" @click="focusMode = !focusMode">
              {{ focusMode ? '退出专注' : '专注阅读' }}
            </button>
          </div>
          <details
            v-if="tocItems.length"
            class="mobile-toc"
            :open="mobileTocOpen"
            @toggle="mobileTocOpen = ($event.target as HTMLDetailsElement).open"
          >
            <summary>本篇目录 · {{ tocItems.length }} 节</summary>
            <button v-for="item in tocItems" :key="item.id" @click="scrollToHeading(item.id)">
              {{ item.text }}
            </button>
          </details>
          <div
            class="content"
            :style="{ fontSize: readingSize + 'px' }"
            v-html="htmlContent"
            @click="handleContentClick"
          ></div>
          <div v-if="article.articleTag" class="article-tags">
            <button
              v-for="tag in parseTags(article.articleTag)"
              :key="tag"
              class="tag"
              @click="goToTag(tag)"
            >
              # {{ tag }}
            </button>
          </div>
          <section id="article-comments" class="reader-comments" aria-label="文章评论">
            <Comment :key="article.id" :article-id="article.id" />
          </section>
        </article>
        <div class="article-actions" aria-label="文章操作" v-if="article">
          <button
            class="action-btn like-btn"
            :class="{ liked: article.isLiked }"
            :aria-pressed="!!article.isLiked"
            :disabled="likeLoading"
            @click="handleLikeArticle"
            title="点赞"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              ></path>
            </svg>
            <span class="count">{{ article.likeCount || 0 }}</span>
          </button>

          <button
            class="action-btn favorite-btn"
            :class="{ favorited: article.isFavorited }"
            :aria-pressed="!!article.isFavorited"
            :disabled="favoriteLoading"
            @click="handleFavorite"
            :title="article.isFavorited ? '取消收藏' : '收藏'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span class="count">{{
              favoriteLoading ? '…' : article.isFavorited ? '已收藏' : '收藏'
            }}</span>
          </button>

          <button class="action-btn" @click="handleShare" title="分享">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span class="count">分享</span>
          </button>
          <button class="action-btn" @click="scrollToComments">
            <span aria-hidden="true">↓</span><span class="count">评论</span>
          </button>
        </div>
      </div>
    </div>
    <Transition name="lightbox"
      ><div
        v-if="lightboxSrc"
        class="lightbox-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="文章图片预览"
        @click="closeLightbox"
      >
        <img :src="lightboxSrc" class="lightbox-img" alt="文章图片大图" @click.stop /><button
          class="lightbox-close"
          @click="closeLightbox"
          aria-label="关闭图片预览"
        >
          ×
        </button>
      </div></Transition
    >
  </div>
</template>

<script setup lang="ts">
import { showRequestError } from '@/utils/requestError'

import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import DOMPurify from 'dompurify'
import { useRoute, useRouter } from 'vue-router'
import Comment from '@/components/Comment.vue'
import Skeleton from '@/components/Skeleton.vue'
import {
  getArticleDetail,
  addArticleView,
  likeArticle,
  getArticleLikeCount,
  addFavorite,
  removeFavorite
} from '@/api/article'
import { formatTimestamp, parseTags } from '@/utils/format'
import { ElMessage } from 'element-plus/es/components/message/index'
import { useUserStore } from '@/stores/user'
import { useSeo } from '@/composables/useSeo'
import { createLatestRequest } from '@/utils/latestRequest'

interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 是否是博主
const isAuthor = computed(() => userStore.isAuthor)

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
  isFavorited?: boolean
}

const article = ref<Article | null>(null)
const loading = ref(false)
const loadError = ref(false)
const favoriteLoading = ref(false)
const likeLoading = ref(false)
const articleRequest = createLatestRequest()
const likeCountRequest = createLatestRequest()
let disposed = false
const readProgress = ref(0)
const tocItems = ref<TocItem[]>([])
const tocEls = ref<{ id: string; el: HTMLElement }[]>([])
const tocOffsets = ref<{ id: string; top: number }[]>([])
const activeId = ref('')
const htmlContent = ref('')
const lightboxSrc = ref('')
const readingSize = ref(16)
const focusMode = ref(false)
const mobileTocOpen = ref(false)
const articleIndex =
  typeof window.history.state?.back === 'string' &&
  /^\/(articles|tag\/articles)([?#]|$)/.test(window.history.state.back)
    ? window.history.state.back
    : '/articles'
watch(focusMode, (value) => document.body.classList.toggle('reading-focus', value))
let parseIdleId: number | null = null
let scrollRaf: number | null = null

const readingTime = computed(() => {
  if (!article.value?.articleContent) return 0
  const text = article.value.articleContent.replace(/<[^>]+>/g, '').replace(/\s+/g, '')
  return Math.max(1, Math.ceil(text.length / 300))
})

function injectHeadingIds(html: string): { html: string; toc: TocItem[] } {
  if (!html) return { html: '', toc: [] }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const toc: TocItem[] = []
  const seen = new Map<string, number>()
  doc.querySelectorAll('h2, h3').forEach((el) => {
    const text = el.textContent?.trim() || ''
    const base =
      text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w一-龥-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'h'
    const n = seen.get(base) ?? 0
    seen.set(base, n + 1)
    const id = n === 0 ? base : `${base}-${n}`
    el.setAttribute('id', id)
    toc.push({ id, text, level: Number(el.tagName[1]) as 2 | 3 })
  })
  return { html: doc.body.innerHTML, toc }
}

watch(
  () => article.value?.articleContent,
  (content) => {
    if (parseIdleId !== null) {
      cancelIdleCallback(parseIdleId)
      parseIdleId = null
    }
    if (!content) {
      htmlContent.value = ''
      tocItems.value = []
      return
    }
    const run = () => {
      parseIdleId = null
      if (disposed) return
      const { html, toc } = injectHeadingIds(DOMPurify.sanitize(content))
      htmlContent.value = html
      tocItems.value = toc
    }
    // 超过 50KB 的文章用空闲时间解析，避免阻塞主线程
    if (typeof requestIdleCallback !== 'undefined' && content.length > 50_000) {
      parseIdleId = requestIdleCallback(run, { timeout: 800 })
    } else {
      run()
    }
  },
  { immediate: true }
)

watch(article, (a) => {
  if (!a) return
  useSeo({
    title: a.articleName,
    description: a.articleContent,
    image: a.articleCover,
    type: 'article',
    article: { id: String(a.id), published: a.createTime, author: undefined }
  })
})

// 代码块复制按钮（DOM 渲染后注入）
const setupCodeCopy = () => {
  nextTick(() => {
    document.querySelectorAll('.article-content .content pre').forEach((pre) => {
      if (pre.querySelector('.copy-btn')) return
      const btn = document.createElement('button')
      btn.className = 'copy-btn'
      btn.textContent = '复制'
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const text = (pre.querySelector('code')?.textContent ?? pre.textContent ?? '').trim()
        try {
          await navigator.clipboard.writeText(text)
          btn.textContent = '✓ 已复制'
          btn.classList.add('copied')
          setTimeout(() => {
            btn.textContent = '复制'
            btn.classList.remove('copied')
          }, 2000)
        } catch {
          /* 不支持 clipboard API */
        }
      })
      pre.appendChild(btn)
    })
  })
}

let contentObserver: ResizeObserver | null = null
const headingTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY
const measureHeadings = () => {
  tocOffsets.value = tocEls.value.map(({ id, el }) => ({ id, top: headingTop(el) }))
  updateProgress()
}
watch(htmlContent, () => {
  setupCodeCopy()
  nextTick(() => {
    tocEls.value = tocItems.value
      .map((item) => ({ id: item.id, el: document.getElementById(item.id)! }))
      .filter((x) => x.el)
    // 缓存各标题的 offsetTop，避免滚动时反复触发强制重排
    measureHeadings()
    contentObserver?.disconnect()
    const content = document.querySelector('.article-content .content')
    if (content && typeof ResizeObserver !== 'undefined') {
      contentObserver = new ResizeObserver(measureHeadings)
      contentObserver.observe(content)
    }
  })
})

const updateProgress = () => {
  const content = document.querySelector<HTMLElement>('.article-content .content')
  if (content) {
    const start = content.getBoundingClientRect().top + window.scrollY - 100
    const length = Math.max(1, content.offsetHeight - window.innerHeight * 0.5)
    readProgress.value = Math.min(
      100,
      Math.max(0, Math.round(((window.scrollY - start) / length) * 100))
    )
  } else readProgress.value = 0

  if (tocOffsets.value.length) {
    const top = window.scrollY + 100
    let current = ''
    for (const { id, top: elTop } of tocOffsets.value) {
      if (elTop <= top) current = id
    }
    if (current) activeId.value = current
  }
}

const handleScroll = () => {
  if (scrollRaf !== null) return
  scrollRaf = requestAnimationFrame(() => {
    updateProgress()
    scrollRaf = null
  })
}

const scrollToHeading = (id: string) => {
  const el = tocEls.value.find((x) => x.id === id)?.el ?? document.getElementById(id)
  if (!el) return
  window.scrollTo({ top: headingTop(el) - 80, behavior: 'smooth' })
  activeId.value = id
  mobileTocOpen.value = false
}

// 灯箱预览
const handleContentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.tagName === 'IMG') {
    lightboxSrc.value = (target as HTMLImageElement).src
  }
}
const closeLightbox = () => {
  lightboxSrc.value = ''
}
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeLightbox()
    focusMode.value = false
  }
}

// 获取文章详情
const fetchArticleDetail = async () => {
  const requestId = articleRequest.next()
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('文章ID不存在')
    return
  }

  if (parseIdleId !== null) {
    cancelIdleCallback(parseIdleId)
    parseIdleId = null
  }
  article.value = null
  htmlContent.value = ''
  tocItems.value = []
  tocEls.value = []
  tocOffsets.value = []
  activeId.value = ''
  readProgress.value = 0
  lightboxSrc.value = ''
  loadError.value = false
  loading.value = true
  try {
    const res: any = await getArticleDetail({ id: id })

    if (!articleRequest.isCurrent(requestId)) return
    if (res) {
      article.value = res
      // 增加查看次数（博主不增加）
      if (!isAuthor.value) {
        incrementViewCount(id)
      }
      // 查询最新点赞数量
      if (article.value) void fetchLikeCount(article.value)
    } else loadError.value = true
  } catch (error) {
    if (articleRequest.isCurrent(requestId)) loadError.value = true
  } finally {
    if (articleRequest.isCurrent(requestId)) loading.value = false
  }
}

// 查询点赞数量
const fetchLikeCount = async (target: Article) => {
  const requestId = likeCountRequest.next()
  try {
    const res: any = await getArticleLikeCount(target.id)
    if (
      !disposed &&
      likeCountRequest.isCurrent(requestId) &&
      article.value === target &&
      res !== undefined
    ) {
      target.likeCount = res
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

  if (!article.value || likeLoading.value) return

  // 保存当前状态
  const target = article.value
  const wasLiked = target.isLiked
  likeLoading.value = true

  try {
    await likeArticle({
      articleId: target.id,
      type: wasLiked ? 2 : 1 // 已点赞则取消(2)，未点赞则点赞(1)
    })

    if (disposed || article.value !== target) return
    target.isLiked = !wasLiked

    // 查询最新点赞数量
    await fetchLikeCount(target)
  } catch (error) {
    showRequestError(error, '操作失败，请重试')
  } finally {
    likeLoading.value = false
  }
}

// 收藏/取消收藏
const handleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  if (!article.value || !userStore.user || favoriteLoading.value) return

  const target = article.value
  const wasFavorited = target.isFavorited
  favoriteLoading.value = true
  try {
    if (wasFavorited) {
      await removeFavorite({ articleId: target.id, userId: userStore.user.id })
      if (disposed || article.value !== target) return
      target.isFavorited = false
      ElMessage.success('已取消收藏')
    } else {
      await addFavorite({
        articleId: target.id,
        articleName: target.articleName,
        articleTime: formatTimestamp(target.createTime, 'YYYY-MM-DD HH:mm:ss'),
        userId: Number(userStore.user.id)
      })
      if (disposed || article.value !== target) return
      target.isFavorited = true
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    showRequestError(error, '操作失败，请重试')
  } finally {
    favoriteLoading.value = false
  }
}

// 分享文章
const handleShare = async () => {
  try {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    showRequestError(error, '复制失败，请手动复制链接')
  }
}

// 格式化时间
const formatTime = (timestamp?: number) => formatTimestamp(timestamp, 'YYYY-MM-DD HH:mm')

// 跳转到标签文章列表
const goToTag = (tag: string) => {
  router.push({ path: '/tag/articles', query: { tag } })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', measureHeadings)
  window.addEventListener('keydown', onKeydown)
})

watch(
  () => route.params.id,
  () => {
    focusMode.value = false
    mobileTocOpen.value = false
    void fetchArticleDetail()
  },
  { immediate: true }
)
watch([readingSize, focusMode], () => {
  void nextTick(measureHeadings)
})

onUnmounted(() => {
  document.body.classList.remove('reading-focus')
  disposed = true
  articleRequest.invalidate()
  likeCountRequest.invalidate()
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', measureHeadings)
  contentObserver?.disconnect()
  window.removeEventListener('keydown', onKeydown)
  if (scrollRaf !== null) cancelAnimationFrame(scrollRaf)
  if (parseIdleId !== null) cancelIdleCallback(parseIdleId)
})

const scrollToComments = () =>
  document
    .getElementById('article-comments')
    ?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    })
</script>
<style scoped lang="scss">
.article-detail {
  padding-top: 24px;
  padding-bottom: 60px;
}
.read-progress-bar {
  position: fixed;
  height: 3px;
  top: 0;
  left: 0;
  background: var(--color-accent);
  z-index: 200;
  pointer-events: none;
}
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  font-size: 12px;
  color: var(--text-tertiary);
}
.reading-layout {
  display: grid;
  grid-template-columns: clamp(160px, 14vw, 220px) minmax(0, 1fr);
  gap: 36px;
  align-items: start;
}
.reading-main {
  min-width: 0;
}
.article-content {
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  border-radius: 5px;
  padding: 40px clamp(24px, 4vw, 64px);
}
.article-content > * {
  max-width: 780px;
  margin-inline: auto;
}
.category-link {
  font-size: 12px;
  color: var(--color-accent);
}
.article-heading h1 {
  font: 600 clamp(28px, 2.6vw, 38px)/1.5 var(--font-serif);
  text-wrap: pretty;
  overflow-wrap: anywhere;
  margin: 16px 0 18px;
}
.article-meta {
  display: flex;
  gap: 10px 18px;
  flex-wrap: wrap;
  color: var(--text-tertiary);
  font-size: 12px;
  padding-bottom: 26px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 22px;
}
.reading-options {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 28px;
}
.reading-options button {
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: transparent;
  border-radius: 4px;
  font-size: 12px;
}
.reading-options button[aria-pressed='true'] {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: var(--bg-soft);
}
.reading-options .focus-toggle {
  margin-left: auto;
}
.content {
  line-height: 1.95;
  color: var(--text-primary);
  font-family: var(--font-article);
  overflow-wrap: anywhere;
}
.content :deep(h1),
.content :deep(h2),
.content :deep(h3),
.content :deep(h4),
.content :deep(h5),
.content :deep(h6) {
  font-family: var(--font-serif);
  line-height: 1.6;
  font-weight: 600;
  margin: 32px 0 16px;
  scroll-margin-top: 100px;
}
.content :deep(h1) {
  font-size: 1.8em;
}
.content :deep(h2) {
  font-size: 1.5em;
}
.content :deep(h3) {
  font-size: 1.25em;
}
.content :deep(p) {
  margin: 17px 0;
}
.content :deep(img) {
  display: block;
  height: auto;
  margin: 26px auto;
  border-radius: 4px;
  max-width: 100%;
  cursor: zoom-in;
}
.content :deep(blockquote) {
  margin: 26px 0;
  border-left: 2px solid var(--color-ochre);
  padding: 4px 20px;
  color: var(--text-secondary);
  font-size: 0.95em;
}
.content :deep(blockquote p) {
  margin: 0;
}
.content :deep(code) {
  padding: 2px 5px;
  border-radius: 3px;
  background: var(--bg-soft);
  color: var(--color-accent);
  font-family: Consolas, monospace;
  font-size: 0.88em;
}
.content :deep(pre) {
  position: relative;
  max-width: 100%;
  margin: 24px 0;
  padding: 40px 22px 20px;
  background: #20322d;
  border: 1px solid #43584d;
  border-radius: 4px;
  color: #f0eddd;
  overflow: auto;
  line-height: 1.8;
  font-size: 13px;
  overflow-wrap: normal;
  white-space: pre;
}
.content :deep(pre code) {
  padding: 0;
  color: inherit;
  background: transparent;
  font-size: inherit;
}
.content :deep(.code-copy-btn) {
  position: absolute;
  top: 7px;
  right: 9px;
  background: transparent;
  border: 1px solid #6c8274;
  color: #dedecd;
  font-size: 11px;
  padding: 4px 9px;
  border-radius: 3px;
}
.content :deep(ul),
.content :deep(ol) {
  margin: 18px 0;
  padding-left: 25px;
}
.content :deep(ul) {
  list-style: disc;
}
.content :deep(ol) {
  list-style: decimal;
}
.content :deep(li) {
  margin-block: 7px;
}
.content :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.content :deep(table) {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  margin: 22px 0;
  font-size: 14px;
}
.content :deep(th),
.content :deep(td) {
  border: 1px solid var(--border-color);
  padding: 10px 14px;
  text-align: left;
}
.content :deep(th) {
  background: var(--bg-secondary);
}
.content :deep(hr) {
  border: 0;
  border-top: 1px solid var(--border-color);
  margin: 30px 0;
}
.article-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 32px;
}
.tag {
  background: transparent;
  border: 1px solid var(--border-color);
  min-height: 36px;
  padding: 6px 11px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--color-accent);
}
.reader-comments {
  margin-top: 38px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  scroll-margin-top: 100px;
}
.toc-panel {
  position: sticky;
  top: 106px;
  align-self: start;
}
.toc-panel strong {
  display: block;
  font: 18px var(--font-serif);
  color: var(--text-primary);
  margin-bottom: 20px;
}
.toc-panel button {
  border: 0;
  background: transparent;
  min-height: 44px;
  text-align: left;
  font-size: 12px;
  padding: 9px 0;
  line-height: 1.8;
  color: var(--text-tertiary);
  width: 100%;
  overflow-wrap: anywhere;
}
.toc-panel .active button {
  color: var(--color-accent);
  border-left: 2px solid var(--color-accent);
  padding-left: 10px;
}
.toc-h3 {
  padding-left: 12px;
}
.toc-progress {
  border-top: 1px solid var(--border-color);
  padding-top: 18px;
  margin-top: 24px;
  font-size: 12px;
  color: var(--text-tertiary);
}
.toc-empty {
  font-size: 12px;
}
.mobile-toc {
  display: none;
}
.article-actions {
  position: sticky;
  bottom: max(12px, env(safe-area-inset-bottom));
  width: max-content;
  max-width: 100%;
  margin: 22px auto 0;
  padding: 6px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-card);
  display: flex;
  gap: 4px;
  z-index: 8;
  box-shadow: 0 4px 18px #0000000a;
}
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: transparent;
  border: 0;
  padding: 8px 14px;
  min-height: 44px;
  font-size: 12px;
  border-radius: 4px;
}
.action-btn svg {
  width: 16px;
  height: 16px;
}
.action-btn.liked,
.action-btn.favorited {
  color: var(--color-accent);
  background: var(--bg-soft);
}
.action-btn:disabled {
  opacity: 0.6;
}
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: #111b16ed;
  display: grid;
  place-items: center;
  padding: 50px 24px;
  z-index: 2000;
}
.lightbox-img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}
.lightbox-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 44px;
  height: 44px;
  color: white;
  border: 1px solid #ffffff50;
  border-radius: 4px;
  background: #0004;
  font-size: 28px;
}
.focus-mode .reading-layout {
  grid-template-columns: minmax(0, 1fr);
}
.focus-mode .toc-panel {
  display: none;
}
.focus-mode .article-content {
  max-width: 1000px;
  margin-inline: auto;
}
.load-error a {
  margin-left: 15px;
  color: var(--color-accent);
}
@media (max-width: 1000px) {
  .reading-layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .toc-panel {
    display: none;
  }
  .mobile-toc {
    display: block;
    background: var(--bg-soft);
    border-radius: 4px;
    padding: 12px 16px;
    margin-bottom: 24px;
    font-size: 13px;
  }
  .mobile-toc summary {
    cursor: pointer;
    min-height: 30px;
  }
  .mobile-toc button {
    display: block;
    width: 100%;
    border: 0;
    background: transparent;
    text-align: left;
    padding: 10px 0;
    min-height: 44px;
    font-size: 12px;
  }
  .article-content {
    padding: 30px 32px;
  }
}
@media (max-width: 760px) {
  .article-detail {
    padding-top: 18px;
    padding-bottom: 30px;
  }
  .breadcrumb {
    font-size: 11px;
  }
  .article-content {
    padding: 24px 18px;
  }
  .article-heading h1 {
    font-size: 27px;
  }
  .article-meta {
    font-size: 11px;
    gap: 8px 12px;
    padding-bottom: 20px;
  }
  .reading-options {
    gap: 6px;
  }
  .reading-options button {
    font-size: 11px;
    padding-inline: 9px;
  }
  .content :deep(pre) {
    padding-inline: 12px;
    font-size: 12px;
  }
  .article-actions {
    width: 100%;
    gap: 0;
    justify-content: space-around;
  }
  .action-btn {
    font-size: 11px;
    padding-inline: 9px;
  }
  .action-btn svg {
    width: 14px;
    height: 14px;
  }
  .reader-comments {
    padding-top: 10px;
  }
}
.focus-exit {
  position: fixed;
  top: 16px;
  right: 16px;
  min-height: 44px;
  padding: 8px 14px;
  z-index: 110;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 12px;
}
.focus-mode {
  padding-top: 70px;
}
</style>
