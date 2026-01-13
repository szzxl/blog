<template>
  <div class="tag-articles">
    <div class="container">
      <!-- 标签标题 -->
      <div class="tag-header">
        <h1 class="tag-name">🏷️ {{ tagName }}</h1>
        <p class="tag-desc">共 {{ total }} 篇文章</p>
      </div>
      
      <!-- 文章表格 -->
      <div class="articles-table card">
        <el-table 
          :data="articles" 
          v-loading="loading"
          style="width: 100%"
          @row-click="goToArticle"
        >
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="articleName" label="文章标题" min-width="300">
            <template #default="{ row }">
              <div class="article-title">{{ row.articleName }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="发布时间" width="180" align="center">
            <template #default="{ row }">
              {{ formatTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="readNum" label="阅读量" width="120" align="center">
            <template #default="{ row }">
              <span class="stat-item">👁️ {{ row.readNum || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="likeCount" label="点赞数" width="120" align="center">
            <template #default="{ row }">
              <span class="stat-item">💗 {{ row.likeCount || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click.stop="goToArticle(row)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 空状态 -->
        <div v-if="articles.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-text">该标签下暂无文章</div>
          <el-button type="primary" @click="goBack">返回标签页</el-button>
        </div>
        
        <!-- 分页 -->
        <div class="pagination" v-if="total > 0">
          <el-pagination
            background
            layout="total, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticlesByTag } from '@/api/article'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const tagName = ref('')
const articles = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

// 加载文章列表
const loadArticles = async () => {
  if (!tagName.value) return
  
  loading.value = true
  try {
    const response: any = await getArticlesByTag({
      tagName: tagName.value,
      tagStatus: 1,
      pageNo: currentPage.value,
      pageSize: pageSize.value
    })
    
    console.log('标签文章列表接口返回:', response)
    
    // 处理分页数据
    if (response) {
      // 如果返回的是分页对象 {list: [], total: 0}
      if (response.list && Array.isArray(response.list)) {
        articles.value = response.list
        total.value = response.total || 0
      } 
      // 如果直接返回数组
      else if (Array.isArray(response)) {
        articles.value = response
        total.value = response.length
      }
      // 其他格式
      else {
        articles.value = []
        total.value = 0
      }
    } else {
      articles.value = []
      total.value = 0
    }
    
    console.log('处理后的文章列表:', articles.value)
    console.log('总数:', total.value)
  } catch (error) {
    console.error('加载文章列表失败:', error)
    ElMessage.error('加载文章列表失败')
    articles.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 跳转到文章详情
const goToArticle = (row: any) => {
  router.push(`/article/${row.id}`)
}

// 返回标签页
const goBack = () => {
  router.push('/tag')
}

// 分页
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadArticles()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 格式化时间
const formatTime = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

onMounted(() => {
  tagName.value = route.query.tag as string || ''
  if (tagName.value) {
    loadArticles()
  } else {
    ElMessage.warning('标签参数缺失')
    router.push('/tag')
  }
})
</script>

<style scoped lang="scss">
.tag-articles {
  min-height: calc(100vh - 200px);
  padding: 40px 0;
  background: #fafafa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.tag-header {
  margin-bottom: 30px;
  
  .tag-name {
    font-size: 28px;
    color: #333;
    margin: 0 0 8px 0;
    font-weight: 700;
  }
  
  .tag-desc {
    font-size: 14px;
    color: #999;
    margin: 0;
  }
}

.articles-table {
  padding: 0;
  overflow: hidden;
  
  :deep(.el-table) {
    font-size: 13px;
    
    .el-table__header {
      th {
        background: linear-gradient(135deg, rgba(255, 154, 158, 0.1) 0%, rgba(254, 207, 239, 0.1) 100%);
        color: #5a5a5a;
        font-weight: 700;
        font-size: 13px;
        padding: 10px 0;
      }
    }
    
    .el-table__body {
      td {
        padding: 10px 0;
      }
    }
    
    .el-table__row {
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background: rgba(255, 154, 158, 0.05);
      }
      
      .article-title {
        font-weight: 600;
        color: #333;
        transition: color 0.2s;
        font-size: 14px;
        
        &:hover {
          color: #ff9a9e;
        }
      }
      
      .stat-item {
        font-size: 13px;
        color: #666;
      }
    }
    
    .el-button {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      border: none;
      color: #fff;
      border-radius: 12px;
      font-weight: 600;
      padding: 5px 12px;
      font-size: 12px;
      
      &:hover {
        opacity: 0.9;
      }
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 80px 20px;
    
    .empty-icon {
      font-size: 60px;
      margin-bottom: 15px;
      opacity: 0.5;
    }
    
    .empty-text {
      font-size: 16px;
      color: #999;
      margin-bottom: 25px;
    }
    
    .el-button {
      border-radius: 20px;
      padding: 10px 25px;
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      border: none;
    }
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    padding: 20px;
    border-top: 1px solid #f0f0f0;
    
    :deep(.el-pagination) {
      .btn-prev, .btn-next, .el-pager li {
        background: #fff;
        border-radius: 8px;
        
        &:hover {
          color: #ff9a9e;
        }
        
        &.is-active {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          color: #fff;
        }
      }
      
      .el-pagination__jump {
        color: #666;
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  
  :deep(.el-pagination) {
    .btn-prev, .btn-next, .el-pager li {
      background: #fff;
      border-radius: 8px;
      
      &:hover {
        color: #ff9a9e;
      }
      
      &.is-active {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        color: #fff;
      }
    }
    
    .el-pagination__jump {
      color: #666;
    }
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 10px;
  }
  
  .tag-header {
    .tag-name {
      font-size: 24px;
    }
  }
  
  .articles-table {
    :deep(.el-table) {
      font-size: 12px;
      
      .el-table__header th {
        padding: 8px 0;
      }
      
      .el-table__row td {
        padding: 8px 0;
      }
    }
  }
}
</style>
