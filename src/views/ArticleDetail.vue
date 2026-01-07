<template>
  <div class="article-detail">
    <div class="container">
      <article>
        <h1>文章标题</h1>
        <div class="meta">
          <span>发布时间</span>
          <span>分类</span>
          <span>标签</span>
        </div>
        <div class="content">
          <!-- 文章内容 -->
        </div>
      </article>
      <Comment />
    </div>
  </div>
</template>

<script setup lang="ts">
import Comment from '@/components/Comment.vue'
</script>

<style scoped lang="scss">
.container {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
}

.meta {
  color: #999;
  margin: 20px 0;
  display: flex;
  gap: 20px;
}

.content {
  margin-top: 40px;
  line-height: 1.8;
}
</style>
