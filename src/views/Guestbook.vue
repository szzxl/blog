<template>
  <div class="guestbook">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-icon">💌</div>
        <div class="header-text">
          <h1>留言板</h1>
          <p>留下你的足迹，分享你的心情~</p>
        </div>
      </div>
      
      <!-- 发表留言 -->
      <div class="message-form card">
        <h3 class="form-title">✨ 写下你的留言</h3>
        <el-form :model="messageForm" label-width="0">
          <el-form-item>
            <el-input 
              v-model="messageForm.name" 
              placeholder="你的昵称"
              prefix-icon="User"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-input 
              v-model="messageForm.email" 
              placeholder="邮箱（选填）"
              prefix-icon="Message"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-input 
              v-model="messageForm.content" 
              type="textarea" 
              :rows="5"
              placeholder="说点什么吧~ 分享你的心情、想法或者祝福..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              class="submit-btn"
              @click="submitMessage"
            >
              <span class="btn-icon">💕</span>
              发表留言
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const messageForm = ref({
  name: '',
  email: '',
  content: ''
})

const submitMessage = () => {
  if (!messageForm.value.name) {
    ElMessage.warning('请输入昵称')
    return
  }
  if (!messageForm.value.content) {
    ElMessage.warning('请输入留言内容')
    return
  }
  
  ElMessage.success('留言发表成功！ 🌸')
  
  // 清空表单
  messageForm.value = {
    name: '',
    email: '',
    content: ''
  }
}
</script>

<style scoped lang="scss">
.guestbook {
  min-height: calc(100vh - 200px);
  padding: 40px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 30px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  
  .header-icon {
    font-size: 60px;
    animation: bounce 2s ease-in-out infinite;
  }
  
  .header-text {
    h1 {
      font-size: 42px;
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 8px 0;
      font-weight: 700;
    }
    
    p {
      font-size: 16px;
      color: #999;
      margin: 0;
    }
  }
}

.message-form {
  padding: 35px;
  margin-bottom: 40px;
  
  .form-title {
    font-size: 24px;
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 25px 0;
    font-weight: 700;
  }
  
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .el-input {
    :deep(.el-input__wrapper) {
      padding: 12px 18px;
      border-radius: 15px;
      box-shadow: 0 2px 12px rgba(252, 182, 159, 0.1);
      border: 2px solid rgba(255, 182, 193, 0.2);
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 4px 20px rgba(252, 182, 159, 0.15);
        border-color: rgba(255, 182, 193, 0.3);
      }
      
      &.is-focus {
        border-color: #ff9a9e;
        box-shadow: 0 4px 20px rgba(255, 154, 158, 0.25);
      }
    }
    
    :deep(.el-input__prefix) {
      color: #ff9a9e;
    }
  }
  
  .el-textarea {
    :deep(.el-textarea__inner) {
      padding: 15px;
      border-radius: 15px;
      box-shadow: 0 2px 12px rgba(252, 182, 159, 0.1);
      border: 2px solid rgba(255, 182, 193, 0.2);
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 4px 20px rgba(252, 182, 159, 0.15);
        border-color: rgba(255, 182, 193, 0.3);
      }
      
      &:focus {
        border-color: #ff9a9e;
        box-shadow: 0 4px 20px rgba(255, 154, 158, 0.25);
      }
    }
  }
  
  .submit-btn {
    width: 100%;
    height: 48px;
    border-radius: 24px;
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    border: none;
    font-size: 16px;
    font-weight: 700;
    box-shadow: 0 8px 25px rgba(255, 154, 158, 0.4);
    transition: all 0.3s;
    
    .btn-icon {
      margin-right: 8px;
      font-size: 18px;
    }
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(255, 154, 158, 0.5);
    }
  }
}



@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
    
    .header-text h1 {
      font-size: 32px;
    }
  }
  
  .message-form {
    padding: 25px;
  }
}
</style>
