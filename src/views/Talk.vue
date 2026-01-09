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
        <!-- 示例模板 1 - 带多张图片 -->
        <div class="talk-item card">
          <div class="talk-header">
            <img src="/web/default-avatar.svg" alt="头像" class="avatar">
            <div class="user-info">
              <div class="username">用户名</div>
              <div class="time">2024-01-03 15:30</div>
            </div>
          </div>
          <div class="talk-content">
            今天天气真好，出去拍了好多照片~ 🌞📷
          </div>
          <div class="talk-images">
            <img src="/web/vite.svg" alt="图片" class="talk-img">
            <img src="/web/vite.svg" alt="图片" class="talk-img">
            <img src="/web/vite.svg" alt="图片" class="talk-img">
          </div>
          <div class="talk-footer">
            <div class="actions">
              <el-button text class="action-btn">
                <span class="icon">💗</span>
                <span class="count">12</span>
              </el-button>
              <el-button text class="action-btn">
                <span class="icon">💬</span>
                <span class="count">3</span>
              </el-button>
            </div>
          </div>
          
          <!-- 评论列表 -->
          <div class="comment-list">
            <!-- 一级评论 -->
            <div class="comment-item">
              <img src="/web/default-avatar.svg" alt="头像" class="comment-avatar">
              <div class="comment-content">
                <div class="comment-user">小明</div>
                <div class="comment-text">照片拍得真好看！👍</div>
                <div class="comment-time">2024-01-03 16:00</div>
              </div>
            </div>
            
            <!-- 回复列表（扁平化） -->
            <div class="reply-list">
              <div class="reply-item">
                <img src="/web/default-avatar.svg" alt="头像" class="reply-avatar">
                <div class="reply-content">
                  <span class="reply-user author">作者</span>
                  <span class="reply-text">：谢谢夸奖~ 😊</span>
                  <span class="reply-time">2024-01-03 16:30</span>
                </div>
              </div>
              
              <div class="reply-item">
                <img src="/web/default-avatar.svg" alt="头像" class="reply-avatar">
                <div class="reply-content">
                  <span class="reply-user">小红</span>
                  <span class="reply-text">：<span class="mention">@作者</span> 请问用什么相机拍的？</span>
                  <span class="reply-time">2024-01-03 17:00</span>
                </div>
              </div>
              
              <div class="reply-item">
                <img src="/web/default-avatar.svg" alt="头像" class="reply-avatar">
                <div class="reply-content">
                  <span class="reply-user author">作者</span>
                  <span class="reply-text">：<span class="mention">@小红</span> 用的是手机拍的哦~</span>
                  <span class="reply-time">2024-01-03 17:30</span>
                </div>
              </div>
              
              <div class="reply-item">
                <img src="/web/default-avatar.svg" alt="头像" class="reply-avatar">
                <div class="reply-content">
                  <span class="reply-user">访客A</span>
                  <span class="reply-text">：<span class="mention">@作者</span> 什么型号的手机呀？</span>
                  <span class="reply-time">2024-01-03 18:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 示例模板 2 - 纯文字 -->
        <div class="talk-item card">
          <div class="talk-header">
            <img src="/web/default-avatar.svg" alt="头像" class="avatar">
            <div class="user-info">
              <div class="username">用户名</div>
              <div class="time">2024-01-02 20:15</div>
            </div>
          </div>
          <div class="talk-content">
            分享一句喜欢的话：生活明朗，万物可爱~ ✨💕
          </div>
          <div class="talk-footer">
            <div class="actions">
              <el-button text class="action-btn">
                <span class="icon">💗</span>
                <span class="count">8</span>
              </el-button>
              <el-button text class="action-btn">
                <span class="icon">💬</span>
                <span class="count">2</span>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 示例模板 3 - 单张图片 -->
        <div class="talk-item card">
          <div class="talk-header">
            <img src="/web/default-avatar.svg" alt="头像" class="avatar">
            <div class="user-info">
              <div class="username">用户名</div>
              <div class="time">2024-01-01 12:00</div>
            </div>
          </div>
          <div class="talk-content">
            新年第一天，给自己立个小目标~ 🎯
          </div>
          <div class="talk-images">
            <img src="/web/vite.svg" alt="图片" class="talk-img">
          </div>
          <div class="talk-footer">
            <div class="actions">
              <el-button text class="action-btn">
                <span class="icon">💗</span>
                <span class="count">15</span>
              </el-button>
              <el-button text class="action-btn">
                <span class="icon">💬</span>
                <span class="count">5</span>
              </el-button>
            </div>
          </div>
        </div>
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
  min-height: 400px;
  
  .empty-state {
    text-align: center;
    padding: 100px 20px;
    
    .empty-icon {
      font-size: 80px;
      margin-bottom: 20px;
      opacity: 0.5;
    }
    
    .empty-text {
      font-size: 18px;
      color: #999;
    }
  }
  
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
  
  .comment-list {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 182, 193, 0.2);
    
    .comment-item {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
      
      .comment-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 2px 8px rgba(255, 154, 158, 0.2);
        flex-shrink: 0;
      }
      
      .comment-content {
        flex: 1;
        
        .comment-user {
          font-size: 15px;
          font-weight: 700;
          color: #5a5a5a;
          margin-bottom: 6px;
        }
        
        .comment-text {
          font-size: 15px;
          color: #666;
          line-height: 1.7;
          margin-bottom: 6px;
        }
        
        .comment-time {
          font-size: 12px;
          color: #aaa;
        }
      }
    }
    
    .reply-list {
      margin-left: 52px;
      margin-top: 12px;
      margin-bottom: 20px;
      
      .reply-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 8px;
        padding: 10px 14px;
        background: linear-gradient(135deg, rgba(255, 154, 158, 0.04) 0%, rgba(254, 207, 239, 0.04) 100%);
        border-radius: 10px;
        transition: all 0.2s;
        
        &:hover {
          background: linear-gradient(135deg, rgba(255, 154, 158, 0.08) 0%, rgba(254, 207, 239, 0.08) 100%);
        }
        
        .reply-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(255, 154, 158, 0.15);
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .reply-content {
          flex: 1;
          font-size: 14px;
          line-height: 1.7;
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 4px;
          
          .reply-user {
            font-weight: 700;
            color: #5a5a5a;
            flex-shrink: 0;
            
            &.author {
              color: #ff7a7e;
              background: linear-gradient(135deg, rgba(255, 122, 126, 0.1) 0%, rgba(254, 207, 239, 0.1) 100%);
              padding: 2px 8px;
              border-radius: 10px;
              
              &::after {
                content: '作者';
                margin-left: 4px;
                font-size: 11px;
                background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
                color: #fff;
                padding: 1px 6px;
                border-radius: 8px;
                font-weight: 600;
              }
            }
          }
          
          .reply-text {
            color: #666;
            flex: 1;
            
            .mention {
              color: #ff9a9e;
              font-weight: 600;
              background: rgba(255, 154, 158, 0.1);
              padding: 2px 6px;
              border-radius: 4px;
              transition: all 0.2s;
              
              &:hover {
                background: rgba(255, 154, 158, 0.2);
                cursor: pointer;
              }
            }
          }
          
          .reply-time {
            font-size: 11px;
            color: #bbb;
            flex-shrink: 0;
            margin-left: auto;
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
