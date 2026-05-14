<template>
  <div class="reply-item" :class="`d${clampedDepth}`">
    <div class="avatar sm">{{ (reply.user?.nickname || '?')[0].toUpperCase() }}</div>
    <div class="reply-body">
      <div class="comment-meta">
        <span class="username" :class="{ author: reply.user?.isAuthor }">
          {{ reply.user?.nickname || '匿名用户' }}
          <span class="author-tag" v-if="reply.user?.isAuthor">博主</span>
        </span>
        <span class="reply-at" v-if="reply.replyToName">
          回复 <em>@{{ reply.replyToName }}</em>
        </span>
      </div>
      <div class="comment-text">{{ reply.content }}</div>
      <div class="comment-footer">
        <span class="comment-time">{{ formatTime(reply.createTime) }}</span>
        <span class="action-btn like-btn" :class="{ liked: reply.isLiked }" @click="$emit('like', reply)">
          <svg class="like-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M7 22V11M2 13v7a2 2 0 002 2h12.5a2 2 0 001.97-1.67l1-6A2 2 0 0017.5 11H13V5a3 3 0 00-3-3H9l-2 6z"/>
          </svg>
          <span>{{ reply.likeCount || 0 }}</span>
        </span>
        <span class="action-btn" @click="onReply">回复</span>
        <span v-if="canDelete" class="action-btn danger" @click="$emit('delete', reply)">删除</span>
      </div>

      <!-- 递归渲染子回复 -->
      <div class="nested-replies" v-if="reply.children?.length">
        <ReplyItem
          v-for="child in reply.children"
          :key="child.id"
          :reply="child"
          :rootId="rootId"
          :depth="(depth ?? 0) + 1"
          @like="$emit('like', $event)"
          @reply="$emit('reply', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

defineOptions({ name: 'ReplyItem' })

const props = defineProps<{
  reply: any
  rootId: string | number
  depth?: number
}>()

const emit = defineEmits<{
  like: [reply: any]
  reply: [payload: { parentId: string | number; atName: string; rootId: string | number }]
  delete: [reply: any]
}>()

const userStore = useUserStore()
const clampedDepth = computed(() => Math.min(props.depth ?? 0, 3))

const canDelete = computed(() => {
  if (!userStore.isLoggedIn || !userStore.user) return false
  return String(props.reply.creator) === String(userStore.user.id)
})

const onReply = () => {
  emit('reply', {
    parentId: props.reply.id,
    atName: props.reply.user?.nickname || '匿名用户',
    rootId: props.rootId
  })
}

const formatTime = (timestamp: number) => {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  if (d.toDateString() === now.toDateString())
    return `今天 ${pad(d.getHours())}:${pad(d.getMinutes())}`
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<style scoped lang="scss">
$accent: #00aeec;
$accent-author: #fb7299;

.reply-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
  &:last-child { border-bottom: none; }

  &.d1 { margin-left: 16px; }
  &.d2 { margin-left: 32px; }
  &.d3 { margin-left: 48px; }
}

.avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fb7299 0%, #00aeec 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  margin-top: 2px;
}

.reply-body { flex: 1; min-width: 0; }

.comment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.username {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  &.author { color: $accent-author; }
  .author-tag {
    font-size: 11px;
    color: $accent-author;
    border: 1px solid $accent-author;
    border-radius: 3px;
    padding: 0 5px;
    line-height: 16px;
  }
}

.reply-at {
  font-size: 12px;
  color: var(--text-tertiary);
  em { color: $accent; font-style: normal; }
}

.comment-text {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.7;
  margin-bottom: 6px;
  word-break: break-word;
}

.comment-footer {
  display: flex;
  align-items: center;
  gap: 14px;
}

.comment-time { font-size: 12px; color: var(--text-tertiary); }

.action-btn {
  font-size: 12px;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
  user-select: none;
  &:hover { color: $accent; }
  &.danger:hover { color: #f53f3f; }
  &.like-btn {
    .like-icon { width: 13px; height: 13px; }
    &.liked { color: $accent; }
  }
}

.nested-replies { margin-top: 4px; }

@media (max-width: 768px) {
  .reply-item {
    &.d1 { margin-left: 10px; }
    &.d2 { margin-left: 20px; }
    &.d3 { margin-left: 28px; }
  }
}
</style>
