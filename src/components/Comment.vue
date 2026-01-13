<template>
  <div class="comment">
    <h3>评论</h3>
    <div class="comment-form">
      <el-input v-model="commentText" type="textarea" :rows="4" placeholder="写下你的评论..." />
      <el-button type="primary" @click="submitComment">发表评论</el-button>
    </div>
    <div class="comment-list">
      <!-- 评论列表 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const commentText = ref('')

const submitComment = () => {
  // 提交评论逻辑
}
</script>

<style scoped lang="scss">
.comment {
  margin-top: 40px;
  
  .comment-form {
    margin: 20px 0;
    
    .el-button {
      margin-top: 10px;
    }
  }
}
</style>
