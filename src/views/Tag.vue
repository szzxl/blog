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
      <div class="tag-cloud card">
        <div 
          class="tag-item" 
          v-for="(tag, index) in tags" 
          :key="index"
          :style="{ fontSize: getTagSize(tag.count) + 'px' }"
          @click="viewTag(tag.id)"
        >
          <span class="tag-name">{{ tag.name }}</span>
          <span class="tag-count">({{ tag.count }})</span>
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
              <span class="tag-count">{{ tag.count }} 篇文章</span>
            </div>
            <el-button class="view-btn" size="small" @click="viewTag(tag.id)">
              查看 →
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const tags = ref([
  { id: 1, name: 'Vue', count: 25 },
  { id: 2, name: 'JavaScript', count: 30 },
  { id: 3, name: '生活', count: 45 },
  { id: 4, name: '旅行', count: 18 },
  { id: 5, name: '美食', count: 22 },
  { id: 6, name: '摄影', count: 28 },
  { id: 7, name: 'TypeScript', count: 15 },
  { id: 8, name: 'CSS', count: 20 },
  { id: 9, name: '读书', count: 12 },
  { id: 10, name: '音乐', count: 16 },
  { id: 11, name: '电影', count: 14 },
  { id: 12, name: '健身', count: 10 },
  { id: 13, name: 'React', count: 18 },
  { id: 14, name: 'Node.js', count: 12 },
  { id: 15, name: '随笔', count: 35 },
  { id: 16, name: '前端', count: 28 },
  { id: 17, name: '设计', count: 15 },
  { id: 18, name: '手工', count: 8 }
])

const sortedTags = computed(() => {
  return [...tags.value].sort((a, b) => b.count - a.count)
})

const getTagSize = (count: number) => {
  const minSize = 14
  const maxSize = 36
  const minCount = Math.min(...tags.value.map(t => t.count))
  const maxCount = Math.max(...tags.value.map(t => t.count))
  
  if (maxCount === minCount) return (minSize + maxSize) / 2
  
  return minSize + ((count - minCount) / (maxCount - minCount)) * (maxSize - minSize)
}

const viewTag = (id: number) => {
  router.push(`/web/articles?tag=${id}`)
}
</script>

<style scoped lang="scss">
.tag {
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
  
  .header-icon {
    font-size: 60px;
    animation: swing 2s ease-in-out infinite;
  }
  
  .header-text {
    h1 {
      font-size: 42px;
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 8px 0;
      font-weight: 700;
    }
    
    p {
      font-size: 16px;
      color: #999;
      margin: 0;
    }
  }
}

.tag-cloud {
  padding: 50px;
  margin-bottom: 50px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 20px;
  min-height: 300px;
  
  .tag-item {
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(255, 154, 158, 0.1) 0%, rgba(254, 207, 239, 0.1) 100%);
    color: #ff9a9e;
    font-weight: 600;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    
    &:hover {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      color: #fff;
      transform: scale(1.1);
      box-shadow: 0 8px 20px rgba(255, 154, 158, 0.3);
    }
    
    .tag-count {
      font-size: 0.8em;
      opacity: 0.8;
    }
  }
}

.tag-list {
  .list-title {
    font-size: 28px;
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 30px 0;
    font-weight: 700;
  }
  
  .tag-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .tag-card {
    padding: 25px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 30px rgba(255, 154, 158, 0.2);
    }
    
    .tag-header {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .tag-icon {
        font-size: 24px;
      }
      
      .tag-name {
        font-size: 18px;
        font-weight: 700;
        color: #5a5a5a;
      }
    }
    
    .tag-info {
      .tag-count {
        font-size: 14px;
        color: #999;
      }
    }
    
    .view-btn {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      border: none;
      color: #fff;
      border-radius: 15px;
      font-weight: 600;
      
      &:hover {
        opacity: 0.9;
      }
    }
  }
}

@keyframes swing {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(10deg);
  }
  75% {
    transform: rotate(-10deg);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
    
    .header-text h1 {
      font-size: 32px;
    }
  }
  
  .tag-cloud {
    padding: 30px 20px;
  }
  
  .tag-grid {
    grid-template-columns: 1fr;
  }
}
</style>
