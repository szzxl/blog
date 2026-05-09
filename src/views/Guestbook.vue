<template>
  <div class="guestbook">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>留言板</h1>
        <p>留下你的足迹，分享你的心情~</p>
      </div>
      
      <!-- 发表留言 -->
      <div class="message-form card">
        <h3 class="form-title">写下你的留言</h3>
        <el-form :model="messageForm" label-width="0">
          <el-form-item>
            <el-input 
              v-model="messageForm.name" 
              placeholder="你的昵称"
              prefix-icon="User"
              :disabled="isLoggedIn"
              clearable
            />
          </el-form-item>
          <el-form-item v-if="!isLoggedIn">
            <el-input 
              v-model="messageForm.email" 
              placeholder="邮箱（选填）"
              prefix-icon="Message"
              clearable
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
                <div class="upload-tip">支持 JPG、PNG、GIF 格式，单张不超过 5MB</div>
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
.guestbook {
  min-height: calc(100vh - 200px);
  padding: 104px 0 64px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
}

// ── 页头 ──────────────────────────────────────────────
.page-header {
  border-left: 4px solid var(--color-accent);
  padding-left: 20px;
  margin-bottom: 40px;

  h1 {
    font-family: var(--font-serif);
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: var(--text-tertiary);
    margin: 0;
  }
}

// ── 留言表单卡片（玻璃态）────────────────────────────
.message-form {
  background: var(--bg-card);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 32px;
  margin-bottom: 36px;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.35s ease, border-color 0.35s ease;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    border-color: var(--color-accent);
  }

  // 顶部小标题（玉石条 + 大写字距）
  .form-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-tertiary);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 22px 0;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '';
      display: block;
      width: 3px;
      height: 14px;
      background: var(--gradient-accent);
      border-radius: 2px;
      flex-shrink: 0;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  // 提交按钮：宽 + accent 渐变 + hover 加深
  .submit-btn {
    width: 100%;
    height: 44px;
    border-radius: var(--radius-btn);
    background: var(--gradient-accent);
    border: none;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      background: var(--color-accent-hover);
      transform: translateY(-1px);
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
    }

    &:active {
      transform: translateY(0);
    }
  }

  // 上传区
  .upload-section {
    width: 100%;

    .upload-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-tertiary);
      letter-spacing: 0.04em;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .upload-area {
      border: 1px dashed var(--border-color);
      border-radius: var(--radius-btn);
      padding: 36px 24px;
      text-align: center;
      cursor: pointer;
      background: var(--bg-secondary);
      transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;

      &:hover {
        border-color: var(--color-accent);
        background: var(--bg-card);

        .upload-icon { color: var(--color-accent); }
        .upload-text { color: var(--text-primary); }
      }

      .upload-icon {
        font-size: 32px;
        color: var(--text-tertiary);
        margin-bottom: 12px;
        transition: color 0.2s ease;
      }

      .upload-text {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 6px;
        transition: color 0.2s ease;
      }

      .upload-tip {
        font-size: 12px;
        color: var(--text-tertiary);
        letter-spacing: 0.02em;
      }
    }

    .image-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
      gap: 10px;

      .image-item {
        position: relative;
        width: 100%;
        padding-bottom: 100%;
        border-radius: var(--radius-btn);
        overflow: hidden;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        transition: border-color 0.2s ease;

        &:hover {
          border-color: var(--color-accent);
          .image-overlay { opacity: 1; }
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
          background: linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.32) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          opacity: 0;
          transition: opacity 0.2s ease;

          :deep(.el-icon) {
            font-size: 20px;
            color: rgba(255, 255, 255, 0.92);
            cursor: pointer;
            transition: color 0.15s ease, transform 0.15s ease;

            &:hover { transform: scale(1.12); }
          }

          .preview-icon:hover { color: var(--color-accent); }
          .delete-icon:hover { color: var(--color-danger); }
        }

        .upload-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 6px;
          background: rgba(10, 10, 15, 0.78);
        }
      }

      .upload-btn {
        position: relative;
        width: 100%;
        padding-bottom: 100%;
        border: 1px dashed var(--border-color);
        border-radius: var(--radius-btn);
        cursor: pointer;
        background: var(--bg-secondary);
        transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;

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
          font-size: 24px;
          color: var(--text-tertiary);
          transition: color 0.2s ease;
        }
      }
    }
  }
}

@media (max-width: 640px) {
  .guestbook { padding: 28px 0 48px; }

  .page-header {
    margin-bottom: 28px;
    h1 { font-size: 26px; }
  }

  .message-form {
    padding: 20px;
  }
}
</style>
