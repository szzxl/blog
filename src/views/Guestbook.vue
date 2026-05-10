<template>
  <div class="guestbook">
    <!-- ── Banner ── -->
    <div class="page-banner">
      <div class="banner-mask"></div>
      <div class="banner-content">
        <h1 class="banner-title">留言板</h1>
        <p class="banner-sub">欢迎留下你的足迹</p>
      </div>
    </div>

    <div class="container">
      <!-- 留言表单卡片 -->
      <div class="message-form">
        <div class="form-bar"></div>
        <div class="form-body">
          <h3 class="form-title">
            <span class="title-dot"></span>
            写下你的留言
          </h3>
          <el-form :model="messageForm" label-width="0">
            <el-form-item>
              <el-input
                v-model="messageForm.name"
                placeholder="你的昵称"
                prefix-icon="User"
                :disabled="isLoggedIn"
                clearable
                class="styled-input"
              />
            </el-form-item>
            <el-form-item v-if="!isLoggedIn">
              <el-input
                v-model="messageForm.email"
                placeholder="邮箱（选填）"
                prefix-icon="Message"
                clearable
                class="styled-input"
              />
            </el-form-item>
            <el-form-item>
              <el-input
                v-model="messageForm.content"
                type="textarea"
                :rows="5"
                placeholder="说点什么吧~ 分享你的心情、想法或者祝福..."
                maxlength="500"
                show-word-limit
                class="styled-textarea"
              />
            </el-form-item>

            <!-- 图片上传 - 仅登录用户可见 -->
            <el-form-item v-if="isLoggedIn">
              <div class="upload-section">
                <div class="upload-title">上传图片（最多9张）</div>

                <!-- 图片预览列表 -->
                <div class="image-list" v-if="imageList.length > 0">
                  <div
                    class="image-item"
                    v-for="(image, index) in imageList"
                    :key="index"
                  >
                    <img :src="image.url" alt="预览图">
                    <div class="image-overlay">
                      <el-icon class="preview-icon" @click="previewImage(image.url)">
                        <ZoomIn />
                      </el-icon>
                      <el-icon class="delete-icon" @click="removeImage(index)">
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
                    v-if="imageList.length < 9"
                    @click="triggerUpload"
                  >
                    <el-icon><Plus /></el-icon>
                  </div>
                </div>

                <!-- 初始上传区域 -->
                <div
                  class="upload-area"
                  v-else
                  @click="triggerUpload"
                  @dragover.prevent
                  @drop.prevent="handleDrop"
                >
                  <el-icon class="upload-icon"><Upload /></el-icon>
                  <div class="upload-text">点击或拖拽图片到这里上传</div>
                  <div class="upload-tip">支持 JPG、PNG、GIF，单张不超过 5MB</div>
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

      <!-- 时间轴留言提示（占位区，如后续接入留言列表可在此处渲染） -->
      <div class="timeline-section">
        <div class="timeline-header">
          <span class="timeline-title">留言记录</span>
        </div>
        <div class="timeline-empty">
          <p class="empty-tip">留言提交后将由博主审核显示，感谢你的留言 ✨</p>
        </div>
      </div>
    </div>

    <!-- 图片预览器 -->
    <el-image-viewer
      v-if="showViewer"
      :url-list="imageList.map(img => img.url)"
      :initial-index="imageList.findIndex(img => img.url === previewImageUrl)"
      @close="closeViewer"
      :hide-on-click-modal="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, ZoomIn, Upload } from '@element-plus/icons-vue'
import { uploadImage, submitGuestbookMessage } from '@/api/article'
import { useUserStore } from '@/stores/user'

interface ImageItem {
  url: string
  file?: File
  uploading?: boolean
  progress?: number
}

const userStore = useUserStore()

const messageForm = ref({
  name: '',
  email: '',
  content: ''
})

const imageList = ref<ImageItem[]>([])
const fileInput = ref<HTMLInputElement>()
const submitting = ref(false)
const showViewer = ref(false)
const previewImageUrl = ref('')

// 是否已登录
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 监听登录状态，自动填充昵称
watch(() => userStore.user, (user) => {
  if (user) {
    messageForm.value.name = user.nickname || user.username
  }
}, { immediate: true })

// 初始化时填充用户信息
onMounted(() => {
  if (userStore.user) {
    messageForm.value.name = userStore.user.nickname || userStore.user.username
  }
})

// 触发文件选择
const triggerUpload = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    handleFiles(Array.from(files))
  }
  // 清空 input，允许重复选择同一文件
  target.value = ''
}

// 处理拖拽上传
const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files) {
    handleFiles(Array.from(files))
  }
}

// 处理文件
const handleFiles = (files: File[]) => {
  // 检查数量限制
  const remainingSlots = 9 - imageList.value.length
  if (files.length > remainingSlots) {
    ElMessage.warning(`最多只能上传9张图片，当前还可以上传${remainingSlots}张`)
    files = files.slice(0, remainingSlots)
  }

  files.forEach(file => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      ElMessage.error(`${file.name} 不是图片文件`)
      return
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error(`${file.name} 大小超过 5MB`)
      return
    }

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageItem: ImageItem = {
        url: e.target?.result as string,
        file: file,
        uploading: true,
        progress: 0
      }
      imageList.value.push(imageItem)

      // 上传图片到服务器
      uploadImageToServer(imageItem)
    }
    reader.readAsDataURL(file)
  })
}

// 上传图片到服务器
const uploadImageToServer = async (imageItem: ImageItem) => {
  if (!imageItem.file) return

  try {
    // 调用真实的上传 API
    const response = await uploadImage(imageItem.file)

    // 上传成功，更新图片 URL 为服务器返回的 URL
    // 后端返回的 data 直接就是图片 URL 字符串
    imageItem.url = (response as unknown as string) || imageItem.url
    imageItem.uploading = false
    imageItem.progress = 100

    ElMessage.success('图片上传成功')
  } catch (error) {
    ElMessage.error('图片上传失败，请重试')

    // 上传失败，从列表中移除
    const index = imageList.value.indexOf(imageItem)
    if (index > -1) {
      imageList.value.splice(index, 1)
    }
  }
}

// 删除图片
const removeImage = (index: number) => {
  imageList.value.splice(index, 1)
  ElMessage.success('图片已删除')
}

// 预览图片
const previewImage = (url: string) => {
  previewImageUrl.value = url
  showViewer.value = true
}

// 关闭预览
const closeViewer = () => {
  showViewer.value = false
}

// 提交留言
const submitMessage = async () => {
  if (!messageForm.value.name) {
    ElMessage.warning('请输入昵称')
    return
  }
  if (!messageForm.value.content) {
    ElMessage.warning('请输入留言内容')
    return
  }

  // 检查是否有图片正在上传
  const uploading = imageList.value.some(img => img.uploading)
  if (uploading) {
    ElMessage.warning('图片正在上传中，请稍候...')
    return
  }

  submitting.value = true

  try {
    // 构建请求数据
    const requestData: any = {
      username: messageForm.value.name,
      contact: messageForm.value.email,
      content: messageForm.value.content
    }

    // 仅登录用户传入 images 字段
    if (isLoggedIn.value && imageList.value.length > 0) {
      requestData.images = imageList.value.map(img => img.url)
    }

    // 调用后端 API 提交留言
    await submitGuestbookMessage(requestData)

    ElMessage.success('留言发表成功！')

    // 清空表单（已登录用户保留昵称）
    if (!isLoggedIn.value) {
      messageForm.value.name = ''
    }
    messageForm.value.email = ''
    messageForm.value.content = ''
    imageList.value = []
  } catch (error) {
    ElMessage.error('留言发表失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
// ── Banner ────────────────────────────────────────────
.page-banner {
  position: relative;
  height: 200px;
  background: url('/bg-banner.png') center 30% / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;

  .banner-mask {
    position: absolute;
    inset: 0;
    background: rgba(5, 12, 30, 0.62);
  }

  .banner-content {
    position: relative;
    z-index: 1;
    text-align: center;

    .banner-title {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
      margin: 0 0 8px 0;
      letter-spacing: 0.04em;
    }

    .banner-sub {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.65);
      margin: 0;
      letter-spacing: 0.06em;
    }
  }
}

// ── 页面容器 ──────────────────────────────────────────
.guestbook {
  min-height: calc(100vh - 200px);
  background: var(--bg-primary);
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

// ── 留言表单卡片 ──────────────────────────────────────
.message-form {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  margin-bottom: 48px;
  max-width: 780px;
  transition: box-shadow 0.35s, border-color 0.35s;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    border-color: var(--color-accent);
  }

  // 渐变顶部装饰条
  .form-bar {
    height: 4px;
    background: linear-gradient(90deg, var(--color-accent) 0%, #7b9eff 50%, #a78bfa 100%);
  }

  .form-body {
    padding: 32px 36px 28px;

    .form-title {
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 700;
      color: var(--text-secondary);
      letter-spacing: 0.05em;
      margin: 0 0 24px 0;
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
      margin-bottom: 16px;
    }

    // 输入框圆角美化
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

    // 提交按钮
    .submit-btn {
      width: 100%;
      height: 46px;
      border-radius: 10px;
      background: linear-gradient(90deg, var(--color-accent) 0%, #4d7eff 100%);
      border: none;
      font-family: var(--font-sans);
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #fff;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;

      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(22, 93, 255, 0.32);
      }

      &:active { transform: translateY(0); }
    }

    // 上传区
    .upload-section {
      width: 100%;

      .upload-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-tertiary);
        margin-bottom: 10px;
      }

      .upload-area {
        border: 1px dashed var(--border-color);
        border-radius: 10px;
        padding: 32px 24px;
        text-align: center;
        cursor: pointer;
        background: var(--bg-secondary);
        transition: border-color 0.2s, background 0.2s;

        &:hover {
          border-color: var(--color-accent);
          background: var(--bg-card);

          .upload-icon { color: var(--color-accent); }
          .upload-text { color: var(--text-primary); }
        }

        .upload-icon { font-size: 30px; color: var(--text-tertiary); margin-bottom: 10px; transition: color 0.2s; }
        .upload-text { font-size: 14px; color: var(--text-secondary); margin-bottom: 4px; transition: color 0.2s; }
        .upload-tip { font-size: 12px; color: var(--text-tertiary); }
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
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          transition: border-color 0.2s;

          &:hover {
            border-color: var(--color-accent);
            .image-overlay { opacity: 1; }
          }

          img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

          .image-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            opacity: 0;
            transition: opacity 0.2s;

            :deep(.el-icon) {
              font-size: 18px;
              color: rgba(255,255,255,0.9);
              cursor: pointer;
              transition: transform 0.15s;

              &:hover { transform: scale(1.15); }
            }

            .preview-icon:hover { color: var(--color-accent); }
            .delete-icon:hover { color: #f53f3f; }
          }

          .upload-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 4px;
            background: rgba(10,10,15,0.75);
          }
        }

        .upload-btn {
          position: relative;
          width: 100%;
          padding-bottom: 100%;
          border: 1px dashed var(--border-color);
          border-radius: 10px;
          cursor: pointer;
          background: var(--bg-secondary);
          transition: border-color 0.2s, background 0.2s, color 0.2s;

          &:hover {
            border-color: var(--color-accent);
            background: var(--bg-card);
            :deep(.el-icon) { color: var(--color-accent); }
          }

          :deep(.el-icon) {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 22px;
            color: var(--text-tertiary);
            transition: color 0.2s;
          }
        }
      }
    }
  }
}

// ── 时间轴区域 ────────────────────────────────────────
.timeline-section {
  .timeline-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;

    .timeline-title {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    &::before {
      content: '';
      display: block;
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, var(--color-accent) 0%, #7b9eff 100%);
      border-radius: 2px;
      flex-shrink: 0;
    }
  }

  // 时间轴样式（左侧时间线 + 点，右侧内容卡片）
  .timeline-list {
    position: relative;
    padding-left: 32px;

    // 左侧竖线
    &::before {
      content: '';
      position: absolute;
      left: 10px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, var(--color-accent) 0%, var(--border-color) 100%);
      border-radius: 1px;
    }
  }

  .timeline-item {
    position: relative;
    margin-bottom: 24px;

    // 时间轴圆点
    &::before {
      content: '';
      position: absolute;
      left: -26px;
      top: 14px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--color-accent);
      border: 3px solid var(--bg-primary);
      box-shadow: 0 0 0 2px var(--color-accent);
      z-index: 1;
    }

    .item-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-card);
      padding: 16px 20px;
      box-shadow: var(--shadow-card);
      transition: box-shadow 0.3s, border-color 0.3s;

      &:hover {
        box-shadow: var(--shadow-card-hover);
        border-color: var(--color-accent);
      }

      .item-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;

        .item-user {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .item-time {
          font-size: 12px;
          color: var(--text-tertiary);
          font-variant-numeric: tabular-nums;
        }
      }

      .item-content {
        font-family: var(--font-sans);
        font-size: 14px;
        color: var(--text-secondary);
        line-height: 1.75;
        word-break: break-word;
      }
    }
  }

  .timeline-empty {
    text-align: center;
    padding: 48px 0;

    .empty-tip {
      font-family: var(--font-sans);
      font-size: 14px;
      color: var(--text-tertiary);
      margin: 0;
    }
  }
}

// ── 响应式 ────────────────────────────────────────────
@media (max-width: 640px) {
  .page-banner { height: 160px; }
  .page-banner .banner-content .banner-title { font-size: 1.7rem; }

  .container { padding: 28px 16px 48px; }

  .message-form .form-body {
    padding: 20px 18px;
  }
}
</style>
