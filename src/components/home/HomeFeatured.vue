<template>
  <section class="feature-board" aria-label="选读与关于博客">
    <router-link
      :to="`/article/${featured.id}`"
      class="feature-photo"
      :class="{ 'without-cover': !featured.articleCover || failedFeatured }"
    >
      <img
        v-if="featured.articleCover && !failedFeatured"
        :src="featured.articleCover"
        :alt="featured.articleName"
        fetchpriority="high"
        @error="failedFeatured = true"
      />
      <div class="feature-top">
        <span>{{ featured.isRecommend === 1 ? '推荐选读' : '本月选读' }}</span
        ><span>{{ featured.articleCategory }}</span>
      </div>
      <div class="feature-caption">
        <time>{{ formatTimestamp(featured.createTime) }}</time>
        <h2>{{ featured.articleName }}</h2>
        <p v-if="featured.summary">{{ featured.summary }}</p>
        <span class="feature-open">翻开这篇文章 </span>
      </div>
    </router-link>
    <div class="feature-rail">
      <router-link v-if="secondary" :to="`/article/${secondary.id}`" class="feature-note"
        ><div>
          <h2>{{ secondary.articleName }}</h2>
          <p>
            {{ secondary.articleCategory }}
            <span v-if="secondary.createTime">· {{ formatTimestamp(secondary.createTime) }}</span>
          </p>
        </div>
        <img
          v-if="secondary.articleCover"
          :src="secondary.articleCover"
          alt=""
          @error="hideFailedImage"
      /></router-link>
      <aside class="author-note">
        <span class="author-monogram" aria-hidden="true">{{
          (config.site_name || '时光').slice(0, 1)
        }}</span>
        <div>
          <div class="author-title">
            <strong>{{ config.site_name || '时光博客' }}</strong
            ><router-link to="/about">认识一下</router-link>
          </div>
          <p>{{ config.website_motto || '写下解决问题的过程，也留住日常里的片刻。' }}</p>
          <div class="author-socials">
            <a
              v-if="config.social_github"
              :href="config.social_github"
              target="_blank"
              rel="noopener noreferrer"
              >GitHub</a
            ><a
              v-if="config.social_gitee"
              :href="config.social_gitee"
              target="_blank"
              rel="noopener noreferrer"
              >Gitee</a
            ><button v-if="config.social_email" @click="copyContact(config.social_email, '邮箱')">
              邮箱</button
            ><button
              v-if="config.social_wechat"
              @click="copyContact(config.social_wechat, '微信号')"
            >
              微信
            </button>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus/es/components/message/index'
import type { ArticleSummary } from '@/types/article'
import type { WebsiteConfig } from '@/types/website'
import { formatTimestamp } from '@/utils/format'
import { copyText } from '@/utils/clipboard'
const props = defineProps<{
  featured: ArticleSummary
  secondary?: ArticleSummary
  config: Readonly<WebsiteConfig>
}>()
const failedFeatured = ref(false)
watch(
  () => props.featured.articleCover,
  () => {
    failedFeatured.value = false
  }
)
const hideFailedImage = (event: Event) => {
  ;(event.target as HTMLImageElement).style.display = 'none'
}
const copyContact = async (value: string, label: string) => {
  try {
    await copyText(value)
    ElMessage.success(`${label}已复制`)
  } catch {
    ElMessage.info(`${label}：${value}`)
  }
}
</script>
<style scoped lang="scss">
.feature-board {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(300px, 1fr);
  gap: 22px;
  margin-bottom: 38px;
}
.feature-photo {
  position: relative;
  min-height: 380px;
  color: #fffdf4;
  background: var(--bg-feature);
  border-radius: 4px;
  overflow: hidden;
}
.feature-photo > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.feature-photo:hover > img {
  transform: scale(1.02);
}
.feature-photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #14201a18 20%, #101d13e6);
}
.feature-photo.without-cover {
  background-color: #203631;
  background-image: repeating-linear-gradient(0deg, transparent, transparent 39px, #ffffff09 40px);
}
.feature-top {
  position: absolute;
  top: 20px;
  left: 24px;
  right: 24px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  z-index: 1;
}
.feature-top span:first-child {
  background: #f3ecda;
  color: #4d513e;
  padding: 4px 9px;
}
.feature-top span:last-child {
  text-shadow: 0 1px 4px #000;
}
.feature-caption {
  position: absolute;
  bottom: 26px;
  left: 28px;
  right: 28px;
  z-index: 1;
}
.feature-caption time {
  color: #e0ddc9;
  font-size: 11px;
}
.feature-caption h2 {
  color: inherit;
  font: 500 clamp(27px, 2.7vw, 40px)/1.45 var(--font-serif);
  max-width: 820px;
  margin-top: 10px;
  overflow-wrap: anywhere;
  text-wrap: pretty;
}
.feature-caption p {
  font-size: 13px;
  margin-top: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #ebe8dc;
}
.feature-open {
  display: inline-block;
  font-size: 12px;
  margin-top: 16px;
  padding-bottom: 3px;
  border-bottom: 1px solid #d1c6a6;
}
.feature-rail {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}
.feature-note {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 18px;
  padding: 24px;
  background: var(--bg-feature);
  color: var(--text-on-feature);
  border-radius: 4px;
}
.feature-note > div {
  min-width: 0;
  flex: 1;
}
.feature-note h2 {
  color: inherit;
  font: 500 23px/1.6 var(--font-serif);
  margin: 0 0 14px;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.feature-note p {
  font-size: 11px;
  color: #c3d0bd;
}
.feature-note img {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 3px;
}
.author-note {
  background: var(--bg-secondary);
  padding: 24px;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 14px;
  border-radius: 4px;
  flex: 1;
  align-content: center;
}
.author-monogram {
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-strong);
  display: grid;
  place-items: center;
  border-radius: 50%;
  font: 23px var(--font-serif);
  color: var(--color-accent);
}
.author-title {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  font-size: 13px;
}
.author-title strong {
  color: var(--text-primary);
}
.author-title a {
  white-space: nowrap;
  font-size: 11px;
}
.author-note p {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.9;
}
.author-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  font-size: 11px;
}
.author-socials button {
  background: transparent;
  border: 0;
  color: var(--color-accent);
}
@media (min-width: 1600px) {
  .feature-photo {
    min-height: 420px;
  }
}
@media (max-width: 1100px) {
  .feature-board {
    grid-template-columns: 1.3fr 1fr;
  }
  .feature-note img {
    display: none;
  }
  .author-note {
    padding: 18px;
  }
  .feature-note {
    padding: 20px;
  }
}
@media (max-width: 760px) {
  .feature-board {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    margin-bottom: 30px;
  }
  .feature-photo {
    min-height: 310px;
  }
  .feature-caption {
    left: 20px;
    right: 20px;
    bottom: 20px;
  }
  .feature-caption h2 {
    font-size: 28px;
  }
  .feature-top {
    left: 20px;
    right: 20px;
    top: 16px;
  }
  .feature-caption p {
    font-size: 12px;
  }
  .feature-rail {
    gap: 12px;
  }
  .feature-note {
    padding: 18px;
  }
  .feature-note h2 {
    font-size: 20px;
    margin: 5px 0 10px;
  }
  .feature-note img {
    display: block;
    width: 96px;
    height: 78px;
  }
  .author-note {
    padding: 18px;
  }
  .author-note p {
    font-size: 12px;
  }
}
@media (max-width: 400px) {
  .feature-caption h2 {
    font-size: 26px;
  }
}
</style>
