<template>
  <div class="category">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-icon">📂</div>
        <div class="header-text">
          <h1>文章分类</h1>
          <p>共 {{ categories.length }} 个分类，{{ totalArticles }} 篇文章</p>
        </div>
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
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 30px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 50px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  padding: 30px 40px;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  
  .header-icon {
    font-size: 60px;
    animation: bounce 2s ease-in-out infinite;
  }
  
  .header-text {
    h1 {
      font-size: 42px;
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 8px 0;
      font-weight: 700;
    }
    
    p {
      font-size: 16px;
      color: #666;
      margin: 0;
      font-weight: 500;
    }
  }
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.category-item {
  padding: 35px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(139, 92, 246, 0.25);
  }
  
  .category-icon {
    font-size: 60px;
    margin-bottom: 20px;
    animation: float 3s ease-in-out infinite;
  }
  
  .category-info {
    margin-bottom: 25px;
    
    .category-name {
      font-size: 24px;
      font-weight: 700;
      color: #5a5a5a;
      margin: 0 0 10px 0;
    }
    
    .category-desc {
      font-size: 14px;
      color: #999;
      margin: 0 0 15px 0;
      line-height: 1.6;
    }
    
    .category-count {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 5px;
      
      .count {
        font-size: 32px;
        font-weight: 700;
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .label {
        font-size: 14px;
        color: #999;
      }
    }
  }
  
  .view-btn {
    width: 100%;
    height: 42px;
    border-radius: 21px;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    border: none;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
    }
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(5deg);
  }
}

@media (max-width: 768px) {
  .category {
    .container {
      padding: 20px 15px;
    }
  }
  
  .page-header {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
    margin-bottom: 25px;
    gap: 15px;
    
    .header-icon {
      font-size: 50px;
    }
    
    .header-text {
      h1 {
        font-size: 28px;
        margin-bottom: 8px;
      }
      
      p {
        font-size: 13px;
      }
    }
  }
  
  .category-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .category-card {
    padding: 25px 20px;
    
    .category-icon {
      width: 60px;
      height: 60px;
      font-size: 28px;
    }
    
    .category-info {
      .category-name {
        font-size: 18px;
        margin-bottom: 8px;
      }
      
      .category-count {
        font-size: 13px;
      }
    }
    
    .category-arrow {
      font-size: 20px;
    }
  }
  
  .empty-state {
    padding: 60px 20px;
    
    .empty-icon {
      font-size: 60px;
    }
    
    .empty-text {
      font-size: 14px;
    }
  }
}
</style>
