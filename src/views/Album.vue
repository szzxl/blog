<template>
  <div class="album">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">📷 相册</h1>
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
                <span class="view-icon">📷</span>
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
            <div class="empty-icon">📷</div>
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
                <span class="view-icon">🔍</span>
              </div>
            </div>
            <div class="photo-info">
              <h3 class="photo-title">{{ photo.photoName }}</h3>
              <p class="photo-desc" v-if="photo.photoDesc">{{ photo.photoDesc }}</p>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="!loading && photos.length === 0" class="empty-state">
            <div class="empty-icon">📷</div>
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
  padding: 32px 0 48px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  border-left: 4px solid var(--color-accent);
  padding-left: 20px;
  margin-bottom: 32px;

  .page-title {
    font-family: var(--font-serif);
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin-bottom: 6px;
  }

  .page-desc {
    font-size: 13px;
    color: var(--text-tertiary);
  }
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.album-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  cursor: pointer;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);

    .cover-img { transform: scale(1.04); }
    .cover-overlay { opacity: 1; }
  }

  .album-cover {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;

    .cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .cover-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.2s ease;

      .view-icon { font-size: 36px; }

      .photo-count {
        color: #fff;
        font-size: 14px;
        font-weight: 600;
      }
    }
  }

  .album-info {
    padding: 14px 16px;

    .album-name {
      font-family: var(--font-serif);
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: color 0.15s ease;
    }

    .album-desc {
      font-size: 13px;
      color: var(--text-tertiary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  &:hover .album-name {
    color: var(--color-accent);
  }
}

.detail-header {
  margin-bottom: 32px;

  .back-btn {
    margin-bottom: 16px;
    border-radius: var(--radius-btn);
    padding: 8px 16px;
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }
  }

  .album-title-section {
    border-left: 4px solid var(--color-accent);
    padding-left: 20px;

    .album-title {
      font-family: var(--font-serif);
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      margin-bottom: 6px;
    }

    .album-subtitle {
      font-size: 13px;
      color: var(--text-tertiary);
    }
  }
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.photo-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  cursor: pointer;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);

    .photo-img { transform: scale(1.04); }
    .photo-overlay { opacity: 1; }
  }

  .photo-wrapper {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;

    .photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .photo-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;

      .view-icon { font-size: 36px; }
    }
  }

  .photo-info {
    padding: 12px 14px;

    .photo-title {
      font-family: var(--font-serif);
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: color 0.15s ease;
    }

    .photo-desc {
      font-size: 12px;
      color: var(--text-tertiary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  &:hover .photo-title {
    color: var(--color-accent);
  }
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 64px 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.photo-preview-dialog {
  :deep(.el-dialog) {
    background: rgba(0, 0, 0, 0.95);

    .el-dialog__body {
      padding: 20px;
      text-align: center;
    }
  }

  .preview-img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    border-radius: var(--radius-btn);
  }

  .preview-info {
    margin-top: 16px;
    color: #fff;

    h3 {
      font-size: 16px;
      margin-bottom: 8px;
    }

    p {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

@media (max-width: 640px) {
  .albums-grid,
  .photos-grid {
    grid-template-columns: 1fr;
  }
}
</style>
