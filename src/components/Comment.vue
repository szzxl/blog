<template>
  <div class="comment-section card">
    <h3 class="section-title">💬 评论区</h3>
    
    <!-- 发表评论表单 -->
    <div class="comment-form">
      <template v-if="userStore.isLoggedIn">
        <el-input 
          v-model="commentText" 
          type="textarea" 
          :rows="4" 
          placeholder="说点什么吧~ 分享你的想法..."
          maxlength="500"
          show-word-limit
        />
        
        <!-- 图片上传区域 -->
        <div class="image-upload-section">
          <div class="upload-title">
            <span class="icon">📷</span>
            上传图片（最多9张）
          </div>
          
          <!-- 图片预览列表 -->
          <div class="image-list" v-if="commentImages.length > 0">
            <div 
              class="image-item" 
              v-for="(image, index) in commentImages" 
              :key="index"
            >
              <img :src="image" alt="预览图">
              <div class="image-overlay">
                <el-icon class="delete-icon" @click="removeCommentImage(index)">
                  <Delete />
                </el-icon>
              </div>
            </div>
            
            <!-- 上传按钮 -->
            <div 
              class="upload-btn" 
              v-if="commentImages.length < 9"
              @click="triggerCommentUpload"
            >
              <el-icon><Plus /></el-icon>
            </div>
          </div>
          
          <!-- 初始上传区域 -->
          <div 
            class="upload-area" 
            v-else
            @click="triggerCommentUpload"
          >
            <el-icon class="upload-icon"><Upload /></el-icon>
            <div class="upload-text">点击上传图片</div>
          </div>
          
          <input 
            ref="commentFileInput"
            type="file" 
            accept="image/*"
            multiple
            style="display: none"
            @change="handleCommentFileChange"
          />
        </div>
        
        <div class="form-actions">
          <el-button 
            type="primary" 
            class="submit-btn"
            :loading="submitting"
            @click="submitComment"
          >
            <span class="icon">💕</span>
            发表评论
          </el-button>
        </div>
      </template>
      <template v-else>
        <div class="login-tip">
          <span class="tip-icon">💡</span>
          <span class="tip-text">
            <router-link to="/login" class="login-link">登录</router-link>
            后可以发表评论哦~
          </span>
        </div>
      </template>
    </div>
    
    <!-- 评论列表 -->
    <div class="comment-list" v-loading="loading">
      <div class="comment-count" v-if="total > 0">
        共 {{ total }} 条评论
      </div>
      
      <template v-if="comments.length > 0">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-main">
            <div class="comment-user" :class="{ author: comment.user?.isAuthor }">
              {{ comment.user?.nickname || '匿名用户' }}
            </div>
            <div class="comment-text">{{ comment.content }}</div>
            
            <!-- 评论图片 -->
            <div class="comment-images" v-if="comment.images && comment.images.length > 0">
              <img 
                v-for="(img, idx) in comment.images" 
                :key="idx" 
                :src="img" 
                alt="评论图片"
                class="comment-img"
                @click="previewImage(img)"
              >
            </div>
            <div class="comment-footer">
              <span class="comment-time">{{ formatCommentTime(comment.createTime) }}</span>
              <div class="comment-actions">
                <span 
                  class="action-btn like-btn" 
                  :class="{ liked: comment.isLiked }"
                  @click="handleLike(comment)"
                >
                  <span class="icon">{{ comment.isLiked ? '💗' : '🤍' }}</span>
                  <span class="count">{{ comment.likeCount || 0 }}</span>
                </span>
                <span 
                  v-if="canDelete(comment)" 
                  class="action-btn delete"
                  @click="handleDelete(comment)"
                >
                  删除
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <div v-else-if="!loading" class="empty-state">
        <div class="empty-icon">💭</div>
        <div class="empty-text">暂无评论，快来抢沙发吧~</div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination" v-if="total > pageSize">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Upload } from '@element-plus/icons-vue'
import { getArticleComments, addArticleComment, deleteArticleComment, uploadImage, likeArticleComment } from '@/api/article'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const props = defineProps<{
  articleId: string | number
}>()

const userStore = useUserStore()
const router = useRouter()

const commentText = ref('')
const commentImages = ref<string[]>([])
const comments = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const commentFileInput = ref<HTMLInputElement>()

// 是否是博主
const isAuthor = computed(() => {
  if (!userStore.isLoggedIn || !userStore.user) return false
  const roles = userStore.user.roles || []
  return roles.some((role: any) => role.name === '博主' || role.name === '超级管理员')
})

// 判断是否可以删除评论
const canDelete = (comment: any) => {
  if (!userStore.isLoggedIn || !userStore.user) return false
  // 博主或评论作者本人可以删除
  return isAuthor.value || comment.user?.id === userStore.user.id
}

// 加载评论列表
const loadComments = async () => {
  loading.value = true
  try {
    const response: any = await getArticleComments({
      articleId: props.articleId,
      pageNo: currentPage.value,
      pageSize: pageSize.value
    })
    
    // 响应拦截器已经处理过，直接返回的是 data 数组
    const data = Array.isArray(response) ? response : (response?.list || response?.data || [])
    
    // 处理评论数据，转换字段格式
    comments.value = data.map((comment: any) => {
      // 解析 images 字段（从字符串转为数组）
      let imageList: string[] = []
      if (comment.images) {
        try {
          imageList = typeof comment.images === 'string' 
            ? JSON.parse(comment.images) 
            : comment.images
        } catch (e) {
          imageList = []
        }
      }
      
      return {
        ...comment,
        images: imageList,
        user: {
          id: comment.userId,
          nickname: comment.username,
          isAuthor: comment.isAuthor || false
        },
        createTime: comment.createTime || Date.now(),
        replies: comment.replies || [],
        isLiked: comment.isLiked || false,
        likeCount: comment.likeCount || 0
      }
    })
    
    // 如果后端返回了 total，使用它；否则使用数组长度
    total.value = response?.total || comments.value.length
  } catch (error) {
    console.error('加载评论失败:', error)
    ElMessage.error('加载评论失败')
    comments.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 触发评论图片上传
const triggerCommentUpload = () => {
  commentFileInput.value?.click()
}

// 处理评论图片选择
const handleCommentFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    handleCommentFiles(Array.from(files))
  }
  target.value = ''
}

// 处理评论图片文件
const handleCommentFiles = async (files: File[]) => {
  const remainingSlots = 9 - commentImages.value.length
  if (files.length > remainingSlots) {
    ElMessage.warning(`最多只能上传9张图片，当前还可以上传${remainingSlots}张`)
    files = files.slice(0, remainingSlots)
  }
  
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      ElMessage.error(`${file.name} 不是图片文件`)
      continue
    }
    
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error(`${file.name} 大小超过 5MB`)
      continue
    }
    
    try {
      const response: any = await uploadImage(file)
      if (response) {
        commentImages.value.push(response)
        ElMessage.success('图片上传成功')
      }
    } catch (error) {
      ElMessage.error('图片上传失败')
    }
  }
}

// 删除评论图片
const removeCommentImage = (index: number) => {
  commentImages.value.splice(index, 1)
}

// 发表评论
const submitComment = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }
  
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  submitting.value = true
  try {
    await addArticleComment({
      username: userStore.user!.username || '',
      articleId: props.articleId,
      content: commentText.value,
      images: commentImages.value,
      likeCount: 1,
      userId: Number(userStore.user!.id)
    })
    
    ElMessage.success('评论发表成功！')
    commentText.value = ''
    commentImages.value = []
    currentPage.value = 1
    loadComments()
  } catch (error) {
    ElMessage.error('发表失败，请重试')
  }
}

// 点赞评论
const handleLike = async (comment: any) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }
  
  // 保存当前状态
  const wasLiked = comment.isLiked
  
  try {
    await likeArticleComment({
      commentArticleId: comment.id,
      type: wasLiked ? 2 : 1  // 已点赞则取消(2)，未点赞则点赞(1)
    })
    
    // 切换本地状态
    if (wasLiked) {
      // 取消点赞
      comment.likeCount = Math.max(0, (comment.likeCount || 0) - 1)
      comment.isLiked = false
    } else {
      // 点赞
      comment.likeCount = (comment.likeCount || 0) + 1
      comment.isLiked = true
    }
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

// 删除评论
const handleDelete = async (comment: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？删除后无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const requestData: any = {
      commentId: comment.id
    }
    
    // 如果不是博主，需要传 userId
    if (!isAuthor.value && userStore.user) {
      requestData.userId = userStore.user.id
    }
    
    await deleteArticleComment(requestData)
    ElMessage.success('评论已删除')
    loadComments()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 分页
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadComments()
  // 滚动到评论区顶部
  document.querySelector('.comment-section')?.scrollIntoView({ behavior: 'smooth' })
}

// 格式化时间
const formatCommentTime = (timestamp: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  
  if (date.toDateString() === now.toDateString()) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `今天 ${hours}:${minutes}`
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 预览图片
const previewImage = (url: string) => {
  window.open(url, '_blank')
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped lang="scss">
.comment-section {
  margin-top: 40px;
  padding: 35px;
  
  .section-title {
    font-size: 24px;
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 25px 0;
    font-weight: 700;
  }
  
  .comment-form {
    margin-bottom: 30px;
    
    .el-textarea {
      :deep(.el-textarea__inner) {
        border-radius: 12px;
        border: 2px solid rgba(255, 182, 193, 0.2);
        font-size: 15px;
        
        &:focus {
          border-color: #ff9a9e;
        }
      }
    }
    
    .form-actions {
      margin-top: 15px;
      display: flex;
      justify-content: flex-end;
      
      .submit-btn {
        height: 42px;
        padding: 0 28px;
        border-radius: 21px;
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        border: none;
        font-size: 15px;
        font-weight: 600;
        
        .icon {
          margin-right: 6px;
        }
      }
    }
    
    .image-upload-section {
      margin-top: 15px;
      
      .upload-title {
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        
        .icon {
          font-size: 16px;
        }
      }
      
      .upload-area {
        border: 2px dashed rgba(255, 182, 193, 0.4);
        border-radius: 12px;
        padding: 30px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
        background: linear-gradient(135deg, rgba(255, 154, 158, 0.03) 0%, rgba(254, 207, 239, 0.03) 100%);
        
        &:hover {
          border-color: #ff9a9e;
          background: linear-gradient(135deg, rgba(255, 154, 158, 0.08) 0%, rgba(254, 207, 239, 0.08) 100%);
          transform: translateY(-2px);
        }
        
        .upload-icon {
          font-size: 36px;
          color: #ff9a9e;
          margin-bottom: 10px;
        }
        
        .upload-text {
          font-size: 14px;
          color: #666;
          font-weight: 600;
        }
      }
      
      .image-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 10px;
        
        .image-item {
          position: relative;
          width: 100%;
          padding-bottom: 100%;
          border-radius: 10px;
          overflow: hidden;
          background: #f5f5f5;
          box-shadow: 0 2px 10px rgba(252, 182, 159, 0.15);
          transition: all 0.3s;
          
          &:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 15px rgba(255, 154, 158, 0.25);
            
            .image-overlay {
              opacity: 1;
            }
          }
          
          img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
            
            .el-icon {
              font-size: 20px;
              color: #fff;
              cursor: pointer;
              transition: all 0.3s;
              
              &:hover {
                transform: scale(1.2);
                color: #ff6b6b;
              }
            }
          }
        }
        
        .upload-btn {
          position: relative;
          width: 100%;
          padding-bottom: 100%;
          border: 2px dashed rgba(255, 182, 193, 0.4);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          background: linear-gradient(135deg, rgba(255, 154, 158, 0.03) 0%, rgba(254, 207, 239, 0.03) 100%);
          
          &:hover {
            border-color: #ff9a9e;
            background: linear-gradient(135deg, rgba(255, 154, 158, 0.08) 0%, rgba(254, 207, 239, 0.08) 100%);
            transform: translateY(-3px);
          }
          
          .el-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 28px;
            color: #ff9a9e;
          }
        }
      }
    }
    
    .login-tip {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 25px;
      background: linear-gradient(135deg, rgba(255, 154, 158, 0.08) 0%, rgba(254, 207, 239, 0.08) 100%);
      border-radius: 15px;
      border: 2px solid rgba(255, 182, 193, 0.2);
      
      .tip-icon {
        font-size: 24px;
      }
      
      .tip-text {
        font-size: 15px;
        color: #666;
        
        .login-link {
          color: #ff9a9e;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s;
          
          &:hover {
            color: #ff7a7e;
            text-decoration: underline;
          }
        }
      }
    }
  }
  
  .comment-list {
    .comment-count {
      font-size: 16px;
      color: #666;
      margin-bottom: 20px;
      font-weight: 600;
    }
    
    .comment-item {
      display: flex;
      gap: 15px;
      padding: 20px 0;
      border-bottom: 1px solid rgba(255, 182, 193, 0.15);
      
      &:last-child {
        border-bottom: none;
      }
      
      .comment-main {
        flex: 1;
        min-width: 0;
        
        .comment-user {
          font-size: 15px;
          font-weight: 700;
          color: #5a5a5a;
          margin-bottom: 8px;
          
          &.author {
            color: #ff7a7e;
            
            &::after {
              content: '作者';
              margin-left: 8px;
              font-size: 11px;
              background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
              color: #fff;
              padding: 2px 8px;
              border-radius: 10px;
              font-weight: 600;
            }
          }
        }
        
        .comment-text {
          font-size: 15px;
          color: #666;
          line-height: 1.8;
          margin-bottom: 10px;
          word-wrap: break-word;
        }
        
        .comment-images {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 10px;
          
          .comment-img {
            width: 120px;
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            border: 2px solid rgba(255, 182, 193, 0.2);
            
            &:hover {
              transform: scale(1.05);
              box-shadow: 0 4px 15px rgba(255, 154, 158, 0.3);
            }
          }
        }
        
        .comment-footer {
          display: flex;
          align-items: center;
          gap: 20px;
          
          .comment-time {
            font-size: 13px;
            color: #999;
          }
          
          .comment-actions {
            display: flex;
            gap: 15px;
            
            .action-btn {
              font-size: 13px;
              color: #999;
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              gap: 5px;
              
              &:hover {
                color: #ff9a9e;
              }
              
              &.like-btn {
                .icon {
                  font-size: 16px;
                }
                
                .count {
                  font-weight: 600;
                }
                
                &.liked {
                  color: #ff6b6b;
                  
                  .count {
                    color: #ff6b6b;
                  }
                  
                  &:hover {
                    color: #ff5252;
                    
                    .count {
                      color: #ff5252;
                    }
                  }
                }
              }
              
              &.delete:hover {
                color: #ff6b6b;
              }
            }
          }
        }
        
        .replies {
          margin-top: 15px;
          padding-left: 20px;
          border-left: 3px solid rgba(255, 182, 193, 0.2);
          
          .reply-item {
            display: flex;
            gap: 12px;
            padding: 12px 0;
            
            &:first-child {
              padding-top: 0;
            }
            
            .reply-content {
              flex: 1;
              min-width: 0;
            }
          }
        }
      }
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      
      .empty-icon {
        font-size: 60px;
        margin-bottom: 15px;
        opacity: 0.5;
      }
      
      .empty-text {
        font-size: 16px;
        color: #999;
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
      }
    }
  }
}

@media (max-width: 768px) {
  .comment-section {
    padding: 25px 20px;
    
    .comment-item {
      .comment-main {
        .comment-user {
          font-size: 14px;
        }
      }
      
      .replies {
        padding-left: 15px;
        
        .reply-content {
          .reply-user {
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>
