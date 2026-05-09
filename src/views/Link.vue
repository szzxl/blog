<template>
  <div class="link">
    <div class="container">
      <!-- 友链列表 -->
      <div class="links-section">
        <div class="section-header">
          <div class="header-left">
            <div class="header-icon">🌈</div>
            <div class="header-text">
              <h3 class="section-title">友情链接</h3>
              <p class="section-desc">一起分享，一起成长~</p>
            </div>
          </div>
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
  padding: 32px 0 48px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  border-left: 3px solid var(--color-accent);
  padding-left: 16px;
  margin-bottom: 32px;

  h1 {
    font-size: 24px;
    color: var(--text-primary);
    margin: 0 0 6px 0;
    font-weight: 700;
  }

  p {
    font-size: 13px;
    color: var(--text-tertiary);
    margin: 0;
  }
}

.apply-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 24px;
  margin-bottom: 32px;

  .card-title {
    font-size: 16px;
    color: var(--text-primary);
    margin: 0 0 12px 0;
    font-weight: 600;
  }

  .card-desc {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.8;
    margin-bottom: 20px;
  }

  .my-info {
    background: var(--bg-primary);
    padding: 16px;
    border-radius: var(--radius-btn);
    border: 1px solid var(--border-color);

    .info-item {
      display: flex;
      align-items: center;
      padding: 8px 0;

      &:not(:last-child) {
        border-bottom: 1px solid var(--border-color);
      }

      .label {
        font-size: 13px;
        color: var(--text-tertiary);
        min-width: 80px;
      }

      .value {
        font-size: 13px;
        color: var(--text-secondary);
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
    margin-bottom: 24px;
    border-left: 4px solid var(--color-accent);
    padding-left: 20px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .section-title {
        font-family: var(--font-serif);
        font-size: 32px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--text-primary);
        margin: 0 0 4px 0;
      }

      .section-desc {
        font-size: 13px;
        color: var(--text-tertiary);
        margin: 0;
      }
    }

    .apply-btn {
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

      &:hover { opacity: 0.85; }
    }
  }

  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }

  .link-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    text-decoration: none;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-card-hover);

      .link-name { color: var(--color-accent); }

      .link-icon {
        color: var(--color-accent);
      }
    }

    .link-avatar {
      flex-shrink: 0;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-text {
        font-family: var(--font-serif);
        font-size: 22px;
        font-weight: 700;
        color: var(--color-accent);
      }
    }

    .link-info {
      flex: 1;
      min-width: 0;

      .link-name {
        font-family: var(--font-serif);
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 4px 0;
        transition: color 0.15s ease;
      }

      .link-author {
        font-size: 12px;
        color: var(--text-tertiary);
        margin: 0 0 4px 0;
      }

      .link-desc {
        font-size: 13px;
        color: var(--text-tertiary);
        margin: 0;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .link-icon {
      font-size: 16px;
      color: var(--text-tertiary);
      transition: color 0.15s ease;
      flex-shrink: 0;
    }
  }
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 64px 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.apply-dialog {
  .dialog-desc {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.8;
    margin-bottom: 20px;
  }

  .my-info {
    background: var(--bg-primary);
    padding: 16px;
    border-radius: var(--radius-btn);
    border: 1px solid var(--border-color);
    margin-bottom: 16px;

    .info-title {
      font-size: 13px;
      color: var(--text-tertiary);
      margin: 0 0 12px 0;
      font-weight: 600;
    }

    .info-item {
      display: flex;
      align-items: center;
      padding: 6px 0;

      &:not(:last-child) {
        border-bottom: 1px solid var(--border-color);
      }

      .label {
        font-size: 12px;
        color: var(--text-tertiary);
        min-width: 72px;
      }

      .value {
        font-size: 13px;
        color: var(--text-secondary);
        flex: 1;
        word-break: break-all;
      }
    }
  }

  .apply-tips {
    background: var(--bg-primary);
    padding: 16px;
    border-radius: var(--radius-btn);
    border: 1px solid var(--border-color);

    .tips-title {
      font-size: 13px;
      color: var(--text-tertiary);
      margin: 0 0 10px 0;
      font-weight: 600;
    }

    .tips-list {
      margin: 0;
      padding-left: 16px;

      li {
        color: var(--text-secondary);
        font-size: 13px;
        line-height: 1.8;
      }
    }
  }

  .apply-form {
    margin: 16px 0;
  }
}

@media (max-width: 640px) {
  .links-section .links-grid {
    grid-template-columns: 1fr;
  }

  .link-card .link-avatar {
    width: 44px;
    height: 44px;
  }
}
</style>
