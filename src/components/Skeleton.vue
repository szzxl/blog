<template>
  <div class="skeleton-wrapper">
    <!-- 文章列表骨架屏 -->
    <div v-if="type === 'article-list'" class="skeleton-article-list">
      <div v-for="n in count" :key="n" class="skeleton-article-item">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>
          <div class="skeleton-footer">
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
            <div class="skeleton-meta"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文章详情骨架屏 -->
    <div v-else class="skeleton-article-detail">
      <div class="skeleton-header">
        <div class="skeleton-title large"></div>
        <div class="skeleton-meta-row">
          <div class="skeleton-meta"></div>
          <div class="skeleton-meta"></div>
          <div class="skeleton-meta"></div>
        </div>
      </div>
      <div class="skeleton-cover"></div>
      <div class="skeleton-body">
        <div v-for="n in 8" :key="n" class="skeleton-paragraph"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type: 'article-list' | 'article-detail'
  count?: number
}

withDefaults(defineProps<Props>(), {
  count: 3
})
</script>

<style scoped lang="scss">
.skeleton-wrapper {
  width: 100%;
}

// 骨架屏动画
@keyframes skeleton-loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

// 基础骨架屏样式
@mixin skeleton-base {
  background: linear-gradient(
    90deg,
    rgba(255, 154, 158, 0.1) 25%,
    rgba(255, 154, 158, 0.2) 50%,
    rgba(255, 154, 158, 0.1) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 8px;
}

// 文章列表骨架屏
.skeleton-article-list {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .skeleton-article-item {
    display: flex;
    gap: 20px;
    padding: 20px;
    background: var(--bg-card);
    border-radius: 16px;

    @media (max-width: 768px) {
      flex-direction: column;
      padding: 15px;
    }

    .skeleton-image {
      @include skeleton-base;
      width: 200px;
      height: 150px;
      flex-shrink: 0;

      @media (max-width: 768px) {
        width: 100%;
        height: 180px;
      }
    }

    .skeleton-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .skeleton-title {
        @include skeleton-base;
        height: 28px;
        width: 70%;
      }

      .skeleton-text {
        @include skeleton-base;
        height: 16px;
        width: 100%;

        &.short {
          width: 60%;
        }
      }

      .skeleton-footer {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-top: auto;

        .skeleton-tag {
          @include skeleton-base;
          height: 24px;
          width: 60px;
        }

        .skeleton-meta {
          @include skeleton-base;
          height: 16px;
          width: 80px;
          margin-left: auto;
        }
      }
    }
  }
}

// 文章详情骨架屏
.skeleton-article-detail {
  .skeleton-header {
    margin-bottom: 30px;

    .skeleton-title {
      @include skeleton-base;
      height: 40px;
      width: 80%;
      margin-bottom: 20px;

      &.large {
        height: 48px;
      }
    }

    .skeleton-meta-row {
      display: flex;
      gap: 20px;

      .skeleton-meta {
        @include skeleton-base;
        height: 20px;
        width: 100px;
      }
    }
  }

  .skeleton-cover {
    @include skeleton-base;
    height: 400px;
    width: 100%;
    margin-bottom: 30px;

    @media (max-width: 768px) {
      height: 250px;
    }
  }

  .skeleton-body {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .skeleton-paragraph {
      @include skeleton-base;
      height: 20px;
      width: 100%;

      &:nth-child(3n) {
        width: 85%;
      }

      &:nth-child(5n) {
        width: 70%;
      }
    }
  }
}

</style>
