<template>
  <div class="tag-page container">
    <header class="page-header">
      <span class="eyebrow">细一点的主题</span>
      <h1>标签</h1>
      <p>{{ loading ? '正在加载标签…' : `共 ${tags.length} 个标签，按文章数量排列。` }}</p>
    </header>
    <div v-if="loadError" class="empty-state" role="alert">
      <p>标签暂时无法加载</p>
      <el-button @click="fetchTags">重新加载</el-button>
    </div>
    <div v-else class="tag-grid" v-loading="loading">
      <router-link
        v-for="tag in sortedTags"
        :key="tag.name"
        :to="{ path: '/tag/articles', query: { tag: tag.name } }"
        class="tag-item"
        ><span class="tag-symbol">#</span><strong>{{ tag.name }}</strong
        ><span>{{ tag.count ?? 0 }} 篇</span></router-link
      >
    </div>
    <p v-if="!loading && !loadError && !tags.length" class="empty-state">暂时还没有标签。</p>
    <div class="tag-foot">
      <router-link to="/category">按分类浏览</router-link
      ><router-link to="/articles">全部文章</router-link>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { getTagListCount } from '@/api/taxonomy'
import type { Tag } from '@/types/catalog'
import { useAsyncResource } from '@/composables/useAsyncResource'
const {
  data: tags,
  loading,
  loadError,
  execute: fetchTags
} = useAsyncResource<Tag[]>(() => getTagListCount({ tagStatus: 1, pageNo: 1, pageSize: 100 }), [])
const sortedTags = computed(() => [...tags.value].sort((a, b) => (b.count ?? 0) - (a.count ?? 0)))
onMounted(fetchTags)
</script>
<style scoped lang="scss">
.tag-page {
  padding-bottom: 50px;
}
.page-header h1 {
  margin-top: 8px;
}
.tag-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 32px;
  min-height: 100px;
}
.tag-item {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 24px 0;
  min-height: 76px;
  border-top: 1px solid var(--border-color);
  font-size: 12px;
}
.tag-symbol {
  font: italic 25px var(--font-serif);
  color: var(--color-ochre);
}
.tag-item strong {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
  margin-right: auto;
  min-width: 0;
  overflow-wrap: anywhere;
}
.tag-item > span:not(.tag-symbol) {
  white-space: nowrap;
  color: var(--text-tertiary);
}
.tag-foot {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  margin-top: 24px;
}
@media (max-width: 900px) {
  .tag-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 500px) {
  .tag-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .tag-item {
    padding-block: 18px;
  }
}
</style>
