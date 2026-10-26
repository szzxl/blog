<template>
  <div class="comment-section card">
    <div class="section-header">
      <span class="section-title">评论</span>
      <span class="comment-count-badge" v-if="total > 0">{{ total }}</span>
    </div>

    <!-- 发表评论表单 -->
    <div class="comment-form">
      <template v-if="userStore.isLoggedIn">
        <CommentForm ref="commentFormRef" :submitting="submitting" @submit="submitComment" />
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
            <div class="expand-replies" v-if="(comment.replyCount || 0) > 0">
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
                @preview="previewImage"
              />
              <el-button v-if="expandedReplies[comment.id]!.length < (replyTotals[comment.id] || 0)"
                :loading="loadingReplies[comment.id]" @click="loadReplies(comment.id, true)">加载更多回复</el-button>
            </div>

            <CommentForm v-if="replyState !== null && replyState.rootId === comment.id"
              :key="String(replyState.parentId)" :ref="setReplyForm" :submitting="replySubmitting"
              :placeholder="`回复 @${replyState.atName}`" :rows="2" cancelable
              @cancel="cancelReply" @submit="submitReply" />
          </div>
        </div>
      </template>

      <div v-else-if="loadError" class="empty-state" role="alert">
        评论加载失败，<button @click="loadComments">重试</button>
      </div>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { ElMessage } from 'element-plus/es/components/message/index'
import { ElMessageBox } from 'element-plus/es/components/message-box/index'
import { getArticleComments, addArticleComment, deleteArticleComment, likeArticleComment, getPhotoComments, addPhotoComment, deletePhotoComment, likePhotoComment, getCommentReplies, toCommentView } from '@/api/comment'
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'
import { showRequestError } from '@/utils/requestError'
import { formatTimestamp } from '@/utils/format'
import type { CommentId, CommentSubmission, CommentView } from '@/types/comment'
import CommentForm from './CommentForm.vue'
import ReplyItem from './ReplyItem.vue'

const props = defineProps<{ articleId?: CommentId; sourceId?: CommentId; sourceType?: 'article' | 'photo' }>()
const resolvedId = computed(() => props.sourceId ?? props.articleId ?? '')
const isPhoto = computed(() => props.sourceType === 'photo')
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const comments = ref<CommentView[]>([])
const loading = ref(false)
const loadError = ref(false)
const submitting = ref(false)
const replySubmitting = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const lightboxSrc = ref('')
const likingIds = new Set<CommentId>()
const deletingIds = new Set<CommentId>()
const commentFormRef = ref<InstanceType<typeof CommentForm>>()
let replyForm: InstanceType<typeof CommentForm> | null = null
const setReplyForm = (element: Element | ComponentPublicInstance | null) => {
  replyForm = element as InstanceType<typeof CommentForm> | null
}
const expandedReplies = ref<Record<CommentId, CommentView[]>>({})
const loadingReplies = ref<Record<CommentId, boolean>>({})
const replyPages = ref<Record<CommentId, number>>({})
const replyTotals = ref<Record<CommentId, number>>({})
const replyState = ref<{ parentId: CommentId; rootId: CommentId; atName: string } | null>(null)
let loadSequence = 0
let repliesVersion = 0
let disposed = false
const resetReplies = () => {
  repliesVersion++
  expandedReplies.value = {}
  loadingReplies.value = {}
  replyPages.value = {}
  replyTotals.value = {}
  replyState.value = null
}
const sessionCurrent = (token: string) => !disposed && userStore.isLoggedIn && token === userStore.token
const requireLogin = () => {
  if (userStore.isLoggedIn) return true
  ElMessage.warning('请先登录')
  void router.push({ path: '/login', query: { redirect: route.fullPath } })
  return false
}
const loadReplies = async (id: CommentId, append = false) => {
  if (loadingReplies.value[id] || disposed) return
  loadingReplies.value[id] = true
  const version = repliesVersion
  const page = append ? (replyPages.value[id] || 0) + 1 : 1
  try {
    const result = await getCommentReplies(id, page)
    if (disposed || version !== repliesVersion) return
    const list = result.list.map(toCommentView)
    expandedReplies.value[id] = append ? [...(expandedReplies.value[id] || []), ...list] : list
    replyPages.value[id] = page
    replyTotals.value[id] = result.total
  } catch (error) {
    if (!disposed) showRequestError(error, '获取回复失败')
  } finally { if (version === repliesVersion) loadingReplies.value[id] = false }
}
const toggleReplies = (comment: CommentView) => {
  if (expandedReplies.value[comment.id]) delete expandedReplies.value[comment.id]
  else void loadReplies(comment.id)
}
const startReply = (parentId: CommentId, atName: string, rootId: CommentId) => {
  if (!requireLogin() || replySubmitting.value) return
  if (replyState.value?.parentId === parentId) { cancelReply(); return }
  replyState.value = { parentId, rootId, atName }
}
const cancelReply = () => { if (!replySubmitting.value) replyState.value = null }
const loadComments = async () => {
  if (disposed) return
  const sequence = ++loadSequence
  loading.value = true
  loadError.value = false
  try {
    const paging = { pageNo: currentPage.value, pageSize: pageSize.value }
    const result = isPhoto.value
      ? await getPhotoComments({ photoId: resolvedId.value, ...paging })
      : await getArticleComments({ articleId: resolvedId.value, ...paging })
    if (sequence !== loadSequence) return
    const lastPage = Math.max(1, Math.ceil(result.total / pageSize.value))
    if (currentPage.value > lastPage) { currentPage.value = lastPage; return loadComments() }
    comments.value = result.list.map(toCommentView)
    total.value = result.total
  } catch (error) {
    if (sequence === loadSequence) {
      loadError.value = true
      showRequestError(error, '评论加载失败，请重试')
    }
  } finally { if (sequence === loadSequence) loading.value = false }
}
const submitComment = async (data: CommentSubmission) => {
  if (submitting.value || !requireLogin()) return
  const token = userStore.token
  submitting.value = true
  try {
    if (isPhoto.value) await addPhotoComment({ photoId: resolvedId.value, ...data })
    else await addArticleComment({ articleId: resolvedId.value, ...data })
    if (!sessionCurrent(token)) return
    commentFormRef.value?.acknowledge(data)
    ElMessage.success('评论发表成功')
    currentPage.value = 1
    await loadComments()
  } catch (error) { if (sessionCurrent(token)) showRequestError(error, '发表失败，请重试') }
  finally { submitting.value = false }
}
const submitReply = async (data: CommentSubmission) => {
  if (replySubmitting.value || !replyState.value || !requireLogin()) return
  const target = replyState.value
  const token = userStore.token
  const form = replyForm
  replySubmitting.value = true
  try {
    const payload = { ...data, parentId: target.parentId, rootId: target.rootId }
    if (isPhoto.value) await addPhotoComment({ photoId: resolvedId.value, ...payload })
    else await addArticleComment({ articleId: resolvedId.value, ...payload })
    if (!sessionCurrent(token)) return
    form?.acknowledge(data)
    if (replyState.value === target) replyState.value = null
    await loadComments()
    if (sessionCurrent(token) && expandedReplies.value[target.rootId]) await loadReplies(target.rootId)
    ElMessage.success('回复成功')
  } catch (error) { if (sessionCurrent(token)) showRequestError(error, '回复失败，请重试') }
  finally { replySubmitting.value = false }
}
const canDelete = (comment: CommentView) => userStore.isLoggedIn && String(comment.creator) === String(userStore.user?.id)
const handleLike = async (comment: CommentView) => {
  if (!requireLogin() || likingIds.has(comment.id)) return
  const token = userStore.token
  const wasLiked = comment.isLiked
  likingIds.add(comment.id)
  try {
    const type = wasLiked ? 2 : 1
    if (isPhoto.value) await likePhotoComment({ commentId: comment.id, type })
    else await likeArticleComment({ commentArticleId: comment.id, type })
    if (!sessionCurrent(token)) return
    comment.isLiked = !wasLiked
    comment.likeCount = Math.max(0, comment.likeCount + (wasLiked ? -1 : 1))
  } catch (error) { if (sessionCurrent(token)) showRequestError(error, '操作失败，请重试') }
  finally { likingIds.delete(comment.id) }
}
const handleDelete = async (comment: CommentView) => {
  if (!requireLogin() || deletingIds.has(comment.id)) return
  const token = userStore.token
  deletingIds.add(comment.id)
  try {
    await ElMessageBox.confirm('确定删除这条评论及其下的全部回复吗？删除后无法恢复。', '删除确认', { type: 'warning' })
    if (!sessionCurrent(token)) return
    if (isPhoto.value) await deletePhotoComment({ commentId: comment.id })
    else await deleteArticleComment({ commentId: comment.id })
    if (!sessionCurrent(token)) return
    resetReplies()
    await loadComments()
    ElMessage.success('评论已删除')
  } catch (error) {
    if (sessionCurrent(token) && error !== 'cancel' && error !== 'close') showRequestError(error, '删除失败，请重试')
  } finally { deletingIds.delete(comment.id) }
}
const handlePageChange = (page: number) => {
  currentPage.value = page
  resetReplies()
  void loadComments()
  document.querySelector('.comment-section')?.scrollIntoView({ behavior: 'smooth' })
}
const formatCommentTime = (timestamp: number | string) => formatTimestamp(typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp, 'YYYY-MM-DD HH:mm')
const previewImage = (url: string) => { lightboxSrc.value = url }
const onKeydown = (event: KeyboardEvent) => { if (event.key === 'Escape') lightboxSrc.value = '' }
watch(() => userStore.token, () => { resetReplies(); void loadComments() })
onMounted(() => { void loadComments(); window.addEventListener('keydown', onKeydown) })
onUnmounted(() => { disposed = true; loadSequence++; window.removeEventListener('keydown', onKeydown) })
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

    .comment-body {
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

.comment-section {
  padding: 8px 0 20px;
  margin-top: 0;
  border-radius: 0;
  box-shadow: none;
}
.comment-section .section-title {
  font: 500 24px var(--font-serif);
}
.comment-section .comment-form .form-input-wrap .form-toolbar .submit-btn {
  border-radius: 4px;
  min-height: 40px;
}
.comment-section .comment-form .form-input-wrap .form-toolbar .img-upload-btn {
  min-width: 40px;
  min-height: 40px;
}
.comment-section .section-header {
  margin-bottom: 22px;
}
@media (max-width: 760px) {
  .comment-section { padding: 8px 0; }
  .comment-section .section-title { font-size: 21px; }
  .comment-section .comment-form .form-row { gap: 10px; }
}

</style>
