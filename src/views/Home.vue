<template>
  <div class="home">
    <!-- ── 主体布局 ─────────────────────────────────────── -->
    <div class="page-layout">

      <!-- 左侧侧边栏 -->
      <aside class="sidebar sidebar-left">

        <!-- 博主卡片 -->
        <div class="sidebar-card author-card">
          <span class="ac-deco ac-deco-tl"></span>
          <span class="ac-deco ac-deco-tr"></span>
          <div class="author-title gradient-text">{{ siteName || '时光博客' }}</div>
          <div class="author-desc">
            <span>{{ displayText }}</span><span class="tw-cursor" :class="{ blink: !isTyping }">|</span>
          </div>
          <div class="author-socials">
            <a v-if="socialGithub" :href="socialGithub" target="_blank" class="ac-social github" title="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a v-if="socialGitee" :href="socialGitee" target="_blank" class="ac-social gitee" title="Gitee">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.984 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 01-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 00-.592-.593h-4.15a.592.592 0 01-.592-.592v-1.482a.593.593 0 01.593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 01-4 4H5.926a.593.593 0 01-.593-.593V9.778a4.444 4.444 0 014.445-4.444h8.296z"/></svg>
            </a>
            <button v-if="socialEmail" class="ac-social email" title="复制邮箱" @click="copyEmail">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </button>
            <button v-if="socialWechat" class="ac-social wechat" title="复制微信号" @click="copyWechat">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.295.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-5.972 2.981-7.853 1.141-.741 2.431-1.242 3.812-1.368.157-4.055-3.735-7.26-8.61-7.26zm-1.47 3.297a1.016 1.016 0 110 2.032 1.016 1.016 0 010-2.032zm4.047 0a1.016 1.016 0 110 2.032 1.016 1.016 0 010-2.032zm4.03 3.867c-3.988 0-7.22 2.73-7.22 6.103 0 3.372 3.232 6.104 7.22 6.104.868 0 1.7-.131 2.47-.363a.728.728 0 01.6.081l1.583.927a.271.271 0 00.14.046c.138 0 .248-.11.248-.249 0-.06-.023-.12-.04-.178l-.325-1.233a.494.494 0 01.178-.556C21.587 19.005 22.5 17.4 22.5 15.455c0-3.372-3.233-6.103-7.202-6.103zm-2.134 2.79a.854.854 0 110 1.708.854.854 0 010-1.708zm4.28 0a.854.854 0 110 1.708.854.854 0 010-1.708z"/></svg>
            </button>
          </div>
        </div>

        <!-- 公告 -->
        <div class="sidebar-card">
          <div class="sidebar-heading">
            <span class="title-dot" style="background:linear-gradient(135deg,#ff7d00,#f53f3f)"></span>
            公告
          </div>
          <ul v-if="notifications.length > 0" class="notice-list">
            <li
              v-for="item in notifications.slice(0, 3)"
              :key="item.id"
              class="notice-item"
            >
              <span class="notice-plain">
                <span class="notice-dot" :class="`notice-dot--${item.type}`"></span>
                {{ item.content }}
              </span>
            </li>
          </ul>
          <p v-else class="notice-text">欢迎来到我的博客，这里记录着技术成长与生活感悟。</p>
        </div>

      </aside>

      <!-- 中间主内容 -->
      <main class="center-col">

        <div class="section-header">
          <h2 class="section-title">最新文章</h2>
          <router-link class="section-more" to="/articles">全部文章 →</router-link>
        </div>

        <div v-loading="loading">

          <!-- 文章网格 -->
          <div class="article-grid">
            <div
              class="article-card"
              v-for="article in articles"
              :key="article.id"
              tabindex="0"
              role="button"
              :aria-label="article.articleName"
              @click="viewArticle(article.id)"
              @keydown.enter="viewArticle(article.id)"
              @keydown.space.prevent="viewArticle(article.id)"
            >
              <div class="card-cover">
                <img :src="article.articleCover || '/default-cover.svg'" :alt="article.articleName" loading="lazy" />
                <span class="top-badge" v-if="article.isTop === 1">置顶</span>
                <span class="cat-badge" v-if="article.articleCategory">{{ article.articleCategory }}</span>
              </div>
              <div class="card-body">
                <div class="card-content">
                  <h3 class="card-title">{{ article.articleName }}</h3>
                </div>
                <div class="card-footer">
                  <span class="card-date">{{ formatTimestamp(article.createTime) }}</span>
                  <div class="card-meta-right">
                    <span class="card-reads" v-if="article.readNum"><el-icon style="vertical-align:-1px"><View /></el-icon> {{ article.readNum }}</span>
                    <div class="card-tags" v-if="article.articleTag">
                      <span
                        class="tag"
                        v-for="(tag, i) in parseTags(article.articleTag).slice(0, 1)"
                        :key="i"
                      >{{ tag }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="loadError && !loading" class="empty-state" role="alert">
            <p>文章加载失败</p>
            <el-button @click="fetchArticles">重新加载</el-button>
          </div>
          <div v-else-if="!loading && articles.length === 0" class="empty-state">
            <el-icon class="empty-icon" :size="48"><Document /></el-icon>
            <p>暂无文章，敬请期待</p>
          </div>

        </div>
      </main>

      <!-- 右侧侧边栏 -->
      <aside class="sidebar sidebar-right">

        <!-- 文章分类 -->
        <div class="sidebar-card">
          <div class="sidebar-heading">
            <span class="title-dot" style="background:linear-gradient(135deg,#00b42a,#0fc6c2)"></span>
            文章分类
          </div>
          <ul class="cat-list" v-if="categories.length > 0">
            <li
              class="cat-item"
              v-for="cat in categories.slice(0, 10)"
              :key="cat.id"
            >
              <router-link class="cat-link" :to="{ path: '/articles', query: { category: cat.name || cat.categoryName } }">
                <span class="cat-dot"></span>
                <span class="cat-name">{{ cat.name || cat.categoryName || '未命名' }}</span>
                <span class="cat-count">{{ cat.num ?? cat.articleCount ?? cat.count ?? 0 }}</span>
              </router-link>
            </li>
          </ul>
          <p class="notice-text" v-else>暂无分类</p>
        </div>

        <!-- 标签云 -->
        <div class="sidebar-card">
          <div class="sidebar-heading">
            <span class="title-dot" style="background:linear-gradient(135deg,#f53f3f,#722ed1)"></span>
            标签云
          </div>
          <div v-if="tags.length" class="tag-cloud">
            <router-link
              v-for="(tag, i) in tags" :key="tag.id ?? tag.name"
              class="cloud-tag"
              :style="tagStyles[i]"
              :to="{ path: '/tag/articles', query: { tag: tag.name || tag.tagName } }"
            >{{ tag.name || tag.tagName }}</router-link>
          </div>
          <p v-else class="notice-text">暂无标签</p>
        </div>

      </aside>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMonthArticleList, getCategoryList, getTagList, getNotificationList } from '@/api/article'
import { formatTimestamp, parseTags } from '@/utils/format'
import { fetchWebsiteConfigWithCache, useWebsiteConfigRefresh } from '@/utils/websiteConfig'
import { Document, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus/es/components/message/index'

const router = useRouter()
let disposed = false


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
  id?: number
  name?: string
  categoryName?: string
  num?: number
  count?: number
  articleCount?: number
}

interface Tag {
  id?: string | number
  name?: string
  tagName?: string
  num?: number
}

interface NotificationItem {
  id: number
  type: string
  content: string
  status: number
}

const articles = ref<Article[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const notifications = ref<NotificationItem[]>([])
const loading = ref(false)
const loadError = ref(false)
const siteName = ref('')
const socialGithub = ref('')
const socialGitee = ref('')
const socialEmail = ref('')
const socialWechat = ref('')

const copyText = async (text: string, label: string) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
  ElMessage.success(`${label}已复制到剪贴板`)
}

const copyEmail  = () => copyText(socialEmail.value,  '邮箱号')
const copyWechat = () => copyText(socialWechat.value, '微信号')


const phrases = ['记录技术与生活', '分享所见所闻', '用文字留住时光']
const displayText = ref('')
const isTyping = ref(true)
let typeTimer: ReturnType<typeof setTimeout>

const runTypewriter = (pi = 0, ci = 0, del = false) => {
  if (disposed) return
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
  loadError.value = false
  loading.value = true
  try {
    const res: any = await getMonthArticleList({ pageNo: 1, pageSize: 12 })
    if (disposed) return
    if (res?.list) articles.value = res.list
    else if (Array.isArray(res)) articles.value = res
  } catch { if (!disposed) loadError.value = true } finally {
    if (!disposed) loading.value = false
  }
}

const fetchConfig = async () => {
  try {
    const config = await fetchWebsiteConfigWithCache()
    if (disposed) return
    if (config.site_name) siteName.value = config.site_name
    socialGithub.value = config.social_github || ''
    socialGitee.value = config.social_gitee || ''
    socialEmail.value = config.social_email || ''
    socialWechat.value = config.social_wechat || ''
  } catch { /* 静默 */ }
}

const fetchNotifications = async () => {
  try {
    const res: any = await getNotificationList()
    if (disposed) return
    const list = Array.isArray(res) ? res : (res?.list ?? [])
    notifications.value = list.filter((item: NotificationItem) => item.status === 1)
  } catch { /* 静默 */ }
}

const fetchCategories = async () => {
  try {
    const res: any = await getCategoryList({ pageSize: 100 })
    if (disposed) return
    if (res?.list) { categories.value = res.list }
    else if (Array.isArray(res)) { categories.value = res }
  } catch { /* 静默 */ }
}

const fetchTags = async () => {
  try {
    const res: any = await getTagList({ pageSize: 200 })
    if (disposed) return
    if (res?.list) { tags.value = res.list }
    else if (Array.isArray(res)) { tags.value = res }
  } catch { /* 静默 */ }
}

let idleId: ReturnType<typeof requestIdleCallback> | null = null
let idleTimer: ReturnType<typeof setTimeout> | undefined

const TAG_COLORS = [
  ['#e8f0ff', '#165dff'], ['#f3e8ff', '#722ed1'], ['#fff3e8', '#ff7d00'],
  ['#ffe8e8', '#f53f3f'], ['#e8fff0', '#00b42a'], ['#e8fffe', '#0fc6c2'],
  ['#fff8e8', '#f77234'], ['#f0ffe8', '#9fdb1d'],
]

const tagStyles = computed(() =>
  tags.value.map((_, i) => {
    const [bg, color] = TAG_COLORS[i % TAG_COLORS.length] ?? ['#e8f0ff', '#165dff']
    return { background: bg, color, borderColor: color + '55' }
  })
)

const viewArticle = (id: number) => router.push(`/article/${id}`)

useWebsiteConfigRefresh(() => { void fetchConfig() })
onMounted(async () => {
  // 阶段1：关键路径，影响首屏可见内容
  await Promise.all([fetchArticles(), fetchConfig()])
  if (disposed) return

  // 阶段2：侧边栏次要数据
  fetchCategories()

  // 阶段3：非关键数据，浏览器空闲时加载
  if (typeof requestIdleCallback !== 'undefined') {
    idleId = requestIdleCallback(() => {
      if (disposed) return
      void fetchTags()
      void fetchNotifications()
    }, { timeout: 2000 })
  } else {
    idleTimer = setTimeout(() => {
      if (disposed) return
      void fetchTags()
      void fetchNotifications()
    }, 200)
  }

  typeTimer = setTimeout(() => runTypewriter(), 800)
})
onUnmounted(() => {
  disposed = true
  clearTimeout(typeTimer)
  clearTimeout(idleTimer)
  if (idleId !== null) cancelIdleCallback(idleId)
})
</script>

<style scoped lang="scss">
.home {
  background: var(--bg-primary);
  position: relative;

  &::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 220px;
    background: linear-gradient(105deg, #165dff 0%, #722ed1 50%, #f53f3f 100%);
    opacity: 0.12;
    mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
    pointer-events: none;
    z-index: 0;
  }
}

[data-theme="dark"] .home::before {
  opacity: 0.18;
}


.tw-cursor {
  display: inline-block;
  font-weight: 300;
  margin-left: 1px;
  &.blink { animation: blink 1s step-end infinite; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

// ── 主体布局 ──────────────────────────────────────────
.page-layout {
  position: relative;
  z-index: 1;
  max-width: 1440px;
  margin: 0 auto;
  padding: 96px 32px 32px;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 220px;
  gap: 24px;
  align-items: start;
}

// ── 侧边栏 ────────────────────────────────────────────
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 72px;
  min-width: 0;
}

.sidebar-right {
  top: 72px;
}

.sidebar-card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: box-shadow 0.3s;
  &:hover { box-shadow: var(--shadow-card); }
}

.author-card {
  position: relative;
  padding: 28px 18px 24px;
  text-align: center;
  overflow: visible;

  .ac-deco {
    position: absolute;
    border-radius: 3px;
    transform: rotate(45deg);
    opacity: 0.45;
  }
  .ac-deco-tl { top: 18px; left: 22px; width: 10px; height: 10px; background: #165dff; }
  .ac-deco-tr { top: 22px; right: 26px; width: 7px; height: 7px; background: #722ed1; }

  .author-title {
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin-bottom: 10px;
  }

  .author-desc {
    font-size: 13px;
    color: var(--text-tertiary);
    line-height: 1.6;
    min-height: 22px;
  }

  .author-socials {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
    flex-wrap: wrap;
  }

  .ac-social {
    width: 30px; height: 30px;
    border-radius: 50%;
    border: none; cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    svg { width: 14px; height: 14px; }
    &:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.22); color: #fff; }
    &.github  { background: #24292f; }
    &.gitee   { background: #c71d23; }
    &.email   { background: #165dff; }
    &.wechat  { background: #07c160; }
  }

}



.sidebar-heading {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 700; color: var(--text-primary);
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--border-color);
  .title-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }
}


// 公告
.notice-text {
  font-size: 13px; color: var(--text-secondary);
  line-height: 1.8; padding: 12px 16px;
}

.notice-list {
  list-style: none;
  padding: 8px 0;
}

.notice-item {
  padding: 0;
}

.notice-link, .notice-plain {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 7px 16px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  transition: color 0.2s, background 0.2s;
  text-decoration: none;
}

.notice-link {
  cursor: pointer;
  &:hover {
    color: var(--color-accent);
    background: var(--bg-secondary);
    .notice-dot { background: var(--color-accent); }
  }
}

.notice-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--border-strong);
  flex-shrink: 0;
  margin-top: 6px;
  transition: background 0.2s;
  &--activity     { background: #ff7d00; }
  &--announcement { background: #f53f3f; }
  &--update       { background: #165dff; }
  &--tip          { background: #00b42a; }
}

// 分类列表
.cat-list {
  list-style: none;
  padding: 8px 0;
}

.cat-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: var(--bg-secondary);
    .cat-name { color: var(--color-accent); }
    .cat-dot { background: var(--color-accent); }
  }
}

.cat-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--border-strong); flex-shrink: 0;
  transition: background 0.2s;
}

.cat-name {
  flex: 1;
  font-size: 13px; color: var(--text-secondary);
  transition: color 0.2s;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.cat-count {
  font-size: 11px;
  color: var(--text-tertiary);
  background: var(--bg-secondary);
  padding: 1px 7px;
  border-radius: 10px;
  min-width: 24px; text-align: center;
}

// 标签云
.tag-cloud {
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.cloud-tag {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  max-width: 100%;
  padding: 5px 11px;
  border-radius: var(--radius-tag);
  border: 1px solid;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  overflow-wrap: anywhere;
  line-height: 1.5;
  transition: filter 0.2s, transform 0.2s;
  &:hover {
    filter: brightness(0.95) saturate(1.2);
    transform: translateY(-2px);
  }
}

// ── 主内容 ────────────────────────────────────────────
.center-col { min-width: 0; font-family: var(--font-article); }

.section-header {
  display: flex; align-items: center; justify-content: space-between;
  min-height: 32px;
  margin-bottom: 16px;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  align-items: stretch;
}

.article-card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  display: flex;
  flex-direction: column;
  min-width: 0;

  &:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }

  &:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-4px);
    border-color: var(--color-accent);
    .card-cover img { transform: scale(1.06); }
    .card-title { color: var(--color-accent-hover); }
  }

  .card-cover {
    position: relative;
    aspect-ratio: 16/9;
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
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .card-title {
    font-family: var(--font-article);
    font-size: 15px; font-weight: 600; color: var(--text-primary);
    line-height: 1.65;
    min-height: 3.3em;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
    transition: color 0.2s; margin: 0;
  }

  .card-abstract {
    font-size: 12px; color: var(--text-tertiary); line-height: 1.7;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    margin: 0;
  }

  .card-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 12px;
    margin-top: 14px;
    gap: 8px;
    border-top: 1px solid var(--border-color);
    flex-wrap: wrap;
  }

  .card-date { font-size: 12px; color: var(--text-tertiary); white-space: nowrap; }

  .card-meta-right {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .card-reads {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .card-tags { display: flex; gap: 4px; }

  .tag {
    max-width: 88px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding: 1px 7px; border-radius: 6px;
    background: var(--bg-secondary); color: var(--text-secondary);
    font-size: 11px; border: 1px solid var(--border-color);
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
@media (max-width: 1200px) {
  .page-layout { grid-template-columns: 190px minmax(0, 1fr) 190px; gap: 20px; padding-inline: 24px; }
  .article-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 1024px) {
  /* 右 sidebar 折叠到主内容下方 */
  .page-layout { grid-template-columns: 200px minmax(0, 1fr); }
  .sidebar-right { grid-column: 2; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); position: static; align-items: start; }
}

@media (max-width: 860px) {
  .page-layout { grid-template-columns: minmax(0, 1fr); padding-top: 88px; }
  .center-col { grid-row: 1; }
  .sidebar-left { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); position: static; align-items: start; }
  .sidebar-right { grid-column: 1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 640px) {
  .article-grid { grid-template-columns: 1fr; }
  .sidebar-left, .sidebar-right { grid-template-columns: 1fr; }
  .page-layout { padding: 84px 16px 24px; gap: 24px; }
  .section-title { font-size: 19px; }
  .cloud-tag { min-height: 36px; }
}

@media (prefers-reduced-motion: reduce) {
  .cloud-tag { transition: none; &:hover { transform: none; } }
  .article-card { transition: none; &:hover { transform: none; } }
}
</style>
