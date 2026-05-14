<template>
  <div class="link">
    <!-- ── Banner ─────────────────────────────────────── -->
    <div class="page-banner">
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <h1 class="banner-title">友情链接</h1>
        <p class="banner-sub">共 {{ links.length }} 位朋友</p>
      </div>
      <button class="banner-apply-btn" @click="showApplyDialog = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        申请友链
      </button>
    </div>

    <!-- ── 内容区 ─────────────────────────────────────── -->
    <div class="main-wrap">
      <div class="container">
        <div class="links-grid" v-loading="loading">
          <a
            v-for="link in links"
            :key="link.id"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="link-card"
          >
            <div class="link-avatar">
              <span class="avatar-text">{{ link.name.charAt(0) }}</span>
            </div>
            <div class="link-info">
              <h4 class="link-name">{{ link.name }}</h4>
              <p class="link-author" v-if="link.author">by {{ link.author }}</p>
              <p class="link-desc">{{ link.description }}</p>
            </div>
            <div class="link-visit">
              <span class="visit-btn">访问</span>
              <svg class="visit-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </a>

          <!-- 空状态 -->
          <div v-if="links.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </div>
            <p class="empty-text">暂无友情链接</p>
            <button class="empty-apply-btn" @click="showApplyDialog = true">成为第一个？</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── 申请友链弹窗 ───────────────────────────────── -->
  <el-dialog
    v-model="showApplyDialog"
    width="560px"
    :close-on-click-modal="false"
    class="apply-dialog-wrap"
    @close="resetForm"
  >
    <!-- 自定义 Header -->
    <template #header>
      <div class="dialog-header">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </div>
        <div>
          <h3 class="header-title">申请友链</h3>
          <p class="header-sub">填写信息提交后，审核通过即可展示~</p>
        </div>
      </div>
    </template>

    <!-- 表单主体 -->
    <div class="apply-body">
      <el-form
        ref="formRef"
        :model="applyForm"
        :rules="formRules"
        label-position="top"
        class="apply-form"
      >
        <!-- 第一行：网站名称 + 站长名称 -->
        <div class="form-row">
          <el-form-item label="网站名称" prop="siteName">
            <el-input v-model="applyForm.siteName" placeholder="我的技术博客">
              <template #prefix>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="站长名称" prop="siteAuthor">
            <el-input v-model="applyForm.siteAuthor" placeholder="张三">
              <template #prefix>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <!-- 网站地址 -->
        <el-form-item label="网站地址" prop="siteUrl">
          <el-input v-model="applyForm.siteUrl" placeholder="https://example.com">
            <template #prefix>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <!-- 联系邮箱 -->
        <el-form-item label="联系邮箱" prop="email">
          <el-input v-model="applyForm.email" placeholder="your@email.com">
            <template #prefix>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <!-- 网站描述 -->
        <el-form-item label="网站描述" prop="siteDescription">
          <el-input
            v-model="applyForm.siteDescription"
            type="textarea"
            :rows="3"
            placeholder="用一两句话介绍你的网站..."
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <!-- 申请须知 -->
      <div class="apply-tips">
        <div class="tips-header">
          <svg class="tips-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          申请须知
        </div>
        <div class="tips-grid">
          <div class="tip-item" v-for="tip in APPLY_TIPS" :key="tip">
            <svg class="tip-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{{ tip }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="dialog-footer">
        <button class="footer-cancel" @click="resetForm">取消</button>
        <button class="footer-submit" @click="submitApply">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          提交申请
        </button>
      </div>
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

const APPLY_TIPS = [
  '网站内容健康，无违法违规信息',
  '网站可以正常访问，更新频率稳定',
  '优先考虑原创内容网站',
  '已将本站加入友链更佳',
]

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
    ElMessage.error('获取友链列表失败')
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
// ── Banner ─────────────────────────────────────────────
.page-banner {
  position: relative;
  height: 200px;
  background: url('/bg-banner.png') center 30% / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .banner-overlay {
    position: absolute;
    inset: 0;
    background: rgba(5, 12, 30, 0.62);
  }

  .banner-content {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 0 24px;

    .banner-title {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 800;
      color: #fff;
      text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
      margin: 0 0 8px 0;
      line-height: 1.3;
    }

    .banner-sub {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.65);
      margin: 0;
      font-family: var(--font-sans);
    }
  }

  // 申请友链按钮（Banner 右上角）
  .banner-apply-btn {
    position: absolute;
    right: 32px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 20px;
    border-radius: var(--radius-btn);
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    font-size: 14px;
    font-family: var(--font-sans);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(calc(-50% - 2px));
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
  }
}

// ── 主内容包装器 ───────────────────────────────────────
.main-wrap {
  padding-top: 48px;
  padding-bottom: 80px;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

// ── 友链网格 ───────────────────────────────────────────
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 20px;
  text-decoration: none;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--gradient-accent);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-5px);
    border-color: var(--color-accent);

    &::before {
      opacity: 0.03;
    }

    .link-name { color: var(--color-accent); }

    .link-avatar {
      box-shadow: var(--shadow-glow-strong);
      transform: scale(1.05);
    }

    .visit-btn {
      background: var(--color-accent);
      color: #fff;
    }

    .visit-arrow {
      color: var(--color-accent);
      transform: translateX(3px);
    }
  }

  .link-avatar {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(145deg, var(--bg-secondary), var(--bg-card));
    border: 2px solid var(--border-strong);
    box-shadow: var(--shadow-glow);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.3s ease;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-text {
      font-family: var(--font-display);
      font-size: 22px;
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
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 3px 0;
      letter-spacing: -0.01em;
      transition: color 0.2s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .link-author {
      font-size: 11px;
      color: var(--text-tertiary);
      margin: 0 0 5px 0;
      font-family: var(--font-sans);
    }

    .link-desc {
      font-size: 12px;
      color: var(--text-tertiary);
      margin: 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      font-family: var(--font-sans);
    }
  }

  .link-visit {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .visit-btn {
      font-size: 11px;
      font-family: var(--font-sans);
      font-weight: 600;
      padding: 4px 10px;
      border-radius: var(--radius-tag);
      background: var(--bg-secondary);
      color: var(--text-tertiary);
      transition: all 0.25s ease;
      letter-spacing: 0.03em;
    }

    .visit-arrow {
      width: 14px;
      height: 14px;
      color: var(--text-tertiary);
      transition: all 0.25s ease;
    }
  }
}

// ── 空状态 ─────────────────────────────────────────────
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 16px;

  .empty-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-tertiary);

    svg {
      width: 28px;
      height: 28px;
    }
  }

  .empty-text {
    font-size: 15px;
    color: var(--text-tertiary);
    font-family: var(--font-sans);
    margin: 0;
  }

  .empty-apply-btn {
    padding: 8px 20px;
    border-radius: var(--radius-btn);
    background: var(--color-accent);
    color: #fff;
    font-size: 13px;
    font-family: var(--font-sans);
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.25s ease;

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: var(--shadow-glow);
    }
  }
}

// ── 申请弹窗 ───────────────────────────────────────────
:deep(.apply-dialog-wrap) {
  .el-dialog {
    border-radius: var(--radius-card);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-card-hover);
    background: var(--bg-card);
    overflow: hidden;
    padding: 0;
  }

  .el-dialog__header {
    padding: 0;
    margin: 0;
  }

  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__footer {
    padding: 0;
  }

  .el-dialog__headerbtn {
    top: 18px;
    right: 18px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    transition: all 0.2s;

    &:hover {
      background: var(--bg-primary);
      border-color: var(--border-strong);
    }

    .el-dialog__close {
      color: var(--text-tertiary);
      font-size: 13px;
    }
  }
}

// Header
.dialog-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 24px 20px;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.04) 0%, rgba(114, 46, 209, 0.04) 100%);

  .header-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--gradient-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(22, 93, 255, 0.28);

    svg {
      width: 20px;
      height: 20px;
      stroke: #fff;
    }
  }

  .header-title {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 3px;
  }

  .header-sub {
    font-size: 13px;
    color: var(--text-tertiary);
    margin: 0;
    font-family: var(--font-sans);
  }
}

// 表单主体
.apply-body {
  padding: 22px 24px 20px;
}

.apply-form {
  margin-bottom: 18px;

  // 双列布局
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 16px;
  }

  :deep(.el-form-item__label) {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    font-family: var(--font-sans);
    padding-bottom: 6px;
    line-height: 1.4;
  }

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-input__wrapper) {
    border-radius: var(--radius-btn);
    background: var(--bg-secondary);
    box-shadow: 0 0 0 1px var(--border-color) inset;
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: 0 0 0 1px var(--border-strong) inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px var(--color-accent) inset, 0 0 0 3px rgba(22, 93, 255, 0.1);
    }
  }

  :deep(.el-input__prefix) {
    color: var(--text-tertiary);

    svg {
      width: 14px;
      height: 14px;
      vertical-align: middle;
    }
  }

  :deep(.el-textarea__inner) {
    border-radius: var(--radius-btn);
    background: var(--bg-secondary);
    box-shadow: 0 0 0 1px var(--border-color) inset;
    font-family: var(--font-sans);
    font-size: 14px;
    resize: none;
    transition: box-shadow 0.2s;

    &:focus {
      box-shadow: 0 0 0 1px var(--color-accent) inset, 0 0 0 3px rgba(22, 93, 255, 0.1);
    }
  }
}

// 须知区域
.apply-tips {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn);
  padding: 14px 16px;

  .tips-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-tertiary);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 12px;
    font-family: var(--font-sans);

    .tips-icon {
      width: 14px;
      height: 14px;
      color: var(--color-accent);
      flex-shrink: 0;
    }
  }

  .tips-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 12px;
  }

  .tip-item {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    font-size: 12px;
    color: var(--text-secondary);
    font-family: var(--font-sans);
    line-height: 1.55;

    .tip-check {
      width: 13px;
      height: 13px;
      flex-shrink: 0;
      margin-top: 1px;
      color: #00b42a;
    }
  }
}

// Footer
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 24px 20px;
  border-top: 1px solid var(--border-color);

  button {
    height: 38px;
    padding: 0 22px;
    border-radius: var(--radius-btn);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-sans);
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .footer-cancel {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);

    &:hover {
      border-color: var(--border-strong);
      color: var(--text-primary);
      background: var(--bg-secondary);
    }
  }

  .footer-submit {
    background: var(--gradient-accent);
    border: none;
    color: #fff;
    box-shadow: 0 4px 14px rgba(22, 93, 255, 0.28);

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 22px rgba(22, 93, 255, 0.38);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

@media (max-width: 560px) {
  .apply-form .form-row {
    grid-template-columns: 1fr;
  }

  .apply-tips .tips-grid {
    grid-template-columns: 1fr;
  }

  :deep(.apply-dialog-wrap) .el-dialog {
    margin: 0 !important;
    border-radius: var(--radius-card) var(--radius-card) 0 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100% !important;
  }
}

// ── 响应式 ────────────────────────────────────────────
@media (max-width: 768px) {
  .page-banner {
    height: 160px;

    .banner-content .banner-title {
      font-size: 1.7rem;
    }

    .banner-apply-btn {
      right: 16px;
      padding: 7px 14px;
      font-size: 13px;
    }
  }

  .main-wrap {
    padding-top: 32px;
    padding-bottom: 60px;
  }

  .container {
    padding: 0 16px;
  }

  .links-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

@media (max-width: 480px) {
  .page-banner .banner-apply-btn {
    position: static;
    transform: none;
    margin-top: 12px;
  }

  .page-banner .banner-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .page-banner {
    height: auto;
    padding: 40px 16px;
    align-items: flex-start;
  }

  .page-banner .banner-content {
    position: relative;
    z-index: 1;
  }
}
</style>
