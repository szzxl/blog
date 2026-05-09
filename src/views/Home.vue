<template>
  <div class="home">
    <div class="page-layout">
      <!-- 左侧侧边栏 -->
      <aside class="sidebar">
        <!-- 博主卡片 -->
        <div class="sidebar-card author-card">
          <div class="author-cover"></div>
          <div class="author-info">
            <img src="/default-avatar.svg" class="author-avatar" alt="博主" />
            <div class="author-name">{{ siteName || '博主' }}</div>
            <div class="author-desc">{{ siteDescription || '记录技术与生活' }}</div>
          </div>
          <div class="author-stats">
            <div class="stat-item">
              <span class="stat-num">{{ totalArticles }}</span>
              <span class="stat-label">文章</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">{{ categoryCount }}</span>
              <span class="stat-label">分类</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">{{ tagCount }}</span>
              <span class="stat-label">标签</span>
            </div>
          </div>
        </div>

        <!-- 公告 -->
        <div class="sidebar-card">
          <div class="card-title">
            <span class="title-dot" style="background:linear-gradient(135deg,#ff7d00,#f53f3f)"></span>
            公告
          </div>
          <p class="notice-text">欢迎来到我的博客，这里记录着技术成长与生活感悟。</p>
        </div>

        <!-- 标签云 -->
        <div class="sidebar-card">
          <div class="card-title">
            <span class="title-dot" style="background:linear-gradient(135deg,#f53f3f,#722ed1)"></span>
            标签云
          </div>
          <div class="tag-sphere-wrap">
            <div class="tag-sphere" ref="sphereRef">
              <span
                v-for="(tag, i) in tags" :key="tag.id"
                class="sphere-tag"
                :style="getTagStyle(i)"
                :ref="el => setTagRef(el, i)"
                @click="$router.push(`/tag/articles?tag=${tag.tagName}`)"
                @mouseenter="pauseSphere"
                @mouseleave="resumeSphere"
              >{{ tag.tagName }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 右侧主内容 -->
      <main class="main-content">
        <div class="section-header">
          <h2 class="section-title">最新文章</h2>
          <router-link to="/articles" class="section-more">查看全部 →</router-link>
        </div>

        <div class="article-grid" v-loading="loading">
          <div
            class="article-card"
            v-for="article in articles"
            :key="article.id"
            @click="viewArticle(article.id)"
          >
            <div class="card-cover">
              <img :src="article.articleCover || '/default-cover.svg'" :alt="article.articleName" />
              <span class="top-badge" v-if="article.isTop === 1">置顶</span>
              <span class="cat-badge" v-if="article.articleCategory">{{ article.articleCategory }}</span>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ article.articleName }}</h3>
              <p class="card-abstract" v-if="article.articleAbstract">{{ article.articleAbstract }}</p>
              <div class="card-footer">
                <span class="card-date">{{ formatTime(article.createTime) }}</span>
                <div class="card-tags" v-if="article.articleTag">
                  <span class="tag" v-for="(tag, i) in parseTags(article.articleTag).slice(0, 2)" :key="i">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!loading && articles.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <p>暂无文章，敬请期待</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getMonthArticleList, getCategoryList, getTagList, getArticleList } from '@/api/article'
import { formatDate } from '@/utils/format'
import { fetchWebsiteConfigWithCache } from '@/utils/websiteConfig'

const router = useRouter()

interface Article {
  id: number
  articleName: string
  articleAbstract?: string
  articleCover?: string
  articleTag?: string
  articleCategory?: string
  readNum?: number
  createTime?: number
  isTop?: number
}

interface Category {
  id: number
  categoryName: string
  articleCount?: number
}

interface Tag {
  id: number
  tagName: string
}

const articles = ref<Article[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const totalArticles = ref(0)
const totalCategories = ref(0)
const totalTags = ref(0)
const loading = ref(false)
const siteName = ref('')
const siteDescription = ref('')

const categoryCount = computed(() => totalCategories.value || categories.value.length)
const tagCount = computed(() => totalTags.value || tags.value.length)

const phrases = ['记录技术与生活', '分享所见所闻', '用文字留住时光']
const displayText = ref('')
const isTyping = ref(true)
let typeTimer: ReturnType<typeof setTimeout>

const runTypewriter = (pi = 0, ci = 0, del = false) => {
  const phrase = phrases[pi] ?? ''
  if (!del) {
    displayText.value = phrase.slice(0, ci + 1)
    isTyping.value = true
    if (ci < phrase.length - 1) {
      typeTimer = setTimeout(() => runTypewriter(pi, ci + 1), 100)
    } else {
      isTyping.value = false
      typeTimer = setTimeout(() => runTypewriter(pi, ci, true), 2200)
    }
  } else {
    displayText.value = phrase.slice(0, ci)
    isTyping.value = true
    if (ci > 0) {
      typeTimer = setTimeout(() => runTypewriter(pi, ci - 1, true), 55)
    } else {
      typeTimer = setTimeout(() => runTypewriter((pi + 1) % phrases.length, 0), 400)
    }
  }
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const res: any = await getMonthArticleList({ pageNo: 1, pageSize: 12 })
    if (res?.list) articles.value = res.list
    else if (Array.isArray(res)) articles.value = res
  } catch { /* 静默 */ } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const res: any = await getArticleList({ pageNo: 1, pageSize: 1 })
    if (res?.total != null) totalArticles.value = res.total
  } catch { /* 静默 */ }
}

const fetchConfig = async () => {
  try {
    const config = await fetchWebsiteConfigWithCache()
    if (config.site_name) siteName.value = config.site_name
    if (config.site_description) siteDescription.value = config.site_description
  } catch { /* 静默 */ }
}

const fetchCategories = async () => {
  try {
    const res: any = await getCategoryList({ pageSize: 100 })
    if (res?.list) { categories.value = res.list; totalCategories.value = res.total ?? res.list.length }
    else if (Array.isArray(res)) { categories.value = res; totalCategories.value = res.length }
  } catch { /* 静默 */ }
}

const fetchTags = async () => {
  try {
    const res: any = await getTagList({ pageSize: 200 })
    if (res?.list) { tags.value = res.list; totalTags.value = res.total ?? res.list.length }
    else if (Array.isArray(res)) { tags.value = res; totalTags.value = res.length }
    await nextTick()
    initSphere()
  } catch { /* 静默 */ }
}

// ── 球形标签云 ────────────────────────────────────────
const tagEls = ref<HTMLElement[]>([])
let sphereTimer = 0
let angleX = 0.008
let angleY = 0.012
let items: { el: HTMLElement; x: number; y: number; z: number }[] = []

const setTagRef = (el: any, i: number) => {
  if (el) tagEls.value[i] = el as HTMLElement
}

const initSphere = () => {
  const count = tagEls.value.length
  if (!count) return
  items = tagEls.value.map((el, i) => {
    const phi   = Math.acos(-1 + (2 * i) / count)
    const theta = Math.sqrt(count * Math.PI) * phi
    return {
      el,
      x: Math.sin(phi) * Math.cos(theta),
      y: Math.sin(phi) * Math.sin(theta),
      z: Math.cos(phi),
    }
  })
  renderSphere()
  sphereTimer = window.setInterval(rotateSphere, 30)
}

const rotateSphere = () => {
  const cosX = Math.cos(angleX), sinX = Math.sin(angleX)
  const cosY = Math.cos(angleY), sinY = Math.sin(angleY)
  items.forEach(item => {
    // rotate Y
    const x1 = item.x * cosY - item.z * sinY
    const z1 = item.x * sinY + item.z * cosY
    // rotate X
    const y2 = item.y * cosX - z1 * sinX
    const z2 = item.y * sinX + z1 * cosX
    item.x = x1; item.y = y2; item.z = z2
  })
  renderSphere()
}

const renderSphere = () => {
  const R = 110
  items.forEach(item => {
    const scale = (item.z + 1.6) / 2.6
    const x = item.x * R + R
    const y = item.y * R + R
    item.el.style.transform = `translate(${x}px, ${y}px) scale(${scale.toFixed(3)})`
    item.el.style.opacity   = (scale * 0.7 + 0.2).toFixed(3)
    item.el.style.zIndex    = Math.round(scale * 10).toString()
  })
}

const pauseSphere  = () => { angleX = 0; angleY = 0 }
const resumeSphere = () => { angleX = 0.008; angleY = 0.012 }

const TAG_COLORS = [
  ['#e8f0ff', '#165dff'], ['#f3e8ff', '#722ed1'], ['#fff3e8', '#ff7d00'],
  ['#ffe8e8', '#f53f3f'], ['#e8fff0', '#00b42a'], ['#e8fffe', '#0fc6c2'],
  ['#fff8e8', '#f77234'], ['#f0ffe8', '#9fdb1d'],
]

const getTagStyle = (i: number) => {
  const pair = TAG_COLORS[i % TAG_COLORS.length] ?? ['#e8f0ff', '#165dff']
  const [bg, color] = pair
  return { background: bg, color, borderColor: (color ?? '#165dff') + '55' }
}

const formatTime = (ts?: number) => ts ? formatDate(new Date(ts), 'YYYY-MM-DD') : ''
const parseTags = (s?: string) => s ? s.split(',').map(t => t.trim()).filter(Boolean) : []
const viewArticle = (id: number) => router.push(`/article/${id}`)

onMounted(() => { fetchArticles(); fetchConfig(); fetchCategories(); fetchTags(); fetchStats(); typeTimer = setTimeout(() => runTypewriter(), 800) })
onUnmounted(() => { clearTimeout(typeTimer); clearInterval(sphereTimer) })
</script>

<style scoped lang="scss">
.home {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-top: 64px;
}

.page-layout {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 80px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 28px;
  align-items: start;
}

// ── 侧边栏 ────────────────────────────────────────────
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 80px;
}

.sidebar-card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: box-shadow 0.3s;
  &:hover { box-shadow: var(--shadow-card-hover); }
}

.author-card {
  .author-cover {
    height: 80px;
    background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
  }
  .author-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 20px 16px;
    margin-top: -32px;
  }
  .author-avatar {
    width: 64px; height: 64px;
    border-radius: 50%;
    border: 3px solid var(--bg-card);
    box-shadow: var(--shadow-card);
    object-fit: cover;
    background: var(--bg-secondary);
  }
  .author-name {
    font-family: var(--font-serif);
    font-size: 16px; font-weight: 700;
    color: var(--text-primary);
    margin-top: 10px;
  }
  .author-desc {
    font-size: 12px; color: var(--text-tertiary);
    text-align: center; line-height: 1.6; margin-top: 4px;
  }
  .author-stats {
    display: flex;
    align-items: center;
    border-top: 1px solid var(--border-color);
    padding: 12px 0;
  }
  .stat-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;
    .stat-num {
      font-size: 18px; font-weight: 700; line-height: 1;
      background: var(--gradient-accent);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .stat-label { font-size: 11px; color: var(--text-tertiary); }
  }
  .stat-divider { width: 1px; height: 28px; background: var(--border-color); }
}

.card-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 700; color: var(--text-primary);
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--border-color);
  .title-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }
}

.notice-text {
  font-size: 13px; color: var(--text-secondary);
  line-height: 1.8; padding: 12px 16px;
}

.tag-sphere-wrap {
  padding: 12px;
  display: flex;
  justify-content: center;
}

.tag-sphere {
  position: relative;
  width: 220px;
  height: 220px;
}

.sphere-tag {
  position: absolute;
  top: 0; left: 0;
  padding: 3px 10px;
  border-radius: var(--radius-tag);
  border: 1px solid;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  will-change: transform, opacity;
  transition: filter 0.2s, box-shadow 0.2s;

  &:hover {
    filter: brightness(0.85) saturate(1.4);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 12px;
}

.nav-grid-item {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  padding: 8px 4px;
  border-radius: 10px;
  font-size: 11px; color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
  &:hover { background: var(--bg-secondary); color: var(--color-accent); }
  .nav-grid-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; font-size: 15px;
  }
}

// ── 主内容 ────────────────────────────────────────────
.main-content { min-width: 0; }

.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-family: var(--font-serif);
  font-size: 20px; font-weight: 700; color: var(--text-primary);
  display: flex; align-items: center; gap: 10px;
  &::before {
    content: '';
    display: block; width: 4px; height: 20px;
    background: var(--gradient-accent); border-radius: 2px;
  }
}

.section-more {
  font-size: 13px; color: var(--color-accent); font-weight: 500;
  transition: opacity 0.2s;
  &:hover { opacity: 0.7; }
}

// ── 文章网格 ──────────────────────────────────────────
.article-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.article-card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-4px);
    border-color: var(--color-accent);
    .card-cover img { transform: scale(1.06); }
    .card-title { color: var(--color-accent); }
  }

  .card-cover {
    position: relative;
    aspect-ratio: 16/10;
    overflow: hidden;
    background: var(--bg-secondary);
    flex-shrink: 0;
    img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
    .top-badge {
      position: absolute; top: 8px; left: 8px;
      background: var(--gradient-warm); color: #fff;
      font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 8px;
    }
    .cat-badge {
      position: absolute; bottom: 8px; left: 8px;
      background: rgba(0,0,0,0.55); color: #fff;
      backdrop-filter: blur(4px);
      font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 8px;
    }
  }

  .card-body {
    flex: 1; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px;
  }

  .card-title {
    font-family: var(--font-serif);
    font-size: 15px; font-weight: 700; color: var(--text-primary);
    line-height: 1.5;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    transition: color 0.2s; margin: 0;
  }

  .card-abstract {
    font-size: 12px; color: var(--text-tertiary); line-height: 1.7;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    margin: 0; flex: 1;
  }

  .card-footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 4px;
  }

  .card-date { font-size: 11px; color: var(--text-tertiary); }

  .card-tags { display: flex; gap: 4px; }

  .tag {
    padding: 1px 7px; border-radius: 6px;
    background: var(--bg-secondary); color: var(--text-tertiary);
    font-size: 10px; border: 1px solid var(--border-color);
    transition: all 0.2s;
    &:hover { border-color: var(--color-accent); color: var(--color-accent); }
  }
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center; padding: 64px 0; color: var(--text-tertiary);
  .empty-icon { font-size: 48px; margin-bottom: 12px; }
  p { font-size: 15px; }
}

// ── 响应式 ────────────────────────────────────────────
@media (max-width: 1100px) {
  .article-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 860px) {
  .page-layout { grid-template-columns: 1fr; }
  .sidebar { position: static; display: grid; grid-template-columns: repeat(2, 1fr); }
  .author-card { grid-column: 1 / -1; }
}

@media (max-width: 560px) {
  .article-grid { grid-template-columns: 1fr; }
  .sidebar { grid-template-columns: 1fr; }
  .page-layout { padding: 16px 16px 60px; }
}
</style>
