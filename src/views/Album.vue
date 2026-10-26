<template>
  <div class="album container">
    <header class="page-header">
      <h1>{{ currentAlbum ? currentAlbum.albumName : '相册' }}</h1>
      <p>
        {{
          currentAlbum
            ? currentAlbum.albumDesc || `${photoTotal} 张照片`
            : '平时拍的照片，按相册整理。选一本，慢慢翻。'
        }}
      </p>
    </header>
    <template v-if="!currentAlbum"
      ><div v-if="albumsError" class="empty-state" role="alert">
        <p>相册暂时无法加载</p>
        <el-button @click="fetchAlbums">重新加载</el-button>
      </div>
      <div v-else class="albums-grid" v-loading="albumsLoading">
        <button
          v-for="album in albums"
          :key="album.id"
          class="album-card"
          @click="loadAlbumPhotos(album)"
        >
          <div class="album-cover">
            <img
              :src="album.albumCover || '/default-cover.svg'"
              :alt="album.albumName"
              class="cover-img"
              loading="lazy"
              @error="fallbackCover"
            /><span class="cover-caption">翻开相册 </span>
          </div>
          <div class="album-info">
            <h2>{{ album.albumName }}</h2>
            <p v-if="album.albumDesc">{{ album.albumDesc }}</p>
            <span v-if="album.photoCount !== undefined">{{ album.photoCount }} 张照片</span>
          </div>
        </button>
        <div v-if="!albumsLoading && !albums.length" class="empty-state">
          还没有公开的相册，过段时间再来看看。
        </div>
      </div></template
    >
    <template v-else
      ><div class="detail-header">
        <button class="back-btn" @click="backToAlbums">← 返回相册列表</button
        ><span>点击照片查看大图和评论</span>
      </div>
      <div class="photos-grid" v-loading="photosLoading">
        <button
          v-for="(photo, index) in photos"
          :key="photo.id"
          class="photo-item"
          @click="openLightbox(index)"
        >
          <div class="photo-wrapper">
            <img
              :src="photo.thumbnailUrl || photo.photoUrl || '/default-cover.svg'"
              :alt="photo.photoName || '相册照片'"
              class="photo-img"
              loading="lazy"
              @error="fallbackCover"
            />
          </div>
          <div v-if="photo.photoName || photo.photoDesc" class="photo-info">
            <h2 v-if="photo.photoName">{{ photo.photoName }}</h2>
            <p v-if="photo.photoDesc">{{ photo.photoDesc }}</p>
          </div>
        </button>
        <div v-if="!photosLoading && !photoError && !photos.length" class="empty-state">
          这个相册还没有照片。
        </div>
      </div>
      <div v-if="photoError" class="empty-state" role="alert">
        <p>照片加载失败</p>
        <el-button @click="loadAlbumPhotos(currentAlbum!, photoPage)">重新加载</el-button>
      </div>
      <div v-if="photoTotal > PHOTO_PAGE_SIZE" class="pagination">
        <el-pagination
          :current-page="photoPage"
          :page-size="PHOTO_PAGE_SIZE"
          :total="photoTotal"
          layout="total, prev, pager, next"
          @current-change="(page: number) => loadAlbumPhotos(currentAlbum!, page)"
        /></div
    ></template>
    <Transition name="lb">
      <div
        v-if="lightboxOpen"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="照片大图与评论"
        @click.self="closeLightbox"
      >
        <!-- 左侧：图片区 -->
        <div class="lb-image-panel">
          <img
            :src="photos[lightboxIndex]?.photoUrl"
            :alt="photos[lightboxIndex]?.photoName || '相册照片'"
            class="lb-img"
            @click.stop
          />

          <button
            v-if="lightboxIndex > 0"
            class="lb-arrow lb-prev"
            @click.stop="lightboxIndex--"
            aria-label="上一张"
          >
            ‹
          </button>
          <button
            v-if="lightboxIndex < photos.length - 1"
            class="lb-arrow lb-next"
            @click.stop="lightboxIndex++"
            aria-label="下一张"
          >
            ›
          </button>

          <div class="lb-counter">{{ lightboxIndex + 1 }} / {{ photos.length }}</div>
        </div>

        <!-- 右侧：评论面板 -->
        <div class="lb-comment-panel" @click.stop>
          <div class="lb-panel-header">
            <div class="lb-panel-title">
              <span class="lb-photo-name">{{
                photos[lightboxIndex]?.photoName || '图片详情'
              }}</span>
            </div>
            <button class="lb-close-btn" @click="closeLightbox" aria-label="关闭">×</button>
          </div>
          <div class="lb-panel-body">
            <Comment
              :source-id="photos[lightboxIndex]?.id"
              source-type="photo"
              :key="photos[lightboxIndex]?.id"
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
<script setup lang="ts">
import { showRequestError } from '@/utils/requestError'

import { ref, onMounted, onUnmounted } from 'vue'
import { getAlbumList, getAlbumPhotos } from '@/api/album'
import Comment from '@/components/Comment.vue'
import { createLatestRequest } from '@/utils/latestRequest'

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
  thumbnailUrl?: string
  photoUrl: string
  albumId: number
}

const albums = ref<Album[]>([])
const currentAlbum = ref<Album | null>(null)
const photos = ref<Photo[]>([])
const albumsLoading = ref(false)
const albumsError = ref(false)
const photosLoading = ref(false)
const photoPage = ref(1)
const photoTotal = ref(0)
const photoError = ref(false)
const PHOTO_PAGE_SIZE = 24
const photoRequest = createLatestRequest()

// ── 灯箱 ──────────────────────────────────────────────
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

const openLightbox = (index: number) => {
  lightboxIndex.value = index
  lightboxOpen.value = true
}

const closeLightbox = () => {
  lightboxOpen.value = false
}

const onKeydown = (e: KeyboardEvent) => {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if ((e.target as HTMLElement)?.closest('input,textarea,[contenteditable=true]')) return
  if (e.key === 'ArrowLeft' && lightboxIndex.value > 0) lightboxIndex.value--
  if (e.key === 'ArrowRight' && lightboxIndex.value < photos.value.length - 1) lightboxIndex.value++
}

// ── 数据获取 ──────────────────────────────────────────
const fetchAlbums = async () => {
  albumsLoading.value = true
  albumsError.value = false
  try {
    const res: any = await getAlbumList()
    if (Array.isArray(res)) albums.value = res
    else if (res?.list) albums.value = res.list
  } catch (error) {
    albumsError.value = true
    showRequestError(error, '获取相册列表失败')
  } finally {
    albumsLoading.value = false
  }
}

const loadAlbumPhotos = async (album: Album, page = 1) => {
  const requestId = photoRequest.next()
  closeLightbox()
  currentAlbum.value = album
  photoPage.value = page
  photoError.value = false
  photos.value = []
  photosLoading.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
  try {
    const res: any = await getAlbumPhotos({ id: album.id, pageNo: page, pageSize: PHOTO_PAGE_SIZE })
    if (!photoRequest.isCurrent(requestId)) return
    photoTotal.value = res?.total ?? 0
    const lastPage = Math.max(1, Math.ceil(photoTotal.value / PHOTO_PAGE_SIZE))
    if (page > lastPage) {
      await loadAlbumPhotos(album, lastPage)
      return
    }
    photos.value = res?.list ?? []
  } catch (error) {
    if (photoRequest.isCurrent(requestId)) {
      photoError.value = true
      showRequestError(error, '获取照片失败')
    }
  } finally {
    if (photoRequest.isCurrent(requestId)) photosLoading.value = false
  }
}

const backToAlbums = () => {
  photoRequest.invalidate()
  photosLoading.value = false
  closeLightbox()
  currentAlbum.value = null
  photos.value = []
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  fetchAlbums()
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  photoRequest.invalidate()
  window.removeEventListener('keydown', onKeydown)
})

const fallbackCover = (event: Event) => {
  const image = event.target as HTMLImageElement
  if (image.getAttribute('src') !== '/default-cover.svg') image.src = '/default-cover.svg'
}
</script>
<style scoped lang="scss">
.album {
  padding-bottom: 55px;
}
.page-header h1 {
  margin-top: 8px;
}
.albums-grid,
.photos-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
  min-height: 120px;
}
.album-card,
.photo-item {
  padding: 0;
  background: transparent;
  border: 0;
  text-align: left;
  color: var(--text-secondary);
  min-width: 0;
}
.album-cover,
.photo-wrapper {
  aspect-ratio: 4 / 3;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  background: var(--bg-secondary);
}
.album-cover img,
.photo-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}
.album-card:hover img,
.photo-item:hover img {
  transform: scale(1.025);
}
.cover-caption {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: #14241dba;
  color: #fff;
  padding: 4px 8px;
  font-size: 11px;
}
.album-info,
.photo-info {
  padding-top: 16px;
}
.album-info h2,
.photo-info h2 {
  font: 500 24px/1.5 var(--font-serif);
  margin-bottom: 7px;
  overflow-wrap: anywhere;
}
.album-info p,
.photo-info p {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-bottom: 7px;
}
.album-info > span {
  font-size: 11px;
  color: var(--text-tertiary);
}
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  font-size: 12px;
}
.back-btn {
  min-height: 44px;
  padding: 8px 13px;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--color-accent);
  border-radius: 4px;
}
.albums-grid .empty-state,
.photos-grid .empty-state {
  grid-column: 1 / -1;
}
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  background: rgba(0, 0, 0, 0.88);
}

// 左侧图片区
.lb-image-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 48px 40px;
}

.lb-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  user-select: none;
  display: block;
}

.lb-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 26px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  line-height: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
  }
  &.lb-prev {
    left: 16px;
  }
  &.lb-next {
    right: 16px;
  }
}

.lb-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  font-family: var(--font-sans);
  white-space: nowrap;
}

// 右侧评论面板
.lb-comment-panel {
  width: 380px;
  flex-shrink: 0;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.lb-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;

  .lb-photo-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-sans);
  }
}

.lb-close-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s,
    color 0.2s;
  margin-left: 12px;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
}

.lb-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }

  // 覆盖评论组件的外边距，使其贴合面板
  :deep(.comment-section) {
    margin-top: 0;
    border: none;
    box-shadow: none;
    border-radius: 0;
    background: transparent;
  }
}

.lb-enter-active,
.lb-leave-active {
  transition: opacity 0.2s ease;
}
.lb-enter-from,
.lb-leave-to {
  opacity: 0;
}

// ── 响应式 ────────────────────────────────────────────

.lightbox {
  z-index: 2000;
}
.lb-comment-panel {
  background: var(--bg-card);
}
.lb-photo-name {
  color: var(--text-primary);
}
.lb-close-btn {
  color: var(--text-primary);
}
@media (max-width: 1000px) {
  .albums-grid,
  .photos-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
  .lb-comment-panel {
    width: 330px;
  }
}
@media (max-width: 760px) {
  .albums-grid,
  .photos-grid {
    gap: 22px 16px;
  }
  .album-info h2,
  .photo-info h2 {
    font-size: 20px;
  }
  .detail-header > span {
    display: none;
  }
  .lightbox {
    flex-direction: column;
    overflow-y: auto;
  }
  .lb-image-panel {
    flex: none;
    height: 50dvh;
    min-height: 240px;
  }
  .lb-comment-panel {
    width: 100%;
    flex: none;
    height: auto;
    min-height: 50dvh;
  }
  .lb-panel-body {
    overflow: visible;
  }
  .lb-close-btn {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 2;
    background: var(--bg-card);
  }
  .album-cover,
  .photo-wrapper {
    aspect-ratio: 1;
  }
}
@media (max-width: 400px) {
  .albums-grid,
  .photos-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .album-cover,
  .photo-wrapper {
    aspect-ratio: 16 / 10;
  }
}
</style>
