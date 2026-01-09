<template>
  <div class="link">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-icon">🌈</div>
        <div class="header-text">
          <h1>友情链接</h1>
          <p>一起分享，一起成长~</p>
        </div>
      </div>
      
      <!-- 申请友链卡片 -->
      <div class="apply-card card">
        <h3 class="card-title">💌 申请友链</h3>
        <p class="card-desc">欢迎交换友链！请在留言板留言或通过邮箱联系我~</p>
        <div class="my-info">
          <div class="info-item">
            <span class="label">网站名称：</span>
            <span class="value">小花的日记本</span>
          </div>
          <div class="info-item">
            <span class="label">网站地址：</span>
            <span class="value">你的网站地址</span>
          </div>
          <div class="info-item">
            <span class="label">网站描述：</span>
            <span class="value">记录美好生活</span>
          </div>
          <div class="info-item">
            <span class="label">网站图标：</span>
            <span class="value">🌸</span>
          </div>
        </div>
      </div>
      
      <!-- 友链列表 -->
      <div class="links-section">
        <h3 class="section-title">🔗 友情链接</h3>
        <div class="links-grid">
          <a 
            v-for="(link, index) in links" 
            :key="index"
            :href="link.url"
            target="_blank"
            class="link-card card"
          >
            <div class="link-avatar">
              <img :src="link.avatar" :alt="link.name">
            </div>
            <div class="link-info">
              <h4 class="link-name">{{ link.name }}</h4>
              <p class="link-desc">{{ link.desc }}</p>
            </div>
            <div class="link-icon">→</div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const links = ref([])
</script>

<style scoped lang="scss">
.link {
  min-height: calc(100vh - 200px);
  padding: 40px 0;
}

.container {
  max-width: 1200px;
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
    animation: rainbow 3s ease-in-out infinite;
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

.apply-card {
  padding: 35px;
  margin-bottom: 50px;
  
  .card-title {
    font-size: 24px;
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 15px 0;
    font-weight: 700;
  }
  
  .card-desc {
    color: #666;
    font-size: 15px;
    line-height: 1.8;
    margin-bottom: 25px;
  }
  
  .my-info {
    background: linear-gradient(135deg, rgba(255, 154, 158, 0.05) 0%, rgba(254, 207, 239, 0.05) 100%);
    padding: 25px;
    border-radius: 15px;
    border: 2px solid rgba(255, 182, 193, 0.2);
    
    .info-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      
      &:not(:last-child) {
        border-bottom: 1px solid rgba(255, 182, 193, 0.1);
      }
      
      .label {
        font-weight: 600;
        color: #ff9a9e;
        min-width: 100px;
      }
      
      .value {
        color: #666;
        flex: 1;
      }
    }
  }
}

.links-section {
  .section-title {
    font-size: 28px;
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 30px 0;
    font-weight: 700;
  }
  
  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 25px;
  }
  
  .link-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 25px;
    text-decoration: none;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 154, 158, 0.1), transparent);
      transition: left 0.5s;
    }
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 30px rgba(255, 154, 158, 0.2);
      
      &::before {
        left: 100%;
      }
      
      .link-icon {
        transform: translateX(5px);
      }
    }
    
    .link-avatar {
      flex-shrink: 0;
      
      img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        border: 3px solid #fff;
        box-shadow: 0 4px 15px rgba(255, 154, 158, 0.3);
      }
    }
    
    .link-info {
      flex: 1;
      
      .link-name {
        font-size: 18px;
        font-weight: 700;
        color: #5a5a5a;
        margin: 0 0 8px 0;
      }
      
      .link-desc {
        font-size: 14px;
        color: #999;
        margin: 0;
        line-height: 1.6;
      }
    }
    
    .link-icon {
      font-size: 24px;
      color: #ff9a9e;
      transition: transform 0.3s;
    }
  }
}

@keyframes rainbow {
  0%, 100% {
    filter: hue-rotate(0deg);
  }
  50% {
    filter: hue-rotate(30deg);
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
  
  .apply-card {
    padding: 25px;
    
    .my-info {
      .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
      }
    }
  }
  
  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>
