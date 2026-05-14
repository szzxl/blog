<template>
  <div class="album">
    <!-- ── Banner ── -->
    <div class="page-banner">
      <div class="banner-mask"></div>
      <div class="banner-content">
        <h1 class="banner-title">{{ currentAlbum ? currentAlbum.albumName : '相册' }}</h1>
        <p class="banner-sub">{{ currentAlbum ? currentAlbum.albumDesc || `${photos.length} 张照片` : '珍藏美好时光' }}</p>
      </div>
    </div>

    <div class="container">
      <!-- 相册列表 -->
      <div v-if="!currentAlbum" class="albums-view">
        <div class="albums-grid" v-loading="albumsLoading">
          <div
            class="album-card"
            v-for="album in albums"
            :key="album.id"
            @click="loadAlbumPhotos(album)"
          >
            <div class="album-cover">
              <img
                :src="album.albumCover || '/default-cover.svg'"
                :alt="album.albumName"
                class="cover-img"
                loading="lazy"
              />
              <div class="cover-overlay">
                <div class="cover-info">
                  <span class="album-name-overlay">{{ album.albumName }}</span>
                  <span class="photo-count">{{ album.photoCount ?? 0 }} 张照片</span>
                </div>
              </div>
            </div>
            <div class="album-info">
              <h3 class="album-name">{{ album.albumName }}</h3>
              <p class="album-desc" v-if="album.albumDesc">{{ album.albumDesc }}</p>
              <span class="photo-num">{{ album.photoCount ?? 0 }} 张</span>
            </div>
          </div>

          <div v-if="!albumsLoading && albums.length === 0" class="empty-state">
            暂无相册
          </div>
        </div>
      </div>

      <!-- 相册详情 -->
      <div v-else class="album-detail-view">
        <div class="detail-header">
          <button class="back-btn" @click="backToAlbums">← 返回相册列表</button>
        </div>

        <!-- 照片网格 -->
        <div class="photos-grid" v-loading="photosLoading">
          <div
            class="photo-item"
            v-for="(photo, index) in photos"
            :key="photo.id"
            @click="openLightbox(index)"
          >
            <div class="photo-wrapper">
              <img
                :src="photo.photoUrl || '/default-cover.svg'"
                :alt="photo.photoName"
                class="photo-img"
                loading="lazy"
              />
              <div class="photo-overlay">
                <span class="view-icon">⊕</span>
              </div>
            </div>
            <div class="photo-info" v-if="photo.photoName || photo.photoDesc">
              <h3 class="photo-title" v-if="photo.photoName">{{ photo.photoName }}</h3>
              <p class="photo-desc" v-if="photo.photoDesc">{{ photo.photoDesc }}</p>
            </div>
          </div>

          <div v-if="!photosLoading && photos.length === 0" class="empty-state">
            该相册暂无照片
          </div>
        </div>

      </div>
    </div>

    <!-- ── 灯箱 ── -->
    <Transition name="lb">
      <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
        <img :src="photos[lightboxIndex]?.photoUrl" class="lb-img" @click.stop />

        <!-- 上一张 -->
        <button
          v-if="lightboxIndex > 0"
          class="lb-arrow lb-prev"
          @click.stop="lightboxIndex--"
          aria-label="上一张"
        >‹</button>

        <!-- 下一张 -->
        <button
          v-if="lightboxIndex < photos.length - 1"
          class="lb-arrow lb-next"
          @click.stop="lightboxIndex++"
          aria-label="下一张"
        >›</button>

        <!-- 关闭 -->
        <button class="lb-close" @click="closeLightbox" aria-label="关闭">×</button>

        <!-- 标题 + 计数 -->
        <div class="lb-caption">
          <span class="lb-title">{{ photos[lightboxIndex]?.photoName }}</span>
          <span class="lb-counter">{{ lightboxIndex + 1 }} / {{ photos.length }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getAlbumList, getAlbumPhotos } from '@/api/article'
import { ElMessage } from 'element-plus'

interface Album {
  id: number
  albumName: string
  albumDesc?: string
  albumCover: string
  albumStatus: number
  photoCount?: number
}

interface Photo {
  id: number
  photoName: string
  photoDesc?: string
  photoUrl: string
  albumId: number
}

const albums       = ref<Album[]>([])
const currentAlbum = ref<Album | null>(null)
const photos       = ref<Photo[]>([])
const albumsLoading = ref(false)
const photosLoading = ref(false)

// ── 灯箱 ──────────────────────────────────────────────
const lightboxOpen  = ref(false)
const lightboxIndex = ref(0)

const openLightbox = (index: number) => {
  lightboxIndex.value = index
  lightboxOpen.value  = true
}

const closeLightbox = () => { lightboxOpen.value = false }

const onKeydown = (e: KeyboardEvent) => {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape')     closeLightbox()
  if (e.key === 'ArrowLeft'  && lightboxIndex.value > 0)               lightboxIndex.value--
  if (e.key === 'ArrowRight' && lightboxIndex.value < photos.value.length - 1) lightboxIndex.value++
}

// ── 数据获取 ──────────────────────────────────────────
const fetchAlbums = async () => {
  albumsLoading.value = true
  try {
    const res: any = await getAlbumList()
    if (Array.isArray(res))      albums.value = res
    else if (res?.list)          albums.value = res.list
  } catch {
    ElMessage.error('获取相册列表失败')
  } finally {
    albumsLoading.value = false
  }
}

const loadAlbumPhotos = async (album: Album) => {
  currentAlbum.value = album
  photos.value       = []
  photosLoading.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
  try {
    const res: any = await getAlbumPhotos({ id: album.id })
    if (Array.isArray(res))  photos.value = res
    else if (res?.list)      photos.value = res.list
  } catch {
    ElMessage.error('获取照片失败')
  } finally {
    photosLoading.value = false
  }
}

const backToAlbums = () => {
  currentAlbum.value = null
  photos.value       = []
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  fetchAlbums()
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
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

  .banner-mask {
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
      letter-spacing: 0.04em;
    }

    .banner-sub {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.65);
      margin: 0;
      letter-spacing: 0.06em;
    }
  }
}

// ── 容器 ──────────────────────────────────────────────
.album {
  min-height: calc(100vh - 200px);
  background: var(--bg-primary);
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

// ── 相册网格 ──────────────────────────────────────────
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.album-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  cursor: pointer;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.35s ease, transform 0.35s ease, border-color 0.35s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-card-hover);
    border-color: var(--color-accent);

    .cover-img   { transform: scale(1.07); }
    .cover-overlay { opacity: 1; }
    .album-name  { color: var(--color-accent); }
  }

  .album-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    background: var(--bg-secondary);

    .cover-img {
      width: 100%; height: 100%;
      object-fit: cover; display: block;
      transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .cover-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(5,12,30,0.82) 0%, rgba(5,12,30,0.15) 60%, transparent 100%);
      display: flex; align-items: flex-end;
      opacity: 0; transition: opacity 0.3s ease;
      padding: 16px 18px;

      .cover-info {
        display: flex; flex-direction: column; gap: 4px;
        .album-name-overlay {
          font-family: var(--font-display);
          font-size: 16px; font-weight: 700; color: #fff;
        }
        .photo-count {
          font-size: 12px; color: rgba(255,255,255,0.72);
        }
      }
    }
  }

  .album-info {
    padding: 14px 18px 16px;
    display: flex; flex-direction: column; gap: 4px;

    .album-name {
      font-family: var(--font-display);
      font-size: 16px; font-weight: 700; color: var(--text-primary);
      margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      transition: color 0.2s;
    }

    .album-desc {
      font-size: 13px; color: var(--text-tertiary); line-height: 1.6; margin: 0;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    .photo-num {
      font-size: 12px; color: var(--color-accent); font-weight: 600; margin-top: 2px;
    }
  }
}

// ── 详情页头 ──────────────────────────────────────────
.detail-header {
  margin-bottom: 32px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-btn);
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
  font-family: var(--font-sans);

  &:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
    background: var(--bg-secondary);
  }
}

// ── 照片网格 ──────────────────────────────────────────
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
}

.photo-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  cursor: pointer;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.35s ease, transform 0.35s ease, border-color 0.35s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);
    border-color: var(--color-accent);

    .photo-img { transform: scale(1.06); }
    .photo-overlay { opacity: 1; }
    .photo-title { color: var(--color-accent); }
  }

  .photo-wrapper {
    position: relative;
    width: 100%; aspect-ratio: 4 / 3;
    overflow: hidden; background: var(--bg-secondary);

    .photo-img {
      width: 100%; height: 100%;
      object-fit: cover; display: block;
      transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .photo-overlay {
      position: absolute; inset: 0;
      background: rgba(5, 12, 30, 0.45);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.3s;

      .view-icon {
        font-size: 30px;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1;
      }
    }
  }

  .photo-info {
    padding: 10px 14px 12px;

    .photo-title {
      font-size: 13px; font-weight: 600; color: var(--text-primary);
      margin: 0 0 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      transition: color 0.2s;
    }

    .photo-desc {
      font-size: 12px; color: var(--text-tertiary); line-height: 1.5; margin: 0;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
  }
}

// ── 空状态 ────────────────────────────────────────────
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 72px 0;
  color: var(--text-tertiary);
  font-size: 15px;
}

// ── 灯箱 ──────────────────────────────────────────────
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 60px 80px 80px;
}

.lb-img {
  max-width: 100%;
  max-height: calc(100vh - 160px);
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
  user-select: none;
}

.lb-arrow {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 52px; height: 52px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
  line-height: 1;

  &:hover { background: rgba(255, 255, 255, 0.22); }
  &.lb-prev { left: 24px; }
  &.lb-next { right: 24px; }
}

.lb-close {
  position: fixed;
  top: 20px; right: 24px;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff; font-size: 22px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;

  &:hover { background: rgba(255, 255, 255, 0.22); }
}

.lb-caption {
  position: fixed;
  bottom: 28px; left: 0; right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 0 80px;

  .lb-title {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 500;
    max-width: 600px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .lb-counter {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    font-family: var(--font-sans);
    white-space: nowrap;
    flex-shrink: 0;
  }
}

.lb-enter-active, .lb-leave-active { transition: opacity 0.2s ease; }
.lb-enter-from, .lb-leave-to { opacity: 0; }

// ── 响应式 ────────────────────────────────────────────
@media (max-width: 768px) {
  .page-banner { height: 160px; }
  .page-banner .banner-content .banner-title { font-size: 1.7rem; }

  .container { padding: 28px 16px 48px; }

  .albums-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
  }

  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .lightbox { padding: 50px 16px 70px; }

  .lb-arrow {
    width: 40px; height: 40px; font-size: 22px;
    &.lb-prev { left: 8px; }
    &.lb-next { right: 8px; }
  }

  .lb-caption { padding: 0 16px; }
}

@media (max-width: 480px) {
  .albums-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  .photos-grid { grid-template-columns: 1fr 1fr; }
}
</style>
