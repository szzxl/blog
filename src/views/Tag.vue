<template>
  <div class="tag-page">
    <!-- ── Banner ──────────────────────────────────────── -->
    <div class="page-banner">
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <h1 class="banner-title">标签云</h1>
        <p class="banner-subtitle">共 {{ tags.length }} 个标签</p>
      </div>
    </div>

    <!-- ── 主体内容 ─────────────────────────────────────── -->
    <div class="container main-body">

      <!-- 标签气泡云 -->
      <div class="tag-cloud-wrap" v-loading="loading">
        <div class="tag-cloud">
          <span
            class="bubble-tag"
            v-for="(tag, index) in tags"
            :key="tag.id ?? tag.name"
            :style="getBubbleStyle(tag, index)"
            @click="viewTag(tag.name)"
          >
            {{ tag.name }}
            <em class="bubble-num">{{ tag.num }}</em>
          </span>
        </div>
      </div>

      <!-- 标签列表网格 -->
      <div class="tag-list">
        <h3 class="list-title">所有标签</h3>
        <div class="tag-grid">
          <div
            class="tag-card"
            v-for="(tag, index) in sortedTags"
            :key="tag.id ?? tag.name"
            @click="viewTag(tag.name)"
          >
            <div class="tag-card-icon" :style="{ background: getTagGradient(index) }">
              <span class="tag-hash">{{ getTagIcon(tag.name as string) }}</span>
            </div>
            <div class="tag-card-body">
              <div class="tag-name">{{ tag.name }}</div>
              <div class="tag-count">{{ tag.num }} 篇文章</div>
            </div>
            <div class="tag-arrow">→</div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && tags.length === 0" class="empty-state">
          <div class="empty-text">暂无标签</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTagListCount } from '@/api/article'
import { ElMessage } from 'element-plus'

const router = useRouter()

interface Tag {
  id: string | number
  name: string
  num: number
}

const tags = ref<Tag[]>([])
const loading = ref(false)

const sortedTags = computed(() => {
  return [...tags.value].sort((a, b) => b.num - a.num)
})

// 获取标签列表
const fetchTags = async () => {
  loading.value = true
  try {
    const res: any = await getTagListCount({
      tagStatus: 1,
      pageNo: 1,
      pageSize: 100
    })

    // 处理返回的数据 { code: 0, msg: "", data: [{name: "Java", num: 0}, ...] }
    if (res && Array.isArray(res)) {
      tags.value = res.map((item: any) => ({
        id: item.name,  // 使用 name 作为 id
        name: item.name,
        num: item.num || 0
      }))
    }
  } catch (error) {
    ElMessage.error('获取标签列表失败')
  } finally {
    loading.value = false
  }
}

// 气泡字号（14~36px）
const tagCountRange = computed(() => {
  const counts = tags.value.map(t => t.num || 0)
  return { min: Math.min(...counts), max: Math.max(...counts) }
})

const getTagSize = (num: number = 0) => {
  const minSize = 14
  const maxSize = 36
  const { min, max } = tagCountRange.value
  if (max === min) return (minSize + maxSize) / 2
  return minSize + ((num - min) / (max - min)) * (maxSize - minSize)
}

// 气泡颜色组
const bubbleColors = [
  { color: '#165dff', bg: 'rgba(22,93,255,0.10)', border: 'rgba(22,93,255,0.28)', glow: 'rgba(22,93,255,0.35)' },
  { color: '#722ed1', bg: 'rgba(114,46,209,0.10)', border: 'rgba(114,46,209,0.28)', glow: 'rgba(114,46,209,0.35)' },
  { color: '#0fc6c2', bg: 'rgba(15,198,194,0.10)', border: 'rgba(15,198,194,0.28)', glow: 'rgba(15,198,194,0.35)' },
  { color: '#ff7d00', bg: 'rgba(255,125,0,0.10)', border: 'rgba(255,125,0,0.28)', glow: 'rgba(255,125,0,0.35)' },
  { color: '#00b42a', bg: 'rgba(0,180,42,0.10)', border: 'rgba(0,180,42,0.28)', glow: 'rgba(0,180,42,0.35)' },
  { color: '#f53f3f', bg: 'rgba(245,63,63,0.10)', border: 'rgba(245,63,63,0.28)', glow: 'rgba(245,63,63,0.35)' },
]

const getBubbleStyle = (tag: Tag, index: number) => {
  const size = getTagSize(tag.num)
  const scheme = bubbleColors[index % bubbleColors.length] ?? bubbleColors[0]!
  return {
    fontSize: size + 'px',
    color: scheme.color,
    background: scheme.bg,
    borderColor: scheme.border,
    '--glow': scheme.glow,
  }
}

// 标签卡片渐变
const tagGradients = [
  'linear-gradient(135deg, #165dff 0%, #722ed1 100%)',
  'linear-gradient(135deg, #0fc6c2 0%, #165dff 100%)',
  'linear-gradient(135deg, #ff7d00 0%, #f53f3f 100%)',
  'linear-gradient(135deg, #00b42a 0%, #0fc6c2 100%)',
  'linear-gradient(135deg, #722ed1 0%, #f53f3f 100%)',
  'linear-gradient(135deg, #f7ba1e 0%, #ff7d00 100%)',
]

const getTagGradient = (index: number) => tagGradients[index % tagGradients.length]

// 标签图标
const TAG_ICON_MAP: Record<string, string> = {
  'Java': '☕', 'java': '☕',
  'Python': '🐍', 'python': '🐍',
  'Go': '🐹', 'Golang': '🐹', 'golang': '🐹',
  'Rust': '⚙️', 'rust': '⚙️',
  'Vue': '💚', 'vue': '💚',
  'React': '⚛️', 'react': '⚛️',
  'Node': '🟢', 'node': '🟢',
  'Spring': '🌱', 'spring': '🌱', 'springboot': '🌱', 'SpringBoot': '🌱',
  'Docker': '🐳', 'docker': '🐳',
  'K8s': '☸️', 'kubernetes': '☸️', 'Kubernetes': '☸️',
  'Linux': '🐧', 'linux': '🐧',
  'Git': '🔀', 'git': '🔀',
  'SQL': '🗄️', 'sql': '🗄️', 'MySQL': '🗄️', 'mysql': '🗄️',
  'Redis': '🔴', 'redis': '🔴',
  'Nginx': '🌐', 'nginx': '🌐',
  'SSL': '🔐', 'ssl': '🔐', 'HTTPS': '🔐', 'https': '🔐',
  '监控': '📊', 'monitor': '📊',
  'job': '⏰', 'Job': '⏰', '定时': '⏰',
  '文件': '📁', 'file': '📁',
  '运维': '🖥️', 'devops': '🖥️', 'DevOps': '🖥️',
  '工具': '🔧', 'tool': '🔧',
  '算法': '🧮', 'algorithm': '🧮',
  '安全': '🛡️', 'security': '🛡️',
  '前端': '🎨', 'frontend': '🎨',
  '后端': '⚙️', 'backend': '⚙️',
  '架构': '🏗️', 'arch': '🏗️',
  '测试': '🧪', 'test': '🧪',
  '设计': '✏️', 'design': '✏️',
  'API': '🔌', 'api': '🔌',
  '日志': '📋', 'log': '📋',
  '性能': '⚡', 'performance': '⚡',
  '消息': '📨', 'mq': '📨', 'MQ': '📨',
  '云': '☁️', 'cloud': '☁️',
}

const FALLBACK_TAG_ICONS = ['🚀','💡','🎯','🌈','🔮','🎪','🏆','🌺','🎭','💎','🧩','🌊','🎸','🦋','🌟']

const getTagIcon = (name: string) => {
  for (const key in TAG_ICON_MAP) {
    if (name?.includes(key)) return TAG_ICON_MAP[key]
  }
  let hash = 0
  for (let i = 0; i < (name?.length || 0); i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffff
  }
  return FALLBACK_TAG_ICONS[hash % FALLBACK_TAG_ICONS.length]
}

const viewTag = (name: string | number) => {
  router.push(`/tag/articles?tag=${name}`)
}

onMounted(() => {
  fetchTags()
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

// ── 标签气泡云 ────────────────────────────────────────
.tag-cloud-wrap {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 44px 36px;
  margin-bottom: 48px;
  transition: box-shadow 0.35s ease, border-color 0.35s ease;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    border-color: var(--color-accent);
  }
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px 10px;
  min-height: 120px;
}

.bubble-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 16px;
  border-radius: 999px;
  border: 1px solid;
  cursor: pointer;
  font-weight: 500;
  font-family: var(--font-sans);
  line-height: 1.4;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

  &:hover {
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 4px 16px var(--glow, rgba(22, 93, 255, 0.35));
    filter: brightness(1.1);
  }

  .bubble-num {
    font-style: normal;
    font-size: 0.68em;
    opacity: 0.75;
    font-weight: 400;
  }
}

// ── 标签列表 ──────────────────────────────────────────
.tag-list {
  .list-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 22px 0;
    display: flex;
    align-items: center;
    gap: 10px;

    &::before {
      content: '';
      display: block;
      width: 4px;
      height: 18px;
      background: var(--gradient-accent);
      border-radius: 2px;
      flex-shrink: 0;
    }
  }

  .tag-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 18px;
  }
}

.tag-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: box-shadow 0.35s ease, transform 0.35s ease, border-color 0.35s ease;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-4px);
    border-color: var(--color-accent);

    .tag-name {
      color: var(--color-accent);
    }

    .tag-arrow {
      opacity: 1;
      transform: translateX(2px);
      color: var(--color-accent);
    }
  }

  .tag-card-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .tag-hash {
      color: #fff;
      font-size: 20px;
      font-weight: 400;
      line-height: 1;
    }
  }

  .tag-card-body {
    flex: 1;
    min-width: 0;

    .tag-name {
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.2s ease;
      margin-bottom: 4px;
    }

    .tag-count {
      font-size: 12px;
      color: var(--text-tertiary);
      font-family: var(--font-sans);
    }
  }

  .tag-arrow {
    font-size: 16px;
    color: var(--text-tertiary);
    opacity: 0.4;
    transition: opacity 0.25s ease, transform 0.25s ease, color 0.25s ease;
    font-family: var(--font-sans);
    flex-shrink: 0;
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

  .tag-cloud-wrap {
    padding: 28px 20px;
  }

  .tag-list .tag-grid {
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
}

@media (max-width: 480px) {
  .tag-list .tag-grid {
    grid-template-columns: 1fr;
  }
}
</style>
