<template>
  <div class="album">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">📷 相册</h1>
        <p class="page-desc">记录生活中的美好瞬间</p>
      </div>

      <!-- 相册选择器 -->
      <div class="album-selector" v-if="albums.length > 0">
        <div 
          class="album-tab"
          v-for="album in albums"
          :key="album.id"
          :class="{ active: currentAlbum?.id === album.id }"
          @click="loadAlbumPhotos(album)"
        >
          <span class="album-name">{{ album.albumName }}</span>
          <span class="photo-count">{{ album.photoCount }} 张</span>
        </div>
      </div>

      <!-- 照片网格 -->
      <div class="album-grid" v-loading="loading">
        <div 
          class="album-item card" 
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
      // 默认加载第一个相册的照片
      if (albums.value.length > 0) {
        loadAlbumPhotos(albums.value[0])
      }
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
    color: var(--text-secondary);
  }
}

.album-selector {
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;
  
  .album-tab {
    padding: 12px 24px;
    border-radius: 25px;
    background: var(--bg-card);
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .album-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .photo-count {
      font-size: 13px;
      color: var(--text-tertiary);
      background: rgba(139, 92, 246, 0.1);
      padding: 2px 8px;
      border-radius: 10px;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(139, 92, 246, 0.2);
      border-color: rgba(139, 92, 246, 0.3);
    }
    
    &.active {
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      border-color: #8b5cf6;
      
      .album-name {
        color: #fff;
      }
      
      .photo-count {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
    }
  }
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.album-item {
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
      font-size: 18px;
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
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .photo-meta {
      display: flex;
      gap: 15px;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 13px;
        color: var(--text-tertiary);
        
        .icon {
          font-size: 14px;
        }
      }
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
    
    .page-title {
      font-size: 32px;
    }
    
    .page-desc {
      font-size: 14px;
    }
  }
  
  .album-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .album-item {
    .photo-wrapper {
      height: 220px;
    }
  }
}
</style>
