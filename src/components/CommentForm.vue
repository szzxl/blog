<template>
  <div class="comment-editor">
    <el-input ref="inputRef" v-model="text" type="textarea" :rows="rows"
      :placeholder="placeholder" maxlength="500" show-word-limit :disabled="submitting" />
    <div class="editor-toolbar">
      <EmojiPicker @select="insertEmoji" />
      <button type="button" :disabled="submitting || items.length >= 9" @click="fileInput?.click()">添加图片</button>
      <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden @change="selectFiles" />
      <el-button v-if="cancelable" :disabled="submitting" size="small" @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" :loading="submitting" :disabled="busy || hasFailed" @click="submit">发布</el-button>
    </div>
    <p v-if="busy" class="upload-status" role="status">图片上传中，请稍候再发布。</p>
    <div v-if="items.length" class="upload-images">
      <div v-for="item in items" :key="item.id" class="upload-item">
        <img :src="item.preview" alt="待发布图片" />
        <span v-if="item.status === 'uploading'">上传中</span>
        <button v-if="item.status === 'failed'" type="button" :disabled="submitting" @click="upload(item)">上传失败，重试</button>
        <button type="button" :disabled="submitting" @click="remove(item)">移除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import type { InputInstance } from 'element-plus'
import { ElMessage } from 'element-plus/es/components/message/index'
import { uploadImage } from '@/api/file'
import { useUserStore } from '@/stores/user'
import { showRequestError } from '@/utils/requestError'
import type { CommentSubmission } from '@/types/comment'
import EmojiPicker from './EmojiPicker.vue'

withDefaults(defineProps<{ submitting: boolean; placeholder?: string; rows?: number; cancelable?: boolean }>(), {
  placeholder: '发一条友善的评论', rows: 3, cancelable: false
})
const emit = defineEmits<{ submit: [data: CommentSubmission]; cancel: [] }>()
const userStore = useUserStore()
const text = ref('')
const inputRef = ref<InputInstance>()
const fileInput = ref<HTMLInputElement>()
interface UploadItem { id: number; file: File; preview: string; url: string; status: 'uploading' | 'ready' | 'failed' }
const items = ref<UploadItem[]>([])
const busy = computed(() => items.value.some(item => item.status === 'uploading'))
const hasFailed = computed(() => items.value.some(item => item.status === 'failed'))
let sequence = 0
let disposed = false
const remove = (item: UploadItem) => {
  items.value = items.value.filter(value => value.id !== item.id)
  URL.revokeObjectURL(item.preview)
}
const reset = () => {
  items.value.forEach(item => URL.revokeObjectURL(item.preview))
  items.value = []
  text.value = ''
}
const upload = async (item: UploadItem) => {
  item.status = 'uploading'
  const token = userStore.token
  const current = () => !disposed && token === userStore.token && items.value.some(value => value.id === item.id)
  try {
    const url: unknown = await uploadImage(item.file)
    if (!current()) return
    if (typeof url !== 'string' || !/^(https?:\/\/|\/)[^\s]+$/i.test(url)) throw new Error('上传响应缺少有效图片地址')
    item.url = url
    item.status = 'ready'
  } catch (error) {
    if (!current()) return
    item.status = 'failed'
    showRequestError(error, '图片上传失败，请重试')
  }
}
const selectFiles = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = ''
  if (!userStore.isLoggedIn) return
  for (const file of files) {
    if (items.value.length >= 9) { ElMessage.warning('最多只能上传 9 张图片'); break }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      ElMessage.warning('请选择不超过 5MB 的 JPG、PNG、WebP 或 GIF 图片')
      continue
    }
    items.value.push({ id: ++sequence, file, preview: URL.createObjectURL(file), url: '', status: 'uploading' })
    void upload(items.value[items.value.length - 1]!)
  }
}
const insertEmoji = async (emoji: string) => {
  const textarea = inputRef.value?.textarea
  const start = textarea?.selectionStart ?? text.value.length
  const end = textarea?.selectionEnd ?? start
  if (text.value.length - (end - start) + emoji.length > 500) return
  text.value = text.value.slice(0, start) + emoji + text.value.slice(end)
  await nextTick()
  textarea?.focus()
  textarea?.setSelectionRange(start + emoji.length, start + emoji.length)
}
const submit = () => {
  if (busy.value || hasFailed.value) return
  const content = text.value.trim()
  if (!content || content.length > 500) { ElMessage.warning('请输入 1 到 500 个字符的内容'); return }
  emit('submit', { content, images: items.value.map(item => item.url) })
}
const acknowledge = (data: CommentSubmission) => {
  if (text.value.trim() === data.content) text.value = ''
  for (const item of [...items.value]) if (data.images.includes(item.url)) remove(item)
}
watch(() => userStore.token, reset)
onUnmounted(() => { disposed = true; reset() })
defineExpose({ acknowledge })
</script>

<style scoped lang="scss">
.editor-toolbar { display: flex; align-items: center; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
.editor-toolbar button, .upload-item button { cursor: pointer; color: var(--text-secondary); }
.upload-status { color: var(--text-secondary); font-size: 12px; }
.upload-images { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
.upload-item { display: grid; gap: 4px; width: 100px; font-size: 12px; }
.upload-item img { width: 100px; height: 80px; object-fit: cover; border-radius: 6px; }
</style>
