<template>
  <div class="article-list">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-icon">📝</div>
        <div class="header-text">
          <h1>文章列表</h1>
          <p>共 {{ articles.length }} 篇文章</p>
        </div>
      </div>
      
      <!-- 筛选栏 -->
      <div class="filter-bar card">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索文章标题或内容..."
          prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-select v-model="selectedCategory" placeholder="选择分类" clearable>
          <el-option label="全部分类" value="" />
          <el-option label="生活随笔" value="1" />
          <el-option label="技术分享" value="2" />
          <el-option label="旅行游记" value="3" />
        </el-select>
        <el-select v-model="selectedTag" placeholder="选择标签" clearable>
          <el-option label="全部标签" value="" />
          <el-option label="Vue" value="1" />
          <el-option label="生活" value="2" />
          <el-option label="旅行" value="3" />
        </el-select>
      </div>
      
      <!-- 文章列表 -->
      <div class="articles">
        <div class="article-item card" v-for="i in 8" :key="i" @click="viewArticle(i)">
          <div class="article-cover">
            <img src="https://via.placeholder.com/400x250/fecfef/ffffff?text=♡" alt="封面">
            <div class="cover-overlay">
              <span class="read-more">阅读全文 →</span>
            </div>
          </div>
          <div class="article-info">
            <h3 class="article-title">这是文章标题 {{ i }} - 记录美好生活的每一天</h3>
            <p class="article-desc">
              这是文章摘要，简单介绍文章的主要内容。分享生活中的美好瞬间，记录成长的点点滴滴...
            </p>
            <div class="article-meta">
              <span class="meta-item">
                <span class="icon">📅</span>
                2024-01-{{ String(i).padStart(2, '0') }}
              </span>
              <span class="meta-item">
                <span class="icon">📂</span>
                生活随笔
              </span>
              <span class="meta-item">
                <span class="icon">👁️</span>
                {{ 100 + i * 20 }}
              </span>
              <span class="meta-item">
                <span class="icon">💗</span>
                {{ 10 + i * 2 }}
              </span>
            </div>
            <div class="article-tags">
              <span class="tag">Vue</span>
              <span class="tag">生活</span>
              <span class="tag">随笔</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="80"
          :page-size="10"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedTag = ref('')

const articles = ref(Array.from({ length: 80 }, (_, i) => ({ id: i + 1 })))

const viewArticle = (id: number) => {
  router.push(`/web/article/${id}`)
}
</script>

<style scoped lang="scss">
.article-list {
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
  margin-bottom: 40px;
  
  .header-icon {
    font-size: 60px;
    animation: bounce 2s ease-in-out infinite;
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

.filter-bar {
  padding: 25px;
  margin-bottom: 30px;
  display: flex;
  gap: 15px;
  
  .search-input {
    flex: 1;
  }
  
  .el-input, .el-select {
    :deep(.el-input__wrapper) {
      border-radius: 15px;
      box-shadow: 0 2px 12px rgba(252, 182, 159, 0.1);
      border: 2px solid rgba(255, 182, 193, 0.2);
      
      &:hover {
        border-color: rgba(255, 182, 193, 0.3);
      }
      
      &.is-focus {
        border-color: #ff9a9e;
        box-shadow: 0 4px 20px rgba(255, 154, 158, 0.25);
      }
    }
  }
}

.articles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.article-item {
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(255, 154, 158, 0.25);
    
    .article-cover {
      .cover-overlay {
        opacity: 1;
      }
      
      img {
        transform: scale(1.1);
      }
    }
  }
  
  .article-cover {
    position: relative;
    width: 100%;
    height: 220px;
    overflow: hidden;
    border-radius: 25px 25px 0 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
    
    .cover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 154, 158, 0.9) 0%, rgba(254, 207, 239, 0.9) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
      
      .read-more {
        color: #fff;
        font-size: 18px;
        font-weight: 700;
      }
    }
  }
  
  .article-info {
    padding: 25px;
    
    .article-title {
      font-size: 20px;
      font-weight: 700;
      color: #5a5a5a;
      margin: 0 0 15px 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .article-desc {
      font-size: 14px;
      color: #999;
      line-height: 1.8;
      margin: 0 0 15px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .article-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 15px;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 13px;
        color: #999;
        
        .icon {
          font-size: 14px;
        }
      }
    }
    
    .article-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .tag {
        padding: 4px 12px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(255, 154, 158, 0.15) 0%, rgba(254, 207, 239, 0.15) 100%);
        color: #ff9a9e;
        font-size: 12px;
        font-weight: 600;
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 50px;
  padding: 30px 0;
  
  :deep(.el-pagination) {
    display: flex;
    gap: 10px;
    
    .btn-prev, .btn-next {
      background: #fff;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(252, 182, 159, 0.15);
      border: 2px solid rgba(255, 182, 193, 0.2);
      min-width: 45px;
      height: 45px;
      font-weight: 600;
      transition: all 0.3s;
      
      &:hover:not(.is-disabled) {
        background: linear-gradient(135deg, rgba(255, 154, 158, 0.1) 0%, rgba(254, 207, 239, 0.1) 100%);
        border-color: #ff9a9e;
        color: #ff9a9e;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 154, 158, 0.25);
      }
      
      &.is-disabled {
        background: #f5f5f5;
        border-color: #e0e0e0;
        color: #ccc;
      }
    }
    
    .el-pager {
      display: flex;
      gap: 8px;
      
      li {
        background: #fff;
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(252, 182, 159, 0.15);
        border: 2px solid rgba(255, 182, 193, 0.2);
        min-width: 45px;
        height: 45px;
        line-height: 41px;
        font-weight: 600;
        transition: all 0.3s;
        
        &:hover {
          background: linear-gradient(135deg, rgba(255, 154, 158, 0.1) 0%, rgba(254, 207, 239, 0.1) 100%);
          border-color: #ff9a9e;
          color: #ff9a9e;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 154, 158, 0.25);
        }
        
        &.is-active {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 6px 25px rgba(255, 154, 158, 0.4);
          transform: translateY(-2px);
        }
        
        &.more {
          border: none;
          box-shadow: none;
          background: transparent;
          
          &:hover {
            background: transparent;
            color: #ff9a9e;
            transform: none;
            box-shadow: none;
          }
        }
      }
    }
    
    .el-pagination__jump {
      margin-left: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #666;
      font-weight: 500;
      
      .el-input {
        width: 60px;
        
        .el-input__wrapper {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(252, 182, 159, 0.15);
          border: 2px solid rgba(255, 182, 193, 0.2);
          padding: 8px 12px;
          
          &:hover {
            border-color: rgba(255, 182, 193, 0.3);
          }
          
          &.is-focus {
            border-color: #ff9a9e;
            box-shadow: 0 4px 20px rgba(255, 154, 158, 0.25);
          }
          
          .el-input__inner {
            text-align: center;
            font-weight: 600;
            color: #5a5a5a;
          }
        }
      }
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
    
    .header-text h1 {
      font-size: 32px;
    }
  }
  
  .filter-bar {
    flex-direction: column;
  }
  
  .articles {
    grid-template-columns: 1fr;
  }
}
</style>
