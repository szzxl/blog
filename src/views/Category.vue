<template>
  <div class="category">
    <!-- ── Banner ──────────────────────────────────────── -->
    <div class="page-banner">
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <h1 class="banner-title">文章分类</h1>
        <p class="banner-subtitle">共 {{ categories.length }} 个分类</p>
      </div>
    </div>

    <!-- ── 主体内容 ─────────────────────────────────────── -->
    <div class="container main-body">
      <!-- 分类网格 -->
      <div class="category-grid" v-loading="loading">
        <div
          class="category-item"
          v-for="(cat, index) in categories"
          :key="cat.id ?? index"
          @click="viewCategory(cat.categoryName)"
        >
          <!-- 渐变图标区域 -->
          <div class="category-icon" :style="{ background: getGradient(index) }">
            <span class="icon-emoji">{{ cat.icon || '📂' }}</span>
          </div>

          <div class="category-info">
            <h3 class="category-name">{{ cat.categoryName }}</h3>
            <div class="category-count">
              <span class="count">{{ cat.count || 0 }}</span>
              <span class="label">篇文章</span>
            </div>
          </div>

          <div class="view-btn">查看文章 →</div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && categories.length === 0" class="empty-state">
          <div class="empty-text">暂无分类</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategoryList } from '@/api/article'
import { ElMessage } from 'element-plus'

const router = useRouter()

interface Category {
  id: number
  categoryName: string
  icon?: string
  desc?: string
  count?: number
}

const categories = ref<Category[]>([])
const loading = ref(false)


// 卡片渐变色列表
const gradients = [
  'linear-gradient(135deg, #165dff 0%, #722ed1 100%)',
  'linear-gradient(135deg, #0fc6c2 0%, #165dff 100%)',
  'linear-gradient(135deg, #ff7d00 0%, #f53f3f 100%)',
  'linear-gradient(135deg, #00b42a 0%, #0fc6c2 100%)',
  'linear-gradient(135deg, #722ed1 0%, #f53f3f 100%)',
  'linear-gradient(135deg, #f7ba1e 0%, #ff7d00 100%)',
  'linear-gradient(135deg, #165dff 0%, #0fc6c2 100%)',
  'linear-gradient(135deg, #f53f3f 0%, #722ed1 100%)',
]

const getGradient = (index: number) => gradients[index % gradients.length]

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const res: any = await getCategoryList({
      pageNo: 1,
      pageSize: 100
    })

    // 处理返回的数据 - 适配后端返回的 {name, num} 结构
    if (Array.isArray(res)) {
      categories.value = res.map((item: any, index: number) => ({
        id: item.id || index + 1,
        categoryName: item.name || item.categoryName,
        icon: getDefaultIcon(item.name || item.categoryName),
        desc: item.description || `${item.name || item.categoryName}相关文章`,
        count: item.num || item.count || item.articleCount || 0
      }))
    } else if (res && res.list) {
      categories.value = res.list.map((item: any, index: number) => ({
        id: item.id || index + 1,
        categoryName: item.name || item.categoryName,
        icon: getDefaultIcon(item.name || item.categoryName),
        desc: item.description || `${item.name || item.categoryName}相关文章`,
        count: item.num || item.count || item.articleCount || 0
      }))
    }
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 根据分类名称返回默认图标
const FALLBACK_ICONS = ['🚀','💡','🎯','🌈','⚡','🔮','🎪','🏆','🌺','🎭','🔬','💎','🧩','🌊','🎸']

const getDefaultIcon = (name: string) => {
  const iconMap: Record<string, string> = {
    '生活': '✨', '日常': '🌸', '随笔': '✍️', '杂谈': '💬',
    '技术': '💻', '技术分享': '💻', '编程': '⌨️', '代码': '📟',
    '前端': '🎨', '后端': '⚙️', '全栈': '🖥️',
    '运维': '🖥️', '部署': '🚢', '服务器': '🗄️', 'Linux': '🐧',
    '工具': '🔧', '效率': '⏱️', '软件': '🛠️',
    '算法': '🧮', '数据结构': '🌲', '数学': '📐',
    '数据库': '🗄️', 'SQL': '📊', 'Redis': '🔴',
    'Python': '🐍', 'Java': '☕', 'Go': '🐹', 'Rust': '⚙️',
    'Vue': '💚', 'React': '⚛️', 'Node': '🟢',
    'Docker': '🐳', 'K8s': '☸️', '容器': '📦',
    '安全': '🔐', '网络': '🌐', '云': '☁️',
    '旅行': '✈️', '美食': '🍰', '摄影': '📷',
    '读书': '📚', '学习': '📖', '笔记': '📝', '教程': '📋',
    '音乐': '🎵', '电影': '🎬', '游戏': '🎮', '运动': '⚽',
    '分享': '🔗', '资源': '💎', '开源': '🌐',
  }

  for (const key in iconMap) {
    if (name?.includes(key)) return iconMap[key]
  }

  // 按名称哈希选图标，保证不同分类名得到不同图标
  let hash = 0
  for (let i = 0; i < (name?.length || 0); i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffff
  }
  return FALLBACK_ICONS[hash % FALLBACK_ICONS.length]
}

const viewCategory = (categoryName: string) => {
  router.push(`/articles?category=${categoryName}`)
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped lang="scss">
// ── Banner ────────────────────────────────────────────
.page-banner {
  position: relative;
  height: 200px;
  background: url('/bg-banner.png') center 30% / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;

  .banner-overlay {
    position: absolute;
    inset: 0;
    background: rgba(5, 12, 30, 0.62);
  }

  .banner-content {
    position: relative;
    z-index: 1;
    text-align: center;

    .banner-title {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
      margin: 0 0 8px 0;
      line-height: 1.2;
    }

    .banner-subtitle {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.65);
      margin: 0;
      font-family: var(--font-sans);
    }
  }
}

// ── 容器 ──────────────────────────────────────────────
.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

.main-body {
  padding-top: 48px;
  padding-bottom: 80px;
}

// ── 分类网格 ──────────────────────────────────────────
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 22px;
}

.category-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 0 0 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow 0.35s ease, transform 0.35s ease, border-color 0.35s ease;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-4px);
    border-color: var(--color-accent);

    .category-name {
      color: var(--color-accent);
    }

    .view-btn {
      background: var(--color-accent);
      color: #fff;
      border-color: var(--color-accent);
    }
  }

  // 渐变图标区域
  .category-icon {
    width: 100%;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    flex-shrink: 0;

    .icon-emoji {
      font-size: 2.4rem;
      line-height: 1;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.25));
    }
  }

  .category-info {
    padding: 0 20px;
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 16px;

    .category-name {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 12px 0;
      letter-spacing: -0.01em;
      transition: color 0.2s ease;
    }

    .category-count {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 5px;

      .count {
        font-size: 28px;
        font-weight: 700;
        line-height: 1;
        background: var(--gradient-accent);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -0.02em;
      }

      .label {
        font-size: 12px;
        color: var(--text-tertiary);
        letter-spacing: 0.04em;
        font-family: var(--font-sans);
      }
    }
  }

  .view-btn {
    display: inline-block;
    padding: 7px 22px;
    border-radius: var(--radius-btn);
    background: transparent;
    border: 1px solid var(--color-accent);
    color: var(--color-accent);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
    font-family: var(--font-sans);
    transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
  }
}

// ── 空状态 ────────────────────────────────────────────
.empty-state {
  text-align: center;
  padding: 72px 0;
  color: var(--text-tertiary);
  font-size: 15px;
  grid-column: 1 / -1;

  .empty-text {
    font-family: var(--font-display);
  }
}

// ── 响应式 ────────────────────────────────────────────
@media (max-width: 768px) {
  .page-banner {
    height: 160px;

    .banner-content .banner-title {
      font-size: 1.8rem;
    }
  }

  .main-body {
    padding-top: 36px;
    padding-bottom: 60px;
  }

  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .category-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
