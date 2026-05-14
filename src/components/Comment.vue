<template>
  <div class="comment-section card">
    <div class="section-header">
      <span class="section-title">评论</span>
      <span class="comment-count-badge" v-if="total > 0">{{ total }}</span>
    </div>

    <!-- 发表评论表单 -->
    <div class="comment-form">
      <template v-if="userStore.isLoggedIn">
        <div class="form-row">
          <div class="avatar-wrap">
            <div class="avatar">{{ (userStore.user?.nickname || userStore.user?.username || '?')[0].toUpperCase() }}</div>
          </div>
          <div class="form-input-wrap">
            <el-input
              ref="commentInputRef"
              v-model="commentText"
              type="textarea"
              :rows="3"
              placeholder="发一条友善的评论"
              maxlength="500"
              show-word-limit
            />
            <div class="form-toolbar">
              <EmojiPicker @select="insertEmoji" />
              <button class="img-upload-btn" @click="triggerCommentUpload" title="上传图片">
                <el-icon><Upload /></el-icon>
              </button>
              <input
                ref="commentFileInput"
                type="file"
                accept="image/*"
                multiple
                style="display:none"
                @change="handleCommentFileChange"
              />
              <el-button
                type="primary"
                class="submit-btn"
                :loading="submitting"
                @click="submitComment"
              >发布</el-button>
            </div>
            <!-- 图片预览 -->
            <div class="image-list" v-if="commentImages.length > 0">
              <div
                class="image-item"
                v-for="(image, index) in commentImages"
                :key="image"
              >
                <img :src="image" alt="预览图">
                <span class="img-del" @click="removeCommentImage(index)">×</span>
              </div>
              <div class="upload-btn" v-if="commentImages.length < 9" @click="triggerCommentUpload">
                <el-icon><Plus /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="login-tip">
          <router-link :to="{ path: '/login', query: { redirect: route.fullPath } }" class="login-link">登录</router-link>
          后参与评论
        </div>
      </template>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list" v-loading="loading">
      <template v-if="comments.length > 0">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="avatar">{{ (comment.user?.nickname || '?')[0].toUpperCase() }}</div>
          <div class="comment-body">
            <div class="comment-meta">
              <span class="username" :class="{ author: comment.user?.isAuthor }">
                {{ comment.user?.nickname || '匿名用户' }}
                <span class="author-tag" v-if="comment.user?.isAuthor">博主</span>
              </span>
            </div>
            <div class="comment-text">{{ comment.content }}</div>
            <div class="comment-images" v-if="comment.images?.length">
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
              <span class="action-btn like-btn" :class="{ liked: comment.isLiked }" @click="handleLike(comment)">
                <svg class="like-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M7 22V11M2 13v7a2 2 0 002 2h12.5a2 2 0 001.97-1.67l1-6A2 2 0 0017.5 11H13V5a3 3 0 00-3-3H9l-2 6z"/>
                </svg>
                <span>{{ comment.likeCount || 0 }}</span>
              </span>
              <span class="action-btn" @click="startReply(comment.id, comment.user?.nickname || '匿名用户', comment.id)">回复</span>
              <span v-if="canDelete(comment)" class="action-btn danger" @click="handleDelete(comment)">删除</span>
            </div>

            <!-- 展开回复 -->
            <div class="expand-replies" v-if="comment.replyCount > 0">
              <span class="expand-btn" @click="toggleReplies(comment)" v-if="!loadingReplies[comment.id]">
                <svg viewBox="0 0 16 16" fill="currentColor" class="arrow-icon" :class="{ open: expandedReplies[comment.id] }">
                  <path d="M8 10.5L3 5.5h10z"/>
                </svg>
                {{ expandedReplies[comment.id] ? '收起回复' : `${comment.replyCount} 条回复` }}
              </span>
              <span v-else class="expand-btn muted">加载中...</span>
            </div>

            <!-- 回复列表 -->
            <div class="replies" v-if="expandedReplies[comment.id]?.length">
              <ReplyItem
                v-for="reply in expandedReplies[comment.id]"
                :key="reply.id"
                :reply="reply"
                :rootId="comment.id"
                :depth="0"
                @like="handleLike"
                @reply="({ parentId, atName, rootId }) => startReply(parentId, atName, rootId)"
                @delete="handleDelete"
              />
            </div>

            <!-- 回复输入框 -->
            <div class="reply-box" v-if="replyState?.rootId === comment.id">
              <el-input
                ref="replyInputRef"
                v-model="replyText"
                type="textarea"
                :rows="2"
                :placeholder="`回复 @${replyState.atName}`"
                maxlength="500"
                autofocus
              />
              <div class="form-toolbar">
                <EmojiPicker @select="insertReplyEmoji" />
                <button class="img-upload-btn" @click="triggerReplyUpload" title="上传图片">
                  <el-icon><Upload /></el-icon>
                </button>
                <input
                  ref="replyFileInput"
                  type="file"
                  accept="image/*"
                  multiple
                  style="display:none"
                  @change="handleReplyFileChange"
                />
                <div class="reply-box-actions">
                  <el-button size="small" @click="cancelReply">取消</el-button>
                  <el-button type="primary" size="small" :loading="replySubmitting" @click="submitReply(comment)">发布</el-button>
                </div>
              </div>
              <div class="image-list" v-if="replyImages.length > 0">
                <div class="image-item" v-for="(img, idx) in replyImages" :key="img">
                  <img :src="img" alt="预览图">
                  <span class="img-del" @click="replyImages.splice(idx, 1)">×</span>
                </div>
                <div class="upload-btn" v-if="replyImages.length < 9" @click="triggerReplyUpload">
                  <el-icon><Plus /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else-if="!loading" class="empty-state">
        <div class="empty-text">还没有评论，快来说点什么吧~</div>
      </div>

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

  <!-- 图片灯箱 -->
  <Teleport to="body">
    <Transition name="cmt-lb">
      <div v-if="lightboxSrc" class="cmt-lightbox" @click="lightboxSrc = ''">
        <img :src="lightboxSrc" class="cmt-lightbox-img" @click.stop />
        <button class="cmt-lb-close" @click="lightboxSrc = ''">×</button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import {
  getArticleComments, addArticleComment, deleteArticleComment, likeArticleComment,
  getAlbumComments, addAlbumComment, deleteAlbumComment, likeAlbumComment,
  getCommentReplies, uploadImage
} from '@/api/article'
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'
import EmojiPicker from './EmojiPicker.vue'
import ReplyItem from './ReplyItem.vue'

const props = defineProps<{
  articleId?: string | number
  sourceId?: string | number
  sourceType?: 'article' | 'album'
}>()

const resolvedId = computed(() => props.sourceId ?? props.articleId ?? '')
const isAlbum = computed(() => props.sourceType === 'album')

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const commentText = ref('')
const commentInputRef = ref()
const commentImages = ref<string[]>([])
const comments = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const commentFileInput = ref<HTMLInputElement>()
const lightboxSrc = ref('')
const likingIds = ref<Set<number | string>>(new Set())
let loadCommentsSeq = 0

// ── 展开回复 ──────────────────────────────────────────
const expandedReplies = ref<Record<string | number, any[]>>({})
const loadingReplies = ref<Record<string | number, boolean>>({})

const resolveIsAuthor = (c: any) =>
  c.isAuthor || (userStore.isAuthor && String(c.creator) === String(userStore.user?.id))

const mapReply = (r: any): any => ({
  ...r,
  user: { id: r.userId, nickname: r.username, isAuthor: resolveIsAuthor(r) },
  createTime: r.createTime || Date.now(),
  isLiked: r.isLiked || false,
  likeCount: r.likeCount || 0,
  replyToName: r.replyToName || '',
  children: (r.children || []).map(mapReply)
})

const toggleReplies = async (comment: any) => {
  const id = comment.id
  if (expandedReplies.value[id]) {
    delete expandedReplies.value[id]
    return
  }
  loadingReplies.value[id] = true
  try {
    const res: any = await getCommentReplies(id)
    const list = Array.isArray(res) ? res : (res?.list || res?.data || [])
    expandedReplies.value[id] = list.map(mapReply)
  } catch {
    ElMessage.error('获取回复失败')
  } finally {
    loadingReplies.value[id] = false
  }
}

// ── 回复状态 ──────────────────────────────────────────
const replyState = ref<{ parentId: number | string; rootId: number | string; atName: string } | null>(null)
const replyText = ref('')
const replyImages = ref<string[]>([])
const replySubmitting = ref(false)
const replyInputRef = ref()
const replyFileInput = ref<HTMLInputElement>()

const startReply = (parentId: number | string, atName: string, rootId: number | string) => {
  if (replyState.value?.parentId === parentId && replyState.value?.atName === atName) {
    cancelReply()
    return
  }
  replyState.value = { parentId, rootId, atName }
  replyText.value = ''
}

const cancelReply = () => {
  replyState.value = null
  replyText.value = ''
  replyImages.value = []
}

const submitReply = async (topComment: any) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  const trimmed = replyText.value.trim()
  if (!trimmed) { ElMessage.warning('请输入回复内容'); return }

  replySubmitting.value = true
  try {
    if (isAlbum.value) {
      await addAlbumComment({
        username: userStore.user!.nickname || userStore.user!.username || '',
        albumId: resolvedId.value,
        content: trimmed,
        images: replyImages.value,
        userId: Number(userStore.user!.id),
        parentId: replyState.value!.parentId,
        rootId: replyState.value!.rootId
      })
    } else {
      await addArticleComment({
        username: userStore.user!.nickname || userStore.user!.username || '',
        articleId: resolvedId.value,
        content: trimmed,
        images: replyImages.value,
        userId: Number(userStore.user!.id),
        parentId: replyState.value!.parentId,
        rootId: replyState.value!.rootId
      })
    }
    const rootId = replyState.value!.rootId
    cancelReply()
    currentPage.value = 1
    await loadComments()
    // 若该评论回复列表已展开，同步刷新
    if (expandedReplies.value[rootId]) {
      const res: any = await getCommentReplies(rootId)
      const list = Array.isArray(res) ? res : (res?.list || res?.data || [])
      expandedReplies.value[rootId] = list.map(mapReply)
    }
    ElMessage.success('回复成功')
  } catch {
    ElMessage.error('回复失败，请重试')
  } finally {
    replySubmitting.value = false
  }
}

const insertReplyEmoji = (emoji: string) => {
  const textarea = replyInputRef.value?.textarea
  if (!textarea) { replyText.value += emoji; return }
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  replyText.value = replyText.value.substring(0, start) + emoji + replyText.value.substring(end)
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length
    textarea.focus()
  }, 0)
}

const triggerReplyUpload = () => replyFileInput.value?.click()

const handleReplyFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) handleReplyFiles(Array.from(files))
  target.value = ''
}

const handleReplyFiles = async (files: File[]) => {
  for (const file of files) {
    if (replyImages.value.length >= 9) {
      ElMessage.warning('最多只能上传 9 张图片')
      break
    }
    if (!file.type.startsWith('image/')) { ElMessage.error(`${file.name} 不是图片`); continue }
    if (file.size > 5 * 1024 * 1024) { ElMessage.error(`${file.name} 超过 5MB`); continue }
    try {
      const url: any = await uploadImage(file)
      if (url) replyImages.value.push(url)
    } catch { ElMessage.error('图片上传失败') }
  }
}

const onLbKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') lightboxSrc.value = '' }

// 插入表情
const insertEmoji = (emoji: string) => {
  const textarea = commentInputRef.value?.textarea
  if (!textarea) {
    commentText.value += emoji
    return
  }
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = commentText.value
  
  commentText.value = text.substring(0, start) + emoji + text.substring(end)
  
  // 设置光标位置
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length
    textarea.focus()
  }, 0)
}

// 判断是否可以删除评论
const canDelete = (comment: any) => {
  if (!userStore.isLoggedIn || !userStore.user) return false
  return String(comment.creator) === String(userStore.user.id)
}

// 加载评论列表
const loadComments = async () => {
  const seq = ++loadCommentsSeq
  loading.value = true
  try {
    const response: any = isAlbum.value
      ? await getAlbumComments({ albumId: resolvedId.value, pageNo: currentPage.value, pageSize: pageSize.value })
      : await getArticleComments({ articleId: resolvedId.value, pageNo: currentPage.value, pageSize: pageSize.value })

    // 丢弃过期响应
    if (seq !== loadCommentsSeq) return

    const rawData = Array.isArray(response) ? response : (response?.list || response?.data || [])

    const parseImages = (raw: any): string[] => {
      if (!raw) return []
      try { return typeof raw === 'string' ? JSON.parse(raw) : raw } catch { return [] }
    }

    // Flatten backend data (handles both flat lists and pre-nested replies arrays)
    const flatData: any[] = []
    const flattenItems = (items: any[]) => {
      for (const item of items) {
        flatData.push(item)
        if (item.replies?.length) flattenItems(item.replies)
      }
    }
    flattenItems(rawData)

    // Map all items to a uniform shape
    const mapped = flatData.map((c: any) => ({
      ...c,
      images: parseImages(c.images),
      user: { id: c.userId, nickname: c.username, isAuthor: resolveIsAuthor(c) },
      createTime: c.createTime || Date.now(),
      replies: [] as any[],
      isLiked: c.isLiked || false,
      likeCount: c.likeCount || 0,
      replyToName: c.replyToName || ''
    }))

    // Build parent-child tree: use rootId to attach all replies under their
    // root comment (2-level only), parentId is only used for @mention display.
    const byId: Record<string | number, any> = {}
    for (const c of mapped) byId[c.id] = c

    const topLevel: any[] = []
    for (const c of mapped) {
      const rootId = c.rootId
      const pid = c.parentId
      // No parent → top-level comment
      if (!pid && !rootId) {
        topLevel.push(c)
        continue
      }
      // Find root container (prefer rootId, fall back to parentId)
      const rootComment = (rootId && byId[rootId]) || (pid && byId[pid])
      if (rootComment && !rootComment.parentId && !rootComment.rootId) {
        // Attach directly under root, set @mention from parentId
        c.replyToName = pid && byId[pid] ? byId[pid].user?.nickname || '' : ''
        rootComment.replies.push(c)
      } else {
        // Orphan or root not in current page — treat as top-level
        topLevel.push(c)
      }
    }

    comments.value = topLevel
    total.value = response?.total || topLevel.length
  } catch {
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
  for (const file of files) {
    if (commentImages.value.length >= 9) {
      ElMessage.warning('最多只能上传 9 张图片')
      break
    }
    if (!file.type.startsWith('image/')) { ElMessage.error(`${file.name} 不是图片文件`); continue }
    if (file.size > 5 * 1024 * 1024) { ElMessage.error(`${file.name} 大小超过 5MB`); continue }
    try {
      const response: any = await uploadImage(file)
      if (response) commentImages.value.push(response)
    } catch {
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
  
  const trimmed = commentText.value.trim()
  if (!trimmed) {
    ElMessage.warning('请输入评论内容')
    return
  }
  if (trimmed.length < 2) {
    ElMessage.warning('评论内容至少 2 个字符')
    return
  }
  if (trimmed.length > 500) {
    ElMessage.warning('评论内容不能超过 500 个字符')
    return
  }
  
  submitting.value = true
  try {
    if (isAlbum.value) {
      await addAlbumComment({
        username: userStore.user!.nickname || userStore.user!.username || '',
        albumId: resolvedId.value,
        content: commentText.value,
        images: commentImages.value,
        likeCount: 0,
        userId: Number(userStore.user!.id)
      })
    } else {
      await addArticleComment({
        username: userStore.user!.nickname || userStore.user!.username || '',
        articleId: resolvedId.value,
        content: commentText.value,
        images: commentImages.value,
        likeCount: 0,
        userId: Number(userStore.user!.id)
      })
    }
    ElMessage.success('评论发表成功！')
    commentText.value = ''
    commentImages.value = []
    currentPage.value = 1
    await loadComments()
  } catch (error) {
    ElMessage.error('发表失败，请重试')
  } finally {
    submitting.value = false
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

  if (likingIds.value.has(comment.id)) return
  likingIds.value.add(comment.id)

  const wasLiked = comment.isLiked
  try {
    if (isAlbum.value) {
      await likeAlbumComment({ commentId: comment.id, type: wasLiked ? 2 : 1 })
    } else {
      await likeArticleComment({ commentArticleId: comment.id, type: wasLiked ? 2 : 1 })
    }
    comment.isLiked = !wasLiked
    comment.likeCount = Math.max(0, (comment.likeCount || 0) + (wasLiked ? -1 : 1))
  } catch {
    ElMessage.error('操作失败，请重试')
  } finally {
    likingIds.value.delete(comment.id)
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

    if (isAlbum.value) {
      await deleteAlbumComment({ commentId: comment.id })
    } else {
      await deleteArticleComment({ commentId: comment.id })
    }
    ElMessage.success('评论已删除')

    const rootId = comment.rootId
    if (rootId && expandedReplies.value[rootId] !== undefined) {
      // 删除的是展开回复里的评论，刷新该回复列表
      const res: any = await getCommentReplies(rootId)
      const list = Array.isArray(res) ? res : (res?.list || res?.data || [])
      expandedReplies.value[rootId] = list.map(mapReply)
      // 同步更新根评论的 replyCount
      await loadComments()
    } else {
      // 删除的是根评论，清除其展开状态后刷新列表
      delete expandedReplies.value[comment.id]
      await loadComments()
    }
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
  lightboxSrc.value = url
}

onMounted(() => {
  loadComments()
  window.addEventListener('keydown', onLbKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onLbKeydown)
})
</script>

<style scoped lang="scss">
// ── 变量 ──────────────────────────────────────────────
$accent: #00aeec;
$accent-author: #fb7299;
$text-primary: var(--text-primary);
$text-secondary: var(--text-secondary);
$text-muted: var(--text-tertiary);
$border: var(--border-color);
$bg-sub: var(--bg-secondary);

// ── 头像 ──────────────────────────────────────────────
.avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fb7299 0%, #00aeec 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;

  &.sm {
    width: 28px;
    height: 28px;
    font-size: 12px;
    margin-top: 2px;
  }
}

// ── 主容器 ────────────────────────────────────────────
.comment-section {
  margin-top: 32px;
  padding: 28px 32px;

  // 标题行
  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
    border-bottom: 1px solid $border;
    padding-bottom: 16px;
  }
  .section-title {
    font-size: 18px;
    font-weight: 700;
    color: $text-primary;
  }
  .comment-count-badge {
    font-size: 14px;
    color: $text-muted;
  }

  // ── 发表表单 ──────────────────────────────────────
  .comment-form {
    margin-bottom: 28px;

    .form-row {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }
    .avatar-wrap { padding-top: 2px; }

    .form-input-wrap {
      flex: 1;
      min-width: 0;

      :deep(.el-textarea__inner) {
        border-radius: 6px;
        border: 1px solid $border;
        font-size: 14px;
        resize: none;
        transition: border-color 0.2s;
        background: var(--bg-card);
        color: $text-primary;
        &:focus { border-color: $accent; box-shadow: none; }
      }

      .form-toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;

        .img-upload-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: $text-muted;
          font-size: 18px;
          padding: 4px 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
          &:hover { color: $accent; }
        }

        .submit-btn {
          margin-left: auto;
          border-radius: 20px;
          padding: 0 22px;
          height: 34px;
          font-size: 14px;
          background: $accent;
          border-color: $accent;
          &:hover { opacity: 0.88; }
        }
      }

      // 图片预览
      .image-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;

        .image-item {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid $border;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .img-del {
            position: absolute;
            top: 2px;
            right: 4px;
            color: #fff;
            font-size: 16px;
            line-height: 1;
            cursor: pointer;
            text-shadow: 0 1px 3px rgba(0,0,0,.6);
            &:hover { color: #ff4d4f; }
          }
        }

        .upload-btn {
          width: 80px;
          height: 80px;
          border: 1px dashed $border;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: $text-muted;
          font-size: 22px;
          transition: border-color 0.2s, color 0.2s;
          &:hover { border-color: $accent; color: $accent; }
        }
      }
    }

    .login-tip {
      font-size: 14px;
      color: $text-muted;
      padding: 14px 0;

      .login-link {
        color: $accent;
        font-weight: 600;
        text-decoration: none;
        &:hover { text-decoration: underline; }
      }
    }
  }

  // ── 评论列表 ──────────────────────────────────────
  .comment-list {
    .comment-item {
      display: flex;
      gap: 14px;
      padding: 18px 0;
      border-bottom: 1px solid $border;
      &:last-child { border-bottom: none; }
    }

    .comment-body, .reply-body {
      flex: 1;
      min-width: 0;
    }

    // 用户名行
    .comment-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .username {
      font-size: 14px;
      font-weight: 600;
      color: $text-secondary;
      display: flex;
      align-items: center;
      gap: 6px;

      &.author { color: $accent-author; }

      .author-tag {
        font-size: 11px;
        font-weight: 500;
        color: $accent-author;
        border: 1px solid $accent-author;
        border-radius: 3px;
        padding: 0 5px;
        line-height: 16px;
      }
    }
    .reply-at {
      font-size: 13px;
      color: $text-muted;
      em { color: $accent; font-style: normal; }
    }

    // 正文
    .comment-text {
      font-size: 15px;
      color: $text-primary;
      line-height: 1.75;
      margin-bottom: 8px;
      word-break: break-word;
    }

    // 图片
    .comment-images {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;

      .comment-img {
        width: 110px;
        height: 110px;
        object-fit: cover;
        border-radius: 6px;
        cursor: zoom-in;
        border: 1px solid $border;
        transition: opacity 0.2s;
        &:hover { opacity: 0.85; }
      }
    }

    // 底栏
    .comment-footer {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .comment-time {
      font-size: 12px;
      color: $text-muted;
    }

    // 操作按钮
    .action-btn {
      font-size: 12px;
      color: $text-muted;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: color 0.2s;
      user-select: none;

      &:hover { color: $accent; }
      &.danger:hover { color: #f53f3f; }

      &.like-btn {
        .like-icon {
          width: 14px;
          height: 14px;
        }
        &.liked { color: $accent; }
      }
    }

    // 展开回复
    .expand-replies {
      margin-top: 10px;

      .expand-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: $accent;
        cursor: pointer;
        user-select: none;
        &:hover { opacity: 0.8; }
        &.muted { color: $text-muted; cursor: default; }

        .arrow-icon {
          width: 14px;
          height: 14px;
          transition: transform 0.2s;
          &.open { transform: rotate(180deg); }
        }
      }
    }

    // 回复列表
    .replies {
      margin-top: 10px;
      background: $bg-sub;
      border-radius: 8px;
      padding: 4px 12px;

      .reply-item {
        display: flex;
        gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid $border;
        &:last-child { border-bottom: none; }
      }
    }

    // 回复输入框
    .reply-box {
      margin-top: 12px;

      :deep(.el-textarea__inner) {
        border-radius: 6px;
        font-size: 14px;
        border: 1px solid $border;
        background: var(--bg-card);
        &:focus { border-color: $accent; box-shadow: none; }
      }

      .form-toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;

        .img-upload-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: $text-muted;
          font-size: 18px;
          padding: 4px 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
          &:hover { color: $accent; }
        }
      }

      .reply-box-actions {
        display: flex;
        gap: 8px;
        margin-left: auto;
      }

      .image-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;

        .image-item {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid $border;
          img { width: 100%; height: 100%; object-fit: cover; }
          .img-del {
            position: absolute;
            top: 2px;
            right: 4px;
            color: #fff;
            font-size: 16px;
            line-height: 1;
            cursor: pointer;
            text-shadow: 0 1px 3px rgba(0,0,0,.6);
            &:hover { color: #ff4d4f; }
          }
        }

        .upload-btn {
          width: 64px;
          height: 64px;
          border: 1px dashed $border;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: $text-muted;
          font-size: 20px;
          transition: border-color 0.2s, color 0.2s;
          &:hover { border-color: $accent; color: $accent; }
        }
      }
    }

    // 空态
    .empty-state {
      text-align: center;
      padding: 50px 20px;

      .empty-text {
        font-size: 14px;
        color: $text-muted;
      }
    }

    // 分页
    .pagination {
      display: flex;
      justify-content: center;
      margin-top: 24px;

      :deep(.el-pagination) {
        .btn-prev, .btn-next, .el-pager li {
          background: var(--bg-card);
          border-radius: 6px;
          &:hover { color: $accent; }
          &.is-active { background: $accent; color: #fff; }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .comment-section {
    padding: 20px 16px;

    .form-row { gap: 10px; }

    .comment-item { gap: 10px; }

    .comment-text { font-size: 14px; }

    .comment-img { width: 80px !important; height: 80px !important; }
  }
}

// ── 评论图片灯箱 ──────────────────────────────────────
.cmt-lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  cursor: zoom-out;
  padding: 20px;
}

.cmt-lightbox-img {
  max-width: 90vw;
  max-height: 88vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
  cursor: default;
}

.cmt-lb-close {
  position: fixed;
  top: 20px;
  right: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover { background: rgba(255, 255, 255, 0.22); }
}

.cmt-lb-enter-active, .cmt-lb-leave-active { transition: opacity 0.2s ease; }
.cmt-lb-enter-from, .cmt-lb-leave-to { opacity: 0; }
</style>
