<template>
  <article class="article-row">
    <div class="article-copy">
      <div class="article-kicker">
        <router-link
          v-if="article.articleCategory"
          :to="{ path: '/articles', query: { category: article.articleCategory } }"
          >{{ article.articleCategory }}</router-link
        >
        <span v-if="article.isTop === 1" class="article-badge">置顶</span>
        <span v-else-if="article.isRecommend === 1" class="article-badge">推荐</span>
      </div>
      <router-link :to="`/article/${article.id}`" class="article-link">
        <h2>{{ article.articleName }}</h2>
        <p v-if="article.summary" class="article-summary">{{ article.summary }}</p>
      </router-link>
      <div class="article-meta">
        <time v-if="article.createTime">{{ formatTimestamp(article.createTime) }}</time>
        <router-link
          v-for="tag in parseTags(article.articleTag).slice(0, 2)"
          :key="tag"
          :to="{ path: '/tag/articles', query: { tag } }"
          >#{{ tag }}</router-link
        >
        <span v-if="article.readNum !== undefined">{{ article.readNum }} 阅读</span>
        <slot name="actions" />
      </div>
    </div>
    <router-link
      :to="`/article/${article.id}`"
      class="article-cover"
      :aria-label="`阅读：${article.articleName}`"
      tabindex="-1"
    >
      <img
        :src="article.articleCover || defaultCover"
        :alt="article.articleName"
        loading="lazy"
        @error="fallbackCover"
      />
    </router-link>
  </article>
</template>

<script setup lang="ts">
import type { ArticleSummary } from '@/types/article'
import { formatTimestamp, parseTags } from '@/utils/format'

defineProps<{ article: ArticleSummary }>()
const defaultCover = `${import.meta.env.BASE_URL}default-cover.svg`
const fallbackCover = (event: Event) => {
  const image = event.target as HTMLImageElement
  if (image.getAttribute('src') !== defaultCover) image.src = defaultCover
}
</script>

<style scoped lang="scss">
.article-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(180px, 20vw, 260px);
  align-items: center;
  gap: 28px;
  padding: 27px 0;
  border-top: 1px solid var(--border-color);
}
.article-copy {
  min-width: 0;
}
.article-kicker {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 20px;
  font-size: 11px;
  color: var(--text-tertiary);
}
.article-badge {
  font-size: 10px;
  color: var(--color-ochre);
}
.article-link {
  display: block;
}
h2 {
  font: 600 23px/1.55 var(--font-serif);
  color: var(--text-primary);
  margin: 7px 0;
  text-wrap: pretty;
  overflow-wrap: anywhere;
}
.article-link:hover h2 {
  color: var(--color-accent);
}
.article-summary {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.9;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 850px;
}
.article-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 14px;
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 14px;
}
.article-cover {
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 4px;
  background: var(--bg-secondary);
}
.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s;
}
.article-cover:hover img {
  transform: scale(1.025);
}
@media (max-width: 760px) {
  .article-row {
    grid-template-columns: minmax(0, 1fr) 96px;
    gap: 14px;
    align-items: start;
    padding: 23px 0;
  }
  h2 {
    font-size: 18px;
    margin-top: 5px;
  }
  .article-cover {
    aspect-ratio: 1;
    margin-top: 6px;
  }
  .article-summary {
    font-size: 12px;
  }
  .article-meta {
    font-size: 10px;
    gap: 7px 10px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .article-cover img {
    transition: none;
  }
}
</style>
