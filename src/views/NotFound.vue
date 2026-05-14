<template>
  <div class="not-found">
    <div class="nf-card">
      <div class="nf-code">404</div>
      <h1 class="nf-title">页面不见了</h1>
      <p class="nf-desc">这个页面可能已被移动、删除，或者从未存在过。</p>
      <div class="nf-actions">
        <button class="btn-primary" @click="router.push('/')">回到首页</button>
        <button class="btn-secondary" @click="router.back()">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { resetSeo } from '@/composables/useSeo'

const router = useRouter()
onMounted(() => resetSeo('页面未找到'))
</script>

<style scoped lang="scss">
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: var(--bg-primary);
}

.nf-card {
  text-align: center;
  max-width: 480px;
  width: 100%;
  padding: 60px 48px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card-hover);
}

.nf-code {
  font-family: var(--font-display);
  font-size: 120px;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, #165dff 0%, #722ed1 50%, #f53f3f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  letter-spacing: -0.04em;
}

.nf-title {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px;
}

.nf-desc {
  font-size: 15px;
  color: var(--text-tertiary);
  line-height: 1.7;
  margin: 0 0 36px;
}

.nf-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;

  button {
    height: 42px;
    padding: 0 28px;
    border-radius: var(--radius-btn);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-sans);
  }

  .btn-primary {
    background: var(--gradient-accent);
    color: #fff;
    border: none;
    box-shadow: 0 4px 14px rgba(22, 93, 255, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(22, 93, 255, 0.4);
    }
  }

  .btn-secondary {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border-color);

    &:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
      background: var(--bg-secondary);
    }
  }
}

@media (max-width: 480px) {
  .nf-card { padding: 48px 28px; }
  .nf-code { font-size: 88px; }
}
</style>
