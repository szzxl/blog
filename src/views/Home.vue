<template>
  <div class="home">
    <!-- 全屏 Hero -->
    <section class="hero" :style="heroBg">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">{{ siteName || '我的博客' }}</h1>
        <p class="hero-subtitle">
          <span class="typewriter">{{ displayText }}</span>
          <span class="cursor" :class="{ blink: !isTyping }">|</span>
        </p>
        <div class="hero-stats" v-if="articles.length > 0">
          <span class="hero-stat">{{ articles.length }} 篇文章</span>
          <span class="hero-dot">·</span>
          <span class="hero-stat">用心记录每一天</span>
        </div>
        <div class="hero-scroll" @click="scrollToContent">
          <span>向下探索</span>
          <span class="scroll-arrow">↓</span>
        </div>
      </div>
    </section>

    <!-- 主体两栏 -->
    <div class="main-layout container" ref="contentRef">
      <!-- 左侧文章列表 -->
      <div class="article-col">
        <!-- Featured 第一篇 -->
        <div
          v-if="featuredArticle"
          class="featured-card"
          @click="viewArticle(featuredArticle.id)"
        >
          <div class="featured-cover">
            <img :src="featuredArticle.articleCover || '/default-cover.svg'" :alt="featuredArticle.articleName" />
            <div class="featured-cover-overlay"></div>
            <div class="featured-cover-body">
              <span v-if="featuredArticle.articleCategory" class="article-category">{{ featuredArticle.articleCategory }}</span>
              <h2 class="featured-title">{{ featuredArticle.articleName }}</h2>
              <p class="featured-abstract" v-if="featuredArticle.articleAbstract">{{ featuredArticle.articleAbstract }}</p>
              <div class="article-meta">
                <span>{{ formatTime(featuredArticle.createTime) }}</span>
                <span v-if="featuredArticle.readNum !== undefined">· {{ featuredArticle.readNum }} 阅读</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 普通文章列表 -->
        <div class="article-list" v-loading="loading">
          <div
            class="article-item"
            v-for="article in restArticles"
            :key="article.id"
            @click="viewArticle(article.id)"
          >
            <div class="article-cover">
              <img :src="article.articleCover || '/default-cover.svg'" :alt="article.articleName" />
              <span class="badge-top" v-if="article.isTop === 1">置顶</span>
            </div>
            <div class="article-body">
              <span v-if="article.articleCategory" class="article-category">{{ article.articleCategory }}</span>
              <h3 class="article-title">{{ article.articleName }}</h3>
              <p class="article-abstract" v-if="article.articleAbstract">{{ article.articleAbstract }}</p>
              <div class="article-footer">
                <div class="article-meta">
                  <span>{{ formatTime(article.createTime) }}</span>
                  <span v-if="article.readNum !== undefined">· {{ article.readNum }} 阅读</span>
                </div>
                <div class="article-tags" v-if="article.articleTag">
                  <span class="tag" v-for="(tag, i) in parseTags(article.articleTag).slice(0, 2)" :key="i">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!loading && articles.length === 0" class="empty-state">
            暂无文章
          </div>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <aside class="sidebar">
        <!-- 博主卡片 -->
        <div class="sidebar-card author-card">
          <div class="author-avatar-wrap">
            <img src="/default-avatar.svg" alt="博主" class="author-avatar" />
          </div>
          <div class="author-name">{{ siteName || '博主' }}</div>
          <div class="author-desc">{{ siteDescription || '记录技术与生活' }}</div>
          <div class="author-divider"></div>
          <div class="author-stats">
            <div class="author-stat">
              <span class="stat-num">{{ articles.length }}</span>
              <span class="stat-label">文章</span>
            </div>
            <div class="author-stat">
              <span class="stat-num">∞</span>
              <span class="stat-label">热爱</span>
            </div>
          </div>
        </div>

        <!-- 公告 -->
        <div class="sidebar-card notice-card">
          <div class="sidebar-title">
            <span class="sidebar-title-icon">📢</span>公告
          </div>
          <p class="notice-text">欢迎来到我的博客，这里记录着我的技术成长与生活感悟。</p>
        </div>

        <!-- 最新文章 -->
        <div class="sidebar-card" v-if="articles.length > 0">
          <div class="sidebar-title">
            <span class="sidebar-title-icon">📝</span>最新文章
          </div>
          <ul class="recent-list">
            <li
              v-for="article in articles.slice(0, 5)"
              :key="article.id"
              class="recent-item"
              @click="viewArticle(article.id)"
            >
              <span class="recent-dot"></span>
              <span class="recent-title">{{ article.articleName }}</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMonthArticleList } from '@/api/article'
import { formatDate } from '@/utils/format'
import { fetchWebsiteConfigWithCache } from '@/utils/websiteConfig'

const router = useRouter()
const contentRef = ref<HTMLElement>()

interface Article {
  id: number
  articleName: string
  articleAbstract?: string
  articleCover?: string
  articleTag?: string
  articleCategory?: string
  readNum?: number
  createTime?: number
  isRecommend?: number
  isTop?: number
}

const articles = ref<Article[]>([])
const loading = ref(false)
const siteName = ref('')
const siteDescription = ref('')
const heroCover = ref('')

const featuredArticle = computed(() => articles.value[0] ?? null)
const restArticles = computed(() => articles.value.slice(1))

const heroBg = computed(() => {
  const img = heroCover.value || featuredArticle.value?.articleCover || ''
  return img ? { backgroundImage: `url(${img})` } : {}
})

// 打字机效果
const phrases = computed(() => [
  siteDescription.value || '记录技术与生活',
  '分享所见所闻',
  '用文字留住时光',
])
const displayText = ref('')
const isTyping = ref(true)
let typeTimer: ReturnType<typeof setTimeout>

const runTypewriter = (phraseIndex = 0, charIndex = 0, deleting = false) => {
  const phrase = phrases.value[phraseIndex] ?? ''
  if (!deleting) {
    displayText.value = phrase.slice(0, charIndex + 1)
    isTyping.value = true
    if (charIndex < phrase.length - 1) {
      typeTimer = setTimeout(() => runTypewriter(phraseIndex, charIndex + 1, false), 100)
    } else {
      isTyping.value = false
      typeTimer = setTimeout(() => runTypewriter(phraseIndex, charIndex, true), 2000)
    }
  } else {
    displayText.value = phrase.slice(0, charIndex)
    isTyping.value = true
    if (charIndex > 0) {
      typeTimer = setTimeout(() => runTypewriter(phraseIndex, charIndex - 1, true), 60)
    } else {
      typeTimer = setTimeout(() => runTypewriter((phraseIndex + 1) % phrases.value.length, 0, false), 400)
    }
  }
}

const scrollToContent = () => {
  contentRef.value?.scrollIntoView({ behavior: 'smooth' })
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const res: any = await getMonthArticleList({ pageNo: 1, pageSize: 10 })
    if (res && res.list) articles.value = res.list
    else if (Array.isArray(res)) articles.value = res
  } catch {
    // 静默失败
  } finally {
    loading.value = false
  }
}

const fetchConfig = async () => {
  try {
    const config = await fetchWebsiteConfigWithCache()
    if (config.site_name) siteName.value = config.site_name
    if (config.site_description) siteDescription.value = config.site_description
    const cfg = config as any
    if (cfg.cover) heroCover.value = cfg.cover
  } catch {
    // 静默失败
  }
}

const formatTime = (timestamp?: number) => {
  if (!timestamp) return ''
  return formatDate(new Date(timestamp), 'YYYY-MM-DD')
}

const parseTags = (tagStr?: string) => {
  if (!tagStr) return []
  return tagStr.split(',').map(t => t.trim()).filter(t => t)
}

const viewArticle = (id: number) => {
  router.push(`/article/${id}`)
}

onMounted(() => {
  fetchArticles()
  fetchConfig()
  typeTimer = setTimeout(() => runTypewriter(), 600)
})

onUnmounted(() => {
  clearTimeout(typeTimer)
})
</script>

<style scoped lang="scss">
.home {
  min-height: 100vh;
}

// ── 全屏 Hero ─────────────────────────────────────────
.hero {
  position: relative;
  height: 100vh;
  min-height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1c1917 center/cover no-repeat;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #1c1917 0%, #3c2a1e 100%);
    z-index: 0;
  }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.3) 0%,
    rgba(0,0,0,0.5) 60%,
    rgba(0,0,0,0.7) 100%
  );
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
  padding: 0 24px;
  max-width: 700px;
}

.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(36px, 6vw, 64px);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 20px;
  text-shadow: 0 2px 20px rgba(0,0,0,0.4);
  line-height: 1.15;
}

.hero-subtitle {
  font-size: clamp(16px, 2.5vw, 22px);
  opacity: 0.85;
  margin-bottom: 28px;
  min-height: 1.6em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.cursor {
  display: inline-block;
  font-weight: 300;
  opacity: 1;
  transition: opacity 0.1s;

  &.blink {
    animation: blink 1s step-end infinite;
  }
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
  opacity: 0.7;
  margin-bottom: 48px;

  .hero-dot { opacity: 0.5; }
}

.hero-scroll {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  opacity: 0.6;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover { opacity: 1; }

  .scroll-arrow {
    font-size: 18px;
    animation: bounce 2s ease-in-out infinite;
  }
}

// ── 主体两栏 ──────────────────────────────────────────
.main-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
  padding-top: 48px;
  padding-bottom: 64px;
  align-items: start;
}

.article-col {
  min-width: 0;
}

// ── Featured 卡片 ─────────────────────────────────────
.featured-card {
  border-radius: var(--radius-card);
  overflow: hidden;
  margin-bottom: 24px;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.3s ease, transform 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-4px);

    .featured-cover img { transform: scale(1.04); }
  }

  .featured-cover {
    position: relative;
    aspect-ratio: 21/9;
    overflow: hidden;
    background: var(--bg-secondary);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.5s ease;
    }
  }

  .featured-cover-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 55%, transparent 100%);
  }

  .featured-cover-body {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 28px 32px;
    color: #fff;
  }

  .featured-title {
    font-family: var(--font-serif);
    font-size: 24px;
    font-weight: 700;
    line-height: 1.35;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
    text-shadow: 0 1px 6px rgba(0,0,0,0.3);
  }

  .featured-abstract {
    font-size: 14px;
    opacity: 0.8;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 10px;
  }
}

// ── 文章列表 ──────────────────────────────────────────
.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-item {
  display: flex;
  gap: 20px;
  background: var(--bg-card);
  border-radius: var(--radius-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.25s ease, transform 0.25s ease;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-3px);

    .article-cover img { transform: scale(1.06); }
    .article-title { color: var(--color-accent); }
  }

  .article-cover {
    width: 200px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    background: var(--bg-secondary);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }

    .badge-top {
      position: absolute;
      top: 8px;
      left: 8px;
      background: var(--color-accent);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-tag);
    }
  }

  .article-body {
    flex: 1;
    padding: 20px 20px 20px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .article-title {
    font-family: var(--font-serif);
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.4;
    letter-spacing: -0.01em;
    transition: color 0.2s ease;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
  }

  .article-abstract {
    font-size: 14px;
    color: var(--text-tertiary);
    line-height: 1.65;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
    flex: 1;
  }

  .article-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
  }
}

// 共用
.article-category {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 2px;
}

.article-meta {
  font-size: 12px;
  color: var(--text-tertiary);
  display: flex;
  gap: 6px;
}

.article-tags {
  display: flex;
  gap: 6px;
}

.tag {
  padding: 2px 10px;
  border-radius: var(--radius-tag);
  background: var(--bg-secondary);
  color: var(--text-tertiary);
  font-size: 11px;
  transition: all 0.15s;

  &:hover {
    background: var(--color-accent);
    color: #fff;
  }
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: var(--text-tertiary);
  font-size: 15px;
}

// ── 侧边栏 ────────────────────────────────────────────
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 80px;
}

.sidebar-card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-card);
  padding: 20px;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;

  .sidebar-title-icon { font-size: 15px; }
}

.author-card {
  text-align: center;

  .author-avatar-wrap {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto 12px;
    border: 3px solid var(--border-color);
    box-shadow: var(--shadow-sm);
  }

  .author-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .author-name {
    font-family: var(--font-serif);
    font-size: 17px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 6px;
  }

  .author-desc {
    font-size: 13px;
    color: var(--text-tertiary);
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .author-divider {
    height: 1px;
    background: var(--border-color);
    margin-bottom: 16px;
  }

  .author-stats {
    display: flex;
    justify-content: center;
    gap: 32px;
  }

  .author-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;

    .stat-num {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }

    .stat-label {
      font-size: 11px;
      color: var(--text-tertiary);
    }
  }
}

.notice-card {
  .notice-text {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.7;
  }
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recent-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  transition: color 0.15s;

  &:hover .recent-title { color: var(--color-accent); }

  .recent-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--color-accent);
    flex-shrink: 0;
    margin-top: 7px;
  }

  .recent-title {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    transition: color 0.15s;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// ── 动画 ──────────────────────────────────────────────
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

// ── 响应式 ────────────────────────────────────────────
@media (max-width: 900px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .hero { height: 80vh; }

  .article-item {
    flex-direction: column;

    .article-cover {
      width: 100%;
      height: 180px;
    }

    .article-body {
      padding: 16px;
    }
  }

  .sidebar {
    grid-template-columns: 1fr;
  }
}
</style>
