<template>
  <div class="catalog-page container">
    <header class="page-header">
      <span class="eyebrow">按主题阅读</span>
      <h1>文章分类</h1>
      <p>{{ loading ? '正在整理分类…' : `共 ${categories.length} 个分类，找到你想读的方向。` }}</p>
    </header>
    <div v-if="loadError" class="empty-state" role="alert">
      <p>分类暂时无法加载</p>
      <el-button @click="fetchCategories">重新加载</el-button>
    </div>
    <div v-else class="catalog-grid" v-loading="loading">
      <router-link
        v-for="(category, index) in categories"
        :key="category.id ?? category.name"
        :to="{ path: '/articles', query: { category: category.name } }"
        class="catalog-card"
        ><div class="catalog-index">
          <span>{{ String(index + 1).padStart(2, '0') }}</span
          ><span>{{ category.count ?? 0 }} 篇</span>
        </div>
        <h2>{{ category.name }}</h2>
        <p v-if="category.description">{{ category.description }}</p>
        <span class="catalog-open">查看文章</span></router-link
      >
    </div>
    <p v-if="!loading && !loadError && !categories.length" class="empty-state">暂时还没有分类。</p>
    <div class="catalog-footer">
      <span>也可以用更具体的关键词查找。</span><router-link to="/tag">浏览全部标签</router-link>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { getCategoryList } from '@/api/taxonomy'
import type { Category } from '@/types/catalog'
import { useAsyncResource } from '@/composables/useAsyncResource'
const {
  data: categories,
  loading,
  loadError,
  execute: fetchCategories
} = useAsyncResource<Category[]>(() => getCategoryList({ pageNo: 1, pageSize: 100 }), [])
onMounted(fetchCategories)
</script>
<style scoped lang="scss">
.catalog-page {
  padding-bottom: 50px;
}
.page-header h1 {
  margin-top: 8px;
}
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 26px;
  min-height: 100px;
}
.catalog-card {
  border-top: 1px solid var(--border-color);
  padding: 25px 0;
}
.catalog-index {
  display: flex;
  justify-content: space-between;
  color: var(--text-tertiary);
  font-size: 11px;
}
.catalog-card h2 {
  font: 500 29px var(--font-serif);
  margin: 24px 0 14px;
  overflow-wrap: anywhere;
}
.catalog-card p {
  font-size: 13px;
  margin-bottom: 18px;
}
.catalog-open {
  display: inline-block;
  min-height: 44px;
  padding-top: 10px;
  color: var(--color-accent);
  font-size: 12px;
}
.catalog-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 14px;
  border-top: 1px solid var(--border-color);
  padding-top: 24px;
  margin-top: 20px;
  font-size: 12px;
  color: var(--text-tertiary);
}
@media (max-width: 900px) {
  .catalog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 500px) {
  .catalog-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }
  .catalog-card h2 {
    font-size: 25px;
  }
}
</style>
