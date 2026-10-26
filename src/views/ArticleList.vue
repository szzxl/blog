<template>
  <div class="article-index container">
    <header class="page-header">
      <h1>文章</h1>
      <p>搜索标题和正文，也可以从分类与标签继续查找。</p>
    </header>
    <div class="index-tools">
      <form class="search-form" @submit.prevent="handleSearch">
        <label class="sr-only" for="article-keyword">搜索文章</label
        ><input
          id="article-keyword"
          v-model="searchKeyword"
          maxlength="100"
          placeholder="搜索标题或正文"
          type="search"
        /><button class="primary-btn" type="submit">搜索</button>
      </form>
      <nav class="category-tabs" aria-label="文章分类">
        <button
          :aria-pressed="!selectedCategory"
          :class="{ active: !selectedCategory }"
          @click="updateQuery({ category: '' })"
        >
          全部</button
        ><button
          v-for="category in categories"
          :key="category.id || category.name"
          :aria-pressed="selectedCategory === (category.name)"
          :class="{ active: selectedCategory === (category.name) }"
          @click="updateQuery({ category: category.name || '' })"
        >
          {{ category.name
          }}<small v-if="(category.count) !== undefined">{{
            category.count
          }}</small>
        </button>
      </nav>
    </div>
    <div class="result-summary">
      <p role="status">
        {{ loading ? '正在查找文章…' : loadError ? '暂时无法获取文章' : `共 ${total} 篇文章` }}
      </p>
      <button
        v-if="appliedFilters.length"
        @click="updateQuery({ keyword: '', category: '', tag: '' })"
      >
        清除全部筛选 ×
      </button>
    </div>
    <div v-if="appliedFilters.length" class="applied-filters" aria-label="当前筛选">
      <button
        v-for="filter in appliedFilters"
        :key="filter.key"
        @click="updateQuery({ [filter.key]: '' })"
        :aria-label="`移除${filter.label}：${filter.value}`"
      >
        {{ filter.label }}：{{ filter.value }} <span aria-hidden="true">×</span>
      </button>
    </div>
    <Skeleton v-if="loading" type="article-list" :count="4" />
    <div v-else-if="loadError" class="empty-state" role="alert">
      <h2>文章加载失败</h2>
      <p>当前筛选条件已保留，可以重新尝试。</p>
      <el-button @click="fetchArticles">重新加载</el-button>
    </div>
    <div v-else-if="!articles.length" class="empty-state">
      <h2>没有找到符合条件的文章</h2>
      <p>
        {{
          appliedFilters.length
            ? '试试更短的关键词，或清除筛选看看其他文章。'
            : '文章还在整理中，过段时间再来看看。'
        }}
      </p>
      <el-button
        v-if="appliedFilters.length"
        @click="updateQuery({ keyword: '', category: '', tag: '' })"
        >查看全部文章</el-button
      >
    </div>
    <div v-else class="index-list">
      <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
    </div>
    <div v-if="!loading && !loadError && total > pageSize" class="pagination">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="pageNo"
        @current-change="handlePageChange"
      />
    </div>
    <p v-else-if="!loading && !loadError && articles.length" class="index-end">
      以上为当前条件下的全部文章
    </p>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticleList } from '@/api/article'
import { getCategoryList } from '@/api/taxonomy'
import { normalizePage, lastPage } from '@/utils/pagination'
import { createLatestRequest } from '@/utils/latestRequest'
import type { ArticleSummary } from '@/types/article'
import ArticleCard from '@/components/ArticleCard.vue'
import Skeleton from '@/components/Skeleton.vue'

import type { Category } from '@/types/catalog'
const route = useRoute()
const router = useRouter()
const searchKeyword = ref('')
const articles = ref<ArticleSummary[]>([])
const categories = ref<Category[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = 10
const loading = ref(true)
const loadError = ref(false)
const articleRequest = createLatestRequest()
let disposed = false
const queryText = (key: string) =>
  typeof route.query[key] === 'string' ? route.query[key].slice(0, 100) : ''
const selectedCategory = computed(() => queryText('category'))
const appliedFilters = computed(() =>
  [
    { key: 'keyword', label: '关键词', value: queryText('keyword') },
    { key: 'category', label: '分类', value: selectedCategory.value },
    { key: 'tag', label: '标签', value: queryText('tag') }
  ].filter((item) => item.value)
)
const updateQuery = (patch: Record<string, string>) => {
  const query: Record<string, string> = {}
  for (const key of ['keyword', 'category', 'tag']) {
    const value = (patch[key] ?? queryText(key)).trim()
    if (value) query[key] = value
  }
  if (patch.page && Number(patch.page) > 1) query.page = patch.page
  const target = router.resolve({ path: '/articles', query })
  if (target.fullPath === route.fullPath) {
    searchKeyword.value = query.keyword || ''
    void fetchArticles()
  } else void router.push({ path: '/articles', query })
}
const handleSearch = () => updateQuery({ keyword: searchKeyword.value.trim() })
const handlePageChange = (page: number) => updateQuery({ page: String(page) })
const fetchArticles = async () => {
  const requestId = articleRequest.next()
  loading.value = true
  loadError.value = false
  try {
    const response = await getArticleList({
      pageNo: pageNo.value,
      pageSize,
      keyword: queryText('keyword') || undefined,
      articleCategory: selectedCategory.value || undefined,
      articleTag: queryText('tag') || undefined
    })
    if (disposed || !articleRequest.isCurrent(requestId)) return
    const list = response.list
    const count = response.total
    const finalPage = lastPage(count, pageSize)
    if (pageNo.value > finalPage) {
      await router.replace({
        query: { ...route.query, page: finalPage > 1 ? String(finalPage) : undefined }
      })
      return
    }
    articles.value = list
    total.value = count
  } catch {
    if (!disposed && articleRequest.isCurrent(requestId)) loadError.value = true
  } finally {
    if (!disposed && articleRequest.isCurrent(requestId)) loading.value = false
  }
}
watch(
  () => [route.query.page, route.query.keyword, route.query.category, route.query.tag],
  () => {
    pageNo.value = normalizePage(route.query.page)
    searchKeyword.value = queryText('keyword')
    void fetchArticles()
  },
  { immediate: true }
)
onMounted(async () => {
  try {
    const response = await getCategoryList({ pageSize: 100 })
    if (!disposed) categories.value = response
  } catch {
    /* 分类不可用时，仍可搜索文章 */
  }
})
onUnmounted(() => {
  disposed = true
  articleRequest.invalidate()
})
</script>
<style scoped lang="scss">
.article-index {
  padding-bottom: 50px;
}
.index-tools {
  padding: 22px 24px 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  margin-bottom: 26px;
}
.search-form {
  display: flex;
  gap: 12px;
  max-width: 800px;
  margin-bottom: 18px;
}
.search-form input {
  min-height: 46px;
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 10px 14px;
  min-width: 0;
  flex: 1;
  font-size: 14px;
}
.primary-btn {
  min-height: 46px;
  background: var(--color-accent);
  color: var(--bg-card);
  padding: 8px 22px;
  border: 0;
  border-radius: 4px;
  font-size: 13px;
}
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.category-tabs button {
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  min-height: 44px;
  padding: 10px 14px;
  font-size: 12px;
}
.category-tabs button.active {
  border-color: var(--color-accent);
  background: var(--bg-soft);
  color: var(--color-accent);
}
.category-tabs small {
  font-size: 10px;
  margin-left: 8px;
}
.result-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--text-tertiary);
  min-height: 36px;
}
.result-summary button {
  background: transparent;
  border: 0;
  min-height: 44px;
  color: var(--color-accent);
  font-size: 12px;
}
.applied-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.applied-filters button {
  min-height: 40px;
  padding: 7px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-soft);
  border-radius: 20px;
  font-size: 12px;
  color: var(--color-accent);
  overflow-wrap: anywhere;
  max-width: 100%;
  text-align: left;
}
.applied-filters span {
  margin-left: 8px;
}
.index-end {
  text-align: center;
  color: var(--text-tertiary);
  font-size: 12px;
  border-top: 1px solid var(--border-color);
  padding: 24px 0;
}
.empty-state h2 {
  font: 24px var(--font-serif);
  margin-bottom: 14px;
}
.empty-state p {
  font-size: 13px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  clip-path: inset(50%);
  overflow: hidden;
}
@media (max-width: 760px) {
  .index-tools {
    padding: 16px 14px 0;
    margin-bottom: 18px;
  }
  .search-form {
    gap: 8px;
  }
  .search-form input {
    font-size: 13px;
  }
  .primary-btn {
    padding-inline: 16px;
  }
  .category-tabs button {
    padding-inline: 9px;
    font-size: 12px;
  }
  .category-tabs small {
    margin-left: 4px;
  }
}
</style>
