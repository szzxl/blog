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
        <!-- 发表说说按钮 - 仅博主可见 -->
        <el-button 
          v-if="isAuthor" 
          type="primary" 
          class="publish-btn"
          @click="showPublishDialog = true"
        >
          <span class="btn-icon">✨</span>
          发表说说
        </el-button>
      </div>
      
      <!-- 说说列表 -->
      <div class="talk-list" v-loading="loading">
        <!-- 遍历说说列表 -->
        <div class="talk-item card" v-for="talk in talks" :key="talk.id">
          <div class="talk-header">
            <img :src="talk.user?.avatar || '/default-avatar.svg'" alt="头像" class="avatar">
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
              <el-button text class="action-btn" @click="handleLike(talk)">
                <span class="icon">{{ talk.isLiked ? '❤️' : '💗' }}</span>
              </el-button>
              <el-button text class="action-btn" @click="openCommentDialog(talk)">
                <span class="icon">💬</span>
              </el-button>
            </div>
            <!-- 删除按钮 - 仅博主和超级管理员可见 -->
            <el-button 
              v-if="isAuthor" 
              text 
              class="delete-talk-btn"
              @click="handleDeleteTalk(talk)"
            >
              <span class="icon">🗑️</span>
              删除
            </el-button>
          </div>
          
          <!-- 评论列表（列表页显示的简单评论） -->
          <div class="comment-list" v-if="talk.comments && talk.comments.length > 0 && !talk.commentsLoaded">
            <template v-for="comment in talk.comments" :key="comment.id">
              <div class="comment-item-bilibili">
                <img :src="comment.user?.avatar || '/default-avatar.svg'" alt="头像" class="comment-avatar">
                <div class="comment-main">
                  <div class="comment-user" :class="{ author: comment.user?.isAuthor }">
                    {{ comment.user?.nickname || '匿名用户' }}
                  </div>
                  <div class="comment-text">{{ comment.content }}</div>
                  <div class="comment-footer">
                    <span class="comment-time">{{ formatCommentTime(comment.createTime) }}</span>
                    <div class="comment-actions">
                      <span class="action-btn" @click="openCommentDialog(talk, comment)">回复</span>
                      <span 
                        v-if="isAuthor || (userStore.user && comment.user?.id === userStore.user.id)" 
                        class="action-btn delete"
                        @click="handleDeleteComment(comment, talk)"
                      >
                        删除
                      </span>
                    </div>
                  </div>
                  <!-- 展开/收起回复按钮 -->
                  <div class="expand-replies" v-if="comment.isMessage" @click="toggleCommentReplies(talk, comment)">
                    <span class="expand-text">{{ comment.repliesExpanded ? '收起回复' : '展开回复' }}</span>
                    <span class="expand-icon" :class="{ 'expanded': comment.repliesExpanded }">▼</span>
                  </div>
                </div>
              </div>
              
              <!-- 该评论的回复列表（展开后显示） -->
              <div v-if="comment.repliesExpanded && comment.detailReplies && comment.detailReplies.length > 0">
                <div 
                  v-for="reply in comment.detailReplies" 
                  :key="reply.id" 
                  class="comment-item-bilibili"
                  :style="{ marginLeft: (reply.level || 1) * 52 + 'px' }"
                >
                  <img :src="reply.user?.avatar || '/default-avatar.svg'" alt="头像" class="comment-avatar">
                  <div class="comment-main">
                    <div class="comment-user" :class="{ author: reply.user?.isAuthor }">
                      {{ reply.user?.nickname || '匿名用户' }}
                    </div>
                    <div class="comment-text">
                      <span v-if="reply.replyTo" class="mention">@{{ reply.replyTo }} </span>{{ reply.content }}
                    </div>
                    <div class="comment-footer">
                      <span class="comment-time">{{ formatCommentTime(reply.createTime) }}</span>
                      <div class="comment-actions">
                        <span class="action-btn" @click="openCommentDialog(talk, reply)">回复</span>
                        <span 
                          v-if="isAuthor || (userStore.user && reply.user?.id === userStore.user.id)" 
                          class="action-btn delete"
                          @click="handleDeleteComment(reply, talk)"
                        >
                          删除
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
          
          <!-- 完整评论树（点击查看详情后显示，B站风格） -->
          <div class="comment-list" v-if="talk.commentsLoaded && talk.detailComments && talk.detailComments.length > 0">
            <div v-for="comment in talk.detailComments" :key="comment.id" class="comment-item-bilibili">
              <img :src="comment.user?.avatar || '/default-avatar.svg'" alt="头像" class="comment-avatar">
              <div class="comment-main">
                <div class="comment-user" :class="{ author: comment.user?.isAuthor }">
                  {{ comment.user?.nickname || '匿名用户' }}
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-footer">
                  <span class="comment-time">{{ formatCommentTime(comment.createTime) }}</span>
                  <div class="comment-actions">
                    <span class="action-btn">回复</span>
                    <span 
                      v-if="isAuthor || (userStore.user && comment.user?.id === userStore.user.id)" 
                      class="action-btn delete"
                      @click="handleDeleteComment(comment, talk)"
                    >
                      删除
                    </span>
                  </div>
                </div>
                
                <!-- 回复列表 -->
                <div class="replies-container" v-if="comment.replies && comment.replies.length > 0">
                  <div class="reply-item" v-for="reply in flattenComments(comment.replies)" :key="reply.id">
                    <img :src="reply.user?.avatar || '/default-avatar.svg'" alt="头像" class="reply-avatar">
                    <div class="reply-content">
                      <div class="reply-user" :class="{ author: reply.user?.isAuthor }">
                        {{ reply.user?.nickname || '匿名用户' }}
                      </div>
                      <div class="reply-text">
                        <span v-if="reply.replyTo" class="mention">@{{ reply.replyTo }} </span>{{ reply.content }}
                      </div>
                      <div class="reply-footer">
                        <span class="reply-time">{{ formatCommentTime(reply.createTime) }}</span>
                        <span class="action-btn" @click="openCommentDialog(talk, reply)">回复</span>
                        <span 
                          v-if="isAuthor || (userStore.user && reply.user?.id === userStore.user.id)" 
                          class="action-btn delete"
                          @click="handleDeleteComment(reply, talk)"
                        >
                          删除
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 收起回复按钮 -->
                <div class="expand-replies" @click="loadTalkComments(talk)">
                  <span class="expand-text">收起回复</span>
                  <span class="expand-icon expanded">▼</span>
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
    
    <!-- 发表说说弹框 -->
    <el-dialog
      v-model="showPublishDialog"
      title="发表说说"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="talkForm" label-width="0">
        <el-form-item>
          <el-input
            ref="talkTextareaRef"
            v-model="talkForm.content"
            type="textarea"
            :rows="6"
            placeholder="分享你的心情..."
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        
        <!-- 表情选择器 -->
        <el-form-item>
          <EmojiPicker @select="insertTalkEmoji" />
        </el-form-item>
        
        <el-form-item>
          <div class="upload-section">
            <div class="upload-title">
              <span class="icon">📷</span>
              上传图片（最多9张）
            </div>
            
            <!-- 图片预览列表 -->
            <div class="image-list" v-if="talkImageList.length > 0">
              <div 
                class="image-item" 
                v-for="(image, index) in talkImageList" 
                :key="index"
              >
                <img :src="image.url" alt="预览图">
                <div class="image-overlay">
                  <el-icon class="preview-icon" @click="previewTalkImage(image.url)">
                    <ZoomIn />
                  </el-icon>
                  <el-icon class="delete-icon" @click="removeTalkImage(index)">
                    <Delete />
                  </el-icon>
                </div>
                <div class="upload-progress" v-if="image.uploading">
                  <el-progress 
                    :percentage="image.progress" 
                    :stroke-width="3"
                    :show-text="false"
                  />
                </div>
              </div>
              
              <!-- 上传按钮 -->
              <div 
                class="upload-btn" 
                v-if="talkImageList.length < 9"
                @click="triggerTalkUpload"
              >
                <el-icon><Plus /></el-icon>
              </div>
            </div>
            
            <!-- 初始上传区域 -->
            <div 
              class="upload-area" 
              v-else
              @click="triggerTalkUpload"
            >
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">点击上传图片</div>
            </div>
            
            <input 
              ref="talkFileInput"
              type="file" 
              accept="image/*"
              multiple
              style="display: none"
              @change="handleTalkFileChange"
            />
          </div>
        </el-form-item>
        
        <el-form-item>
          <div class="status-select">
            <span class="status-label">状态：</span>
            <el-radio-group v-model="talkForm.status">
              <el-radio :label="0">公开</el-radio>
              <el-radio :label="1">私密</el-radio>
            </el-radio-group>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showPublishDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="publishing"
          @click="submitTalk"
        >
          发表
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 评论弹框 -->
    <el-dialog
      v-model="commentDialogVisible"
      :title="replyToComment ? `回复 @${replyToComment.user?.nickname}` : '发表评论'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-input
        ref="commentTextareaRef"
        v-model="commentText"
        type="textarea"
        :rows="5"
        :placeholder="replyToComment ? `回复 @${replyToComment.user?.nickname}...` : '说点什么吧~'"
        maxlength="500"
        show-word-limit
      />
      
      <!-- 表情选择器 -->
      <div style="margin-top: 12px;">
        <EmojiPicker @select="insertCommentEmoji" />
      </div>
      
      <template #footer>
        <el-button @click="commentDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="submittingComment"
          @click="submitComment"
        >
          发表
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent, h, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTalkList, getTalkDetail, publishTalk, uploadImage, deleteTalk, deleteComment, addComment, likeTalk } from '@/api/article'
import { Plus, Delete, ZoomIn, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import EmojiPicker from '@/components/EmojiPicker.vue'

const userStore = useUserStore()
const router = useRouter()

// 是否是博主（检查 roles 数组中是否有 name 为 "博主" 或 "超级管理员" 的角色）
const isAuthor = computed(() => {
  if (!userStore.isLoggedIn || !userStore.user) return false
  const roles = userStore.user.roles || []
  return roles.some((role: any) => role.name === '博主' || role.name === '超级管理员')
})

// 发表说说相关
const showPublishDialog = ref(false)
const publishing = ref(false)
const talkForm = ref({
  content: '',
  status: 0 // 0公开 1私密
})

interface ImageItem {
  url: string
  file?: File
  uploading?: boolean
  progress?: number
}

const talkImageList = ref<ImageItem[]>([])
const talkFileInput = ref<HTMLInputElement>()
const talkTextareaRef = ref<any>()
const commentTextareaRef = ref<any>()

// 触发文件选择
const triggerTalkUpload = () => {
  talkFileInput.value?.click()
}

// 处理文件选择
const handleTalkFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    handleTalkFiles(Array.from(files))
  }
  target.value = ''
}

// 处理文件
const handleTalkFiles = (files: File[]) => {
  const remainingSlots = 9 - talkImageList.value.length
  if (files.length > remainingSlots) {
    ElMessage.warning(`最多只能上传9张图片，当前还可以上传${remainingSlots}张`)
    files = files.slice(0, remainingSlots)
  }
  
  files.forEach(file => {
    if (!file.type.startsWith('image/')) {
      ElMessage.error(`${file.name} 不是图片文件`)
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error(`${file.name} 大小超过 5MB`)
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageItem: ImageItem = {
        url: e.target?.result as string,
        file: file,
        uploading: true,
        progress: 0
      }
      talkImageList.value.push(imageItem)
      uploadTalkImage(imageItem)
    }
    reader.readAsDataURL(file)
  })
}

// 上传图片
const uploadTalkImage = async (imageItem: ImageItem) => {
  if (!imageItem.file) return
  
  try {
    const response = await uploadImage(imageItem.file)
    imageItem.url = (response as unknown as string) || imageItem.url
    imageItem.uploading = false
    imageItem.progress = 100
    ElMessage.success('图片上传成功')
  } catch (error) {
    ElMessage.error('图片上传失败，请重试')
    const index = talkImageList.value.indexOf(imageItem)
    if (index > -1) {
      talkImageList.value.splice(index, 1)
    }
  }
}

// 删除图片
const removeTalkImage = (index: number) => {
  talkImageList.value.splice(index, 1)
}

// 预览图片
const previewTalkImage = (url: string) => {
  previewImageList.value = talkImageList.value.map(img => img.url)
  previewIndex.value = talkImageList.value.findIndex(img => img.url === url)
  showViewer.value = true
}

// 提交说说
const submitTalk = async () => {
  if (!talkForm.value.content.trim()) {
    ElMessage.warning('请输入说说内容')
    return
  }
  
  if (!userStore.user?.id) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }
  
  const uploading = talkImageList.value.some(img => img.uploading)
  if (uploading) {
    ElMessage.warning('图片正在上传中，请稍候...')
    return
  }
  
  publishing.value = true
  
  try {
    await publishTalk({
      userId: Number(userStore.user.id),
      talkContent: talkForm.value.content,
      talkPic: talkImageList.value.map(img => img.url),
      talkStatus: talkForm.value.status
    })
    
    ElMessage.success('说说发表成功！')
    showPublishDialog.value = false
    
    // 清空表单
    talkForm.value.content = ''
    talkForm.value.status = 0
    talkImageList.value = []
    
    // 刷新列表
    currentPage.value = 1
    loadTalkList()
  } catch (error) {
    ElMessage.error('发表失败，请重试')
  } finally {
    publishing.value = false
  }
}

// 删除说说
const handleDeleteTalk = async (talk: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条说说吗？删除后无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteTalk(talk.id)
    ElMessage.success('说说已删除')
    
    // 刷新列表
    loadTalkList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 删除评论
const handleDeleteComment = async (comment: any, talk: any) => {
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
    
    // 判断是否是博主/超级管理员
    const requestData: any = {
      talkCommentId: comment.id
    }
    
    // 如果不是博主/超级管理员，需要传 userId
    if (!isAuthor.value && userStore.user) {
      requestData.userId = Number(userStore.user.id)
    }
    
    await deleteComment(requestData)
    ElMessage.success('评论已删除')
    
    // 刷新评论列表
    if (talk.commentsLoaded) {
      // 如果已经展开了详情，重新加载详情
      talk.commentsLoaded = false
      await loadTalkComments(talk)
    } else {
      // 否则刷新整个说说列表
      loadTalkList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 打开评论弹框
const openCommentDialog = (talk: any, comment?: any) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }
  
  currentTalk.value = talk
  replyToComment.value = comment || null
  commentText.value = ''
  commentDialogVisible.value = true
}

// 提交评论
const submitComment = async () => {
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  if (!userStore.user?.id) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }
  
  submittingComment.value = true
  
  try {
    const requestData: any = {
      talkId: currentTalk.value.id,
      userId: Number(userStore.user.id),
      content: commentText.value
    }
    
    // 如果是回复评论，需要传递额外参数
    if (replyToComment.value) {
      requestData.parentId = replyToComment.value.parentId || replyToComment.value.id
      requestData.replyToId = replyToComment.value.id
      requestData.replyToUserId = replyToComment.value.user?.id
    }
    
    await addComment(requestData)
    ElMessage.success('评论发表成功！')
    
    commentDialogVisible.value = false
    commentText.value = ''
    
    // 刷新评论列表
    if (currentTalk.value.commentsLoaded) {
      // 如果已经展开了详情，重新加载详情
      currentTalk.value.commentsLoaded = false
      await loadTalkComments(currentTalk.value)
    } else {
      // 否则刷新整个说说列表
      loadTalkList()
    }
  } catch (error) {
    ElMessage.error('发表失败，请重试')
  } finally {
    submittingComment.value = false
  }
}

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
            src: comment.user?.avatar || '/default-avatar.svg',
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

// 评论相关
const commentDialogVisible = ref(false)
const commentText = ref('')
const currentTalk = ref<any>(null)
const replyToComment = ref<any>(null)
const submittingComment = ref(false)

// 点赞相关
const handleLike = async (talk: any) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }
  
  if (!userStore.user?.id) {
    ElMessage.warning('用户信息异常，请重新登录')
    return
  }
  
  try {
    const type = talk.isLiked ? 2 : 1  // 1=点赞, 2=取消点赞
    
    await likeTalk({
      talkId: talk.id,
      userId: Number(userStore.user.id),
      type
    })
    
    // 更新本地状态
    talk.isLiked = !talk.isLiked
    talk.likeCount = talk.isLiked ? (talk.likeCount || 0) + 1 : (talk.likeCount || 0) - 1
    
    ElMessage.success(talk.isLiked ? '点赞成功 ❤️' : '取消点赞')
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

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
    const params: any = {
      pageNo: currentPage.value,
      pageSize: pageSize.value
    }
    
    // 如果用户已登录，传入用户ID
    if (userStore.user?.id) {
      params.userId = Number(userStore.user.id)
    }
    
    const response: any = await getTalkList(params)
    
    // 响应拦截器已经返回了 res.data，所以直接用 response.list
    if (response && response.list) {
      const list = response.list || []
      
      // 格式化数据
      talks.value = list.map((talk: any) => {
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
          images = []
        }
        
        const result = {
          ...talk,  // 保留所有原始字段
          talkPic: images,
          createTime: talk.createTime ? formatTimestamp(talk.createTime) : '',
          user: talk.user || {
            id: 0,
            nickname: '匿名用户',
            avatar: '/default-avatar.svg',
            isAuthor: false
          },
          comments: talk.comments || [],  // 确保 comments 字段存在
          commentCount: talk.commentCount || 0,  // 确保 commentCount 存在
          commentsLoaded: false  // 标记评论是否已加载
        }
        
        return result
      })
      
      total.value = response.total || 0
    }
  } catch (error) {
    ElMessage.error('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

// 加载说说的评论详情
const loadTalkComments = async (talk: any) => {
  // 如果已经加载过，则切换折叠状态
  if (talk.commentsLoaded) {
    talk.commentsLoaded = false
    return
  }
  
  try {
    const params: any = {
      talkId: talk.id,
      pageNo: 1,
      pageSize: 1
    }
    
    // 如果用户已登录，传入用户ID
    if (userStore.user?.id) {
      params.userId = Number(userStore.user.id)
    }
    
    const response: any = await getTalkDetail(params)
    
    if (response && response.comments) {
      talk.detailComments = response.comments
      talk.commentsLoaded = true
    }
  } catch (error) {
    ElMessage.error('加载评论失败，请重试')
  }
}

// 加载单个评论的回复
// 直接加载整个说说的详情
const toggleCommentReplies = async (talk: any, comment: any) => {
  // 如果已经展开，则收起
  if (comment.repliesExpanded) {
    comment.repliesExpanded = false
    // 强制更新
    talks.value = [...talks.value]
    return
  }
  
  // 如果还没有加载过回复，则加载
  if (!comment.detailReplies) {
    try {
      const params: any = {
        talkId: talk.id,
        pageNo: 1,
        pageSize: 100
      }
      
      // 如果用户已登录，传入用户ID
      if (userStore.user?.id) {
        params.userId = Number(userStore.user.id)
      }
      
      const response: any = await getTalkDetail(params)
      
      if (response && response.comments) {
        // 找到当前评论在详情中的数据
        const detailComment = response.comments.find((c: any) => c.id === comment.id)
        if (detailComment && detailComment.replies) {
          // 扁平化回复列表，并添加层级信息
          comment.detailReplies = flattenCommentsWithLevel(detailComment.replies, 1)
        } else {
          comment.detailReplies = []
        }
      }
    } catch (error) {
      ElMessage.error('加载回复失败，请重试')
      return
    }
  }
  
  // 展开
  comment.repliesExpanded = true
  // 强制更新
  talks.value = [...talks.value]
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

// 扁平化评论树并添加层级信息
const flattenCommentsWithLevel = (comments: any[], level: number = 1): any[] => {
  const result: any[] = []
  
  const flatten = (commentList: any[], currentLevel: number) => {
    commentList.forEach(comment => {
      result.push({
        ...comment,
        level: currentLevel
      })
      if (comment.replies && comment.replies.length > 0) {
        flatten(comment.replies, currentLevel + 1)
      }
    })
  }
  
  flatten(comments, level)
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

// 插入表情到说说文本框
const insertTalkEmoji = (emoji: string) => {
  const textarea = talkTextareaRef.value?.textarea || talkTextareaRef.value?.$el?.querySelector('textarea')
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = talkForm.value.content
    
    talkForm.value.content = text.substring(0, start) + emoji + text.substring(end)
    
    // 恢复光标位置
    setTimeout(() => {
      textarea.focus()
      const newPos = start + emoji.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  } else {
    // 如果无法获取 textarea，直接追加到末尾
    talkForm.value.content += emoji
  }
}

// 插入表情到评论文本框
const insertCommentEmoji = (emoji: string) => {
  const textarea = commentTextareaRef.value?.textarea || commentTextareaRef.value?.$el?.querySelector('textarea')
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = commentText.value
    
    commentText.value = text.substring(0, start) + emoji + text.substring(end)
    
    // 恢复光标位置
    setTimeout(() => {
      textarea.focus()
      const newPos = start + emoji.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  } else {
    // 如果无法获取 textarea，直接追加到末尾
    commentText.value += emoji
  }
}

// 初始化加载
onMounted(() => {
  loadTalkList()
})
</script>

<style scoped lang="scss">
.talk {
  min-height: calc(100vh - 200px);
  padding: 32px 0 48px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  border-left: 4px solid var(--color-accent);
  padding-left: 20px;

  .header-text {
    h1 {
      font-family: var(--font-serif);
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      margin: 0 0 4px 0;
    }

    p {
      font-size: 13px;
      color: var(--text-tertiary);
      margin: 0;
    }
  }

  .publish-btn {
    height: 36px;
    padding: 0 18px;
    border-radius: var(--radius-btn);
    background: var(--color-accent);
    border: none;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.85;
    }
  }
}

.talk-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .empty-state {
    text-align: center;
    padding: 64px 20px;
    color: var(--text-tertiary);
    font-size: 14px;
  }

  .talk-item {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-card);
    padding: 20px;
    box-shadow: var(--shadow-card);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-card-hover);
    }

    .talk-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid var(--border-color);
        object-fit: cover;
        flex-shrink: 0;
      }

      .user-info {
        .username {
          font-family: var(--font-serif);
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .time {
          font-size: 12px;
          color: var(--text-tertiary);
        }
      }
    }

    .talk-content {
      font-size: 14px;
      line-height: 1.7;
      color: var(--text-secondary);
      margin-bottom: 14px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .talk-images {
      display: grid;
      gap: 8px;
      margin-bottom: 16px;

      &:has(.talk-img:nth-child(1):nth-last-child(1)) {
        grid-template-columns: 1fr;
        max-width: 360px;
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
        height: 180px;
        object-fit: cover;
        border-radius: var(--radius-btn);
        cursor: pointer;
        transition: opacity 0.15s ease;

        &:hover {
          opacity: 0.85;
        }
      }
    }

    .talk-footer {
      border-top: 1px solid var(--border-color);
      padding-top: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .actions {
        display: flex;
        gap: 16px;

        .action-btn {
          color: var(--text-tertiary);
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.15s ease;
          background: none;
          border: none;
          padding: 0;

          .icon { font-size: 15px; }

          &:hover { color: var(--color-accent); }
          &.liked { color: var(--color-danger); }
        }
      }

      .delete-talk-btn {
        color: var(--text-tertiary);
        font-size: 13px;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
        transition: color 0.15s ease;

        &:hover { color: var(--color-danger); }
      }
    }
  }

  .comment-list {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);

    .comment-item-bilibili {
      display: flex;
      gap: 10px;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child { border-bottom: none; }

      .comment-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid var(--border-color);
        flex-shrink: 0;
        object-fit: cover;
      }

      .comment-main {
        flex: 1;
        min-width: 0;

        .comment-user {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 6px;

          &.author {
            color: var(--color-accent);

            &::after {
              content: '博主';
              margin-left: 6px;
              font-size: 10px;
              background: var(--color-accent);
              color: var(--text-inverse);
              padding: 1px 6px;
              border-radius: var(--radius-tag);
              font-weight: 600;
            }
          }
        }

        .comment-text {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 8px;
          word-break: break-word;
        }

        .comment-footer {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 8px;

          .comment-time {
            font-size: 12px;
            color: var(--text-tertiary);
          }

          .comment-actions {
            display: flex;
            gap: 12px;

            .action-btn {
              font-size: 12px;
              color: var(--text-tertiary);
              cursor: pointer;
              background: none;
              border: none;
              padding: 0;
              transition: color 0.15s ease;

              &:hover { color: var(--color-accent); }
              &.delete:hover { color: var(--color-danger); }
            }
          }
        }

        .expand-replies {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: var(--bg-secondary);
          border-radius: var(--radius-tag);
          cursor: pointer;
          transition: background 0.15s ease;
          margin-top: 6px;

          .expand-text {
            font-size: 12px;
            color: var(--color-accent);
          }

          .expand-icon {
            font-size: 10px;
            color: var(--color-accent);
            transition: transform 0.2s;

            &.expanded { transform: rotate(180deg); }
          }

          &:hover { background: var(--bg-primary); }
        }

        .replies-list {
          margin-top: 10px;
          padding-left: 12px;
          border-left: 2px solid var(--border-color);

          .reply-item {
            display: flex;
            gap: 8px;
            padding: 8px 0;
            border-bottom: 1px solid var(--border-color);

            &:last-child { border-bottom: none; }

            .reply-avatar {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: 1px solid var(--border-color);
              flex-shrink: 0;
              object-fit: cover;
            }

            .reply-main {
              flex: 1;
              min-width: 0;

              .reply-user {
                font-size: 12px;
                font-weight: 600;
                color: var(--text-secondary);
                margin-bottom: 4px;

                &.author { color: var(--color-accent); }

                .reply-to {
                  color: var(--color-accent);
                  margin: 0 4px;
                }
              }

              .reply-text {
                font-size: 13px;
                color: var(--text-secondary);
                line-height: 1.6;
                margin-bottom: 6px;
                word-break: break-word;
              }

              .reply-footer {
                display: flex;
                align-items: center;
                gap: 12px;

                .reply-time {
                  font-size: 11px;
                  color: var(--text-tertiary);
                }

                .reply-actions {
                  display: flex;
                  gap: 10px;

                  .action-btn {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    cursor: pointer;
                    background: none;
                    border: none;
                    padding: 0;
                    transition: color 0.15s ease;

                    &:hover { color: var(--color-accent); }
                    &.delete:hover { color: var(--color-danger); }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .comment-input-area {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);

    .input-box {
      width: 100%;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-btn);
      padding: 10px 12px;
      font-size: 14px;
      color: var(--text-primary);
      resize: vertical;
      min-height: 80px;
      font-family: inherit;
      transition: border-color 0.15s ease;

      &:focus {
        outline: none;
        border-color: var(--color-accent);
      }

      &::placeholder { color: var(--text-tertiary); }
    }

    .input-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;

      .submit-btn {
        padding: 6px 16px;
        border-radius: var(--radius-btn);
        background: var(--color-accent);
        border: none;
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.15s ease;

        &:hover { opacity: 0.85; }
      }
    }
  }
}

.publish-dialog {
  .publish-form {
    .form-textarea {
      width: 100%;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-btn);
      padding: 12px;
      font-size: 14px;
      color: var(--text-primary);
      resize: vertical;
      min-height: 120px;
      font-family: inherit;
      transition: border-color 0.15s ease;

      &:focus {
        outline: none;
        border-color: var(--color-accent);
      }

      &::placeholder { color: var(--text-tertiary); }
    }

    .image-upload-section {
      margin-top: 12px;

      .upload-title {
        font-size: 13px;
        color: var(--text-tertiary);
        margin-bottom: 8px;
      }

      .image-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .image-item {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: var(--radius-btn);
          overflow: hidden;
          border: 1px solid var(--border-color);

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .remove-btn {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.6);
            color: #fff;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
          }
        }

        .upload-btn {
          width: 80px;
          height: 80px;
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-btn);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-tertiary);
          font-size: 24px;
          background: transparent;
          transition: border-color 0.15s ease;

          &:hover {
            border-color: var(--color-accent);
            color: var(--color-accent);
          }
        }
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 24px 0 0;
  border-top: 1px solid var(--border-color);
  margin-top: 8px;
}

@media (max-width: 640px) {
  .talk-list .talk-item .talk-images .talk-img {
    height: 140px;
  }
}
</style>
