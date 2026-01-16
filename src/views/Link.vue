<template>
  <div class="link">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-icon">🌈</div>
        <div class="header-text">
          <h1>友情链接</h1>
          <p>一起分享，一起成长~</p>
        </div>
      </div>
      
      <!-- 申请友链卡片 - 移除 -->
      
      <!-- 友链列表 -->
      <div class="links-section">
        <div class="section-header">
          <h3 class="section-title">🔗 友情链接</h3>
          <el-button type="primary" class="apply-btn" @click="showApplyDialog = true">
            <span class="btn-icon">💌</span>
            申请友链
          </el-button>
        </div>
        <div class="links-grid" v-loading="loading">
          <a 
            v-for="link in links" 
            :key="link.id"
            :href="link.url"
            target="_blank"
            class="link-card card"
          >
            <div class="link-avatar">
              <span class="avatar-text">{{ link.name.charAt(0) }}</span>
            </div>
            <div class="link-info">
              <h4 class="link-name">{{ link.name }}</h4>
              <p class="link-author" v-if="link.author">by {{ link.author }}</p>
              <p class="link-desc">{{ link.description }}</p>
            </div>
            <div class="link-icon">→</div>
          </a>
          
          <!-- 空状态 -->
          <div v-if="links.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">🔗</div>
            <div class="empty-text">暂无友情链接</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 申请友链弹窗 -->
  <el-dialog
    v-model="showApplyDialog"
    title="💌 申请友链"
    width="600px"
    :close-on-click-modal="false"
    @close="resetForm"
  >
    <div class="apply-dialog">
      <p class="dialog-desc">填写以下信息申请友链，我们会尽快审核~</p>
      
      <!-- 申请表单 -->
      <el-form
        ref="formRef"
        :model="applyForm"
        :rules="formRules"
        label-width="100px"
        class="apply-form"
      >
        <el-form-item label="网站名称" prop="siteName">
          <el-input v-model="applyForm.siteName" placeholder="请输入您的网站名称" />
        </el-form-item>
        
        <el-form-item label="网站地址" prop="siteUrl">
          <el-input v-model="applyForm.siteUrl" placeholder="https://example.com" />
        </el-form-item>
        
        <el-form-item label="网站描述" prop="siteDescription">
          <el-input
            v-model="applyForm.siteDescription"
            type="textarea"
            :rows="3"
            placeholder="简单介绍一下您的网站"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="站长名称" prop="siteAuthor">
          <el-input v-model="applyForm.siteAuthor" placeholder="请输入您的名称" />
        </el-form-item>
        
        <el-form-item label="联系邮箱" prop="email">
          <el-input v-model="applyForm.email" placeholder="your@email.com" />
        </el-form-item>
      </el-form>
      
      <!-- 申请要求 -->
      <div class="apply-tips">
        <h4 class="tips-title">申请要求</h4>
        <ul class="tips-list">
          <li>网站内容健康，无违法违规信息</li>
          <li>网站可以正常访问，更新频率稳定</li>
          <li>优先考虑原创内容网站</li>
        </ul>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="resetForm">取消</el-button>
      <el-button type="primary" @click="submitApply">
        提交申请
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFriendLinks, applyFriendLink } from '@/api/article'
import { ElMessage } from 'element-plus'

interface Link {
  id: number
  name: string
  author: string
  url: string
  description: string
  sort: number
  status: number
  createTime: number
}

const links = ref<Link[]>([])
const loading = ref(false)
const showApplyDialog = ref(false)

// 申请表单
const applyForm = ref({
  siteName: '',
  siteUrl: '',
  siteDescription: '',
  siteAuthor: '',
  email: ''
})

const formRef = ref()

// 表单验证规则
const formRules = {
  siteName: [
    { required: true, message: '请输入网站名称', trigger: 'blur' }
  ],
  siteUrl: [
    { required: true, message: '请输入网站地址', trigger: 'blur' },
    { 
      pattern: /^https?:\/\/.+/, 
      message: '请输入正确的网址格式（以http://或https://开头）', 
      trigger: 'blur' 
    }
  ],
  siteDescription: [
    { required: true, message: '请输入网站描述', trigger: 'blur' },
    { max: 100, message: '描述不能超过100个字符', trigger: 'blur' }
  ],
  siteAuthor: [
    { required: true, message: '请输入站长名称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' },
    { 
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
      message: '请输入正确的邮箱格式', 
      trigger: 'blur' 
    }
  ]
}

// 获取友情链接
const fetchLinks = async () => {
  loading.value = true
  try {
    const response: any = await getFriendLinks()
    
    if (response && Array.isArray(response)) {
      // 过滤状态为1的链接，并按sort排序
      links.value = response
        .filter((link: Link) => link.status === 1)
        .sort((a: Link, b: Link) => a.sort - b.sort)
    }
  } catch (error) {
    // 获取友情链接失败
  } finally {
    loading.value = false
  }
}

// 提交申请
const submitApply = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    
    if (valid) {
      try {
        await applyFriendLink({
          name: applyForm.value.siteName,
          author: applyForm.value.siteAuthor,
          url: applyForm.value.siteUrl,
          description: applyForm.value.siteDescription,
          email: applyForm.value.email
        })
        
        ElMessage.success('友链申请已提交，请耐心等待审核~')
        showApplyDialog.value = false
        resetForm()
      } catch (error: any) {
        ElMessage.error(error.msg || error.message || '申请失败，请稍后重试')
      }
    }
  } catch (error) {
    // 表单验证失败
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  showApplyDialog.value = false
}

onMounted(() => {
  fetchLinks()
})
</script>

<style scoped lang="scss">
.link {
  min-height: calc(100vh - 200px);
  padding: 40px 0;
}

.container {
  max-width: 1200px;
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
    animation: rainbow 3s ease-in-out infinite;
  }
  
  .header-text {
    h1 {
      font-size: 42px;
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
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

.apply-card {
  padding: 35px;
  margin-bottom: 50px;
  
  .card-title {
    font-size: 24px;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 15px 0;
    font-weight: 700;
  }
  
  .card-desc {
    color: #666;
    font-size: 15px;
    line-height: 1.8;
    margin-bottom: 25px;
  }
  
  .my-info {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%);
    padding: 25px;
    border-radius: 15px;
    border: 2px solid rgba(139, 92, 246, 0.2);
    
    .info-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      
      &:not(:last-child) {
        border-bottom: 1px solid rgba(139, 92, 246, 0.1);
      }
      
      .label {
        font-weight: 600;
        color: #8b5cf6;
        min-width: 100px;
      }
      
      .value {
        color: #666;
        flex: 1;
      }
    }
  }
}

.links-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    
    .apply-btn {
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      border: none;
      border-radius: 20px;
      padding: 12px 24px;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
      
      .btn-icon {
        margin-right: 6px;
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
      }
    }
  }
  
  .section-title {
    font-size: 28px;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    font-weight: 700;
  }
  
  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 25px;
  }
  
  .link-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 25px;
    text-decoration: none;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.1), transparent);
      transition: left 0.5s;
    }
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 30px rgba(139, 92, 246, 0.2);
      
      &::before {
        left: 100%;
      }
      
      .link-icon {
        transform: translateX(5px);
      }
    }
    
    .link-avatar {
      flex-shrink: 0;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
      
      .avatar-text {
        font-size: 32px;
        font-weight: 700;
        color: #fff;
      }
    }
    
    .link-info {
      flex: 1;
      
      .link-name {
        font-size: 18px;
        font-weight: 700;
        color: #5a5a5a;
        margin: 0 0 5px 0;
      }
      
      .link-author {
        font-size: 12px;
        color: #8b5cf6;
        margin: 0 0 5px 0;
      }
      
      .link-desc {
        font-size: 14px;
        color: #999;
        margin: 0;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
    
    .link-icon {
      font-size: 24px;
      color: #8b5cf6;
      transition: transform 0.3s;
    }
  }
}

@keyframes rainbow {
  0%, 100% {
    filter: hue-rotate(0deg);
  }
  50% {
    filter: hue-rotate(30deg);
  }
}

@media (max-width: 768px) {
  .link {
    .container {
      padding: 20px 15px;
    }
  }
  
  .page-header {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
    margin-bottom: 25px;
    gap: 15px;
    
    .header-icon {
      font-size: 50px;
    }
    
    .header-text {
      h1 {
        font-size: 28px;
        margin-bottom: 8px;
      }
      
      p {
        font-size: 13px;
      }
    }
  }
  
  .apply-card {
    padding: 20px 15px;
    margin-bottom: 25px;
    
    .card-title {
      font-size: 18px;
      margin-bottom: 15px;
    }
    
    .card-desc {
      font-size: 13px;
      line-height: 1.6;
      margin-bottom: 15px;
    }
    
    .my-info {
      padding: 15px;
      
      .info-title {
        font-size: 15px;
        margin-bottom: 12px;
      }
      
      .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
        font-size: 13px;
        
        .label {
          font-size: 12px;
        }
        
        .value {
          font-size: 13px;
        }
      }
    }
    
    .apply-btn {
      width: 100%;
      padding: 12px;
      font-size: 15px;
    }
  }
  
  .links-section {
    .section-header {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;
      margin-bottom: 20px;
      
      h2 {
        font-size: 20px;
        text-align: center;
      }
      
      .apply-btn {
        width: 100%;
        padding: 12px;
        font-size: 15px;
      }
    }
  }
  
  .links-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .link-card {
    padding: 20px 15px;
    
    .link-avatar {
      width: 50px;
      height: 50px;
    }
    
    .link-info {
      .link-name {
        font-size: 16px;
        margin-bottom: 6px;
      }
      
      .link-desc {
        font-size: 12px;
        line-height: 1.5;
        -webkit-line-clamp: 2;
      }
    }
    
    .link-arrow {
      font-size: 20px;
    }
  }
  
  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    
    .empty-icon {
      font-size: 60px;
      margin-bottom: 15px;
      opacity: 0.5;
    }
    
    .empty-text {
      font-size: 14px;
      color: #999;
    }
  }
}

// 申请弹窗移动端样式
:deep(.apply-dialog) {
  @media (max-width: 768px) {
    .el-dialog {
      width: 95vw !important;
      margin: 0 auto;
    }
    
    .el-dialog__header {
      padding: 15px 20px !important;
    }
    
    .el-dialog__body {
      padding: 20px 15px !important;
    }
    
    .el-dialog__footer {
      padding: 15px 20px 20px !important;
    }
    
    .dialog-desc {
      font-size: 13px;
      margin-bottom: 20px;
    }
    
    .my-info {
      padding: 15px;
      margin-bottom: 15px;
      
      .info-title {
        font-size: 14px;
        margin-bottom: 12px;
      }
      
      .info-item {
        font-size: 12px;
        
        .label {
          font-size: 11px;
        }
      }
    }
    
    .el-form-item__label {
      font-size: 13px;
    }
    
    .el-input__inner {
      font-size: 14px;
    }
    
    .el-textarea__inner {
      font-size: 14px;
    }
  }
}

.apply-dialog {
  .dialog-desc {
    color: #666;
    font-size: 15px;
    line-height: 1.8;
    margin-bottom: 25px;
    text-align: center;
  }
  
  .my-info {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%);
    padding: 20px;
    border-radius: 12px;
    border: 2px solid rgba(139, 92, 246, 0.2);
    margin-bottom: 20px;
    
    .info-title {
      font-size: 16px;
      color: #8b5cf6;
      margin: 0 0 15px 0;
      font-weight: 700;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      
      &:not(:last-child) {
        border-bottom: 1px solid rgba(139, 92, 246, 0.1);
      }
      
      .label {
        font-weight: 600;
        color: #8b5cf6;
        min-width: 90px;
        font-size: 14px;
      }
      
      .value {
        color: #666;
        flex: 1;
        font-size: 14px;
        word-break: break-all;
      }
    }
  }
  
  .apply-tips {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid rgba(139, 92, 246, 0.15);
    
    .tips-title {
      font-size: 16px;
      color: #8b5cf6;
      margin: 0 0 12px 0;
      font-weight: 700;
    }
    
    .tips-list {
      margin: 0;
      padding-left: 20px;
      
      li {
        color: #666;
        font-size: 14px;
        line-height: 2;
        
        &::marker {
          color: #8b5cf6;
        }
      }
    }
  }
  
  .apply-form {
    margin: 20px 0;
    
    :deep(.el-form-item__label) {
      color: #8b5cf6;
      font-weight: 600;
    }
    
    :deep(.el-input__wrapper) {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(252, 182, 159, 0.08);
      border: 1px solid rgba(139, 92, 246, 0.15);
      
      &:hover {
        border-color: rgba(255, 182, 193, 0.3);
      }
      
      &.is-focus {
        border-color: #8b5cf6;
        box-shadow: 0 2px 12px rgba(139, 92, 246, 0.15);
      }
    }
    
    :deep(.el-textarea__inner) {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(252, 182, 159, 0.08);
      border: 1px solid rgba(139, 92, 246, 0.15);
      
      &:hover {
        border-color: rgba(255, 182, 193, 0.3);
      }
      
      &:focus {
        border-color: #8b5cf6;
        box-shadow: 0 2px 12px rgba(139, 92, 246, 0.15);
      }
    }
  }
}

:deep(.el-dialog) {
  border-radius: 15px;
  
  .el-dialog__header {
    padding: 20px 20px 10px;
    
    .el-dialog__title {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
  
  .el-dialog__body {
    padding: 20px;
  }
  
  .el-dialog__footer {
    padding: 10px 20px 20px;
    
    .el-button {
      border-radius: 15px;
      padding: 10px 20px;
      
      &[type="primary"] {
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
        border: none;
        
        &:hover {
          opacity: 0.9;
        }
      }
    }
  }
  
  @media (max-width: 768px) {
    width: 95vw !important;
    margin: 0 auto;
    
    .el-dialog__header {
      padding: 15px 15px 10px;
      
      .el-dialog__title {
        font-size: 18px;
      }
    }
    
    .el-dialog__body {
      padding: 15px;
    }
    
    .el-dialog__footer {
      padding: 10px 15px 15px;
      
      .el-button {
        padding: 10px 20px;
        font-size: 14px;
      }
    }
  }
}
</style>
