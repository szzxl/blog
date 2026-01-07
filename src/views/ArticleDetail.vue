<template>
  <div class="article-detail">
    <div class="container">
      <!-- 文章头部 -->
      <div class="article-header card">
        <h1 class="article-title">这是一篇文章的标题 - 记录美好生活</h1>
        <div class="article-meta">
          <div class="meta-item">
            <span class="icon">👤</span>
            <span>小花</span>
          </div>
          <div class="meta-item">
            <span class="icon">📅</span>
            <span>2024-01-15 14:30</span>
          </div>
          <div class="meta-item">
            <span class="icon">📂</span>
            <span>生活随笔</span>
          </div>
          <div class="meta-item">
            <span class="icon">👁️</span>
            <span>256</span>
          </div>
        </div>
        <div class="article-tags">
          <span class="tag">Vue</span>
          <span class="tag">生活</span>
          <span class="tag">随笔</span>
        </div>
      </div>
      
      <!-- 文章内容 -->
      <article class="article-content card">
        <div class="content">
          <h2>这是一个二级标题</h2>
          <p>这是文章的正文内容。在这里可以分享生活中的美好瞬间，记录成长的点点滴滴。每一天都值得被记录，每一个瞬间都值得被珍藏。</p>
          
          <p>生活就像一本书，每一页都写满了故事。有欢笑，有泪水，有成长，有收获。让我们一起用心感受生活的美好，用文字记录下这些珍贵的回忆。</p>
          
          <h3>这是一个三级标题</h3>
          <p>在这个快节奏的时代，我们更需要停下来，静静地感受生活。一杯咖啡的香气，一本好书的陪伴，一段美好的音乐，都能让我们的心灵得到片刻的宁静。</p>
          
          <blockquote>
            <p>生活不止眼前的苟且，还有诗和远方。</p>
          </blockquote>
          
          <p>让我们一起用心生活，用爱记录，让每一天都充满阳光和希望。✨</p>
          
          <h3>图片示例</h3>
          <div class="content-images">
            <img src="https://via.placeholder.com/800x400/fecfef/ffffff?text=♡" alt="示例图片">
          </div>
          
          <h3>代码示例</h3>
          <pre><code>const greeting = 'Hello, World!'
console.log(greeting)</code></pre>
          
          <p>这就是今天想要分享的内容，希望能给你带来一些启发和温暖。💕</p>
        </div>
      </article>
      
      <!-- 文章操作 -->
      <div class="article-actions card">
        <el-button class="action-btn like-btn">
          <span class="icon">💗</span>
          <span>点赞 (128)</span>
        </el-button>
        <el-button class="action-btn">
          <span class="icon">⭐</span>
          <span>收藏 (45)</span>
        </el-button>
        <el-button class="action-btn">
          <span class="icon">🔗</span>
          <span>分享</span>
        </el-button>
      </div>
      
      <!-- 评论区 -->
      <Comment />
    </div>
  </div>
</template>

<script setup lang="ts">
import Comment from '@/components/Comment.vue'
</script>

<style scoped lang="scss">
.article-detail {
  min-height: calc(100vh - 200px);
  padding: 40px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 30px;
}

.article-header {
  padding: 40px;
  margin-bottom: 25px;
  
  .article-title {
    font-size: 36px;
    font-weight: 700;
    color: #5a5a5a;
    line-height: 1.5;
    margin: 0 0 25px 0;
  }
  
  .article-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 182, 193, 0.2);
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #999;
      
      .icon {
        font-size: 16px;
      }
    }
  }
  
  .article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    
    .tag {
      padding: 6px 16px;
      border-radius: 15px;
      background: linear-gradient(135deg, rgba(255, 154, 158, 0.15) 0%, rgba(254, 207, 239, 0.15) 100%);
      color: #ff9a9e;
      font-size: 14px;
      font-weight: 600;
    }
  }
}

.article-content {
  padding: 40px;
  margin-bottom: 25px;
  
  .content {
    font-size: 16px;
    line-height: 2;
    color: #666;
    
    h2 {
      font-size: 28px;
      font-weight: 700;
      color: #5a5a5a;
      margin: 40px 0 20px 0;
      padding-bottom: 15px;
      border-bottom: 3px solid;
      border-image: linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%) 1;
    }
    
    h3 {
      font-size: 22px;
      font-weight: 700;
      color: #5a5a5a;
      margin: 30px 0 15px 0;
      
      &::before {
        content: '✨ ';
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    
    p {
      margin: 15px 0;
    }
    
    blockquote {
      margin: 25px 0;
      padding: 20px 25px;
      background: linear-gradient(135deg, rgba(255, 154, 158, 0.08) 0%, rgba(254, 207, 239, 0.08) 100%);
      border-left: 4px solid #ff9a9e;
      border-radius: 0 15px 15px 0;
      
      p {
        margin: 0;
        color: #666;
        font-style: italic;
      }
    }
    
    .content-images {
      margin: 30px 0;
      
      img {
        width: 100%;
        border-radius: 20px;
        box-shadow: 0 8px 30px rgba(255, 154, 158, 0.2);
      }
    }
    
    pre {
      margin: 25px 0;
      padding: 20px;
      background: #f8f8f8;
      border-radius: 15px;
      overflow-x: auto;
      
      code {
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 14px;
        line-height: 1.6;
        color: #5a5a5a;
      }
    }
  }
}

.article-actions {
  padding: 25px;
  margin-bottom: 25px;
  display: flex;
  justify-content: center;
  gap: 15px;
  
  .action-btn {
    height: 45px;
    padding: 0 30px;
    border-radius: 22px;
    border: 2px solid rgba(255, 182, 193, 0.3);
    background: #fff;
    color: #ff9a9e;
    font-size: 15px;
    font-weight: 600;
    transition: all 0.3s;
    
    .icon {
      margin-right: 8px;
      font-size: 18px;
    }
    
    &:hover {
      background: linear-gradient(135deg, rgba(255, 154, 158, 0.1) 0%, rgba(254, 207, 239, 0.1) 100%);
      border-color: #ff9a9e;
      transform: translateY(-2px);
    }
    
    &.like-btn:hover {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      color: #fff;
      border-color: transparent;
    }
  }
}

@media (max-width: 768px) {
  .article-header {
    padding: 30px 25px;
    
    .article-title {
      font-size: 28px;
    }
  }
  
  .article-content {
    padding: 30px 25px;
    
    .content {
      h2 {
        font-size: 24px;
      }
      
      h3 {
        font-size: 20px;
      }
    }
  }
  
  .article-actions {
    flex-wrap: wrap;
    
    .action-btn {
      flex: 1;
      min-width: 120px;
    }
  }
}
</style>
