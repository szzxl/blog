<template>
  <div class="profile">
    <div class="container">
      <!-- 个人简介卡片 -->
      <div class="intro-card card">
        <div class="intro-avatar">
          <img :src="userStore.user?.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogIDwhLS0g6IOM5pmv5ZyGIC0tPg0KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjYwIiByPSI2MCIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4NCiAgDQogIDwhLS0g5riQ5Y+Y5a6a5LmJIC0tPg0KICA8ZGVmcz4NCiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4NCiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0ZmFjZmU7c3RvcC1vcGFjaXR5OjEiIC8+DQogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMGYyZmU7c3RvcC1vcGFjaXR5OjEiIC8+DQogICAgPC9saW5lYXJHcmFkaWVudD4NCiAgPC9kZWZzPg0KICANCiAgPCEtLSDnlKjmiLflm77moIcgLS0+DQogIDxjaXJjbGUgY3g9IjYwIiBjeT0iNDUiIHI9IjIwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+DQogIDxwYXRoIGQ9Ik0gMzAgOTUgUSAzMCA3MCA2MCA3MCBRIDkwIDcwIDkwIDk1IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+DQo8L3N2Zz4NCg=='" alt="头像">
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
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

.intro-card {
  padding: 40px;
  text-align: center;

  .intro-avatar {
    position: relative;
    display: inline-block;
    margin-bottom: 28px;

    img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 2px solid var(--color-accent);
      box-shadow: 0 0 20px rgba(0, 212, 170, 0.2);
      display: block;
    }

    .avatar-decoration {
      position: absolute;
      top: -4px;
      right: -4px;
      font-size: 20px;
    }
  }

  .intro-content {
    .intro-title {
      font-size: 20px;
      color: var(--text-primary);
      margin-bottom: 12px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .intro-desc {
      color: var(--text-tertiary);
      font-size: 14px;
      line-height: 1.8;
      margin-bottom: 28px;
      max-width: 560px;
      margin-left: auto;
      margin-right: auto;
    }

    .tags-section {
      .intro-tags {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
        margin-bottom: 16px;

        .tag {
          background: transparent;
          color: var(--color-accent);
          padding: 6px 14px;
          border-radius: var(--radius-tag);
          font-size: 13px;
          border: 1px solid rgba(0, 212, 170, 0.4);
          transition: all 0.15s;
          font-family: 'JetBrains Mono', monospace;
          display: flex;
          align-items: center;
          gap: 8px;

          &:hover {
            background: rgba(0, 212, 170, 0.08);
            border-color: var(--color-accent);
          }

          .tag-remove {
            cursor: pointer;
            font-size: 16px;
            font-weight: 700;
            opacity: 0.5;
            transition: opacity 0.15s;
            line-height: 1;

            &:hover {
              opacity: 1;
              color: var(--color-danger);
            }
          }
        }

        .add-tag-btn {
          background: transparent;
          color: var(--text-tertiary);
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-tag);
          padding: 6px 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          transition: all 0.15s;

          &:hover {
            border-color: var(--color-accent);
            color: var(--color-accent);
          }
        }
      }

      .tag-input-wrapper {
        display: flex;
        gap: 10px;
        justify-content: center;
        align-items: center;
        max-width: 480px;
        margin: 0 auto;

        .el-input {
          flex: 1;

          :deep(.el-input__wrapper) {
            background: var(--bg-secondary);
            border-radius: var(--radius-btn);
            box-shadow: none;
            border: 1px solid var(--border-color);

            &:hover {
              border-color: var(--color-accent);
            }

            &.is-focus {
              border-color: var(--color-accent);
              box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.15);
            }

            .el-input__inner {
              color: var(--text-primary);
              font-family: 'JetBrains Mono', monospace;
              font-size: 13px;

              &::placeholder {
                color: var(--text-tertiary);
              }
            }
          }
        }

        .el-button {
          border-radius: var(--radius-btn);
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;

          &[type="primary"] {
            background: var(--color-accent);
            border-color: var(--color-accent);
            color: var(--bg-primary);
            font-weight: 700;

            &:hover {
              opacity: 0.85;
            }
          }

          &:not([type="primary"]) {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);

            &:hover {
              border-color: var(--color-accent);
              color: var(--color-accent);
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .intro-card {
    padding: 28px 20px;

    .intro-avatar img {
      width: 80px;
      height: 80px;
    }

    .intro-content {
      .intro-title {
        font-size: 17px;
      }

      .tags-section .tag-input-wrapper {
        flex-direction: column;

        .el-input, .el-button {
          width: 100%;
        }
      }
    }
  }
}
</style>
