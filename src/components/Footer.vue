<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-main">
        <div>
          <router-link to="/" class="brand-name">{{ websiteName }}</router-link>
          <p>{{ websiteMotto || '项目笔记和日常记录。' }}</p>
          <div class="social-row">
            <a v-if="socialGithub" :href="socialGithub" target="_blank" rel="noopener noreferrer"
              >GitHub</a
            ><a v-if="socialGitee" :href="socialGitee" target="_blank" rel="noopener noreferrer"
              >Gitee</a
            ><button v-if="socialEmail" @click="copyEmail">邮箱</button
            ><button v-if="socialWechat" @click="copyWechat">微信</button>
          </div>
        </div>
        <nav aria-label="页脚导航">
          <router-link to="/guestbook">留下足迹</router-link
          ><router-link to="/about">关于博主</router-link
          ><router-link to="/link">友情链接</router-link><router-link to="/tools">工具</router-link
          ><router-link to="/terms">用户协议</router-link
          ><router-link to="/privacy">隐私政策</router-link>
        </nav>
      </div>
      <div class="footer-bottom">
        <div>
          {{ copyright }}
          <a
            v-if="icpNumber"
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            >{{ icpNumber }}</a
          ><span v-if="runtimeText">{{ runtimeText }}</span>
        </div>
        <div class="visit-stats" aria-label="网站访问统计" :aria-busy="visitStatsLoading">
          <span>累计浏览 {{ formatVisitCount(visitSummary?.totalPv) }}</span
          ><span>今日浏览 {{ formatVisitCount(visitSummary?.todayPv) }}</span
          ><span>今日访客 {{ formatVisitCount(visitSummary?.todayUv) }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>
<script setup lang="ts">
import { watch, ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus/es/components/message/index'
import { useWebsiteConfig } from '@/composables/useWebsiteConfig'
import { copyText } from '@/utils/clipboard'
import { useVisitStats } from '@/utils/visit'

const { visitSummary, visitStatsLoading } = useVisitStats()
const visitNumberFormat = new Intl.NumberFormat('zh-CN')
const formatVisitCount = (value?: number) =>
  value === undefined ? '—' : visitNumberFormat.format(value)

const year = new Date().getFullYear()
const websiteName = ref('博客')
const websiteMotto = ref('')
const copyright = ref(`© ${year}`)
const icpNumber = ref('')
const socialEmail = ref('')
const socialGitee = ref('')
const socialGithub = ref('')
const socialWechat = ref('')
const runtimeText = ref('')

let startTime = new Date('2026-01-01T00:00:00+08:00').getTime()

const calculateRuntime = () => {
  const diff = Math.max(0, Date.now() - startTime)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  runtimeText.value = `已运行 ${days}天 ${hours}时 ${minutes}分 ${seconds}秒`
}

let timer: number | null = null

const { config: websiteConfig } = useWebsiteConfig()
watch(websiteConfig, (config) => {
  if (config.site_name) websiteName.value = config.site_name.replace(/系统$/u, '')
  copyright.value = config.copyright || `© ${year}`
  icpNumber.value = config.icp_number || ''
  websiteMotto.value = config.website_motto || ''
  socialEmail.value = config.social_email || ''
  socialGitee.value = config.social_gitee || ''
  socialGithub.value = config.social_github || ''
  socialWechat.value = config.social_wechat || ''
  const configuredStart = config.site_start_time
    ? Date.parse(config.site_start_time.replace(' ', 'T') + '+08:00')
    : NaN
  if (Number.isFinite(configuredStart)) startTime = configuredStart
  calculateRuntime()
})

onMounted(() => {
  calculateRuntime()
  timer = window.setInterval(calculateRuntime, 1000)
})

const copyContact = async (value: string, label: string) => {
  if (!value) return
  try {
    await copyText(value)
    ElMessage.success(`${label}已复制到剪贴板`)
  } catch {
    ElMessage.info(`${label}：${value}`)
  }
}
const copyWechat = () => copyContact(socialWechat.value, '微信号')
const copyEmail = () => copyContact(socialEmail.value, '邮箱')

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
<style scoped lang="scss">
.footer {
  padding: 30px 0 24px;
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 24px;
}
.footer-main {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
}
.brand-name {
  font: 18px var(--font-serif);
  color: var(--text-primary);
}
.footer-main p {
  margin-top: 7px;
  font-size: 12px;
}
.footer-main nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 22px;
}
.footer-main nav a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
}
.social-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
}
.social-row button {
  font-size: 12px;
  border: 0;
  background: transparent;
}
.footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
  border-top: 1px solid var(--border-color);
  margin-top: 24px;
  padding-top: 18px;
  font-size: 11px;
}
.footer-bottom > div,
.visit-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}
@media (max-width: 760px) {
  .footer-main {
    display: block;
  }
  .footer-main nav {
    margin-top: 18px;
    gap: 0 20px;
  }
  .footer-bottom {
    display: block;
  }
  .visit-stats {
    margin-top: 14px;
  }
}
</style>
