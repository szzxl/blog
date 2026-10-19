<template>
  <div class="about container">
    <header class="page-header">
      <span class="eyebrow">关于这里</span>
      <h1>关于我</h1>
      <p>{{ config.website_motto || '记录技术与生活。' }}</p>
    </header>
    <div class="about-layout">
      <section class="intro">
        <span class="monogram" aria-hidden="true">{{
          (config.site_name || '时光').slice(0, 1)
        }}</span>
        <h2>{{ config.site_name || '时光博客' }}</h2>
        <p>
          {{
            config.site_description ||
            '这里整理项目中的技术笔记、解决问题的过程，也分享一些日常记录。'
          }}
        </p>
        <router-link to="/guestbook" class="text-link">有想法，给我留言 →</router-link>
      </section>
      <div>
        <section class="about-section">
          <h2>从这里开始</h2>
          <router-link to="/articles"
            ><span>文章笔记</span><small>看看最近在记录什么 ↗</small></router-link
          ><router-link to="/category"
            ><span>分类与主题</span><small>找到你感兴趣的内容 ↗</small></router-link
          ><router-link to="/album"
            ><span>日常相册</span><small>文字之外的片刻 ↗</small></router-link
          >
        </section>
        <section class="about-section">
          <h2>联系与交流</h2>
          <a v-if="config.social_email" :href="`mailto:${config.social_email}`"
            ><span>邮箱</span><small>{{ config.social_email }}</small></a
          ><a
            v-if="config.social_github"
            :href="config.social_github"
            target="_blank"
            rel="noopener noreferrer"
            ><span>GitHub</span><small>看看我的代码 ↗</small></a
          ><a
            v-if="config.social_gitee"
            :href="config.social_gitee"
            target="_blank"
            rel="noopener noreferrer"
            ><span>Gitee</span><small>看看我的代码 ↗</small></a
          >
          <p v-if="config.social_wechat" class="wechat">微信：{{ config.social_wechat }}</p>
          <p>问题、建议，或只是打个招呼，都可以留在留言板。</p>
        </section>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { fetchWebsiteConfigWithCache, useWebsiteConfigRefresh } from '@/utils/websiteConfig'
import type { WebsiteConfig } from '@/utils/websiteConfig'
const config = ref<WebsiteConfig>({})
let disposed = false
const fetchConfig = async () => {
  const value = await fetchWebsiteConfigWithCache()
  if (!disposed) config.value = value
}
onMounted(fetchConfig)
useWebsiteConfigRefresh(() => {
  void fetchConfig()
})
onUnmounted(() => {
  disposed = true
})
</script>
<style scoped lang="scss">
.about {
  padding-bottom: 55px;
}
.page-header h1 {
  margin-top: 8px;
}
.about-layout {
  display: grid;
  grid-template-columns: minmax(250px, 1fr) minmax(0, 1.5fr);
  gap: clamp(32px, 6vw, 96px);
}
.intro {
  background: var(--bg-secondary);
  border-radius: 4px;
  padding: 32px;
  align-self: start;
}
.monogram {
  width: 60px;
  height: 60px;
  border: 1px solid var(--border-strong);
  display: grid;
  place-items: center;
  border-radius: 50%;
  font: 30px var(--font-serif);
  color: var(--color-accent);
}
.intro h2 {
  font: 28px var(--font-serif);
  margin: 24px 0 18px;
}
.intro p {
  font-size: 14px;
  line-height: 2;
}
.text-link {
  display: inline-block;
  font-size: 13px;
  min-height: 44px;
  margin-top: 20px;
  color: var(--color-accent);
}
.about-section {
  padding: 5px 0 30px;
  margin-bottom: 24px;
}
.about-section h2 {
  font: 25px var(--font-serif);
  margin-bottom: 24px;
}
.about-section > a {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  min-height: 60px;
  align-items: center;
  border-top: 1px solid var(--border-color);
}
.about-section small {
  font-size: 12px;
  color: var(--text-tertiary);
  overflow-wrap: anywhere;
}
.about-section p {
  font-size: 13px;
  margin-top: 16px;
  line-height: 1.9;
}
@media (max-width: 760px) {
  .about-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 30px;
  }
  .intro {
    padding: 26px;
  }
  .about-section > a {
    font-size: 13px;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 0;
  }
}
</style>
