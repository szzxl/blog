<template>
  <div class="carousel">
    <el-carousel 
      v-if="carouselItems.length > 0"
      :interval="5000" 
      height="400px" 
      arrow="always" 
      indicator-position="outside"
    >
      <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
        <div class="carousel-item" @click="handleClick(item)">
          <img :src="item.image" :alt="item.title" class="carousel-image">
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCarousel } from '@/api/article'

const router = useRouter()
const carouselItems = ref<any[]>([])

// 获取轮播图数据
const fetchCarousel = async () => {
  try {
    const response: any = await getCarousel()
    
    if (response && Array.isArray(response)) {
      carouselItems.value = response.map((item: any) => ({
        title: item.title || '',
        image: item.image || '',
        url: item.url || '',
        sort: item.sort || 0
      })).sort((a: any, b: any) => a.sort - b.sort)
    }
  } catch (error) {
    console.error('获取轮播图失败:', error)
  }
}

// 点击轮播图
const handleClick = (item: any) => {
  if (item.url) {
    if (item.url.startsWith('http')) {
      window.open(item.url, '_blank')
    } else {
      router.push(item.url)
    }
  }
}

onMounted(() => {
  fetchCarousel()
})
</script>

<style scoped lang="scss">
.carousel {
  width: 100%;
  margin-bottom: 40px;
  
  :deep(.el-carousel) {
    position: relative;
    z-index: 1;
    
    .el-carousel__container {
      position: relative;
      z-index: 1;
    }
    
    .el-carousel__arrow {
      z-index: 2;
    }
    
    .el-carousel__indicator {
      button {
        background: rgba(255, 255, 255, 0.5);
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
      
      &.is-active button {
        background: #ff9a9e;
        width: 30px;
        border-radius: 6px;
      }
    }
  }
  
  .carousel-item {
    width: 100%;
    height: 100%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    
    .carousel-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
    }
  }
}

@media (max-width: 768px) {
  .carousel {
    :deep(.el-carousel) {
      height: 250px !important;
    }
  }
}
</style>
