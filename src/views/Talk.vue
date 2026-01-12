<template>
  <div class="talk">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-icon">💭</div>
        <div class="header-text">
          <h1>说说</h1>
          <p>记录生活的点点滴滴~</p>
        </div>
      </div>
      
      <!-- 说说列表 -->
      <div class="talk-list" v-loading="loading">
        <!-- 遍历说说列表 -->
        <div class="talk-item card" v-for="talk in talks" :key="talk.id">
          <div class="talk-header">
            <img :src="talk.user?.avatar || '/web/default-avatar.svg'" alt="头像" class="avatar">
            <div class="user-info">
              <div class="username">{{ talk.user?.nickname || '匿名用户' }}</div>
              <div class="time">{{ talk.createTime }}</div>
            </div>
          </div>
          <div class="talk-content">
            {{ talk.talkContent }}
          </div>
          <div class="talk-images" v-if="talk.talkPic && talk.talkPic.length > 0">
            <img 
              v-for="(img, index) in talk.talkPic" 
              :key="index"
              :src="img" 
              alt="图片" 
              class="talk-img"
              @click="previewImages(talk.talkPic, Number(index))"
            >
          </div>
          <div class="talk-footer">
            <div class="actions">
              <el-button text class="action-btn" @click="handleLike">
                <span class="icon">{{ talk.isLiked ? '❤️' : '💗' }}</span>
                <span class="count">{{ talk.likeCount || 0 }}</span>
              </el-button>
              <el-button text class="action-btn" @click="showCommentInput = !showCommentInput">
                <span class="icon">💬</span>
                <span class="count">{{ talk.commentCount || 0 }}</span>
              </el-button>
            </div>
          </div>
          
          <!-- 查看回复按钮 -->
          <div class="view-comments" v-if="talk.commentCount > 0 && !talk.commentsLoaded">
            <el-button text class="view-btn" @click="loadTalkComments(talk)">
              <span class="icon">💬</span>
              查看 {{ talk.commentCount }} 条回复
            </el-button>
          </div>
          
          <!-- 评论列表（列表页显示的简单评论） -->
          <div class="comment-list" v-if="talk.comments && talk.comments.length > 0 && !talk.commentsLoaded">
            <div v-for="comment in talk.comments" :key="comment.id" class="comment-item-bilibili">
              <img :src="comment.user?.avatar || '/web/default-avatar.svg'" alt="头像" class="comment-avatar">
              <div class="comment-main">
                <div class="comment-user" :class="{ author: comment.user?.isAuthor }">
                  {{ comment.user?.nickname || '匿名用户' }}
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-footer">
                  <span class="comment-time">{{ formatCommentTime(comment.createTime) }}</span>
                  <div class="comment-actions">
                    <span class="action-btn">回复</span>
                    <span class="action-btn delete">删除</span>
                  </div>
                </div>
                <!-- 展开回复按钮 -->
                <div class="expand-replies" v-if="comment.isMessage" @click="loadCommentReplies(talk, comment)">
                  <span class="expand-text">展开回复</span>
                  <span class="expand-icon">▼</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 完整评论树（点击查看详情后显示，B站风格） -->
          <div class="comment-list" v-if="talk.commentsLoaded && talk.detailComments && talk.detailComments.length > 0">
            <div v-for="comment in talk.detailComments" :key="comment.id" class="comment-item-bilibili">
              <img :src="comment.user?.avatar || '/web/default-avatar.svg'" alt="头像" class="comment-avatar">
              <div class="comment-main">
                <div class="comment-user" :class="{ author: comment.user?.isAuthor }">
                  {{ comment.user?.nickname || '匿名用户' }}
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-footer">
                  <span class="comment-time">{{ formatCommentTime(comment.createTime) }}</span>
                  <div class="comment-actions">
                    <span class="action-btn">回复</span>
                    <span class="action-btn delete">删除</span>
                  </div>
                </div>
                
                <!-- 回复列表 -->
                <div class="replies-container" v-if="comment.replies && comment.replies.length > 0">
                  <div class="reply-item" v-for="reply in flattenComments(comment.replies)" :key="reply.id">
                    <img :src="reply.user?.avatar || '/web/default-avatar.svg'" alt="头像" class="reply-avatar">
                    <div class="reply-content">
                      <span class="reply-user" :class="{ author: reply.user?.isAuthor }">
                        {{ reply.user?.nickname || '匿名用户' }}
                      </span>
                      <span v-if="reply.replyTo" class="reply-to">回复 <span class="mention">@{{ reply.replyTo }}</span></span>
                      <span class="reply-text">: {{ reply.content }}</span>
                      <div class="reply-footer">
                        <span class="reply-time">{{ formatCommentTime(reply.createTime) }}</span>
                        <span class="action-btn">回复</span>
                        <span class="action-btn delete">删除</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="talks.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">💭</div>
          <div class="empty-text">暂无说说</div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination" v-if="total > 0">
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
    
    <!-- 图片预览 -->
    <el-image-viewer 
      v-if="showViewer"
      :url-list="previewImageList"
      :initial-index="previewIndex"
      @close="closeViewer"
      :hide-on-click-modal="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent, h } from 'vue'
import { ElMessage } from 'element-plus'
import { getTalkList, getTalkDetail } from '@/api/article'
// import { useUserStore } from '@/stores/user'

// const userStore = useUserStore()

// 递归评论组件
const CommentItem: any = defineComponent({
  name: 'CommentItem',
  props: ['comment', 'level'],
  setup(props: any) {
    const formatCommentTime = (timestamp: number) => {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const now = new Date()
      
      if (date.toDateString() === now.toDateString()) {
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
      }
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }
    
    return () => {
      const { comment } = props
      
      return h('div', [
        // 评论项
        h('div', { class: 'comment-item' }, [
          h('img', {
            src: comment.user?.avatar || '/web/default-avatar.svg',
            alt: '头像',
            class: 'comment-avatar',
            style: 'width: 32px; height: 32px;'
          }),
          h('div', { class: 'comment-content' }, [
            h('div', {
              class: ['comment-user', comment.user?.isAuthor ? 'author' : '']
            }, comment.user?.nickname || '匿名用户'),
            h('div', { class: 'comment-text' }, [
              comment.replyTo ? h('span', { class: 'mention' }, `@${comment.replyTo} `) : null,
              comment.content
            ]),
            h('div', { class: 'comment-footer' }, [
              h('span', { class: 'comment-time' }, formatCommentTime(comment.createTime)),
              h('div', { class: 'comment-actions' }, [
                h('span', { class: 'action-btn' }, '回复'),
                h('span', { class: 'action-btn delete' }, '删除')
              ])
            ])
          ])
        ]),
        // 递归渲染回复
        comment.replies && comment.replies.length > 0
          ? h('div', { class: 'replies' }, 
              comment.replies.map((reply: any) => 
                h(CommentItem, { comment: reply, level: props.level + 1, key: reply.id })
              )
            )
          : null
      ])
    }
  }
})

const loading = ref(false)
const talks = ref<any[]>([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 点赞相关
const isLiked = ref(false)
const likeCount = ref(12)

const handleLike = () => {
  isLiked.value = !isLiked.value
  likeCount.value = isLiked.value ? likeCount.value + 1 : likeCount.value - 1
  ElMessage.success(isLiked.value ? '点赞成功 ❤️' : '取消点赞')
}

// 评论相关
const showCommentInput = ref(false)
// const commentText = ref('')

// const submitComment = () => {
//   if (!commentText.value.trim()) {
//     ElMessage.warning('请输入评论内容')
//     return
//   }
//   ElMessage.success('评论发表成功！')
//   commentText.value = ''
//   showCommentInput.value = false
// }

// 图片预览
const showViewer = ref(false)
const previewImageList = ref<string[]>([])
const previewIndex = ref(0)

const previewImages = (images: string[], index: number) => {
  previewImageList.value = images
  previewIndex.value = index
  showViewer.value = true
}

const closeViewer = () => {
  showViewer.value = false
}

// 分页
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadTalkList()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 加载说说列表
const loadTalkList = async () => {
  loading.value = true
  try {
    const response: any = await getTalkList({
      userId: 1,
      pageNo: currentPage.value,
      pageSize: pageSize.value
    })
    
    console.log('=== 开始处理数据 ===')
    console.log('完整响应:', response)
    
    // 响应拦截器已经返回了 res.data，所以直接用 response.list
    if (response && response.list) {
      const list = response.list || []
      console.log('原始 list:', list)
      console.log('list 长度:', list.length)
      
      // 格式化数据
      talks.value = list.map((talk: any) => {
        console.log('原始 talk 完整对象:', JSON.stringify(talk, null, 2))
        console.log('talk 的所有键:', Object.keys(talk))
        
        let images = []
        try {
          if (typeof talk.talkPic === 'string') {
            if (talk.talkPic.startsWith('[') || talk.talkPic.startsWith('{')) {
              images = JSON.parse(talk.talkPic)
            } else if (talk.talkPic) {
              images = [talk.talkPic]
            }
          } else if (Array.isArray(talk.talkPic)) {
            images = talk.talkPic
          }
        } catch (e) {
          console.error('解析图片失败:', e)
          images = []
        }
        
        const result = {
          ...talk,  // 保留所有原始字段
          talkPic: images,
          createTime: talk.createTime ? formatTimestamp(talk.createTime) : '',
          user: talk.user || {
            id: 0,
            nickname: '匿名用户',
            avatar: '/web/default-avatar.svg',
            isAuthor: false
          },
          commentsLoaded: false  // 标记评论是否已加载
        }
        
        return result
      })
      
      total.value = response.total || 0
      
      console.log('最终 talks.value:', talks.value)
      console.log('最终 total.value:', total.value)
    } else {
      console.error('响应格式错误, response:', response)
    }
  } catch (error) {
    console.error('加载说说列表失败:', error)
    ElMessage.error('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

// 加载说说的评论详情
const loadTalkComments = async (talk: any) => {
  console.log('=== 开始加载评论 ===')
  console.log('talk.id:', talk.id)
  
  try {
    const params = {
      userId: 1,
      talkId: talk.id,
      pageNo: 1,
      pageSize: 1
    }
    console.log('请求参数:', params)
    console.log('调用 getTalkDetail')
    
    const response: any = await getTalkDetail(params)
    console.log('评论详情响应:', response)
    
    if (response && response.comments) {
      talk.detailComments = response.comments
      talk.commentsLoaded = true
      console.log('评论加载成功')
    }
  } catch (error) {
    console.error('加载评论失败:', error)
    ElMessage.error('加载评论失败，请重试')
  }
}

// 加载单个评论的回复
const loadCommentReplies = async (talk: any, _comment: any) => {
  // 直接加载整个说说的详情
  await loadTalkComments(talk)
}

// 扁平化评论树
const flattenComments = (comments: any[]): any[] => {
  const result: any[] = []
  
  const flatten = (commentList: any[]) => {
    commentList.forEach(comment => {
      result.push(comment)
      if (comment.replies && comment.replies.length > 0) {
        flatten(comment.replies)
      }
    })
  }
  
  flatten(comments)
  return result
}

// 格式化时间戳
const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 格式化评论时间
const formatCommentTime = (timestamp: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  
  // 如果是今天，只显示时分
  if (date.toDateString() === now.toDateString()) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }
  
  // 否则显示完整日期时间
  return formatTimestamp(timestamp)
}

// 初始化加载
onMounted(() => {
  loadTalkList()
})
</script>

<style scoped lang="scss">
.talk {
  min-height: calc(100vh - 200px);
  padding: 40px 0;
}

.container {
  max-width: 900px;
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
    animation: float 3s ease-in-out infinite;
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

.talk-list {
  min-height: 400px;
  
  .empty-state {
    text-align: center;
    padding: 100px 20px;
    
    .empty-icon {
      font-size: 80px;
      margin-bottom: 20px;
      opacity: 0.5;
    }
    
    .empty-text {
      font-size: 18px;
      color: #999;
    }
  }
  
  .talk-item {
    padding: 30px;
    margin-bottom: 25px;
    
    .talk-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
      
      .avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 3px solid #fff;
        box-shadow: 0 4px 15px rgba(255, 154, 158, 0.3);
      }
      
      .user-info {
        .username {
          font-size: 18px;
          font-weight: 700;
          color: #5a5a5a;
          margin-bottom: 5px;
        }
        
        .time {
          font-size: 14px;
          color: #999;
        }
      }
    }
    
    .talk-content {
      font-size: 16px;
      line-height: 1.8;
      color: #666;
      margin-bottom: 20px;
    }
    
    .talk-images {
      display: grid;
      gap: 10px;
      margin-bottom: 20px;
      
      &:has(.talk-img:nth-child(1):nth-last-child(1)) {
        grid-template-columns: 1fr;
        max-width: 400px;
      }
      
      &:has(.talk-img:nth-child(2)) {
        grid-template-columns: repeat(2, 1fr);
      }
      
      &:has(.talk-img:nth-child(3)) {
        grid-template-columns: repeat(3, 1fr);
      }
      
      &:has(.talk-img:nth-child(4)) {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .talk-img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 15px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(255, 154, 158, 0.3);
        }
      }
    }
    
    .talk-footer {
      border-top: 1px solid rgba(255, 182, 193, 0.2);
      padding-top: 15px;
      
      .actions {
        display: flex;
        gap: 20px;
        
        .action-btn {
          color: #ff9a9e;
          font-size: 15px;
          
          .icon {
            margin-right: 5px;
            font-size: 18px;
          }
          
          .count {
            margin-left: 5px;
          }
          
          &:hover {
            color: #ff7a7e;
          }
        }
      }
    }
  }
  
  .view-comments {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 182, 193, 0.2);
    text-align: center;
    
    .view-btn {
      color: #ff9a9e;
      font-size: 14px;
      transition: all 0.3s;
      
      .icon {
        margin-right: 5px;
        font-size: 16px;
      }
      
      &:hover {
        color: #ff7a7e;
        transform: translateY(-2px);
      }
    }
  }
  
  .comment-list {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 182, 193, 0.2);
    
    .comment-item-bilibili {
      display: flex;
      gap: 12px;
      padding: 16px 0;
      border-bottom: 1px solid rgba(255, 182, 193, 0.1);
      
      &:last-child {
        border-bottom: none;
      }
      
      .comment-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 2px 8px rgba(255, 154, 158, 0.2);
        flex-shrink: 0;
      }
      
      .comment-main {
        flex: 1;
        min-width: 0;
        
        .comment-user {
          font-size: 14px;
          font-weight: 600;
          color: #666;
          margin-bottom: 8px;
          
          &.author {
            color: #ff7a7e;
            
            &::after {
              content: '博主';
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
          color: #333;
          line-height: 1.7;
          margin-bottom: 10px;
          word-wrap: break-word;
        }
        
        .comment-footer {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 10px;
          
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
              
              &:hover {
                color: #ff9a9e;
              }
              
              &.delete:hover {
                color: #ff6b6b;
              }
            }
          }
        }
        
        .expand-replies {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255, 154, 158, 0.08);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
          
          .expand-text {
            font-size: 13px;
            color: #ff9a9e;
            font-weight: 500;
          }
          
          .expand-icon {
            font-size: 10px;
            color: #ff9a9e;
          }
          
          &:hover {
            background: rgba(255, 154, 158, 0.15);
          }
        }
        
        .replies-container {
          margin-top: 12px;
          padding: 12px;
          background: rgba(255, 250, 252, 0.5);
          border-radius: 8px;
          
          .reply-item {
            display: flex;
            gap: 10px;
            padding: 10px 0;
            
            &:first-child {
              padding-top: 0;
            }
            
            &:not(:last-child) {
              border-bottom: 1px solid rgba(255, 182, 193, 0.1);
            }
            
            .reply-avatar {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: 2px solid #fff;
              box-shadow: 0 2px 6px rgba(255, 154, 158, 0.15);
              flex-shrink: 0;
            }
            
            .reply-content {
              flex: 1;
              min-width: 0;
              font-size: 14px;
              line-height: 1.6;
              
              .reply-user {
                color: #666;
                font-weight: 600;
                
                &.author {
                  color: #ff7a7e;
                  
                  &::after {
                    content: '博主';
                    margin-left: 6px;
                    font-size: 10px;
                    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
                    color: #fff;
                    padding: 2px 6px;
                    border-radius: 8px;
                    font-weight: 600;
                  }
                }
              }
              
              .reply-to {
                color: #999;
                font-size: 13px;
                margin: 0 4px;
                
                .mention {
                  color: #ff9a9e;
                  font-weight: 600;
                }
              }
              
              .reply-text {
                color: #333;
              }
              
              .reply-footer {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-top: 6px;
                
                .reply-time {
                  font-size: 12px;
                  color: #aaa;
                }
                
                .action-btn {
                  font-size: 12px;
                  color: #999;
                  cursor: pointer;
                  transition: all 0.2s;
                  
                  &:hover {
                    color: #ff9a9e;
                  }
                  
                  &.delete:hover {
                    color: #ff6b6b;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  
  :deep(.el-pagination) {
    .btn-prev, .btn-next, .el-pager li {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(252, 182, 159, 0.1);
      
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

@keyframes float {
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
  
  .talk-item {
    .talk-images {
      .talk-img {
        height: 150px;
      }
    }
  }
}
</style>
