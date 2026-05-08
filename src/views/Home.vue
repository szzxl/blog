<template>
  <div class="home">
    <!-- Hero 区 -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">{{ siteName || '博客' }}</h1>
          <p class="hero-desc">{{ siteDescription || '记录技术与生活' }}</p>
        </div>
      </div>
    </section>

    <!-- 文章网格 -->
    <div class="container">
      <div class="section-title">
        <span>最新文章</span>
      </div>

      <div class="article-grid" v-loading="loading">
        <div
          class="article-card card"
          v-for="article in articles"
          :key="article.id"
          @click="viewArticle(article.id)"
        >
          <div class="card-badges" v-if="article.isTop === 1 || article.isRecommend === 1">
            <span class="badge-top" v-if="article.isTop === 1">置顶</span>
            <span class="badge-recommend" v-if="article.isRecommend === 1">推荐</span>
          </div>

          <div class="card-cover">
            <img :src="article.articleCover || '/default-cover.svg'" :alt="article.articleName">
          </div>

          <div class="card-body">
            <h3 class="card-title">{{ article.articleName }}</h3>
            <p class="card-abstract" v-if="article.articleAbstract">{{ article.articleAbstract }}</p>

            <div class="card-meta">
              <span v-if="article.articleCategory" class="meta-category">{{ article.articleCategory }}</span>
              <span class="meta-date">{{ formatTime(article.createTime) }}</span>
              <span v-if="article.readNum !== undefined" class="meta-read">{{ article.readNum }} 阅读</span>
            </div>

            <div class="card-tags" v-if="article.articleTag">
              <span
                class="tag"
                v-for="(tag, i) in parseTags(article.articleTag).slice(0, 3)"
                :key="i"
              >{{ tag }}</span>
            </div>
          </div>
        </div>

        <div v-if="!loading && articles.length === 0" class="empty-state">
          <p>暂无文章</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMonthArticleList } from '@/api/article'
import { formatDate } from '@/utils/format'
import { fetchWebsiteConfigWithCache } from '@/utils/websiteConfig'

const router = useRouter()

interface Article {
  id: number
  articleName: string
  articleAbstract?: string
  articleCover?: string
  articleTag?: string
  articleCategory?: string
  readNum?: number
  likeCount?: number
  commentCount?: number
  createTime?: number
  isRecommend?: number
  isTop?: number
}

const articles = ref<Article[]>([])
const loading = ref(false)
const siteName = ref('')
const siteDescription = ref('')

const fetchArticles = async () => {
  loading.value = true
  try {
    const res: any = await getMonthArticleList({ pageNo: 1, pageSize: 9 })
    if (res && res.list) articles.value = res.list
    else if (Array.isArray(res)) articles.value = res
  } catch {
    // 静默失败
  } finally {
    loading.value = false
  }
}

const fetchConfig = async () => {
  try {
    const config = await fetchWebsiteConfigWithCache()
    if (config.site_name) siteName.value = config.site_name
    if (config.site_description) siteDescription.value = config.site_description
  } catch {
    // 静默失败
  }
}

const formatTime = (timestamp?: number) => {
  if (!timestamp) return ''
  return formatDate(new Date(timestamp), 'YYYY-MM-DD')
}

const parseTags = (tagStr?: string) => {
  if (!tagStr) return []
  return tagStr.split(',').map(t => t.trim()).filter(t => t)
}

const viewArticle = (id: number) => {
  router.push(`/article/${id}`)
}

onMounted(() => {
  fetchArticles()
  fetchConfig()
})
</script>

<style scoped lang="scss">
.home {
  min-height: calc(100vh - 200px);
}

.hero {
  padding: 48px 0 40px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 40px;

  .hero-content {
    max-width: 600px;
  }

  .hero-title {
    font-size: 36px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
    line-height: 1.2;
  }

  .hero-desc {
    font-size: 16px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
  }
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-color);
  }
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding-bottom: 48px;
}

.article-card {
  cursor: pointer;
  overflow: hidden;
  position: relative;

  .card-badges {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 2;
    display: flex;
    gap: 6px;
  }

  .badge-top {
    padding: 2px 8px;
    border-radius: var(--radius-tag);
    background: var(--color-danger);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
  }

  .badge-recommend {
    padding: 2px 8px;
    border-radius: var(--radius-tag);
    background: var(--color-warning);
    color: var(--text-inverse);
    font-size: 11px;
    font-weight: 600;
  }

  .card-cover {
    aspect-ratio: 16/9;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
  }

  &:hover .card-cover img {
    transform: scale(1.04);
  }

  .card-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
  }

  .card-abstract {
    font-size: 13px;
    color: var(--text-tertiary);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    span {
      font-size: 12px;
      color: var(--text-tertiary);
    }

    .meta-category {
      color: var(--color-accent-2);
    }
  }

  .card-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .tag {
    padding: 2px 8px;
    border-radius: var(--radius-tag);
    border: 1px solid var(--color-accent);
    color: var(--color-accent);
    font-size: 11px;
  }
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px;
  color: var(--text-tertiary);
  font-size: 14px;
}

@media (max-width: 1024px) {
  .article-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .hero .hero-title {
    font-size: 28px;
  }

  .article-grid {
    grid-template-columns: 1fr;
  }
}
</style>
