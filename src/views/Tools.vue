<template>
  <div class="tools">
    <header class="page-header container">
      <h1>工具</h1>
      <p>随手可用的小工具</p>
    </header>

    <div class="container tools-content">
      <article class="tool-card" aria-labelledby="miniprogram-title">
        <div class="tool-info">
          <span class="tool-label">微信小程序</span>
          <h2 id="miniprogram-title">{{ miniprogramName }}</h2>
          <p class="tool-description">打开微信扫一扫，即可使用小程序。</p>
          <div class="scan-guide">
            <span class="guide-number" aria-hidden="true">01</span>
            <p>电脑浏览时，用手机微信扫描右侧二维码。</p>
          </div>
          <div class="scan-guide">
            <span class="guide-number" aria-hidden="true">02</span>
            <p>手机浏览时，保存二维码，在微信扫一扫中从相册选择图片。</p>
          </div>
          <a
            class="download-link"
            :href="miniprogramQr"
            target="_blank"
            rel="noopener noreferrer"
            :download="`${miniprogramName}二维码.jpg`"
          >
            <el-icon aria-hidden="true"><Download /></el-icon>
            保存二维码
          </a>
        </div>

        <figure class="qr-panel">
          <img
            :src="miniprogramQr"
            :alt="`${miniprogramName}二维码，请使用微信扫一扫`"
            width="258"
            height="294"
          />
          <figcaption>微信扫一扫，打开小程序</figcaption>
        </figure>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download } from '@element-plus/icons-vue'
import defaultMiniprogramQr from '@/assets/tools/miniprogram-qr.jpg'
import { ref, onMounted } from 'vue'
import { fetchWebsiteConfigWithCache, useWebsiteConfigRefresh } from '@/utils/websiteConfig'

const miniprogramName = ref('工具小程序')
const miniprogramQr = ref(defaultMiniprogramQr)
const refreshTool = async () => {
  const config = await fetchWebsiteConfigWithCache()
  miniprogramName.value = config.tool_miniprogram_name || '工具小程序'
  miniprogramQr.value = config.tool_miniprogram_qr || defaultMiniprogramQr
}
useWebsiteConfigRefresh(() => { void refreshTool() })
onMounted(() => { void refreshTool() })
</script>

<style scoped lang="scss">




.tools-content {
  padding-top: 48px;
  padding-bottom: 48px;
}

.tool-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 306px;
  gap: 48px;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.tool-label {
  display: inline-block;
  padding: 5px 12px;
  border-radius: var(--radius-tag);
  background: var(--bg-secondary);
  color: var(--color-success);
  font-size: 12px;
  font-weight: 600;
}

.tool-info h2 {
  margin: 16px 0 12px;
  font-family: var(--font-display);
  font-size: 30px;
  line-height: 1.4;
  color: var(--text-primary);
}

.tool-description {
  margin-bottom: 28px;
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.scan-guide {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-top: 14px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.guide-number {
  color: var(--color-success);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.download-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 28px;
  padding: 10px 18px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-btn);
  color: var(--text-primary);
  font-size: 14px;
  text-decoration: none;
  transition:
    border-color 0.2s,
    color 0.2s;

  &:hover {
    border-color: var(--color-success);
    color: var(--color-success);
  }
  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 4px;
  }
}

.qr-panel {
  margin: 0;
  padding: 16px;
  text-align: center;
  background: #fff;
  border: 1px solid #ede8e1;
  border-radius: 12px;

  img {
    display: block;
    width: 258px;
    max-width: 100%;
    height: auto;
    margin: 0 auto;
  }
  figcaption {
    margin-top: 8px;
    color: #4e5969;
    font-size: 12px;
    line-height: 1.7;
  }
}

@media (max-width: 768px) {
  .tool-card {
    grid-template-columns: minmax(0, 1fr);
    padding: 24px;
    gap: 28px;
  }
  .qr-panel {
    width: 100%;
    max-width: 306px;
    justify-self: center;
  }
  .tools-content {
    padding-top: 32px;
    padding-bottom: 24px;
  }
}

.page-header.container {
  width: calc(100% - clamp(48px, 4vw, 64px));
  padding-inline: 0;
}
.tools-content {
  padding-top: 0;
}
.tool-card {
  max-width: none;
  border-radius: 5px;
  box-shadow: none;
}
.tool-label {
  color: var(--color-ochre);
}
.qr-panel {
  background: var(--bg-secondary);
}
@media (max-width: 760px) {
  .page-header.container {
    width: calc(100% - 32px);
  }
  .tool-card {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
