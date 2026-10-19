<template>
  <aside class="sidebar">
    <section class="side-block">
      <h2>关于这里</h2>
      <p>{{ config.site_description || '技术实践与日常记录，慢慢整理在这里。' }}</p>
      <router-link to="/about" class="text-link">关于我</router-link>
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
          :key="category.id || category.name"
          :to="{
            path: '/articles',
            query: { category: category.name }
          }"
          >{{ category.name
          }}<span v-if="category.count !== undefined">{{ category.count }}</span></router-link
        >
      </div>
      <router-link to="/category" class="text-link">全部分类</router-link>
    </section>
    <section class="side-block">
      <h2>标签</h2>
      <div class="tag-list">
        <router-link
          v-for="tag in tags.slice(0, 12)"
          :key="tag.id || tag.name"
          :to="{ path: '/tag/articles', query: { tag: tag.name } }"
          >#{{ tag.name }}</router-link
        >
      </div>
      <router-link to="/tag" class="text-link">浏览标签</router-link>
    </section>
    <router-link to="/album" class="album-link"
      ><span>换个心情</span><strong>去相册走走</strong>
      <p>看看文字之外的日常。</p></router-link
    >
  </aside>
</template>
<script setup lang="ts">
import type { Category, Tag } from '@/types/catalog'
import type { SiteNotice, WebsiteConfig } from '@/types/website'
defineProps<{
  categories: Category[]
  tags: Tag[]
  notifications: SiteNotice[]
  config: Readonly<WebsiteConfig>
}>()
</script>
<style scoped lang="scss">
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
@media (max-width: 760px) {
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
}
</style>
