<template>
  <div class="talk">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-icon">💭</div>
        <div class="header-text">
          <h1>说说</h1>
          <p>记录生活的点点滴滴~</p>
        </div>
      </div>
      
      <!-- 说说列表 -->
      <div class="talk-list">
        <div class="talk-item card" v-for="i in 6" :key="i">
          <div class="talk-header">
            <img src="https://via.placeholder.com/60/ff9a9e/ffffff?text=♡" alt="头像" class="avatar">
            <div class="user-info">
              <div class="username">小花</div>
              <div class="time">2024-01-{{ String(i).padStart(2, '0') }} 14:30</div>
            </div>
          </div>
          <div class="talk-content">
            {{ i === 1 ? '今天天气真好，阳光洒在身上暖暖的~ 🌞' : 
               i === 2 ? '分享一首最近很喜欢的歌，单曲循环中 🎵' :
               i === 3 ? '周末去了海边，看到了超美的日落！🌅' :
               i === 4 ? '新买的裙子到了，好开心呀~ 💕' :
               i === 5 ? '今天学会了一道新菜，味道还不错！🍳' :
               '晚安，做个好梦~ 🌙✨' }}
          </div>
          <div class="talk-images" v-if="i <= 3">
            <img v-for="j in (i === 1 ? 3 : i === 2 ? 1 : 4)" :key="j" 
                 src="https://via.placeholder.com/200/fecfef/ffffff?text=♡" 
                 alt="图片" 
                 class="talk-img">
          </div>
          <div class="talk-footer">
            <div class="actions">
              <el-button text class="action-btn">
                <span class="icon">💗</span>
                <span class="count">{{ 20 + i * 3 }}</span>
              </el-button>
              <el-button text class="action-btn">
                <span class="icon">💬</span>
                <span class="count">{{ 5 + i }}</span>
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="60"
          :page-size="10"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.talk {
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
    animation: float 3s ease-in-out infinite;
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

.talk-list {
  .talk-item {
    padding: 30px;
    margin-bottom: 25px;
    
    .talk-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
      
      .avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 3px solid #fff;
        box-shadow: 0 4px 15px rgba(255, 154, 158, 0.3);
      }
      
      .user-info {
        .username {
          font-size: 18px;
          font-weight: 700;
          color: #5a5a5a;
          margin-bottom: 5px;
        }
        
        .time {
          font-size: 14px;
          color: #999;
        }
      }
    }
    
    .talk-content {
      font-size: 16px;
      line-height: 1.8;
      color: #666;
      margin-bottom: 20px;
    }
    
    .talk-images {
      display: grid;
      gap: 10px;
      margin-bottom: 20px;
      
      &:has(.talk-img:nth-child(1):nth-last-child(1)) {
        grid-template-columns: 1fr;
        max-width: 400px;
      }
      
      &:has(.talk-img:nth-child(2)) {
        grid-template-columns: repeat(2, 1fr);
      }
      
      &:has(.talk-img:nth-child(3)) {
        grid-template-columns: repeat(3, 1fr);
      }
      
      &:has(.talk-img:nth-child(4)) {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .talk-img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 15px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(255, 154, 158, 0.3);
        }
      }
    }
    
    .talk-footer {
      border-top: 1px solid rgba(255, 182, 193, 0.2);
      padding-top: 15px;
      
      .actions {
        display: flex;
        gap: 20px;
        
        .action-btn {
          color: #ff9a9e;
          font-size: 15px;
          
          .icon {
            margin-right: 5px;
            font-size: 18px;
          }
          
          .count {
            margin-left: 5px;
          }
          
          &:hover {
            color: #ff7a7e;
          }
        }
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  
  :deep(.el-pagination) {
    .btn-prev, .btn-next, .el-pager li {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(252, 182, 159, 0.1);
      
      &:hover {
        color: #ff9a9e;
      }
      
      &.is-active {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        color: #fff;
      }
    }
  }
}

@keyframes float {
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
  
  .talk-item {
    .talk-images {
      .talk-img {
        height: 150px;
      }
    }
  }
}
</style>
