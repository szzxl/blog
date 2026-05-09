<template>
  <div class="link">
    <div class="container">
      <!-- 友链列表 -->
      <div class="links-section">
        <div class="section-header">
          <div class="header-left">
            <h3 class="section-title">友情链接</h3>
            <p class="section-desc">一起分享，一起成长~</p>
          </div>
          <el-button type="primary" class="apply-btn" @click="showApplyDialog = true">
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
            <div class="empty-text">暂无友情链接</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 申请友链弹窗 -->
  <el-dialog
    v-model="showApplyDialog"
    title="申请友链"
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
  padding: 104px 0 64px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.links-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 36px;
    border-left: 4px solid var(--color-accent);
    padding-left: 20px;

    .header-left {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;

      .section-title {
        font-family: var(--font-serif);
        font-size: 32px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--text-primary);
        margin: 0;
        line-height: 1.2;
      }

      .section-desc {
        font-size: 14px;
        color: var(--text-tertiary);
        margin: 0;
      }
    }

    .apply-btn {
      height: 38px;
      padding: 0 22px;
      border-radius: var(--radius-btn);
      background: var(--color-accent);
      border: none;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.02em;
      cursor: pointer;
      transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.25s ease;

      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: var(--shadow-glow);
      }
    }
  }

  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  .link-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 22px;
    text-decoration: none;
    background: var(--bg-card);
    backdrop-filter: var(--blur-glass);
    -webkit-backdrop-filter: var(--blur-glass);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    transition: box-shadow 0.35s ease, transform 0.35s ease, border-color 0.35s ease;

    &:hover {
      box-shadow: var(--shadow-card-hover);
      transform: translateY(-4px);
      border-color: var(--color-accent);

      .link-name { color: var(--color-accent); }

      .link-icon {
        color: var(--color-accent);
        transform: translateX(3px);
      }

      .link-avatar {
        box-shadow: var(--shadow-glow-strong);
      }
    }

    .link-avatar {
      flex-shrink: 0;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(145deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
      border: 2px solid var(--border-strong);
      box-shadow: var(--shadow-glow);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition: box-shadow 0.35s ease;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-text {
        font-family: var(--font-serif);
        font-size: 24px;
        font-weight: 700;
        line-height: 1;
        background: var(--gradient-accent);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .link-info {
      flex: 1;
      min-width: 0;

      .link-name {
        font-family: var(--font-serif);
        font-size: 17px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 4px 0;
        letter-spacing: -0.01em;
        transition: color 0.2s ease;
      }

      .link-author {
        font-size: 12px;
        color: var(--text-tertiary);
        margin: 0 0 4px 0;
        letter-spacing: 0.02em;
      }

      .link-desc {
        font-size: 13px;
        color: var(--text-tertiary);
        margin: 0;
        line-height: 1.55;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .link-icon {
      font-size: 16px;
      color: var(--text-tertiary);
      transition: color 0.25s ease, transform 0.25s ease;
      flex-shrink: 0;
    }
  }
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 72px 0;
  color: var(--text-tertiary);
  font-size: 15px;
}

.apply-dialog {
  .dialog-desc {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.85;
    margin-bottom: 20px;
  }

  .apply-form {
    margin: 16px 0;
  }

  .apply-tips {
    background: var(--bg-secondary);
    padding: 18px 20px;
    border-radius: var(--radius-btn);
    border: 1px solid var(--border-color);

    .tips-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-tertiary);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin: 0 0 12px 0;
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

    .tips-list {
      margin: 0;
      padding-left: 18px;

      li {
        color: var(--text-secondary);
        font-size: 13px;
        line-height: 1.85;
      }
    }
  }
}

@media (max-width: 640px) {
  .links-section {
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 14px;

      .apply-btn {
        align-self: stretch;
      }
    }

    .links-grid {
      grid-template-columns: 1fr;
    }
  }

  .link-card .link-avatar {
    width: 48px;
    height: 48px;

    .avatar-text {
      font-size: 20px;
    }
  }
}
</style>
