<template>
  <div class="guestbook">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-icon">💌</div>
        <div class="header-text">
          <h1>留言板</h1>
          <p>留下你的足迹，分享你的心情~</p>
        </div>
      </div>
      
      <!-- 发表留言 -->
      <div class="message-form card">
        <h3 class="form-title">✨ 写下你的留言</h3>
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
          
          <!-- 未登录提示 -->
          <el-form-item v-if="!isLoggedIn">
            <div class="login-tip">
              <span class="tip-icon">💡</span>
              <span class="tip-text">
                <router-link to="/login" class="login-link">登录</router-link>
                后可以上传图片哦~
              </span>
            </div>
          </el-form-item>
          
          <!-- 图片上传 - 仅登录用户可见 -->
          <el-form-item v-if="isLoggedIn">
            <div class="upload-section">
              <div class="upload-title">
                <span class="icon">📷</span>
                上传图片（最多9张）
              </div>
              
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
              <span class="btn-icon">💕</span>
              发表留言
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 留言记录 -->
      <div class="message-list">
        <h3 class="list-title">💬 留言记录</h3>
        
        <!-- 留言组 1 -->
        <div class="message-group">
          <!-- 主留言 -->
          <div class="message-item">
            <img src="/web/default-avatar.svg" alt="头像" class="msg-avatar">
            <div class="msg-right">
              <div class="msg-header">
                <span class="msg-user">访客A</span>
                <span class="msg-time">2024-01-03 15:30</span>
              </div>
              <div class="msg-text">网站做得很漂亮，喜欢这个粉色系的设计~ 💕</div>
            </div>
          </div>
          
          <!-- 回复列表 -->
          <div class="reply-list">
            <div class="reply-item">
              <img src="/web/default-avatar.svg" alt="头像" class="reply-avatar">
              <div class="reply-right">
                <div class="reply-header">
                  <span class="reply-user author">博主</span>
                  <span class="reply-time">15:45</span>
                </div>
                <div class="reply-text"><span class="mention">@访客A</span> 谢谢喜欢~ 😊</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 留言组 2 -->
        <div class="message-group">
          <div class="message-item">
            <img src="/web/default-avatar.svg" alt="头像" class="msg-avatar">
            <div class="msg-right">
              <div class="msg-header">
                <span class="msg-user">小明</span>
                <span class="msg-time">2024-01-02 20:15</span>
              </div>
              <div class="msg-text">路过留个脚印，祝博主越来越好！✨</div>
            </div>
          </div>
          
          <div class="reply-list">
            <div class="reply-item">
              <img src="/web/default-avatar.svg" alt="头像" class="reply-avatar">
              <div class="reply-right">
                <div class="reply-header">
                  <span class="reply-user author">博主</span>
                  <span class="reply-time">20:30</span>
                </div>
                <div class="reply-text"><span class="mention">@小明</span> 谢谢支持！💕</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 留言组 3 -->
        <div class="message-group">
          <div class="message-item">
            <img src="/web/default-avatar.svg" alt="头像" class="msg-avatar">
            <div class="msg-right">
              <div class="msg-header">
                <span class="msg-user">小红</span>
                <span class="msg-time">2024-01-01 12:00</span>
              </div>
              <div class="msg-text">第一次来访，感觉这个博客很温馨！🌸</div>
            </div>
          </div>
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
    imageItem.url = response || imageItem.url
    imageItem.uploading = false
    imageItem.progress = 100
    
    ElMessage.success('图片上传成功')
  } catch (error) {
    console.error('图片上传失败:', error)
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
    
    ElMessage.success('留言发表成功！ 🌸')
    
    // 清空表单（已登录用户保留昵称）
    if (!isLoggedIn.value) {
      messageForm.value.name = ''
    }
    messageForm.value.email = ''
    messageForm.value.content = ''
    imageList.value = []
  } catch (error) {
    console.error('留言发表失败:', error)
    ElMessage.error('留言发表失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.guestbook {
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
    animation: bounce 2s ease-in-out infinite;
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

.message-form {
  padding: 35px;
  margin-bottom: 40px;
  
  .form-title {
    font-size: 24px;
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 25px 0;
    font-weight: 700;
  }
  
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .el-input {
    :deep(.el-input__wrapper) {
      padding: 12px 18px;
      border-radius: 15px;
      box-shadow: 0 2px 12px rgba(252, 182, 159, 0.1);
      border: 2px solid rgba(255, 182, 193, 0.2);
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 4px 20px rgba(252, 182, 159, 0.15);
        border-color: rgba(255, 182, 193, 0.3);
      }
      
      &.is-focus {
        border-color: #ff9a9e;
        box-shadow: 0 4px 20px rgba(255, 154, 158, 0.25);
      }
    }
    
    :deep(.el-input__prefix) {
      color: #ff9a9e;
    }
  }
  
  .el-textarea {
    :deep(.el-textarea__inner) {
      padding: 15px;
      border-radius: 15px;
      box-shadow: 0 2px 12px rgba(252, 182, 159, 0.1);
      border: 2px solid rgba(255, 182, 193, 0.2);
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 4px 20px rgba(252, 182, 159, 0.15);
        border-color: rgba(255, 182, 193, 0.3);
      }
      
      &:focus {
        border-color: #ff9a9e;
        box-shadow: 0 4px 20px rgba(255, 154, 158, 0.25);
      }
    }
  }
  
  .submit-btn {
    width: 100%;
    height: 48px;
    border-radius: 24px;
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    border: none;
    font-size: 16px;
    font-weight: 700;
    box-shadow: 0 8px 25px rgba(255, 154, 158, 0.4);
    transition: all 0.3s;
    
    .btn-icon {
      margin-right: 8px;
      font-size: 18px;
    }
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(255, 154, 158, 0.5);
    }
  }
  
  .login-tip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px 20px;
    background: linear-gradient(135deg, rgba(255, 154, 158, 0.08) 0%, rgba(254, 207, 239, 0.08) 100%);
    border-radius: 15px;
    border: 2px solid rgba(255, 182, 193, 0.2);
    
    .tip-icon {
      font-size: 20px;
    }
    
    .tip-text {
      font-size: 14px;
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
  
  .upload-section {
    width: 100%;
    
    .upload-title {
      font-size: 15px;
      color: #666;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      
      .icon {
        font-size: 18px;
      }
    }
    
    .upload-area {
      border: 2px dashed rgba(255, 182, 193, 0.4);
      border-radius: 15px;
      padding: 40px;
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
        font-size: 48px;
        color: #ff9a9e;
        margin-bottom: 15px;
      }
      
      .upload-text {
        font-size: 16px;
        color: #666;
        margin-bottom: 8px;
        font-weight: 600;
      }
      
      .upload-tip {
        font-size: 13px;
        color: #999;
      }
    }
    
    .image-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
      
      .image-item {
        position: relative;
        width: 100%;
        padding-bottom: 100%;
        border-radius: 12px;
        overflow: hidden;
        background: #f5f5f5;
        box-shadow: 0 2px 12px rgba(252, 182, 159, 0.15);
        transition: all 0.3s;
        
        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(255, 154, 158, 0.25);
          
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
          gap: 15px;
          opacity: 0;
          transition: opacity 0.3s;
          
          .el-icon {
            font-size: 24px;
            color: #fff;
            cursor: pointer;
            transition: all 0.3s;
            
            &:hover {
              transform: scale(1.2);
            }
            
            &.delete-icon:hover {
              color: #ff6b6b;
            }
          }
        }
        
        .upload-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 8px;
          background: rgba(255, 255, 255, 0.95);
        }
      }
      
      .upload-btn {
        position: relative;
        width: 100%;
        padding-bottom: 100%;
        border: 2px dashed rgba(255, 182, 193, 0.4);
        border-radius: 12px;
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
          font-size: 32px;
          color: #ff9a9e;
        }
      }
    }
  }
}

.message-list {
  .list-title {
    font-size: 24px;
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 25px 0;
    font-weight: 700;
  }
  
  .message-group {
    margin-bottom: 30px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .message-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 15px;
      
      .msg-avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 2px 8px rgba(255, 154, 158, 0.2);
        flex-shrink: 0;
      }
      
      .msg-right {
        flex: 1;
        
        .msg-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          
          .msg-user {
            font-size: 15px;
            font-weight: 700;
            color: #5a5a5a;
          }
          
          .msg-time {
            font-size: 13px;
            color: #999;
          }
        }
        
        .msg-text {
          font-size: 15px;
          line-height: 1.7;
          color: #666;
          margin-bottom: 8px;
        }
        
        .msg-actions {
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
          }
        }
      }
    }
    
    /* 留言板回复样式 - 简单2层 */
    .reply-list {
      margin-left: 54px;
      margin-top: 12px;
      
      .reply-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 12px;
        padding: 10px;
        background: #f9f9f9;
        border-radius: 8px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .reply-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(255, 154, 158, 0.15);
          flex-shrink: 0;
        }
        
        .reply-right {
          flex: 1;
          
          .reply-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 4px;
            
            .reply-user {
              font-size: 14px;
              font-weight: 700;
              color: #5a5a5a;
              
              &.author {
                color: #ff7a7e;
                background: linear-gradient(135deg, rgba(255, 122, 126, 0.15) 0%, rgba(254, 207, 239, 0.15) 100%);
                padding: 2px 8px;
                border-radius: 10px;
                
                &::after {
                  content: '作者';
                  margin-left: 4px;
                  font-size: 11px;
                  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
                  color: #fff;
                  padding: 1px 6px;
                  border-radius: 8px;
                  font-weight: 600;
                }
              }
            }
            
            .reply-time {
              font-size: 12px;
              color: #999;
            }
          }
          
          .reply-text {
            font-size: 14px;
            line-height: 1.7;
            color: #666;
            
            .mention {
              color: #ff9a9e;
              font-weight: 600;
              background: rgba(255, 154, 158, 0.12);
              padding: 2px 6px;
              border-radius: 4px;
              transition: all 0.2s;
              
              &:hover {
                background: rgba(255, 154, 158, 0.2);
                cursor: pointer;
              }
            }
          }
        }
      }
    }
  }
}



@keyframes bounce {
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
  
  .message-form {
    padding: 25px;
  }
}
</style>
