<template>
    <div class="music-list-container no-select" v-hover="{
        enterClass: 'show-scrollbar',
        leaveClass: 'show-scrollbar',
    }">        
            <ul class="music-list">  
                <TransitionGroup name="list">           
                    <li @click="handleClick(song)"
                        class="music-item"
                        v-for="(song, index) in musicList" 
                        :key="song?.id">
                        <div :class="{
                            'song-index':currentIndex !== index,
                            'song-index active':currentIndex === index
                            }">{{ index + 1 }}</div>
                        <div class="song-infos">
                            <p class="song-name">{{ song?.name }}</p>
                            <p class="song-author">{{ song?.ar.map(item => item.name).join('/') }}</p>
                        </div> 
                        <Loading1 v-if="currentIndex === index" class="loading-warp"></Loading1>                  
                    </li>
                </TransitionGroup>
            </ul>        
    </div>
</template>

<script setup>
import Loading1 from './Loading1.vue';
import { useLocalStore } from '../store/localStore';
import { storeToRefs } from 'pinia';
import { ref } from 'vue'
const localStore = useLocalStore();
const { musicList, currentIndex } = storeToRefs(localStore);
const handleClick = (song) => {
    if (!song) return;
    localStore.pushMusicToList(song)
}
</script>

<style scoped>  
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease-in-out;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.music-list-container {
    width: 100%;
    overflow-y: scroll;
    height: 100%;
}

.music-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.music-list .music-item {
    height: 48px;
    width: 100%;
    border-radius: var(--border-radius-light);
    display: flex;
    align-items: center;
    padding-left: 12px;
    cursor: pointer;
    transition: all 0.2s linear;
}
.music-list .music-item>.loading-warp {
    margin-left: auto;
    margin-right: 16px;
}
.music-list .music-item:hover {
    background: #ffffff;
}
.song-index {
    font-size: 14px;
    color: #999;
    margin-right: 16px;
}
.song-index.active {
    color: red;
}
.song-infos {
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.song-name {
    font-size: 12px;
    font-weight: bold;
    color: #333;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.song-author { 
    color: #999;
    font-size: 10px;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}




/* 滚动条默认隐藏 */
::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 2px; /* 轨道圆角 */
}
::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 2px; /* 滚动条滑块圆角 */
}
::-webkit-scrollbar-thumb:hover {
    background: transparent;
}
/* 滚动时显示滚动条 */
.music-list-container.show-scrollbar::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
.music-list-container.show-scrollbar::-webkit-scrollbar-track {
    background: var(--main-scrollbal-track-bg-color); /* 滚动条轨道背景色 */
    border-radius: 2px;
}
.music-list-container.show-scrollbar::-webkit-scrollbar-thumb{
    background: var(--main-scrollbal-thumb-bg-color); /* 滚动条滑块颜色 */
    border-radius: 2px;
}
.music-list-container.show-scrollbar::-webkit-scrollbar-thumb:hover{
    background: var(--main-scrollbal-thumb-hover-bg-color); /* 滚动条滑块悬停颜色 */
}
</style>