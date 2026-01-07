<template>
  <div class="guestbook">
    <div class="container">
      <h2>留言板</h2>
      <Comment />
    </div>
  </div>
</template>

<script setup lang="ts">
import Comment from '@/components/Comment.vue'
</script>

<style scoped lang="scss">
.container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}
</style>
