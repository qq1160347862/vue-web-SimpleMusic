<template>    
    <div class="player-warp">
        <div class="player-bg"></div>
        <div class="player-content">
            <div class="player-left">
                <div :class="{'songs-img':!isPlaying,'songs-img played':isPlaying}" v-if="musicList.length" @click="isShowMusicPlayerDrawer = true"
                :style="`background-image:url(${musicList[currentIndex]?.al.picUrl})`"></div>
                <Teleport to="body">
                    <MusicPlayerDrawer @close="isShowMusicPlayerDrawer = false"
                    :show="isShowMusicPlayerDrawer"></MusicPlayerDrawer>  
                </Teleport>
                <div class="songs-info">
                    <span class="song-name">{{musicList[currentIndex]?.name}}</span>
                    <span class="singer">{{musicList[currentIndex]?.ar.map(item => item.name).join('/')}}</span>
                </div>
            </div>
            <div class="player-center">
                <div class="player-btn">
                    <button @click="musicSwitch(-1)"><i class="iconfont icon-shangyishou"></i></button>
                    <button v-show="!isPlaying" @click="musicOn_off"><i class="iconfont icon-bofang"></i></button>
                    <button v-show="isPlaying" @click="musicOn_off"><i class="iconfont icon-zanting"></i></button>
                    <button @click="musicSwitch(1)"><i class="iconfont icon-xiayishou"></i></button>
                </div>
                <div class="player-bar">
                    <span class="play-time">{{ currentTime  }}</span>
                    <Slider v-model:progress="progress"
                    @handleProgress="handleProgress"
                    :Aysnc="true"
                    :name="'player'"
                    :barHeight="2"
                    :barRadius="1"
                    :knobWidth="12"
                    :knobHeight="12"
                    :hover="true"
                    :min="0" 
                    :max="100" 
                    :step="1"></Slider>
                    <audio ref="player"
                        id="player"
                        autoplay
                        :src="musicList[currentIndex]?.url" 
                        @timeupdate="updateProgress"
                        @ended="localStore.switchMusic(1)"></audio>
                    <span class="play-time">{{ duration }}</span>
                </div>
            </div>
            <div class="player-right">
                <div class="player-mode" @click="changePlayerMode">
                    <i v-show="loop === 0" class="iconfont icon-bofang-xunhuanbofang"></i>
                    <i v-show="loop === 1" class="iconfont icon-mayi-shunxubofang"></i>
                    <i v-show="loop === 2" class="iconfont icon-suijibofang"></i>
                </div>        
                <div class="player-list" @click="handleClickMusicList">
                    <i class="iconfont icon-gequliebiao"></i>
                    <div :class="{
                        'music-list-popup': !isShowMusicListPopup,
                        'music-list-popup show': isShowMusicListPopup
                        }" >
                        <MusicList></MusicList>
                    </div>
                </div>
                <div  class="player-volume" @click="hanleMute">
                    <i v-show="isMuted" class="iconfont icon-jingyin"></i>
                    <i v-show="!isMuted" class="iconfont icon-laba"></i>
                </div>
                <div class="handle-volume-warp">
                    <Slider v-model:progress="volume"
                        @handleProgress="handleVolume"
                        :name="'volume'"
                        :min="0" 
                        :max="1" 
                        :step="0.1"></Slider>
                </div>
            </div>            
        </div>         
    </div>
</template>

<script setup>
import MusicPlayerDrawer from './MusicPlayerDrawer.vue';
import Slider from './Slider.vue';
import MusicList from './MusicList.vue';
import useSecondsToMinute from '@/hooks/useSecondsToMinute'
import { useLocalStore } from '@/store/localStore';
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, onMounted, ref, watch, inject, computed } from 'vue';
const localStore = useLocalStore()
const { localPlayer, musicList, currentIndex, isPlaying, volume, loop, currentTime, duration, progress, isDragging } = storeToRefs(localStore)
const player = ref()
const message = inject('message')
const isShowMusicPlayerDrawer = ref(false)
const isShowMusicListPopup = ref(false)
const isMuted = computed(() => volume.value === 0)
const lastVolume = ref(volume.value)
const formatSeconds = useSecondsToMinute()

// 操作进度条的回调
const handleProgress = (e) => {
    isDragging.value = e
    if(!isDragging.value) {
        player.value.currentTime = player.value.duration * progress.value * 0.01
    }    
}
// 音乐播放器更新的回调
const updateProgress = (e) => {
    requestAnimationFrame(() => {
        if(!isDragging.value){
        
            progress.value = e.target.currentTime / player.value.duration * 100
        }
        currentTime.value = formatSeconds(e.target.currentTime)
        duration.value = formatSeconds(e.target.duration)
    })    
}
// 音乐开关
const musicOn_off = () => {    
    const isPlay = localStore.togglePlay()
    if (!isPlay) {
        message.value.addMessage({ text: "音乐列表为空，无法播放音乐", duration: 2000, type: 'error' });  
        return;
    }    
}
// 音乐上一首/下一首
const musicSwitch = (step) => {
    const isSwitch = localStore.switchMusic(step)
    if (!isSwitch) {
        message.value.addMessage({ text: "音乐列表为空，无法切换音乐", duration: 2000, type: 'error' });  
        return;
    }
}
// 音量调节
const handleVolume = () => {
    player.value.volume = volume.value
}
// 静音
const hanleMute = () => {
    if(isMuted.value){        
        player.value.volume = lastVolume.value
        volume.value = lastVolume.value
    }else{
        lastVolume.value = volume.value
        volume.value = 0
        player.value.volume = 0
    }
}
// 改变播放器模式
const changePlayerMode = () => {
    const msg = localStore.toggleLoop();
    message.value.addMessage({ text: msg, duration: 3000, type: 'info' });    
}
// 打开音乐列表
const handleClickMusicList = () => {
    isShowMusicListPopup.value = !isShowMusicListPopup.value
}
// 点击音乐列表之外的地方关闭音乐列表
const handleClickOutside = (event) => {
    const parentDom = event.target.closest('.player-list')
    const len = parentDom?.children.length
    const PopupDom = parentDom?.children[len-1]
    
    if(event.target.classList.contains('menu-item')) {
        return;
    }
    
    if (!parentDom) {
        isShowMusicListPopup.value = false
        return;
    }
    
    if (PopupDom && 
        PopupDom?.classList.contains('music-list-popup') &&
        PopupDom?.classList.contains('show')) {
        return;
    }
}
onMounted(() => {
    // audio Dom存入store
    player.value.crossOrigin = "anonymous"  // 解决跨域问题
    localPlayer.value = player.value  
    message.value.addMessage({ text: "欢迎使用音乐播放器", duration: 3000, type: 'success' });  

    window.addEventListener('click',handleClickOutside)
})

onBeforeUnmount(() => {
    window.removeEventListener('click',handleClickOutside)
})
</script>


<style scoped>
.player-warp {
    position: relative;
    width: 100%;
    height: 100%;
}

.player-content {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.player-left {
    width: 200px;
    height: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    overflow: hidden;
}
.player-left .songs-img {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    cursor: pointer;
    background-repeat: no-repeat;
    background-position: 0% 0%;
    background-size: cover;
    animation: songs-img-rotate-animation 10s infinite linear normal;
    animation-play-state: paused;
}
.player-left .songs-img.played {
    animation-play-state: running;
}

.player-left .songs-info{
    --player-info-margin-left: 12px;
    height: 100%;
    width: calc(100% - 56px - var(--player-info-margin-left));
    margin-left: var(--player-info-margin-left);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 0px;
    cursor: default;
}
.song-name {
    font-weight: bold;
    font-size: 14px;
    color: var(--footer-song-name-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.singer {
    font-size: 12px;
    color: var(--footer-song-singer-color);
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.player-center {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    width: 600px;
    height: 100%;
}
.player-center .player-btn {
    flex: 1;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
}
.player-center .player-btn button {
    width: 36px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: transparent;
    border: none;
    cursor: pointer;
}
.player-center .player-btn button .iconfont {
    font-size: 32px;
    color: var(--footer-player-btn-color);
    transition: all 0.3s ease;
}
.player-center .player-btn button .iconfont:hover {
    font-size: 36px;
    color: var(--footer-player-btn-hover-color);
}
.player-center .player-bar {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 200px;
    cursor: pointer;
}
.player-center .player-bar .play-time {
    font-size: 14px;
    color: var(--footer-player-time-color);
    margin: 0 10px;
}



.player-right {
    position: relative;
    width: 200px;
    height: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
}
.player-right .iconfont {
    font-size: 16px;
    color: var(--footer-func-icon-color);
    transition: all 0.3s ease;
}
.player-right .player-mode,
.player-right .player-list,
.player-right .player-volume {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
}
.player-right .player-mode:hover {
    box-shadow: var(--footer-func-icon-hover-box-shadow);
}
.handle-volume-warp {
    position:absolute;
    width: 100px;
    height: 24px;
    padding: 0 8px;
    border-radius: 12px;
    background-color: white;
    top: -12px;
    right: -8px;
    transform: translateY(-6%) scale(0.9);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s ease-out;
}
.handle-volume-warp::before {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-top: 10px solid #ccc;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    bottom: -6px;
    right: 12px;
}
.handle-volume-warp::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-top: 10px solid #fff;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    bottom: -6px;
    right: 12px;
}
.player-right .player-volume:hover+.handle-volume-warp {
    transform: translateY(0) scale(1);
    opacity: 1;
    pointer-events: auto;
}
.handle-volume-warp:hover {
    transform: translateY(0) scale(1);
    opacity: 1;
    pointer-events: auto;
}

.music-list-popup {
    position: absolute;
    z-index: 1000;
    bottom: 88px;
    right: 0;
    min-width: 240px;
    height: 400px;
    background-color: rgba(255, 255, 255, 0.404);
    border-radius: var(--border-radius-light);
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    pointer-events: none;
}
.music-list-popup.show {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

@keyframes songs-img-rotate-animation  {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>