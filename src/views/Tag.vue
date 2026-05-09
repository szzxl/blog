<template>
  <div class="tag">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-icon">🏷️</div>
        <div class="header-text">
          <h1>标签云</h1>
          <p>共 {{ tags.length }} 个标签</p>
        </div>
      </div>
      
      <!-- 标签云 -->
      <div class="tag-cloud card" v-loading="loading">
        <div 
          class="tag-item" 
          v-for="(tag, index) in tags" 
          :key="index"
          :style="{ fontSize: getTagSize(tag.num) + 'px' }"
          @click="viewTag(tag.name)"
        >
          <span class="tag-name">{{ tag.name }}</span>
          <span class="tag-count">({{ tag.num }})</span>
        </div>
      </div>
      
      <!-- 标签列表 -->
      <div class="tag-list">
        <h3 class="list-title">📋 标签列表</h3>
        <div class="tag-grid">
          <div class="tag-card card" v-for="(tag, index) in sortedTags" :key="index">
            <div class="tag-header">
              <span class="tag-icon">🔖</span>
              <span class="tag-name">{{ tag.name }}</span>
            </div>
            <div class="tag-info">
              <span class="tag-count">{{ tag.num }} 篇文章</span>
            </div>
            <el-button class="view-btn" size="small" @click="viewTag(tag.name)">
              查看 →
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTagListCount } from '@/api/article'
import { ElMessage } from 'element-plus'

const router = useRouter()

interface Tag {
  id: string | number
  name: string
  num: number
}

const tags = ref<Tag[]>([])
const loading = ref(false)

const sortedTags = computed(() => {
  return [...tags.value].sort((a, b) => b.num - a.num)
})

// 获取标签列表
const fetchTags = async () => {
  loading.value = true
  try {
    const res: any = await getTagListCount({
      tagStatus: 1,
      pageNo: 1,
      pageSize: 100
    })
    
    // 处理返回的数据 { code: 0, msg: "", data: [{name: "Java", num: 0}, ...] }
    if (res && Array.isArray(res)) {
      tags.value = res.map((item: any) => ({
        id: item.name,  // 使用 name 作为 id
        name: item.name,
        num: item.num || 0
      }))
    }
  } catch (error) {
    ElMessage.error('获取标签列表失败')
  } finally {
    loading.value = false
  }
}

const getTagSize = (num: number = 0) => {
  const minSize = 14
  const maxSize = 36
  const counts = tags.value.map(t => t.num || 0)
  const minCount = Math.min(...counts)
  const maxCount = Math.max(...counts)
  
  if (maxCount === minCount) return (minSize + maxSize) / 2
  
  return minSize + ((num - minCount) / (maxCount - minCount)) * (maxSize - minSize)
}

const viewTag = (name: string | number) => {
  router.push(`/tag/articles?tag=${name}`)
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped lang="scss">
.tag {
  min-height: calc(100vh - 200px);
  padding: 32px 0 48px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  border-left: 4px solid var(--color-accent);
  padding-left: 20px;
  margin-bottom: 36px;

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

.tag-cloud {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 36px 32px;
  margin-bottom: 36px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px;
  min-height: 160px;

  .tag-item {
    cursor: pointer;
    padding: 6px 16px;
    border-radius: var(--radius-tag);
    background: var(--bg-secondary);
    color: var(--text-secondary);
    font-weight: 500;
    transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 4px;

    &:hover {
      background: var(--color-accent);
      color: #fff;
      box-shadow: var(--shadow-glow);
    }

    .tag-count {
      font-size: 0.8em;
      opacity: 0.75;
    }
  }
}

.tag-list {
  .list-title {
    font-family: var(--font-serif);
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 24px 0;
  }

  .tag-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }

  .tag-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    cursor: pointer;
    transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;

    &:hover {
      border-color: var(--color-accent);
      box-shadow: var(--shadow-card-hover);
      transform: translateY(-4px);

      .tag-name {
        color: var(--color-accent);
      }
    }

    .tag-header {
      display: flex;
      align-items: center;
      gap: 8px;

      .tag-icon { font-size: 20px; }

      .tag-name {
        font-family: var(--font-serif);
        font-size: 15px;
        font-weight: 700;
        color: var(--text-primary);
        transition: color 0.2s ease;
      }
    }

    .tag-info {
      .tag-count {
        font-size: 13px;
        color: var(--text-tertiary);
      }
    }

    .view-btn {
      background: transparent;
      border: 1px solid var(--color-accent);
      color: var(--color-accent);
      border-radius: var(--radius-btn);
      font-size: 13px;
      font-weight: 600;
      padding: 6px 0;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;

      &:hover {
        background: var(--color-accent);
        color: var(--text-inverse);
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 64px 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

@media (max-width: 640px) {
  .page-header h1 {
    font-size: 26px;
  }

  .tag-list .tag-grid {
    grid-template-columns: 1fr;
  }
}
</style>
