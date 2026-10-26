<script setup lang="ts">
defineProps<{ title: string; description: string }>()
</script>

<template>
  <section class="auth-page" aria-labelledby="auth-title">
    <div class="auth-layout">
      <router-link to="/" class="auth-back">返回首页</router-link>
      <div class="auth-card">
        <header class="auth-heading">
          <h1 id="auth-title">{{ title }}</h1>
          <p class="auth-description">{{ description }}</p>
        </header>
        <slot />
        <footer class="auth-footer"><slot name="footer" /></footer>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.auth-page {
  display: grid;
  place-items: center;
  min-height: 70vh;
  padding: 36px 24px 64px;
  background: var(--bg-primary);
}
.auth-layout {
  width: 100%;
  max-width: 440px;
}
.auth-back {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin-bottom: 8px;
  color: var(--text-tertiary);
  font-size: 12px;
  &:hover {
    color: var(--color-accent);
  }
}
.auth-card {
  padding: 36px;
  border: 1px solid var(--border-color);
  border-radius: 7px;
  background: var(--bg-card);
}
.auth-heading {
  margin-bottom: 28px;
}
.auth-heading h1 {
  margin: 0 0 10px;
  font: 600 27px/1.4 var(--font-sans);
  letter-spacing: -0.5px;
  color: var(--text-primary);
}
.auth-description {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 13px;
  line-height: 1.8;
}
.auth-card :deep(.el-form-item) {
  margin-bottom: 24px;
}
.auth-card :deep(.el-form-item__label) {
  margin-bottom: 8px;
  padding: 0;
  height: auto;
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.6;
  font-weight: 500;
}
.auth-card :deep(.el-form-item.is-required .el-form-item__label::before) {
  display: none;
}
.auth-card :deep(.el-input__wrapper) {
  min-height: 46px;
  padding: 1px 14px;
  background: var(--bg-card) !important;
  box-shadow: 0 0 0 1px var(--border-color) inset !important;
  border-radius: 5px !important;
  &:hover {
    box-shadow: 0 0 0 1px var(--border-strong) inset !important;
  }
  &.is-focus {
    box-shadow: 0 0 0 2px var(--color-accent) inset !important;
  }
}
.auth-card :deep(.el-input__inner) {
  height: 44px;
  font-size: 14px;
  color: var(--text-primary) !important;
  &::placeholder {
    color: var(--text-tertiary);
  }
  &:-webkit-autofill {
    -webkit-text-fill-color: var(--text-primary);
    caret-color: var(--text-primary);
    box-shadow: 0 0 0 1000px var(--bg-card) inset;
  }
}
.auth-card :deep(.el-input__suffix .el-icon) {
  color: var(--text-tertiary);
}
.auth-card :deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--color-danger) inset !important;
}
.auth-card :deep(.el-form-item__error) {
  color: var(--color-danger);
  font-size: 12px;
  padding-top: 5px;
  line-height: 1.4;
}
.auth-card :deep(.auth-submit.el-button) {
  width: 100%;
  min-height: 46px;
  margin: 0;
  --el-button-text-color: var(--bg-card);
  --el-button-hover-text-color: var(--bg-card);
  --el-button-active-text-color: var(--bg-card);
  --el-button-bg-color: var(--color-accent);
  --el-button-hover-bg-color: var(--color-accent-hover);
  --el-button-border-color: var(--color-accent);
  --el-button-hover-border-color: var(--color-accent-hover);
  border-radius: 5px;
  background-image: none;
  box-shadow: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
}
.auth-card :deep(.auth-help) {
  display: flex;
  justify-content: flex-end;
  margin: -4px 0 20px;
  font-size: 12px;
  color: var(--color-accent);
}
.auth-card :deep(.auth-error) {
  margin: 0 0 18px;
  padding: 10px 12px;
  border: 1px solid var(--color-danger);
  border-radius: 5px;
  color: var(--color-danger);
  font-size: 12px;
  line-height: 1.7;
}
.auth-card :deep(.auth-agreement .el-form-item__content) {
  display: block;
  line-height: 1.8;
}
.auth-card :deep(.auth-agreement .el-checkbox) {
  height: auto;
  min-height: 32px;
  white-space: normal;
}
.auth-card :deep(.auth-agreement .el-checkbox__label) {
  color: var(--text-secondary);
  font-size: 12px;
  white-space: normal;
}
.auth-card :deep(.auth-agreement .el-checkbox__input) {
  align-self: center;
}
.auth-card :deep(.auth-policies) {
  font-size: 12px;
  color: var(--text-tertiary);
  padding-left: 22px;
  a {
    color: var(--color-accent);
  }
}
.auth-footer {
  margin-top: 26px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  color: var(--text-tertiary);
  font-size: 13px;
  line-height: 1.8;
}
.auth-footer :deep(a) {
  margin-left: 6px;
  color: var(--color-accent);
  font-weight: 500;
}
@media (max-width: 600px) {
  .auth-page {
    padding: 20px 20px 36px;
    min-height: 65vh;
  }
  .auth-card {
    padding: 28px 24px;
  }
  .auth-heading h1 {
    font-size: 24px;
  }
}
@media (max-width: 360px) {
  .auth-page {
    padding-inline: 16px;
  }
  .auth-card {
    padding-inline: 20px;
  }
}
</style>
