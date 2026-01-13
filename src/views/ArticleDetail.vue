<template>
  <div class="article-detail">
    <div class="container" v-loading="loading">
      <!-- 文章内容（包含标题和信息） -->
      <article class="article-content card" v-if="article">
        <h1 class="article-title">{{ article.articleName }}</h1>
        
        <div class="article-info">
          <!-- 左侧：标签 -->
          <span class="info-item tags" v-if="article.articleTag">
            <span class="icon">🏷️</span>
            <span class="tag" v-for="(tag, index) in parseTags(article.articleTag)" :key="index">{{ tag }}</span>
          </span>
          
          <!-- 右侧：阅读数、点赞数、时间 -->
          <div class="info-right">
            <span class="info-item" v-if="article.readNum !== undefined">
              <span class="icon">👁️</span>
              {{ article.readNum }} 阅读
            </span>
            <span class="info-item" v-if="article.likeCount">
              <span class="icon">💗</span>
              {{ article.likeCount }} 点赞
            </span>
            <span class="info-divider" v-if="article.createTime">|</span>
            <span class="info-item" v-if="article.createTime">
              <span class="icon">📅</span>
              {{ formatTime(article.createTime) }}
            </span>
          </div>
        </div>
        
        <div class="content" v-html="article.articleContent"></div>
      </article>
      
      <!-- 文章操作栏 - 固定在右侧 -->
      <div class="article-actions" v-if="article">
        <el-button 
          class="action-btn like-btn" 
          size="large"
          :class="{ liked: article.isLiked }"
          @click="handleLikeArticle"
        >
          <span class="icon">{{ article.isLiked ? '💗' : '🤍' }}</span>
          <span class="text">点赞</span>
          <span class="count">{{ article.likeCount || 0 }}</span>
        </el-button>
        <el-button class="action-btn" size="large">
          <span class="icon">⭐</span>
          <span class="text">收藏</span>
        </el-button>
        <el-button class="action-btn" size="large">
          <span class="icon">🔗</span>
          <span class="text">分享</span>
        </el-button>
      </div>
      
      <!-- 评论区 -->
      <Comment v-if="article" :article-id="article.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Comment from '@/components/Comment.vue'
import { getArticleDetail, addArticleView, likeArticle } from '@/api/article'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 是否是博主
const isAuthor = computed(() => {
  if (!userStore.isLoggedIn || !userStore.user) return false
  const roles = userStore.user.roles || []
  return roles.some((role: any) => role.name === '博主' || role.name === '超级管理员')
})

interface Article {
  id: string | number
  articleName: string
  articleContent: string
  articleCover?: string
  articleCategory?: string
  articleTag?: string
  readNum?: number
  likeCount?: number
  createTime?: number
  isLiked?: boolean
}

const article = ref<Article | null>(null)
const loading = ref(false)

// 获取文章详情
const fetchArticleDetail = async () => {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('文章ID不存在')
    return
  }
  
  loading.value = true
  try {
    const res: any = await getArticleDetail({ id: id })
    
    if (res) {
      article.value = res
      // 增加查看次数（博主不增加）
      if (!isAuthor.value) {
        incrementViewCount(id)
      }
    }
  } catch (error) {
    ElMessage.error('获取文章详情失败')
  } finally {
    loading.value = false
  }
}

// 增加查看次数
const incrementViewCount = async (id: string) => {
  try {
    await addArticleView({ id })
  } catch (error) {
    // 静默失败，不影响用户体验
  }
}

// 点赞文章
const handleLikeArticle = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    })
    return
  }
  
  if (!article.value) return
  
  // 保存当前状态
  const wasLiked = article.value.isLiked
  
  try {
    await likeArticle({
      articleId: article.value.id,
      type: wasLiked ? 2 : 1  // 已点赞则取消(2)，未点赞则点赞(1)
    })
    
    // 切换本地状态
    if (wasLiked) {
      // 取消点赞
      article.value.likeCount = Math.max(0, (article.value.likeCount || 0) - 1)
      article.value.isLiked = false
    } else {
      // 点赞
      article.value.likeCount = (article.value.likeCount || 0) + 1
      article.value.isLiked = true
    }
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

// 格式化时间
const formatTime = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

// 解析标签字符串为数组
const parseTags = (tagStr?: string) => {
  if (!tagStr) return []
  return tagStr.split(',').map(t => t.trim()).filter(t => t)
}

onMounted(() => {
  fetchArticleDetail()
})
</script>

<style scoped lang="scss">
.article-detail {
  min-height: calc(100vh - 200px);
  padding: 40px 0 60px;
  position: relative;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

// 文章内容（包含标题和信息）
.article-content {
  padding: 45px 50px;
  margin-bottom: 25px;
  
  .article-title {
    font-size: 32px;
    font-weight: 700;
    color: #5a5a5a;
    line-height: 1.5;
    margin: 0 0 20px 0;
    text-align: center;
  }
  
  .article-info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    font-size: 14px;
    color: #888;
    padding-bottom: 30px;
    margin-bottom: 30px;
    border-bottom: 2px solid rgba(255, 182, 193, 0.15);
    
    .info-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      
      .icon {
        font-size: 16px;
      }
      
      &.tags {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        
        .tag {
          padding: 4px 12px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(255, 154, 158, 0.12) 0%, rgba(254, 207, 239, 0.12) 100%);
          color: #ff9a9e;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.3s;
          
          &:hover {
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            color: #fff;
            transform: translateY(-2px);
            box-shadow: 0 3px 10px rgba(255, 154, 158, 0.3);
          }
        }
      }
    }
    
    .info-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .info-divider {
      color: #ddd;
      margin: 0 5px;
    }
  }
  
  .content {
    font-size: 17px;
    line-height: 2.2;
    color: #555;
    
    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      font-weight: 700;
      color: #5a5a5a;
      margin-top: 40px;
      margin-bottom: 20px;
    }
    
    :deep(h2) {
      font-size: 28px;
      padding-bottom: 15px;
      border-bottom: 3px solid;
      border-image: linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%) 1;
      
      &::before {
        content: '💖 ';
      }
    }
    
    :deep(h3) {
      font-size: 24px;
      
      &::before {
        content: '✨ ';
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    
    :deep(p) {
      margin: 20px 0;
      text-align: justify;
    }
    
    :deep(img) {
      max-width: 100%;
      border-radius: 20px;
      box-shadow: 0 8px 30px rgba(255, 154, 158, 0.15);
      margin: 30px 0;
    }
    
    :deep(blockquote) {
      margin: 30px 0;
      padding: 25px 30px;
      background: linear-gradient(135deg, rgba(255, 154, 158, 0.08) 0%, rgba(254, 207, 239, 0.08) 100%);
      border-left: 5px solid #ff9a9e;
      border-radius: 0 20px 20px 0;
      font-style: italic;
      color: #666;
      
      p {
        margin: 0;
      }
    }
    
    :deep(code) {
      padding: 3px 8px;
      background: rgba(255, 154, 158, 0.1);
      border-radius: 6px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9em;
      color: #ff9a9e;
    }
    
    :deep(pre) {
      margin: 30px 0;
      padding: 25px;
      background: #f8f8f8;
      border-radius: 20px;
      overflow-x: auto;
      border: 2px solid rgba(255, 182, 193, 0.2);
      
      code {
        padding: 0;
        background: none;
        color: #5a5a5a;
        font-size: 14px;
        line-height: 1.8;
      }
    }
    
    :deep(ul), :deep(ol) {
      padding-left: 30px;
      margin: 20px 0;
      
      li {
        margin: 10px 0;
      }
    }
    
    :deep(a) {
      color: #ff9a9e;
      text-decoration: none;
      border-bottom: 2px solid rgba(255, 154, 158, 0.3);
      transition: all 0.3s;
      
      &:hover {
        border-bottom-color: #ff9a9e;
      }
    }
  }
}

// 文章操作栏 - 固定在内容区域右侧
.article-actions {
  position: fixed;
  right: calc((100vw - 900px) / 2 - 120px);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 100;
  
  .action-btn {
    width: 70px;
    height: 70px;
    padding: 0;
    border-radius: 50%;
    border: 2px solid rgba(255, 182, 193, 0.3);
    background: #fff;
    color: #ff9a9e;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    box-shadow: 0 4px 20px rgba(255, 154, 158, 0.15);
    position: relative;
    
    .icon {
      font-size: 24px;
    }
    
    .text {
      font-size: 12px;
    }
    
    .count {
      position: absolute;
      top: -5px;
      right: -5px;
      padding: 2px 8px;
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      color: #fff;
      border-radius: 12px;
      font-size: 11px;
      box-shadow: 0 2px 8px rgba(255, 154, 158, 0.4);
    }
    
    &:hover {
      background: linear-gradient(135deg, rgba(255, 154, 158, 0.1) 0%, rgba(254, 207, 239, 0.1) 100%);
      border-color: #ff9a9e;
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(255, 154, 158, 0.3);
    }
    
    &.like-btn:hover {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      color: #fff;
      border-color: transparent;
      
      .count {
        background: rgba(255, 255, 255, 0.3);
      }
    }
    
    &.like-btn.liked {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      color: #fff;
      border-color: transparent;
      
      .count {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

// 当屏幕宽度小于1200px时，隐藏固定按钮
@media (max-width: 1200px) {
  .article-actions {
    display: none;
  }
}

@media (max-width: 768px) {
  .article-content {
    padding: 30px 20px;
    
    .article-title {
      font-size: 22px;
    }
    
    .article-info {
      gap: 12px;
      font-size: 13px;
      padding-bottom: 20px;
      margin-bottom: 20px;
      flex-direction: column;
      align-items: flex-start;
      
      .info-item {
        &.tags {
          width: 100%;
          
          .tag {
            font-size: 12px;
            padding: 3px 10px;
          }
        }
      }
      
      .info-right {
        width: 100%;
        flex-wrap: wrap;
        gap: 12px;
      }
      
      .info-divider {
        display: none;
      }
    }
    
    .content {
      font-size: 16px;
      line-height: 2;
      
      :deep(h2) {
        font-size: 22px;
      }
      
      :deep(h3) {
        font-size: 20px;
      }
    }
  }
  
  .article-actions {
    position: fixed;
    right: 10px;
    bottom: 80px;
    top: auto;
    transform: none;
    flex-direction: row;
    gap: 10px;
    
    .action-btn {
      width: 55px;
      height: 55px;
      
      .icon {
        font-size: 20px;
      }
      
      .text {
        display: none;
      }
      
      .count {
        top: -3px;
        right: -3px;
        padding: 1px 6px;
        font-size: 10px;
      }
    }
  }
}
</style>
