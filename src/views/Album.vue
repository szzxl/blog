<template>
  <div class="album">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">相册</h1>
        <p class="page-desc">记录生活中的美好瞬间</p>
      </div>

      <!-- 相册列表视图 -->
      <div v-if="!currentAlbum" class="albums-view">
        <div class="albums-grid" v-loading="loading">
          <div 
            class="album-card card" 
            v-for="album in albums" 
            :key="album.id"
            @click="loadAlbumPhotos(album)"
          >
            <div class="album-cover">
              <img :src="album.albumCover" :alt="album.albumName" class="cover-img">
              <div class="cover-overlay">
                <span class="view-icon">↗</span>
                <span class="photo-count">{{ album.photoCount }} 张照片</span>
              </div>
            </div>
            <div class="album-info">
              <h3 class="album-name">{{ album.albumName }}</h3>
              <p class="album-desc" v-if="album.albumDesc">{{ album.albumDesc }}</p>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="!loading && albums.length === 0" class="empty-state">
            <div class="empty-text">暂无相册</div>
          </div>
        </div>
      </div>

      <!-- 相册详情视图 -->
      <div v-else class="album-detail-view">
        <!-- 返回按钮和相册标题 -->
        <div class="detail-header">
          <el-button class="back-btn" @click="backToAlbums">
            <span class="icon">←</span>
            返回相册列表
          </el-button>
          <div class="album-title-section">
            <h2 class="album-title">{{ currentAlbum.albumName }}</h2>
            <p class="album-subtitle" v-if="currentAlbum.albumDesc">{{ currentAlbum.albumDesc }}</p>
          </div>
        </div>

        <!-- 照片网格 -->
        <div class="photos-grid" v-loading="loading">
          <div 
            class="photo-item card" 
            v-for="photo in photos" 
            :key="photo.id"
            @click="viewPhoto(photo)"
          >
            <div class="photo-wrapper">
              <img :src="photo.photoUrl" :alt="photo.photoName" class="photo-img">
              <div class="photo-overlay">
                <span class="view-icon">↗</span>
              </div>
            </div>
            <div class="photo-info">
              <h3 class="photo-title">{{ photo.photoName }}</h3>
              <p class="photo-desc" v-if="photo.photoDesc">{{ photo.photoDesc }}</p>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="!loading && photos.length === 0" class="empty-state">
            <div class="empty-text">该相册暂无照片</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览 -->
    <el-dialog
      v-model="showPreview"
      :show-close="true"
      width="90%"
      class="photo-preview-dialog"
    >
      <img :src="currentPhoto?.photoUrl" :alt="currentPhoto?.photoName" class="preview-img">
      <div class="preview-info">
        <h3>{{ currentPhoto?.photoName }}</h3>
        <p v-if="currentPhoto?.photoDesc">{{ currentPhoto?.photoDesc }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAlbumList, getAlbumPhotos } from '@/api/article'

interface Album {
  id: number
  albumName: string
  albumDesc?: string
  albumCover: string
  albumStatus: number
  photoCount: number
}

interface Photo {
  id: number
  photoName: string
  photoDesc?: string
  photoUrl: string
  albumId: number
}

const albums = ref<Album[]>([])
const currentAlbum = ref<Album | null>(null)
const photos = ref<Photo[]>([])
const loading = ref(false)
const showPreview = ref(false)
const currentPhoto = ref<Photo | null>(null)

// 获取相册列表
const fetchAlbums = async () => {
  loading.value = true
  try {
    const response: any = await getAlbumList({
      albumStatus: 0  // 只获取已发布的相册
    })
    
    if (Array.isArray(response) && response.length > 0) {
      albums.value = response
      // 不再自动加载第一个相册
    }
  } catch (error) {
    // 静默失败
  } finally {
    loading.value = false
  }
}

// 加载某个相册的照片
const loadAlbumPhotos = async (album: Album) => {
  currentAlbum.value = album
  loading.value = true
  try {
    const response: any = await getAlbumPhotos({ id: album.id })
    
    if (Array.isArray(response) && response.length > 0) {
      photos.value = response
    } else {
      photos.value = []
    }
  } catch (error) {
    photos.value = []
  } finally {
    loading.value = false
  }
}

// 返回相册列表
const backToAlbums = () => {
  currentAlbum.value = null
  photos.value = []
}

const viewPhoto = (photo: Photo) => {
  currentPhoto.value = photo
  showPreview.value = true
}

onMounted(() => {
  fetchAlbums()
})
</script>

<style scoped lang="scss">
.album {
  min-height: calc(100vh - 200px);
  padding: 104px 0 64px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

// ── 页头 ──────────────────────────────────────────────
.page-header {
  border-left: 4px solid var(--color-accent);
  padding-left: 20px;
  margin-bottom: 40px;

  .page-title {
    font-family: var(--font-serif);
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin: 0 0 8px 0;
  }

  .page-desc {
    font-size: 14px;
    color: var(--text-tertiary);
    margin: 0;
  }
}

// ── 相册网格 ──────────────────────────────────────────
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 22px;
}

.album-card {
  background: var(--bg-card);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
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

    .cover-img { transform: scale(1.06); }
    .cover-overlay { opacity: 1; }
    .album-name { color: var(--color-accent); }
  }

  .album-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--bg-secondary);

    .cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .cover-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.32) 60%, rgba(0,0,0,0.18) 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      opacity: 0;
      transition: opacity 0.3s ease;

      .view-icon {
        font-size: 22px;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 300;
      }

      .photo-count {
        color: #fff;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.85;
      }
    }
  }

  .album-info {
    padding: 16px 18px 18px;

    .album-name {
      font-family: var(--font-serif);
      font-size: 17px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
      margin: 0 0 6px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: color 0.2s ease;
    }

    .album-desc {
      font-size: 13px;
      color: var(--text-tertiary);
      line-height: 1.65;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}

// ── 详情页头 ──────────────────────────────────────────
.detail-header {
  margin-bottom: 36px;

  .back-btn {
    margin-bottom: 20px;
    border-radius: var(--radius-btn);
    padding: 8px 16px;
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;

    .icon { margin-right: 4px; }

    &:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
      background: var(--bg-secondary);
    }
  }

  .album-title-section {
    border-left: 4px solid var(--color-accent);
    padding-left: 20px;

    .album-title {
      font-family: var(--font-serif);
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      margin: 0 0 8px 0;
    }

    .album-subtitle {
      font-size: 14px;
      color: var(--text-tertiary);
      margin: 0;
    }
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
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
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
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--bg-secondary);

    .photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .photo-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.18) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;

      .view-icon {
        font-size: 22px;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 300;
      }
    }
  }

  .photo-info {
    padding: 14px 16px 16px;

    .photo-title {
      font-family: var(--font-serif);
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
      margin: 0 0 4px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: color 0.2s ease;
    }

    .photo-desc {
      font-size: 12px;
      color: var(--text-tertiary);
      line-height: 1.6;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
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

// ── 预览弹窗（保留深色背景）───────────────────────────
.photo-preview-dialog {
  :deep(.el-dialog) {
    background: rgba(8, 10, 14, 0.96);
    border-radius: var(--radius-card);
    box-shadow: 0 30px 80px rgba(0,0,0,0.6);

    .el-dialog__body {
      padding: 20px 24px 28px;
      text-align: center;
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: rgba(255, 255, 255, 0.85);
      font-size: 22px;
    }
  }

  .preview-img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    border-radius: var(--radius-btn);
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  }

  .preview-info {
    margin-top: 18px;
    color: #fff;

    h3 {
      font-family: var(--font-serif);
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.01em;
      margin: 0 0 6px 0;
    }

    p {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.62);
      margin: 0;
      line-height: 1.65;
    }
  }
}

@media (max-width: 640px) {
  .album { padding: 28px 0 48px; }

  .page-header {
    margin-bottom: 28px;
    .page-title { font-size: 26px; }
  }

  .albums-grid,
  .photos-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .detail-header .album-title-section .album-title { font-size: 22px; }
}
</style>
