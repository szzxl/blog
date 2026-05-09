<template>
  <div class="category">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>文章分类</h1>
        <p>共 {{ categories.length }} 个分类，{{ totalArticles }} 篇文章</p>
      </div>
      
      <!-- 分类网格 -->
      <div class="category-grid">
        <div class="category-item card" v-for="(cat, index) in categories" :key="index">
          <div class="category-info">
            <h3 class="category-name">{{ cat.categoryName }}</h3>
            <div class="category-count">
              <span class="count">{{ cat.count }}</span>
              <span class="label">篇文章</span>
            </div>
          </div>
          <el-button class="view-btn" @click="viewCategory(cat.categoryName)">
            查看文章 →
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategoryList } from '@/api/article'
import { ElMessage } from 'element-plus'

const router = useRouter()

interface Category {
  id: number
  categoryName: string
  icon?: string
  desc?: string
  count?: number
}

const categories = ref<Category[]>([])
const loading = ref(false)

const totalArticles = computed(() => {
  return categories.value.reduce((sum, cat) => sum + (cat.count || 0), 0)
})

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const res: any = await getCategoryList({
      pageNo: 1,
      pageSize: 100
    })
    
    // 处理返回的数据 - 适配后端返回的 {name, num} 结构
    if (Array.isArray(res)) {
      categories.value = res.map((item: any, index: number) => ({
        id: item.id || index + 1,
        categoryName: item.name || item.categoryName,
        icon: getDefaultIcon(item.name || item.categoryName),
        desc: item.description || `${item.name || item.categoryName}相关文章`,
        count: item.num || item.count || item.articleCount || 0
      }))
    } else if (res && res.list) {
      categories.value = res.list.map((item: any, index: number) => ({
        id: item.id || index + 1,
        categoryName: item.name || item.categoryName,
        icon: getDefaultIcon(item.name || item.categoryName),
        desc: item.description || `${item.name || item.categoryName}相关文章`,
        count: item.num || item.count || item.articleCount || 0
      }))
    }
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 根据分类名称返回默认图标
const getDefaultIcon = (name: string) => {
  const iconMap: Record<string, string> = {
    '生活': '✨',
    '技术': '💻',
    '旅行': '✈️',
    '美食': '🍰',
    '读书': '📚',
    '摄影': '📷',
    '音乐': '🎵',
    '电影': '🎬',
    '运动': '⚽',
    '学习': '📖'
  }
  
  for (const key in iconMap) {
    if (name.includes(key)) {
      return iconMap[key]
    }
  }
  
  return '📂'
}

const viewCategory = (categoryName: string) => {
  router.push(`/articles?category=${categoryName}`)
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped lang="scss">
.category {
  min-height: calc(100vh - 200px);
  padding: 104px 0 64px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  border-left: 4px solid var(--color-accent);
  padding-left: 20px;
  margin-bottom: 40px;

  h1 {
    font-family: var(--font-serif);
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin: 0 0 8px 0;
    line-height: 1.2;
  }

  p {
    font-size: 14px;
    color: var(--text-tertiary);
    margin: 0;
  }
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 22px;
}

.category-item {
  background: var(--bg-card);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 32px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: box-shadow 0.35s ease, transform 0.35s ease, border-color 0.35s ease;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-4px);
    border-color: var(--color-accent);

    .category-name {
      color: var(--color-accent);
    }

    .view-btn {
      background: var(--color-accent);
      color: var(--text-inverse);
    }
  }

  .category-info {
    margin-bottom: 20px;
    width: 100%;

    .category-name {
      font-family: var(--font-serif);
      font-size: 19px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 14px 0;
      letter-spacing: -0.01em;
      transition: color 0.2s ease;
    }

    .category-desc {
      font-size: 13px;
      color: var(--text-tertiary);
      margin: 0 0 14px 0;
      line-height: 1.6;
    }

    .category-count {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 6px;

      .count {
        font-size: 32px;
        font-weight: 700;
        line-height: 1;
        background: var(--gradient-accent);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -0.02em;
      }

      .label {
        font-size: 12px;
        color: var(--text-tertiary);
        letter-spacing: 0.04em;
      }
    }
  }

  .view-btn {
    width: 100%;
    height: 36px;
    border-radius: var(--radius-btn);
    background: transparent;
    border: 1px solid var(--color-accent);
    color: var(--color-accent);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: background 0.25s ease, color 0.25s ease;

    &:hover {
      background: var(--color-accent);
      color: var(--text-inverse);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 72px 0;
  color: var(--text-tertiary);
  font-size: 15px;
}

@media (max-width: 640px) {
  .page-header h1 {
    font-size: 26px;
  }

  .category-grid {
    grid-template-columns: 1fr;
  }
}
</style>
