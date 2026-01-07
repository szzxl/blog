<template>
  <div class="about">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-icon">🦋</div>
        <div class="header-text">
          <h1>关于我</h1>
          <p>Hi~ 很高兴认识你</p>
        </div>
      </div>
      
      <!-- 个人介绍卡片 -->
      <div class="intro-section card">
        <div class="intro-avatar">
          <img src="https://via.placeholder.com/150/ff9a9e/ffffff?text=♡" alt="头像">
          <div class="avatar-decoration">✨</div>
        </div>
        <h2 class="intro-name">小花 🌸</h2>
        <p class="intro-title">一个热爱生活的女生</p>
        <div class="intro-tags">
          <span class="tag">🎨 手账爱好者</span>
          <span class="tag">📷 摄影</span>
          <span class="tag">☕ 咖啡</span>
          <span class="tag">🎵 音乐</span>
          <span class="tag">📚 阅读</span>
          <span class="tag">✈️ 旅行</span>
        </div>
      </div>
      
      <!-- 关于博客 -->
      <div class="content-section card">
        <h3 class="section-title">💕 关于这个博客</h3>
        <div class="content-text">
          <p>欢迎来到我的小天地！这里是我记录生活、分享心情的地方。</p>
          <p>我喜欢用文字和图片记录下生活中的美好瞬间，无论是一杯香浓的咖啡，一本好书，还是一次难忘的旅行，都值得被珍藏。</p>
          <p>希望我的分享能给你带来一些温暖和启发，也欢迎你在留言板留下你的足迹~</p>
        </div>
      </div>
      
      <!-- 关于我 -->
      <div class="content-section card">
        <h3 class="section-title">🌟 关于我</h3>
        <div class="content-text">
          <p>我是一个热爱生活、喜欢记录的女生。</p>
          <p>平时喜欢做手账、拍照、喝咖啡、听音乐、看书、旅行...总之，一切美好的事物都让我着迷。</p>
          <p>我相信生活中处处都有小确幸，只要用心去发现和感受。</p>
        </div>
      </div>
      
      <!-- 技能标签 -->
      <div class="skills-section card">
        <h3 class="section-title">💪 我的技能</h3>
        <div class="skills-grid">
          <div class="skill-item">
            <div class="skill-icon">🎨</div>
            <div class="skill-name">手账设计</div>
            <div class="skill-bar">
              <div class="skill-progress" style="width: 90%"></div>
            </div>
          </div>
          <div class="skill-item">
            <div class="skill-icon">📷</div>
            <div class="skill-name">摄影</div>
            <div class="skill-bar">
              <div class="skill-progress" style="width: 85%"></div>
            </div>
          </div>
          <div class="skill-item">
            <div class="skill-icon">✍️</div>
            <div class="skill-name">写作</div>
            <div class="skill-bar">
              <div class="skill-progress" style="width: 80%"></div>
            </div>
          </div>
          <div class="skill-item">
            <div class="skill-icon">🍳</div>
            <div class="skill-name">烹饪</div>
            <div class="skill-bar">
              <div class="skill-progress" style="width: 75%"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 联系方式 -->
      <div class="contact-section card">
        <h3 class="section-title">📮 联系我</h3>
        <div class="contact-grid">
          <div class="contact-item">
            <div class="contact-icon">📧</div>
            <div class="contact-info">
              <div class="contact-label">邮箱</div>
              <div class="contact-value">hello@example.com</div>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">💬</div>
            <div class="contact-info">
              <div class="contact-label">微信</div>
              <div class="contact-value">xiahua2024</div>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">🐧</div>
            <div class="contact-info">
              <div class="contact-label">QQ</div>
              <div class="contact-value">123456789</div>
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
.about {
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
    animation: flutter 3s ease-in-out infinite;
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

.intro-section {
  padding: 50px;
  margin-bottom: 30px;
  text-align: center;
  
  .intro-avatar {
    position: relative;
    display: inline-block;
    margin-bottom: 25px;
    
    img {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      border: 5px solid #fff;
      box-shadow: 0 8px 25px rgba(255, 154, 158, 0.3);
    }
    
    .avatar-decoration {
      position: absolute;
      top: -10px;
      right: -10px;
      font-size: 35px;
      animation: rotate 3s linear infinite;
    }
  }
  
  .intro-name {
    font-size: 32px;
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 10px 0;
    font-weight: 700;
  }
  
  .intro-title {
    font-size: 16px;
    color: #999;
    margin: 0 0 25px 0;
  }
  
  .intro-tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
    
    .tag {
      background: linear-gradient(135deg, rgba(255, 154, 158, 0.15) 0%, rgba(254, 207, 239, 0.15) 100%);
      color: #ff9a9e;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      border: 2px solid rgba(255, 154, 158, 0.2);
      font-weight: 600;
    }
  }
}

.content-section {
  padding: 35px;
  margin-bottom: 30px;
  
  .section-title {
    font-size: 24px;
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 20px 0;
    font-weight: 700;
  }
  
  .content-text {
    p {
      color: #666;
      font-size: 16px;
      line-height: 2;
      margin: 0 0 15px 0;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.skills-section {
  padding: 35px;
  margin-bottom: 30px;
  
  .section-title {
    font-size: 24px;
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 25px 0;
    font-weight: 700;
  }
  
  .skills-grid {
    display: grid;
    gap: 20px;
  }
  
  .skill-item {
    display: flex;
    align-items: center;
    gap: 15px;
    
    .skill-icon {
      font-size: 32px;
      flex-shrink: 0;
    }
    
    .skill-name {
      font-size: 16px;
      font-weight: 600;
      color: #5a5a5a;
      min-width: 100px;
    }
    
    .skill-bar {
      flex: 1;
      height: 12px;
      background: rgba(255, 182, 193, 0.2);
      border-radius: 6px;
      overflow: hidden;
      
      .skill-progress {
        height: 100%;
        background: linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%);
        border-radius: 6px;
        transition: width 1s ease;
      }
    }
  }
}

.contact-section {
  padding: 35px;
  
  .section-title {
    font-size: 24px;
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 25px 0;
    font-weight: 700;
  }
  
  .contact-grid {
    display: grid;
    gap: 20px;
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(255, 154, 158, 0.05) 0%, rgba(254, 207, 239, 0.05) 100%);
    border-radius: 15px;
    border: 2px solid rgba(255, 182, 193, 0.2);
    
    .contact-icon {
      font-size: 40px;
      flex-shrink: 0;
    }
    
    .contact-info {
      flex: 1;
      
      .contact-label {
        font-size: 14px;
        color: #999;
        margin-bottom: 5px;
      }
      
      .contact-value {
        font-size: 16px;
        font-weight: 600;
        color: #5a5a5a;
      }
    }
  }
}

@keyframes flutter {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(-5deg);
  }
  75% {
    transform: translateY(-5px) rotate(5deg);
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
  .page-header {
    flex-direction: column;
    text-align: center;
    
    .header-text h1 {
      font-size: 32px;
    }
  }
  
  .intro-section {
    padding: 35px 25px;
  }
  
  .content-section,
  .skills-section,
  .contact-section {
    padding: 25px;
  }
  
  .skill-item {
    flex-wrap: wrap;
    
    .skill-name {
      min-width: auto;
    }
    
    .skill-bar {
      width: 100%;
    }
  }
}
</style>
