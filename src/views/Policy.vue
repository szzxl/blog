<template>
  <main class="policy">
    <router-link to="/register" class="back">← 返回注册</router-link>
    <span class="eyebrow">{{ privacy ? '信息处理说明' : '使用说明' }}</span>
    <h1>{{ privacy ? '隐私政策' : '用户协议' }}</h1>
    <p class="intro">{{ privacy ? '这里说明使用博客时，哪些信息会被保存或公开。' : '欢迎阅读与交流。注册前，请了解以下使用规则。' }}</p>
    <template v-if="privacy">
      <section><h2>账号与公开内容</h2><p>账号用于登录、评论、点赞和收藏。昵称、头像及评论内容会公开展示；你在个人中心填写的邮箱和手机号用于账号资料，不属于公开评论信息。</p></section>
      <section><h2>留言与友链申请</h2><p>留言和友链申请需由博主审核。正文、图片以及通过审核的友链信息会公开，请勿上传不希望公开的信息。联系方式用于处理申请或联系你。</p></section>
      <section><h2>浏览器存储与访问记录</h2><p>浏览器保存登录状态、主题和网站配置。服务端会记录访问及操作日志，用于网站统计与故障排查。退出登录会清理本地登录信息。</p></section>
      <section><h2>外部资源</h2><p>图片或友链可能指向其他网站，访问这些资源会向对应服务发送请求。其信息处理由对应网站负责。</p></section>
    </template>
    <template v-else>
      <section><h2>账号使用</h2><p>请妥善保管密码。使用个人中心可以修改头像、资料和密码；密码修改后需要重新登录。</p></section>
      <section><h2>发布与交流</h2><p>请只发布有权分享的文字和图片，尊重他人的隐私，避免垃圾广告、冒充他人或干扰网站运行。留言及友链申请在审核通过后公开。</p></section>
      <section><h2>内容管理</h2><p>你可以删除自己的评论。删除评论会同时删除其下的回复分支，请谨慎操作。博主可以管理文章、评论、留言和友链。</p></section>
    </template>
    <section><h2>联系与信息更正</h2><p>如需更正或删除账号及已提交的信息，请联系博主。{{ email ? '联系邮箱：' + email : '可通过网站留言板联系。' }}</p><router-link to="/guestbook">前往留言板 →</router-link></section>
  </main>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchWebsiteConfigWithCache } from '@/utils/websiteConfig'
const route = useRoute()
const privacy = computed(() => route.path.endsWith('/privacy'))
const email = ref('')
onMounted(async () => { email.value = (await fetchWebsiteConfigWithCache()).social_email || '' })
</script>
<style scoped lang="scss">
.policy { max-width: 760px; margin: auto; padding: 48px 24px 80px; color: var(--text-primary); }
.back, .policy a { color: var(--color-accent); font-size: 14px; }
.eyebrow { display: block; margin-top: 40px; color: var(--text-tertiary); font-size: 12px; letter-spacing: .12em; }
h1 { font-family: var(--font-serif); font-size: 36px; margin: 16px 0; }
.intro { color: var(--text-secondary); padding-bottom: 28px; border-bottom: 1px solid var(--border-color); }
section { margin-top: 32px; } h2 { font-size: 19px; font-family: var(--font-serif); } p { line-height: 1.9; color: var(--text-secondary); }
</style>
