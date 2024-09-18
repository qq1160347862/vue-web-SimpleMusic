<template>
  <div class="album-card">
    <img :src="imgUrl" alt="album cover">
    <div class="album-info">{{ info }}</div>
     <div class="playCount">
        <i class="iconfont icon-bofang1"></i>
        <span>{{ formatNumber(playCount) }}</span>
     </div>
  </div>
</template>

<script setup>
import useNumberToTenThousand from '@/hooks/useNumberToTenThousand'
const formatNumber = useNumberToTenThousand()
const props = defineProps({
  imgUrl: {
    type: String,
    default: ''
  },
  playCount: {
    type: Number,
    default: 0
  },
  info: {
    type: String,
    default: 'xxx'
  },
  AlbumId: {
    type: Number,
    require: true
  }
})
</script>


<style scoped>
.album-card {
    position: relative;
    width: 108px;
    height: 132px;
    border-radius: var(--border-radius-light);
}
.album-card img {
    width: 108px;
    height: 108px;
    border-radius: var(--border-radius-light);
    cursor: pointer;
}
.playCount {
    line-height: 1;
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 8px;
    color: var(--album-card-playCount-color);
    background-color: var(--album-card-playCount-bg-color);
    padding: 2px 4px;
    border-radius: 16px;
    cursor: default;
}
.playCount .iconfont {
    font-size: 12px;
    margin-right: 2px;
}

.album-info {
    flex: 1;
    width: 100%;
    color: var(--album-card-info-color);
    font-size: 12px;
    cursor: default;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>