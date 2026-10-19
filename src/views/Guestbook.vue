<template>
  <div class="guestbook">
    <!-- Banner -->
    <header class="page-header container">
      <h1>留言板</h1>
      <p>有问题或建议可以写在这里。留言审核通过后公开展示。</p>
    </header>

    <div class="container">
      <div class="layout">
        <!-- 左栏：留言表单（sticky） -->
        <aside class="form-aside">
          <div class="message-form">
            <div class="form-bar"></div>
            <div class="form-body">
              <h3 class="form-title">
                <span class="title-dot"></span>
                写下你的留言
              </h3>
              <el-form :model="messageForm" label-width="0">
                <el-form-item label="昵称（必填）" label-position="top">
                  <el-input
                    v-model="messageForm.name"
                    placeholder="你的昵称"
                    :prefix-icon="User"
                    :disabled="userStore.isLoggedIn"
                    clearable
                  />
                </el-form-item>
                <el-form-item
                  v-if="!userStore.isLoggedIn"
                  label="联系邮箱（选填，不公开）"
                  label-position="top"
                >
                  <el-input
                    v-model="messageForm.email"
                    placeholder="邮箱（选填）"
                    :prefix-icon="Message"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="留言内容" label-position="top">
                  <el-input
                    v-model="messageForm.content"
                    type="textarea"
                    :rows="5"
                    placeholder="分享你的想法，或留下一个问题。"
                    maxlength="500"
                    show-word-limit
                  />
                </el-form-item>

                <!-- 图片上传 - 仅登录用户可见 -->
                <el-form-item v-if="userStore.isLoggedIn">
                  <div class="upload-section">
                    <div class="upload-title">上传图片（最多9张）</div>
                    <div class="image-list" v-if="imageList.length > 0">
                      <div class="image-item" v-for="(image, index) in imageList" :key="image.id">
                        <img :src="image.url" alt="预览图" />
                        <div class="image-overlay">
                          <el-icon class="preview-icon" @click="previewImage(image.url)"
                            ><ZoomIn
                          /></el-icon>
                          <el-icon class="delete-icon" @click="removeImage(index)"
                            ><Delete
                          /></el-icon>
                        </div>
                        <div class="upload-progress" v-if="image.uploading">
                          <el-progress
                            :percentage="image.progress"
                            :stroke-width="3"
                            :show-text="false"
                          />
                        </div>
                      </div>
                      <div class="upload-btn" v-if="imageList.length < 9" @click="triggerUpload">
                        <el-icon><Plus /></el-icon>
                      </div>
                    </div>
                    <div
                      class="upload-area"
                      v-else
                      @click="triggerUpload"
                      @dragover.prevent
                      @drop.prevent="handleDrop"
                    >
                      <el-icon class="upload-icon"><Upload /></el-icon>
                      <div class="upload-text">点击或拖拽图片上传</div>
                      <div class="upload-tip">JPG · PNG · GIF，单张 ≤ 5MB</div>
                    </div>
                    <input
                      ref="fileInput"
                      type="file"
                      accept="image/*"
                      multiple
                      style="display: none"
                      @change="handleFileChange"
                    />
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    class="submit-btn"
                    :loading="submitting"
                    @click="submitMessage"
                  >
                    发表留言
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </aside>

        <!-- 右栏：留言列表 -->
        <main class="list-main">
          <div class="list-header">
            <div class="list-title-wrap">
              <span class="list-title">留言记录</span>
              <span class="list-count" v-if="total > 0">{{ total }}</span>
            </div>
          </div>

          <!-- 骨架屏 -->
          <div v-if="messagesLoading" class="skeleton-list">
            <div class="skeleton-item" v-for="n in 4" :key="n">
              <div class="skeleton-avatar"></div>
              <div class="skeleton-body">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line medium"></div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else-if="messages.length === 0" class="empty-state">
            <div class="empty-icon">💬</div>
            <p class="empty-title">暂无留言</p>
            <p class="empty-desc">留言提交后将由博主审核，审核通过后显示在这里</p>
          </div>

          <!-- 留言卡片列表 -->
          <div v-else class="msg-list">
            <div class="msg-card" v-for="msg in messages" :key="msg.id">
              <div class="card-avatar" :style="{ background: getAvatarColor(msg.username) }">
                {{ msg.username?.[0]?.toUpperCase() || '?' }}
              </div>
              <div class="card-body">
                <div class="card-header">
                  <span class="card-name">{{ msg.username }}</span>
                  <span class="card-time">{{ msg.createTime }}</span>
                </div>
                <div class="card-content">{{ msg.content }}</div>
                <div class="card-images" v-if="msg.images && msg.images.length">
                  <img
                    v-for="(img, i) in msg.images"
                    :key="i"
                    :src="img"
                    class="card-img"
                    @click="previewMsgImage(msg.images, i)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="list-pagination" v-if="total > pageSize">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="total"
              layout="prev, pager, next"
              @current-change="fetchMessages"
            />
          </div>
        </main>
      </div>
    </div>

    <el-image-viewer
      v-if="showViewer"
      :url-list="viewerUrls"
      :initial-index="viewerIndex"
      @close="closeViewer"
      :hide-on-click-modal="true"
    />
  </div>
</template>

<script setup lang="ts">
import { showRequestError } from '@/utils/requestError'

import { ref, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus/es/components/message/index'
import { Plus, Delete, ZoomIn, Upload, User, Message } from '@element-plus/icons-vue'
import { uploadImage } from '@/api/file'
import { submitGuestbookMessage, getApprovedGuestbookMessages } from '@/api/guestbook'
import { useUserStore } from '@/stores/user'
import { createLatestRequest } from '@/utils/latestRequest'

interface ImageItem {
  id: number
  previewUrl: string
  url: string
  file?: File
  uploading?: boolean
  progress?: number
}

interface GuestbookMessage {
  id: number | string
  username: string
  content: string
  createTime: string
  images?: string[]
}

const userStore = useUserStore()

const AVATAR_COLORS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fccb90,#d57eeb)',
  'linear-gradient(135deg,#e0c3fc,#8ec5fc)',
]
const getAvatarColor = (name: string) => {
  let hash = 0
  for (let i = 0; i < (name?.length || 0); i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// 留言列表
const messages = ref<GuestbookMessage[]>([])
const listRequest = createLatestRequest()
let disposed = false
let imageId = 0
const messagesLoading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = 10

const parseImages = (images: any): string[] => {
  if (!images) return []
  if (Array.isArray(images)) return images.filter(Boolean)
  if (typeof images === 'string') {
    try { return (JSON.parse(images) as string[]).filter(Boolean) } catch { return [] }
  }
  return []
}

const fetchMessages = async () => {
  if (disposed) return
  const requestId = listRequest.next()
  messagesLoading.value = true
  try {
    const res: any = await getApprovedGuestbookMessages({ pageNo: currentPage.value, pageSize: pageSize })
    if (!listRequest.isCurrent(requestId)) return
    const lastPage = Math.max(1, Math.ceil((res.total || 0) / pageSize))
    if (currentPage.value > lastPage) { currentPage.value = lastPage; return fetchMessages() }
    const raw = res.list || res.records || res || []
    messages.value = raw.map((msg: any) => ({ ...msg, images: parseImages(msg.images) }))
    total.value = res.total || messages.value.length
  } catch {
    // 静默失败
  } finally {
    if (listRequest.isCurrent(requestId)) messagesLoading.value = false
  }
}

onMounted(fetchMessages)

const messageForm = ref({ name: '', email: '', content: '' })
const imageList = ref<ImageItem[]>([])
const fileInput = ref<HTMLInputElement>()
const submitting = ref(false)
const showViewer = ref(false)
const viewerUrls = ref<string[]>([])
const viewerIndex = ref(0)

watch(() => userStore.user, (user) => {
  if (user) messageForm.value.name = user.nickname || user.username
}, { immediate: true })

const triggerUpload = () => fileInput.value?.click()

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) handleFiles(Array.from(target.files))
  target.value = ''
}

const handleDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files) handleFiles(Array.from(event.dataTransfer.files))
}

const releaseImage = (item: ImageItem) => URL.revokeObjectURL(item.previewUrl)
const handleFiles = (files: File[]) => {
  if (disposed || !userStore.isLoggedIn) return
  for (const file of files) {
    if (imageList.value.length >= 9) { ElMessage.warning('最多只能上传9张图片'); break }
    if (!file.type.startsWith('image/')) { ElMessage.error(`${file.name} 不是图片`); continue }
    if (file.size > 5 * 1024 * 1024) { ElMessage.error(`${file.name} 超过 5MB`); continue }
    const previewUrl = URL.createObjectURL(file)
    // 立即占用名额，避免连续选图时读取回调尚未完成。
    imageList.value.push({ id: ++imageId, url: previewUrl, previewUrl, file, uploading: true, progress: 0 })
    const item = imageList.value[imageList.value.length - 1]!
    void uploadImageToServer(item)
  }
}

const uploadImageToServer = async (item: ImageItem) => {
  if (!item.file) return
  try {
    const res = await uploadImage(item.file)
    if (disposed || !imageList.value.some(image => image.id === item.id)) return
    if (typeof res !== 'string' || !res) throw new Error('上传响应缺少图片地址')
    item.url = res
    item.uploading = false
    item.progress = 100
  } catch (error) {
    if (disposed || !imageList.value.some(image => image.id === item.id)) return
    showRequestError(error, '图片上传失败，请重试')
    removeImage(imageList.value.findIndex(image => image.id === item.id))
  }
}

const removeImage = (index: number) => {
  const item = imageList.value[index]
  if (!item) return
  releaseImage(item)
  imageList.value.splice(index, 1)
}

onUnmounted(() => {
  disposed = true
  listRequest.invalidate()
  imageList.value.forEach(releaseImage)
})

const previewImage = (url: string) => {
  viewerUrls.value = imageList.value.map(img => img.url)
  viewerIndex.value = imageList.value.findIndex(img => img.url === url)
  showViewer.value = true
}

const previewMsgImage = (imgs: string[], index: number) => {
  viewerUrls.value = imgs
  viewerIndex.value = index
  showViewer.value = true
}

const closeViewer = () => { showViewer.value = false }

const submitMessage = async () => {
  if (submitting.value || disposed) return
  if (!messageForm.value.name.trim()) { ElMessage.warning('请输入昵称'); return }
  if (!messageForm.value.content.trim()) { ElMessage.warning('请输入留言内容'); return }
  if (imageList.value.some(img => img.uploading)) { ElMessage.warning('图片上传中，请稍候...'); return }

  const snapshot = { ...messageForm.value }
  const submittedImages = imageList.value.map(img => ({ id: img.id, url: img.url }))
  submitting.value = true
  try {
    const data = { username: snapshot.name.trim(), contact: snapshot.email.trim(), content: snapshot.content.trim(),
      images: userStore.isLoggedIn ? submittedImages.map(img => img.url) : [] }
    await submitGuestbookMessage(data)
    if (disposed) return
    ElMessage.success('留言发表成功，等待审核～')
    if (!userStore.isLoggedIn && messageForm.value.name === snapshot.name) messageForm.value.name = ''
    if (messageForm.value.email === snapshot.email) messageForm.value.email = ''
    if (messageForm.value.content === snapshot.content) messageForm.value.content = ''
    const submittedIds = new Set(submittedImages.map(img => img.id))
    imageList.value.filter(img => submittedIds.has(img.id)).forEach(releaseImage)
    imageList.value = imageList.value.filter(img => !submittedIds.has(img.id))
  } catch (error) {
    showRequestError(error, '留言发表失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
// ── Banner ────────────────────────────────────────────


// ── 容器 ──────────────────────────────────────────────
.guestbook {
  min-height: calc(100vh - 220px);
  background: var(--bg-primary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

// ── 双栏布局 ──────────────────────────────────────────
.layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 40px;
  align-items: start;
}

// ── 左侧表单（sticky）────────────────────────────────
.form-aside {
  position: sticky;
  top: 80px;
}

.message-form {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition:
    box-shadow 0.3s,
    border-color 0.3s;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    border-color: var(--color-accent);
  }

  .form-bar {
    height: 4px;
    background: linear-gradient(90deg, var(--color-accent) 0%, #7b9eff 50%, #a78bfa 100%);
  }

  .form-body {
    padding: 28px 28px 24px;

    .form-title {
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 22px;
      display: flex;
      align-items: center;
      gap: 10px;

      .title-dot {
        display: block;
        width: 4px;
        height: 16px;
        background: linear-gradient(180deg, var(--color-accent) 0%, #7b9eff 100%);
        border-radius: 2px;
        flex-shrink: 0;
      }
    }

    :deep(.el-form-item) {
      margin-bottom: 14px;
    }

    :deep(.el-input__wrapper) {
      border-radius: 10px;
      background: var(--bg-secondary);
      box-shadow: 0 0 0 1px var(--border-color) inset;
      transition: box-shadow 0.2s;

      &:hover,
      &.is-focus {
        box-shadow: 0 0 0 1px var(--color-accent) inset;
      }
    }

    :deep(.el-textarea__inner) {
      border-radius: 10px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      font-family: var(--font-sans);
      line-height: 1.75;
      resize: vertical;
      transition: border-color 0.2s;

      &:focus {
        border-color: var(--color-accent);
      }
    }

    .submit-btn {
      width: 100%;
      height: 44px;
      border-radius: 10px;
      background: linear-gradient(90deg, var(--color-accent) 0%, #4d7eff 100%);
      border: none;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #fff;
      transition:
        opacity 0.2s,
        transform 0.2s,
        box-shadow 0.2s;
      box-shadow: 0 4px 16px rgba(22, 93, 255, 0.28);

      &:hover {
        opacity: 0.92;
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(22, 93, 255, 0.36);
      }
      &:active {
        transform: translateY(0);
      }
    }

    // 上传区
    .upload-section {
      width: 100%;

      .upload-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-tertiary);
        margin-bottom: 8px;
      }

      .upload-area {
        border: 1px dashed var(--border-color);
        border-radius: 10px;
        padding: 24px;
        text-align: center;
        cursor: pointer;
        background: var(--bg-secondary);
        transition:
          border-color 0.2s,
          background 0.2s;

        &:hover {
          border-color: var(--color-accent);
          background: var(--bg-card);
          .upload-icon {
            color: var(--color-accent);
          }
        }

        .upload-icon {
          font-size: 26px;
          color: var(--text-tertiary);
          margin-bottom: 8px;
          transition: color 0.2s;
        }
        .upload-text {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 2px;
        }
        .upload-tip {
          font-size: 11px;
          color: var(--text-tertiary);
        }
      }

      .image-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 8px;

        .image-item {
          position: relative;
          width: 100%;
          padding-bottom: 100%;
          border-radius: 8px;
          overflow: hidden;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);

          &:hover .image-overlay {
            opacity: 1;
          }

          img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            opacity: 0;
            transition: opacity 0.2s;

            :deep(.el-icon) {
              font-size: 16px;
              color: #fff;
              cursor: pointer;
              &:hover {
                transform: scale(1.15);
              }
            }
            .delete-icon:hover {
              color: #f53f3f;
            }
          }

          .upload-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 3px;
            background: rgba(0, 0, 0, 0.6);
          }
        }

        .upload-btn {
          position: relative;
          width: 100%;
          padding-bottom: 100%;
          border: 1px dashed var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          background: var(--bg-secondary);
          transition:
            border-color 0.2s,
            background 0.2s;

          &:hover {
            border-color: var(--color-accent);
            :deep(.el-icon) {
              color: var(--color-accent);
            }
          }

          :deep(.el-icon) {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 20px;
            color: var(--text-tertiary);
            transition: color 0.2s;
          }
        }
      }
    }
  }
}

// ── 右侧列表 ──────────────────────────────────────────
.list-main {
  min-width: 0;
}

.list-header {
  margin-bottom: 24px;

  .list-title-wrap {
    display: flex;
    align-items: center;
    gap: 10px;

    &::before {
      content: '';
      display: block;
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, var(--color-accent) 0%, #7b9eff 100%);
      border-radius: 2px;
    }
  }

  .list-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .list-count {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-accent);
    background: rgba(22, 93, 255, 0.1);
    border-radius: 20px;
    padding: 2px 10px;
    line-height: 1.6;
  }
}

// ── 骨架屏 ────────────────────────────────────────────
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-item {
  display: flex;
  gap: 14px;
  padding: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
}

.skeleton-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--border-color);
  flex-shrink: 0;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 4px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: var(--border-color);
  animation: skeleton-pulse 1.5s ease-in-out infinite;

  &.short {
    width: 30%;
  }
  &.medium {
    width: 60%;
  }
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}

// ── 空状态 ────────────────────────────────────────────
.empty-state {
  text-align: center;
  padding: 64px 0;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.6;
  }

  .empty-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-secondary);
    margin: 0 0 8px;
  }

  .empty-desc {
    font-size: 13px;
    color: var(--text-tertiary);
    margin: 0;
  }
}

// ── 留言卡片 ──────────────────────────────────────────
.msg-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.msg-card {
  display: flex;
  gap: 14px;
  padding: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition:
    box-shadow 0.3s,
    border-color 0.3s,
    transform 0.3s;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    border-color: var(--color-accent);
    transform: translateY(-2px);
  }

  .card-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    letter-spacing: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .card-body {
    flex: 1;
    min-width: 0;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      gap: 8px;

      .card-name {
        font-family: var(--font-display);
        font-size: 14px;
        font-weight: 700;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .card-time {
        font-size: 12px;
        color: var(--text-tertiary);
        white-space: nowrap;
        flex-shrink: 0;
      }
    }

    .card-content {
      font-family: var(--font-sans);
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.75;
      word-break: break-word;
    }

    .card-images {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;

      .card-img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
        cursor: pointer;
        border: 1px solid var(--border-color);
        transition:
          opacity 0.2s,
          transform 0.2s;

        &:hover {
          opacity: 0.88;
          transform: scale(1.03);
        }
      }
    }
  }
}

.list-pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

// ── 响应式 ────────────────────────────────────────────
@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .form-aside {
    position: static;
  }
}

@media (max-width: 640px) {
  .page-banner {
    height: 170px;
  }
  .page-banner .banner-content .banner-title {
    font-size: 1.8rem;
  }
  .container {
    padding: 24px 16px 48px;
  }
  .message-form .form-body {
    padding: 20px 18px 16px;
  }
}

.container {
  width: 100%;
  max-width: none;
  padding: 0 clamp(24px, 2vw, 32px) 50px;
}
.page-header.container {
  padding-top: 28px;
  padding-bottom: 24px;
  margin-bottom: 28px;
  width: calc(100% - clamp(48px, 4vw, 64px));
  padding-inline: 0;
}
.page-header h1 {
  font: 500 34px/1.4 var(--font-serif);
}
.page-header p {
  font-size: 14px;
}
.form-aside {
  top: 100px;
}
.layout {
  grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
}
.message-form {
  border-radius: 5px;
  box-shadow: none;
}
.message-form:hover {
  box-shadow: none;
  border-color: var(--border-color);
}
.form-bar,
.title-dot {
  display: none;
}
.form-body {
  padding: 26px;
}
.form-title {
  font: 500 24px var(--font-serif);
}
.submit-btn {
  background: var(--color-accent);
  border-color: var(--color-accent);
  border-radius: 4px;
}
.upload-area {
  border-radius: 4px;
}
.msg-card {
  box-shadow: none;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--border-color);
  border-radius: 0;
  padding: 10px 0 26px;
}
.msg-card:hover {
  box-shadow: none;
  transform: none;
}
.card-name {
  font-size: 14px;
}
.card-time {
  font-size: 11px;
  color: var(--text-tertiary);
}
.card-content {
  font-size: 14px;
  line-height: 1.9;
  overflow-wrap: anywhere;
}
.list-title {
  font: 24px var(--font-serif);
}
.list-count {
  font-size: 12px;
  background: var(--bg-soft);
  color: var(--color-accent);
}
.empty-icon {
  display: none;
}
.list-main {
  min-width: 0;
}
@media (max-width: 760px) {
  .container {
    padding-inline: 16px;
  }
  .page-header.container {
    width: calc(100% - 32px);
    padding-top: 22px;
    padding-inline: 0;
  }
  .page-header h1 {
    font-size: 29px;
  }
  .layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 30px;
  }
  .form-aside {
    position: static;
  }
  .form-body {
    padding: 22px 20px;
  }
  .msg-card {
    gap: 12px;
  }
  .card-header {
    flex-wrap: wrap;
    gap: 6px;
  }
  .card-body {
    min-width: 0;
  }
}

.message-form .form-body .submit-btn {
  background: var(--color-accent);
  background-image: none;
  border-color: var(--color-accent);
  border-radius: 4px;
  box-shadow: none;
  color: var(--bg-card);
  font-size: 14px;
}
.message-form .form-body .form-title { font: 500 23px var(--font-serif); }
.message-form .form-title::before, .message-form .form-body .form-title .title-dot { display: none; }
</style>
