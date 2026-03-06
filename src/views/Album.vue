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
  padding: 40px 0;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 60px;
}

.page-header {
  text-align: center;
  margin-bottom: 50px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  
  .page-title {
    font-size: 42px;
    font-weight: 700;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 15px;
  }
  
  .page-desc {
    font-size: 16px;
    color: #666;
    font-weight: 600;
  }
}



// 相册列表视图
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.album-card {
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(139, 92, 246, 0.25);
    
    .cover-img {
      transform: scale(1.1);
    }
    
    .cover-overlay {
      opacity: 1;
    }
  }
  
  .album-cover {
    position: relative;
    width: 100%;
    height: 240px;
    overflow: hidden;
    border-radius: 15px;
    margin-bottom: 15px;
    
    .cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    
    .cover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(139, 92, 246, 0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      opacity: 0;
      transition: opacity 0.3s ease;
      
      .view-icon {
        font-size: 48px;
        filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.3));
      }
      
      .photo-count {
        color: #fff;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
  
  .album-info {
    .album-name {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .album-desc {
      font-size: 14px;
      color: var(--text-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}

// 相册详情视图
.detail-header {
  margin-bottom: 40px;
  
  .back-btn {
    margin-bottom: 20px;
    border-radius: 20px;
    padding: 10px 20px;
    background: var(--bg-card);
    border: 2px solid rgba(139, 92, 246, 0.2);
    color: var(--text-primary);
    font-weight: 600;
    
    .icon {
      margin-right: 5px;
      font-size: 18px;
    }
    
    &:hover {
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      color: #fff;
      border-color: #8b5cf6;
    }
  }
  
  .album-title-section {
    text-align: center;
    
    .album-title {
      font-size: 36px;
      font-weight: 700;
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
    }
    
    .album-subtitle {
      font-size: 16px;
      color: var(--text-secondary);
    }
  }
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.photo-item {
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(139, 92, 246, 0.25);
    
    .photo-img {
      transform: scale(1.1);
    }
    
    .photo-overlay {
      opacity: 1;
    }
  }
  
  .photo-wrapper {
    position: relative;
    width: 100%;
    height: 240px;
    overflow: hidden;
    border-radius: 15px;
    margin-bottom: 15px;
    
    .photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    
    .photo-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(139, 92, 246, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      
      .view-icon {
        font-size: 48px;
        filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.3));
      }
    }
  }
  
  .photo-info {
    .photo-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .photo-desc {
      font-size: 14px;
      color: var(--text-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}



.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 100px 20px;
  
  .empty-icon {
    font-size: 80px;
    margin-bottom: 20px;
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: 18px;
    color: var(--text-tertiary);
  }
}

.photo-preview-dialog {
  :deep(.el-dialog) {
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    
    .el-dialog__body {
      padding: 20px;
      text-align: center;
    }
  }
  
  .preview-img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    border-radius: 10px;
  }
  
  .preview-info {
    margin-top: 20px;
    color: #fff;
    
    h3 {
      font-size: 20px;
      margin-bottom: 10px;
    }
    
    p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }
  
  .page-header {
    margin-bottom: 30px;
    padding: 20px;
    
    .page-title {
      font-size: 32px;
    }
    
    .page-desc {
      font-size: 14px;
    }
  }
  
  .albums-grid,
  .photos-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .album-card,
  .photo-item {
    .album-cover,
    .photo-wrapper {
      height: 220px;
    }
  }
  
  .detail-header {
    .album-title-section {
      .album-title {
        font-size: 28px;
      }
    }
  }
}
</style>
