<template>
  <div class="music-player" :class="{ expanded: isExpanded }">
    <div class="player-toggle" @click="toggleExpand">
      <span class="music-icon">{{ isPlaying ? '🎵' : '🎶' }}</span>
    </div>
    
    <transition name="slide">
      <div v-if="isExpanded" class="player-content">
        <div class="player-header">
          <h3 class="player-title">音乐播放器</h3>
          <button class="close-btn" @click="toggleExpand">×</button>
        </div>
        
        <div class="album-cover">
          <img :src="currentSong?.cover || ''" :alt="currentSong?.name || ''" :class="{ rotating: isPlaying }">
          <div class="play-overlay" @click="togglePlay">
            <span class="play-icon">{{ isPlaying ? '⏸️' : '▶️' }}</span>
          </div>
        </div>
        
        <div class="song-info">
          <h4 class="song-name">{{ currentSong?.name || '' }}</h4>
          <p class="song-artist">{{ currentSong?.artist || '' }}</p>
        </div>
        
        <div class="progress-bar">
          <span class="time">{{ formatTime(currentTime) }}</span>
          <div class="progress" @click="seek">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <span class="time">{{ formatTime(duration) }}</span>
        </div>
        
        <div class="controls">
          <button class="control-btn" @click="prevSong">⏮️</button>
          <button class="control-btn play-btn" @click="togglePlay">
            {{ isPlaying ? '⏸️' : '▶️' }}
          </button>
          <button class="control-btn" @click="nextSong">⏭️</button>
          <button class="control-btn" @click="toggleMute">
            {{ isMuted ? '🔇' : '🔊' }}
          </button>
        </div>
        
        <div class="playlist">
          <h4 class="playlist-title">播放列表</h4>
          <div class="playlist-items">
            <div 
              v-for="(song, index) in playlist" 
              :key="index"
              class="playlist-item"
              :class="{ active: currentIndex === index }"
              @click="playSong(index)"
            >
              <span class="song-number">{{ index + 1 }}</span>
              <div class="song-details">
                <span class="song-name">{{ song.name }}</span>
                <span class="song-artist">{{ song.artist }}</span>
              </div>
              <span class="song-duration">{{ song.duration }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <audio 
      ref="audioPlayer" 
      @timeupdate="updateTime"
      @loadedmetadata="updateDuration"
      @ended="nextSong"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'

interface Song {
  name: string
  artist: string
  url: string
  cover: string
  duration: string
}

const themeStore = useThemeStore()
const isExpanded = ref(false)
const isPlaying = ref(false)
const isMuted = ref(false)
const currentIndex = ref(0)
const currentTime = ref(0)
const duration = ref(0)
const audioPlayer = ref<HTMLAudioElement | null>(null)

// 不同主题的播放列表
const playlistData = {
  girl: [
    { name: '小幸运', artist: '田馥甄', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: 'https://via.placeholder.com/200/ff9a9e/ffffff?text=♡', duration: '3:45' },
    { name: '告白气球', artist: '周杰伦', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: 'https://via.placeholder.com/200/fecfef/ffffff?text=♡', duration: '4:20' },
    { name: '可爱女人', artist: '周杰伦', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: 'https://via.placeholder.com/200/ffd0d0/ffffff?text=♡', duration: '3:58' },
    { name: '甜甜的', artist: '周杰伦', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: 'https://via.placeholder.com/200/ffe8f0/ffffff?text=♡', duration: '3:59' }
  ],
  boy: [
    { name: '夜曲', artist: '周杰伦', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: 'https://via.placeholder.com/200/667eea/ffffff?text=Music', duration: '3:45' },
    { name: '以父之名', artist: '周杰伦', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: 'https://via.placeholder.com/200/764ba2/ffffff?text=Music', duration: '4:20' },
    { name: '止战之殇', artist: '周杰伦', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: 'https://via.placeholder.com/200/5a67d8/ffffff?text=Music', duration: '3:58' },
    { name: '龙拳', artist: '周杰伦', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: 'https://via.placeholder.com/200/667eea/ffffff?text=Music', duration: '3:59' }
  ],
  it: [
    { name: 'Code Monkey', artist: 'Jonathan Coulton', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: 'https://via.placeholder.com/200/00d4ff/ffffff?text=Code', duration: '3:45' },
    { name: 'Programmer', artist: 'Tech Music', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: 'https://via.placeholder.com/200/0099ff/ffffff?text=Code', duration: '4:20' },
    { name: 'Binary', artist: 'Digital Sound', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: 'https://via.placeholder.com/200/0066cc/ffffff?text=Code', duration: '3:58' },
    { name: 'Algorithm', artist: 'Code Beat', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: 'https://via.placeholder.com/200/00d4ff/ffffff?text=Code', duration: '3:59' }
  ],
  finance: [
    { name: 'Money Money', artist: 'ABBA', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: 'https://via.placeholder.com/200/ffd700/ffffff?text=$', duration: '3:45' },
    { name: 'Rich', artist: 'Finance Music', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: 'https://via.placeholder.com/200/ffb700/ffffff?text=$', duration: '4:20' },
    { name: 'Investment', artist: 'Wall Street', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: 'https://via.placeholder.com/200/ff9500/ffffff?text=$', duration: '3:58' },
    { name: 'Fortune', artist: 'Gold Sound', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: 'https://via.placeholder.com/200/ffd700/ffffff?text=$', duration: '3:59' }
  ],
  mom: [
    { name: '听妈妈的话', artist: '周杰伦', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: 'https://via.placeholder.com/200/ffb6c1/ffffff?text=Baby', duration: '3:45' },
    { name: '宝贝', artist: '张悬', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: 'https://via.placeholder.com/200/ffc0cb/ffffff?text=Baby', duration: '4:20' },
    { name: '童话', artist: '光良', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: 'https://via.placeholder.com/200/ffd0e0/ffffff?text=Baby', duration: '3:58' },
    { name: '摇篮曲', artist: '儿歌', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: 'https://via.placeholder.com/200/ffb6c1/ffffff?text=Baby', duration: '3:59' }
  ]
}

const playlist = computed(() => playlistData[themeStore.currentTheme])
const currentSong = computed(() => playlist.value[currentIndex.value])
const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// 监听主题变化，重置播放器
watch(() => themeStore.currentTheme, () => {
  currentIndex.value = 0
  if (isPlaying.value) {
    isPlaying.value = false
    if (audioPlayer.value) {
      audioPlayer.value.pause()
    }
  }
  loadSong()
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const togglePlay = () => {
  if (!audioPlayer.value) return
  
  if (isPlaying.value) {
    audioPlayer.value.pause()
  } else {
    audioPlayer.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const toggleMute = () => {
  if (!audioPlayer.value) return
  audioPlayer.value.muted = !audioPlayer.value.muted
  isMuted.value = audioPlayer.value.muted
}

const prevSong = () => {
  currentIndex.value = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length
  loadSong()
}

const nextSong = () => {
  currentIndex.value = (currentIndex.value + 1) % playlist.value.length
  loadSong()
}

const playSong = (index: number) => {
  currentIndex.value = index
  loadSong()
}

const loadSong = () => {
  if (!audioPlayer.value || !currentSong.value) return
  audioPlayer.value.src = currentSong.value.url
  if (isPlaying.value) {
    audioPlayer.value.play()
  }
}

const updateTime = () => {
  if (!audioPlayer.value) return
  currentTime.value = audioPlayer.value.currentTime
}

const updateDuration = () => {
  if (!audioPlayer.value) return
  duration.value = audioPlayer.value.duration
}

const seek = (e: MouseEvent) => {
  if (!audioPlayer.value) return
  const progressBar = e.currentTarget as HTMLElement
  const clickX = e.offsetX
  const width = progressBar.offsetWidth
  const seekTime = (clickX / width) * duration.value
  audioPlayer.value.currentTime = seekTime
}

const formatTime = (time: number) => {
  if (isNaN(time)) return '0:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

onMounted(() => {
  if (audioPlayer.value && currentSong.value) {
    audioPlayer.value.src = currentSong.value.url
  }
})

onBeforeUnmount(() => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
  }
})
</script>

<style scoped lang="scss">
.music-player {
  position: fixed;
  top: 100px;
  left: 30px;
  z-index: 998;
  
  .player-toggle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: scale(1.1);
    }
    
    .music-icon {
      font-size: 28px;
      animation: bounce 2s infinite;
    }
  }
  
  &.expanded .player-toggle {
    display: none;
  }
  
  .player-content {
    width: 350px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    padding: 20px;
    
    .player-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      .player-title {
        font-size: 18px;
        font-weight: 600;
      }
      
      .close-btn {
        width: 30px;
        height: 30px;
        border: none;
        background: #f0f0f0;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          color: #fff;
          transform: rotate(90deg);
        }
      }
    }
    
    .album-cover {
      position: relative;
      width: 200px;
      height: 200px;
      margin: 0 auto 20px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        
        &.rotating {
          animation: rotate 10s linear infinite;
        }
      }
      
      .play-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
        cursor: pointer;
        
        &:hover {
          opacity: 1;
        }
        
        .play-icon {
          font-size: 48px;
        }
      }
    }
    
    .song-info {
      text-align: center;
      margin-bottom: 20px;
      
      .song-name {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin-bottom: 5px;
      }
      
      .song-artist {
        font-size: 14px;
        color: #999;
      }
    }
    
    .progress-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      
      .time {
        font-size: 12px;
        color: #999;
        min-width: 40px;
      }
      
      .progress {
        flex: 1;
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        cursor: pointer;
        position: relative;
        
        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.1s;
        }
      }
    }
    
    .controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
      
      .control-btn {
        width: 45px;
        height: 45px;
        border: none;
        background: #f0f0f0;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          transform: scale(1.1);
        }
        
        &.play-btn {
          width: 55px;
          height: 55px;
          font-size: 24px;
        }
      }
    }
    
    .playlist {
      border-top: 1px solid #e0e0e0;
      padding-top: 15px;
      
      .playlist-title {
        font-size: 14px;
        font-weight: 600;
        color: #666;
        margin-bottom: 10px;
      }
      
      .playlist-items {
        max-height: 200px;
        overflow-y: auto;
        
        &::-webkit-scrollbar {
          width: 6px;
        }
        
        .playlist-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          
          &:hover {
            background: #f8f8f8;
          }
          
          .song-number {
            width: 25px;
            height: 25px;
            background: #f0f0f0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
          }
          
          .song-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 3px;
            
            .song-name {
              font-size: 14px;
              font-weight: 500;
              color: #333;
            }
            
            .song-artist {
              font-size: 12px;
              color: #999;
            }
          }
          
          .song-duration {
            font-size: 12px;
            color: #999;
          }
        }
      }
    }
  }
}

/* 女生主题 */
.theme-girl {
  .music-player {
    .player-toggle {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      box-shadow: 0 8px 25px rgba(255, 154, 158, 0.4);
      
      &:hover {
        box-shadow: 0 10px 30px rgba(255, 154, 158, 0.6);
      }
    }
    
    .player-title {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .close-btn:hover {
      background: #ff9a9e;
    }
    
    .progress-fill {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    }
    
    .control-btn:hover {
      background: #ff9a9e;
    }
    
    .play-btn {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      box-shadow: 0 4px 15px rgba(255, 154, 158, 0.4);
    }
    
    .playlist-items::-webkit-scrollbar-thumb {
      background: #ff9a9e;
    }
    
    .playlist-item.active {
      background: linear-gradient(135deg, #fff0f6 0%, #ffe8f0 100%);
      
      .song-number {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        color: #fff;
      }
    }
  }
}

/* 男生主题 */
.theme-boy {
  .music-player {
    .player-toggle {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      
      &:hover {
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.6);
      }
    }
    
    .player-title {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .close-btn:hover {
      background: #667eea;
    }
    
    .progress-fill {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .control-btn:hover {
      background: #667eea;
    }
    
    .play-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    
    .playlist-items::-webkit-scrollbar-thumb {
      background: #667eea;
    }
    
    .playlist-item.active {
      background: linear-gradient(135deg, #f0f0ff 0%, #e8e8ff 100%);
      
      .song-number {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
      }
    }
  }
}

/* IT主题 */
.theme-it {
  .music-player {
    .player-toggle {
      background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
      box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
      
      &:hover {
        box-shadow: 0 10px 30px rgba(0, 212, 255, 0.6);
      }
    }
    
    .player-title {
      background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .close-btn:hover {
      background: #00d4ff;
    }
    
    .progress-fill {
      background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
    }
    
    .control-btn:hover {
      background: #00d4ff;
    }
    
    .play-btn {
      background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
      box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
    }
    
    .playlist-items::-webkit-scrollbar-thumb {
      background: #00d4ff;
    }
    
    .playlist-item.active {
      background: linear-gradient(135deg, #e6f7ff 0%, #d0f0ff 100%);
      
      .song-number {
        background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
        color: #fff;
      }
    }
  }
}

/* 金融主题 */
.theme-finance {
  .music-player {
    .player-toggle {
      background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
      
      &:hover {
        box-shadow: 0 10px 30px rgba(255, 215, 0, 0.6);
      }
    }
    
    .player-title {
      background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .close-btn:hover {
      background: #ffd700;
    }
    
    .progress-fill {
      background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
    }
    
    .control-btn:hover {
      background: #ffd700;
    }
    
    .play-btn {
      background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
    }
    
    .playlist-items::-webkit-scrollbar-thumb {
      background: #ffd700;
    }
    
    .playlist-item.active {
      background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
      
      .song-number {
        background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
        color: #fff;
      }
    }
  }
}

/* 宝妈主题 */
.theme-mom {
  .music-player {
    .player-toggle {
      background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
      box-shadow: 0 8px 25px rgba(255, 182, 193, 0.4);
      
      &:hover {
        box-shadow: 0 10px 30px rgba(255, 182, 193, 0.6);
      }
    }
    
    .player-title {
      background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .close-btn:hover {
      background: #ffb6c1;
    }
    
    .progress-fill {
      background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
    }
    
    .control-btn:hover {
      background: #ffb6c1;
    }
    
    .play-btn {
      background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
      box-shadow: 0 4px 15px rgba(255, 182, 193, 0.4);
    }
    
    .playlist-items::-webkit-scrollbar-thumb {
      background: #ffb6c1;
    }
    
    .playlist-item.active {
      background: linear-gradient(135deg, #fff0f5 0%, #ffe4e9 100%);
      
      .song-number {
        background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
        color: #fff;
      }
    }
  }
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .music-player {
    top: 80px;
    left: 20px;
    
    .player-toggle {
      width: 50px;
      height: 50px;
      
      .music-icon {
        font-size: 24px;
      }
    }
    
    .player-content {
      width: calc(100vw - 40px);
      max-width: 350px;
    }
  }
}
</style>
