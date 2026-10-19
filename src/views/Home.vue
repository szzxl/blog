<template>
  <div class="home container">
    <section class="home-heading">
      <div>
        <p class="eyebrow">个人博客</p>
        <h1>笔记与日常</h1>
        <p>{{ config.site_description || '项目笔记、排错过程，偶尔记点别的。' }}</p>
      </div>
      <router-link to="/about">关于我 ↗</router-link>
    </section>
    <Skeleton v-if="loading" type="article-list" :count="3" />
    <div v-else-if="loadError" class="empty-state" role="alert">
      <h2>文章暂时没有加载出来</h2>
      <p>稍后再试，或从文章索引继续浏览。</p>
      <el-button @click="fetchArticles">重新加载</el-button
      ><router-link to="/articles" class="text-link">文章索引 →</router-link>
    </div>
    <template v-else>
      <section v-if="featured" class="feature-board" aria-label="选读与关于博客">
        <router-link
          :to="`/article/${featured.id}`"
          class="feature-photo"
          :class="{ 'without-cover': !featured.articleCover || failedFeatured }"
        >
          <img
            v-if="featured.articleCover && !failedFeatured"
            :src="featured.articleCover"
            :alt="featured.articleName"
            fetchpriority="high"
            @error="failedFeatured = true"
          />
          <div class="feature-top">
            <span>{{ featured.isRecommend === 1 ? '推荐选读' : '本月选读' }}</span
            ><span>{{ featured.articleCategory }}</span>
          </div>
          <div class="feature-caption">
            <time>{{ formatTimestamp(featured.createTime) }}</time>
            <h2>{{ featured.articleName }}</h2>
            <p v-if="featured.summary">{{ featured.summary }}</p>
            <span class="feature-open">翻开这篇文章 ↗</span>
          </div>
        </router-link>
        <div class="feature-rail">
          <router-link v-if="secondary" :to="`/article/${secondary.id}`" class="feature-note"
            ><div>
              <span class="eyebrow">接着读</span>
              <h2>{{ secondary.articleName }}</h2>
              <p>
                {{ secondary.articleCategory }}
                <span v-if="secondary.createTime"
                  >· {{ formatTimestamp(secondary.createTime) }}</span
                >
                ↗
              </p>
            </div>
            <img
              v-if="secondary.articleCover"
              :src="secondary.articleCover"
              alt=""
              @error="hideFailedImage"
          /></router-link>
          <aside class="author-note">
            <span class="author-monogram" aria-hidden="true">{{
              (config.site_name || '时光').slice(0, 1)
            }}</span>
            <div>
              <div class="author-title">
                <strong>{{ config.site_name || '时光博客' }}</strong
                ><router-link to="/about">认识一下 ↗</router-link>
              </div>
              <p>{{ config.website_motto || '写下解决问题的过程，也留住日常里的片刻。' }}</p>
              <div class="author-socials">
                <a
                  v-if="config.social_github"
                  :href="config.social_github"
                  target="_blank"
                  rel="noopener noreferrer"
                  >GitHub ↗</a
                ><a
                  v-if="config.social_gitee"
                  :href="config.social_gitee"
                  target="_blank"
                  rel="noopener noreferrer"
                  >Gitee ↗</a
                ><button
                  v-if="config.social_email"
                  @click="copyContact(config.social_email, '邮箱')"
                >
                  邮箱</button
                ><button
                  v-if="config.social_wechat"
                  @click="copyContact(config.social_wechat, '微信号')"
                >
                  微信
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <div class="content-layout">
        <section>
          <div class="section-heading">
            <h2>最近更新 <small>本月文章</small></h2>
            <router-link to="/articles">全部文章 →</router-link>
          </div>
          <ArticleCard v-for="article in recentArticles" :key="article.id" :article="article" />
          <div v-if="!articles.length" class="empty-state">
            <h3>本月还没有新文章</h3>
            <p>可以先看看往期笔记。</p>
            <router-link to="/articles" class="text-link">浏览全部文章 →</router-link>
          </div>
          <p v-else-if="!recentArticles.length" class="list-end">
            本月的更新都在上方。<router-link to="/articles">继续看往期文章 →</router-link>
          </p>
        </section>
        <aside class="sidebar">
          <section class="side-block">
            <h2>关于这里</h2>
            <p>{{ config.site_description || '技术实践与日常记录，慢慢整理在这里。' }}</p>
            <router-link to="/about" class="text-link">关于我 →</router-link>
          </section>
          <section v-if="notifications.length" class="side-block">
            <h2>公告</h2>
            <p v-for="notice in notifications.slice(0, 3)" :key="notice.id" class="notice">
              {{ notice.content }}
            </p>
          </section>
          <section class="side-block">
            <h2>分类</h2>
            <div class="category-list">
              <router-link
                v-for="category in categories"
                :key="category.id || category.categoryName || category.name"
                :to="{
                  path: '/articles',
                  query: { category: category.categoryName || category.name }
                }"
                >{{ category.categoryName || category.name
                }}<span
                  v-if="(category.articleCount ?? category.count ?? category.num) !== undefined"
                  >{{ category.articleCount ?? category.count ?? category.num }}</span
                ></router-link
              >
            </div>
            <router-link to="/category" class="text-link">全部分类 →</router-link>
          </section>
          <section class="side-block">
            <h2>标签</h2>
            <div class="tag-list">
              <router-link
                v-for="tag in tags.slice(0, 12)"
                :key="tag.id || tag.tagName || tag.name"
                :to="{ path: '/tag/articles', query: { tag: tag.tagName || tag.name } }"
                >#{{ tag.tagName || tag.name }}</router-link
              >
            </div>
            <router-link to="/tag" class="text-link">浏览标签 →</router-link>
          </section>
          <router-link to="/album" class="album-link"
            ><span>换个心情</span><strong>去相册走走 ↗</strong>
            <p>看看文字之外的日常。</p></router-link
          >
        </aside>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus/es/components/message/index'
import {
  getCategoryList,
  getMonthArticleList,
  getNotificationList,
  getTagList
} from '@/api/article'
import { fetchWebsiteConfigWithCache, useWebsiteConfigRefresh } from '@/utils/websiteConfig'
import type { WebsiteConfig } from '@/utils/websiteConfig'
import type { ArticleSummary } from '@/types/article'
import { formatTimestamp } from '@/utils/format'
import { createLatestRequest } from '@/utils/latestRequest'
import ArticleCard from '@/components/ArticleCard.vue'
import Skeleton from '@/components/Skeleton.vue'

interface Category {
  id?: number
  categoryName?: string
  name?: string
  articleCount?: number
  count?: number
  num?: number
}
interface Tag {
  id?: number | string
  tagName?: string
  name?: string
}
interface Notice {
  id: number
  content: string
  status: number
}
const articles = ref<ArticleSummary[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const notifications = ref<Notice[]>([])
const config = ref<WebsiteConfig>({})
const loading = ref(true)
const loadError = ref(false)
const failedFeatured = ref(false)
const articleRequest = createLatestRequest()
let disposed = false
const listOf = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : (value as { list?: T[] } | null)?.list || []
const featured = computed(
  () =>
    articles.value.find((a) => a.isRecommend === 1 && a.articleCover) ||
    articles.value.find((a) => a.articleCover) ||
    articles.value[0]
)
const secondary = computed(() => articles.value.find((a) => a.id !== featured.value?.id))
const recentArticles = computed(() =>
  articles.value.filter((a) => a.id !== featured.value?.id && a.id !== secondary.value?.id)
)
const fetchArticles = async () => {
  const requestId = articleRequest.next()
  loading.value = true
  loadError.value = false
  try {
    const response = await getMonthArticleList({ pageNo: 1, pageSize: 12 })
    if (disposed || !articleRequest.isCurrent(requestId)) return
    articles.value = listOf<ArticleSummary>(response)
    failedFeatured.value = false
  } catch {
    if (!disposed && articleRequest.isCurrent(requestId)) loadError.value = true
  } finally {
    if (!disposed && articleRequest.isCurrent(requestId)) loading.value = false
  }
}
const fetchConfig = async () => {
  const value = await fetchWebsiteConfigWithCache()
  if (!disposed) config.value = value
}
const hideFailedImage = (event: Event) => {
  ;(event.target as HTMLImageElement).style.display = 'none'
}
const copyContact = async (value: string, label: string) => {
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success(`${label}已复制`)
  } catch {
    ElMessage.info(`${label}：${value}`)
  }
}
useWebsiteConfigRefresh(() => {
  void fetchConfig()
})
onMounted(() => {
  void fetchArticles()
  void fetchConfig()
  void Promise.allSettled([
    getCategoryList({ pageSize: 100 }),
    getTagList({ pageSize: 200 }),
    getNotificationList()
  ]).then((results) => {
    if (disposed) return
    const [categoryResult, tagResult, noticeResult] = results
    if (categoryResult?.status === 'fulfilled')
      categories.value = listOf<Category>(categoryResult.value)
    if (tagResult?.status === 'fulfilled') tags.value = listOf<Tag>(tagResult.value)
    if (noticeResult?.status === 'fulfilled')
      notifications.value = listOf<Notice>(noticeResult.value).filter((item) => item.status === 1)
  })
})
onUnmounted(() => {
  disposed = true
  articleRequest.invalidate()
})
</script>
<style scoped lang="scss">
.home {
  padding-top: 24px;
  padding-bottom: 60px;
}
.home-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 0 22px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 22px;
  gap: 20px;
}
.home-heading h1 {
  font: 500 36px/1.4 var(--font-serif);
  margin: 5px 0 8px;
}
.home-heading p:last-child {
  font-size: 13px;
  max-width: 760px;
}
.home-heading > a {
  font-size: 12px;
  white-space: nowrap;
  min-height: 44px;
  display: flex;
  align-items: center;
}
.feature-board {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(300px, 1fr);
  gap: 22px;
  margin-bottom: 38px;
}
.feature-photo {
  position: relative;
  min-height: 380px;
  color: #fffdf4;
  background: var(--bg-feature);
  border-radius: 4px;
  overflow: hidden;
}
.feature-photo > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.feature-photo:hover > img {
  transform: scale(1.02);
}
.feature-photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #14201a18 20%, #101d13e6);
}
.feature-photo.without-cover {
  background-color: #203631;
  background-image: repeating-linear-gradient(0deg, transparent, transparent 39px, #ffffff09 40px);
}
.feature-top {
  position: absolute;
  top: 20px;
  left: 24px;
  right: 24px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  z-index: 1;
}
.feature-top span:first-child {
  background: #f3ecda;
  color: #4d513e;
  padding: 4px 9px;
}
.feature-top span:last-child {
  text-shadow: 0 1px 4px #000;
}
.feature-caption {
  position: absolute;
  bottom: 26px;
  left: 28px;
  right: 28px;
  z-index: 1;
}
.feature-caption time {
  color: #e0ddc9;
  font-size: 11px;
}
.feature-caption h2 {
  color: inherit;
  font: 500 clamp(27px, 2.7vw, 40px)/1.45 var(--font-serif);
  max-width: 820px;
  margin-top: 10px;
  overflow-wrap: anywhere;
  text-wrap: pretty;
}
.feature-caption p {
  font-size: 13px;
  margin-top: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #ebe8dc;
}
.feature-open {
  display: inline-block;
  font-size: 12px;
  margin-top: 16px;
  padding-bottom: 3px;
  border-bottom: 1px solid #d1c6a6;
}
.feature-rail {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}
.feature-note {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 18px;
  padding: 24px;
  background: var(--bg-feature);
  color: var(--text-on-feature);
  border-radius: 4px;
}
.feature-note > div {
  min-width: 0;
  flex: 1;
}
.feature-note .eyebrow {
  color: #d1bc85;
}
.feature-note h2 {
  color: inherit;
  font: 500 23px/1.6 var(--font-serif);
  margin: 10px 0 14px;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.feature-note p {
  font-size: 11px;
  color: #c3d0bd;
}
.feature-note img {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 3px;
}
.author-note {
  background: var(--bg-secondary);
  padding: 24px;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 14px;
  border-radius: 4px;
  flex: 1;
  align-content: center;
}
.author-monogram {
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-strong);
  display: grid;
  place-items: center;
  border-radius: 50%;
  font: 23px var(--font-serif);
  color: var(--color-accent);
}
.author-title {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  font-size: 13px;
}
.author-title strong {
  color: var(--text-primary);
}
.author-title a {
  white-space: nowrap;
  font-size: 11px;
}
.author-note p {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.9;
}
.author-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  font-size: 11px;
}
.author-socials button {
  background: transparent;
  border: 0;
  color: var(--color-accent);
}
.content-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(250px, 20vw, 340px);
  gap: 40px;
}
.content-layout > section {
  min-width: 0;
}
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.section-heading h2 {
  font: 500 23px var(--font-serif);
}
.section-heading h2::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 17px;
  background: var(--color-ochre);
  margin-right: 10px;
}
.section-heading small {
  font: 11px var(--font-sans);
  color: var(--text-tertiary);
  margin-left: 8px;
}
.section-heading > a {
  font-size: 12px;
  white-space: nowrap;
}
.side-block {
  padding: 24px 0;
  border-top: 1px solid var(--border-color);
}
.side-block:first-child {
  padding-top: 0;
  border-top: 0;
}
.side-block h2 {
  font-size: 13px;
  margin-bottom: 14px;
}
.side-block p {
  font-size: 13px;
  line-height: 1.9;
}
.notice + .notice {
  margin-top: 12px;
}
.text-link {
  display: inline-block;
  font-size: 12px;
  color: var(--color-accent);
  padding-block: 10px;
}
.category-list a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 44px;
  font-size: 13px;
}
.category-list span {
  color: var(--text-tertiary);
  font-size: 11px;
}
.tag-list {
  display: flex;
  gap: 8px 16px;
  flex-wrap: wrap;
}
.tag-list a {
  font-size: 12px;
  min-height: 28px;
}
.album-link {
  display: block;
  padding: 24px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}
.album-link span {
  font-size: 11px;
  color: var(--text-tertiary);
}
.album-link strong {
  display: block;
  font: 22px var(--font-serif);
  margin: 9px 0;
}
.album-link p {
  font-size: 12px;
}
.list-end {
  padding: 28px 0;
  font-size: 13px;
}
.list-end a {
  margin-left: 8px;
  color: var(--color-accent);
}
@media (min-width: 1600px) {
  .feature-photo {
    min-height: 420px;
  }
}
@media (max-width: 1100px) {
  .feature-board {
    grid-template-columns: 1.3fr 1fr;
  }
  .feature-note img {
    display: none;
  }
  .content-layout {
    gap: 28px;
  }
  .author-note {
    padding: 18px;
  }
  .feature-note {
    padding: 20px;
  }
}
@media (max-width: 760px) {
  .home {
    padding-top: 20px;
  }
  .home-heading h1 {
    font-size: 29px;
  }
  .home-heading p:last-child {
    font-size: 12px;
  }
  .home-heading > a {
    font-size: 11px;
  }
  .feature-board {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    margin-bottom: 30px;
  }
  .feature-photo {
    min-height: 310px;
  }
  .feature-caption {
    left: 20px;
    right: 20px;
    bottom: 20px;
  }
  .feature-caption h2 {
    font-size: 28px;
  }
  .feature-top {
    left: 20px;
    right: 20px;
    top: 16px;
  }
  .feature-caption p {
    font-size: 12px;
  }
  .feature-rail {
    gap: 12px;
  }
  .feature-note {
    padding: 18px;
  }
  .feature-note h2 {
    font-size: 20px;
    margin: 5px 0 10px;
  }
  .feature-note img {
    display: block;
    width: 96px;
    height: 78px;
  }
  .author-note {
    padding: 18px;
  }
  .author-note p {
    font-size: 12px;
  }
  .content-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
  }
  .section-heading h2 {
    font-size: 20px;
  }
  .section-heading small {
    display: none;
  }
  .sidebar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
  }
  .side-block:first-child {
    border-top: 1px solid var(--border-color);
    padding-top: 24px;
  }
  .album-link {
    grid-column: 1 / -1;
  }
}
@media (max-width: 400px) {
  .sidebar {
    grid-template-columns: minmax(0, 1fr);
  }
  .feature-caption h2 {
    font-size: 26px;
  }
}
</style>
