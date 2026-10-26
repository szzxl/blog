<template>
  <div class="home container">
    <section class="home-heading">
      <div>
        <h1>笔记与日常</h1>
        <p>{{ config.site_description || '项目笔记、排错过程，偶尔记点别的。' }}</p>
      </div>
      <router-link to="/about">关于我</router-link>
    </section>
    <Skeleton v-if="loading" type="article-list" :count="3" />
    <div v-else-if="loadError" class="empty-state" role="alert">
      <h2>文章暂时没有加载出来</h2>
      <p>稍后再试，或从文章索引继续浏览。</p>
      <el-button @click="fetchArticles">重新加载</el-button
      ><router-link to="/articles" class="text-link">文章索引</router-link>
    </div>
    <template v-else>
      <HomeFeatured v-if="featured" :featured="featured" :secondary="secondary" :config="config" />
      <div class="content-layout">
        <section>
          <div class="section-heading">
            <h2>最近更新 <small>本月文章</small></h2>
            <router-link to="/articles">全部文章</router-link>
          </div>
          <ArticleCard v-for="article in recentArticles" :key="article.id" :article="article" />
          <div v-if="!articles.length" class="empty-state">
            <h3>本月还没有新文章</h3>
            <p>可以先看看往期笔记。</p>
            <router-link to="/articles" class="text-link">浏览全部文章</router-link>
          </div>
          <p v-else-if="!recentArticles.length" class="list-end">
            本月的更新都在上方。<router-link to="/articles">继续看往期文章</router-link>
          </p>
        </section>
        <HomeSidebar
          :categories="categories"
          :tags="tags"
          :notifications="notifications"
          :config="config"
        />
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { getCategoryList, getTagList } from '@/api/taxonomy'
import { getMonthArticleList } from '@/api/article'
import { getNotificationList } from '@/api/website'
import { useWebsiteConfig } from '@/composables/useWebsiteConfig'
import { useAsyncResource } from '@/composables/useAsyncResource'
import type { ArticleSummary } from '@/types/article'
import type { Category, Tag } from '@/types/catalog'
import type { SiteNotice } from '@/types/website'
import ArticleCard from '@/components/ArticleCard.vue'
import Skeleton from '@/components/Skeleton.vue'
import HomeFeatured from '@/components/home/HomeFeatured.vue'
import HomeSidebar from '@/components/home/HomeSidebar.vue'
const { config } = useWebsiteConfig()
const {
  data: articles,
  loading,
  loadError,
  execute: fetchArticles
} = useAsyncResource<ArticleSummary[]>(
  async () => (await getMonthArticleList({ pageNo: 1, pageSize: 12 })).list,
  []
)
const { data: categories, execute: fetchCategories } = useAsyncResource<Category[]>(
  () => getCategoryList({ pageSize: 100 }),
  []
)
const { data: tags, execute: fetchTags } = useAsyncResource<Tag[]>(
  () => getTagList({ pageSize: 200 }),
  []
)
const { data: notifications, execute: fetchNotifications } = useAsyncResource<SiteNotice[]>(
  async () => (await getNotificationList()).filter((item) => item.status === 1),
  []
)
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
onMounted(() => {
  void fetchArticles()
  void fetchCategories()
  void fetchTags()
  void fetchNotifications()
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
.text-link {
  display: inline-block;
  font-size: 12px;
  color: var(--color-accent);
  padding-block: 10px;
}
.list-end {
  padding: 28px 0;
  font-size: 13px;
}
.list-end a {
  margin-left: 8px;
  color: var(--color-accent);
}
@media (max-width: 1100px) {
  .content-layout {
    gap: 28px;
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
}
</style>
