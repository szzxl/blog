<template>
  <div class="profile">
    <div class="container">
      <!-- 个人简介卡片 -->
      <div class="intro-card card">
        <div class="intro-avatar">
          <img :src="userStore.user?.avatar || 'https://via.placeholder.com/120/ff9a9e/ffffff?text=♡'" alt="头像">
          <div class="avatar-decoration">✨</div>
        </div>
        <div class="intro-content">
          <h2 class="intro-title">Hi~ 我是{{ userStore.user?.username || '小花' }} 🌸</h2>
          <p class="intro-desc">一个热爱生活、喜欢记录的女生，在这里分享我的日常、心情和小确幸~</p>
          
          <!-- 标签编辑区域 -->
          <div class="tags-section">
            <div class="intro-tags">
              <span 
                v-for="(tag, index) in tags" 
                :key="index" 
                class="tag"
              >
                {{ tag }}
                <span class="tag-remove" @click="removeTag(index)">×</span>
              </span>
              <el-button 
                v-if="!isAddingTag" 
                class="add-tag-btn" 
                size="small" 
                @click="isAddingTag = true"
              >
                + 添加标签
              </el-button>
            </div>
            
            <div v-if="isAddingTag" class="tag-input-wrapper">
              <el-input 
                v-model="newTag" 
                placeholder="输入标签（如：🎨 手账爱好者）"
                maxlength="20"
                @keyup.enter="addTag"
              />
              <el-button type="primary" @click="addTag">确定</el-button>
              <el-button @click="cancelAddTag">取消</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const tags = ref([
  '🎨 手账爱好者',
  '📷 摄影',
  '☕ 咖啡',
  '🎵 音乐'
])

const isAddingTag = ref(false)
const newTag = ref('')

const addTag = () => {
  if (!newTag.value.trim()) {
    ElMessage.warning('请输入标签内容')
    return
  }
  
  if (tags.value.length >= 8) {
    ElMessage.warning('最多只能添加8个标签')
    return
  }
  
  tags.value.push(newTag.value.trim())
  newTag.value = ''
  isAddingTag.value = false
  ElMessage.success('标签添加成功')
}

const removeTag = (index: number) => {
  tags.value.splice(index, 1)
  ElMessage.success('标签已删除')
}

const cancelAddTag = () => {
  newTag.value = ''
  isAddingTag.value = false
}
</script>

<style scoped lang="scss">
.profile {
  min-height: calc(100vh - 200px);
  padding: 40px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 30px;
}

.intro-card {
  padding: 50px;
  text-align: center;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 45px rgba(252, 182, 159, 0.25);
  }
  
  .intro-avatar {
    position: relative;
    display: inline-block;
    margin-bottom: 30px;
    
    img {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      border: 5px solid #fff;
      box-shadow: 0 8px 25px rgba(255, 154, 158, 0.3);
    }
    
    .avatar-decoration {
      position: absolute;
      top: -5px;
      right: -5px;
      font-size: 35px;
      animation: rotate 3s linear infinite;
    }
  }
  
  .intro-content {
    .intro-title {
      font-size: 32px;
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 20px;
      font-weight: 700;
    }
    
    .intro-desc {
      color: #666;
      font-size: 16px;
      line-height: 1.8;
      margin-bottom: 35px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .tags-section {
      .intro-tags {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: center;
        margin-bottom: 20px;
        
        .tag {
          background: linear-gradient(135deg, rgba(255, 154, 158, 0.15) 0%, rgba(254, 207, 239, 0.15) 100%);
          color: #ff9a9e;
          padding: 10px 18px;
          border-radius: 20px;
          font-size: 15px;
          border: 2px solid rgba(255, 154, 158, 0.2);
          transition: all 0.3s;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          
          &:hover {
            background: linear-gradient(135deg, rgba(255, 154, 158, 0.2) 0%, rgba(254, 207, 239, 0.2) 100%);
            border-color: #ff9a9e;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 154, 158, 0.2);
          }
          
          .tag-remove {
            cursor: pointer;
            font-size: 18px;
            font-weight: 700;
            opacity: 0.6;
            transition: all 0.2s;
            
            &:hover {
              opacity: 1;
              color: #ff6b6b;
              transform: scale(1.2);
            }
          }
        }
        
        .add-tag-btn {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          color: #fff;
          border: none;
          border-radius: 20px;
          padding: 10px 18px;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(255, 154, 158, 0.3);
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 154, 158, 0.4);
          }
        }
      }
      
      .tag-input-wrapper {
        display: flex;
        gap: 10px;
        justify-content: center;
        align-items: center;
        max-width: 500px;
        margin: 0 auto;
        
        .el-input {
          flex: 1;
          
          :deep(.el-input__wrapper) {
            border-radius: 15px;
            box-shadow: 0 2px 12px rgba(252, 182, 159, 0.1);
            border: 2px solid rgba(255, 182, 193, 0.2);
            
            &:hover {
              border-color: rgba(255, 182, 193, 0.3);
            }
            
            &.is-focus {
              border-color: #ff9a9e;
              box-shadow: 0 4px 20px rgba(255, 154, 158, 0.25);
            }
          }
        }
        
        .el-button {
          border-radius: 15px;
          
          &[type="primary"] {
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            border: none;
            box-shadow: 0 4px 15px rgba(255, 154, 158, 0.3);
            
            &:hover {
              opacity: 0.9;
            }
          }
        }
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .intro-card {
    padding: 35px 25px;
    
    .intro-avatar {
      img {
        width: 110px;
        height: 110px;
      }
      
      .avatar-decoration {
        font-size: 28px;
      }
    }
    
    .intro-content {
      .intro-title {
        font-size: 26px;
      }
      
      .intro-desc {
        font-size: 14px;
      }
      
      .tags-section {
        .tag-input-wrapper {
          flex-direction: column;
          
          .el-input {
            width: 100%;
          }
          
          .el-button {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
