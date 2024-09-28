<template>
    <Transition name="player-drawer" mode="out-in">
        <div class="drawer-mask" v-show="show">
            <div class="drawer-container">
              <div class="drawer-layout">
                <div class="drawer-header">
                  <i @click="$emit('close')" class="iconfont icon-close"></i>
                </div>
                <div class="drawer-content">
                  <div class="record-warp">
                    <span class="music-name no-select">{{ musicList[currentIndex]?.name }}</span>    
                    <p class="author-list no-select">
                      <span>
                        {{ musicList[currentIndex]?.ar.map(item=>item.name).join('/') }}
                      </span>
                    </p>    
                    <div class="music-picUrl">
                      <canvas id="visualizer"></canvas>
                      <img :src="musicList[currentIndex]?.al.picUrl" alt="" class="no-select">
                    </div>
                  </div>
                  <div class="func-warp">
                    <div class="func-switch-btn">
                      <SwitchBtn :options="switchBtnOptions"
                        @handleClick="handleSwitchBtnClick"></SwitchBtn>
                    </div>
                    <div class="func-container">     
                      <div class="func-layout" v-resize="handleResize">
                        <div class="lyric-warp active">
                          <ul class="lrc-list" v-if="musicList[currentIndex]?.lyric">
                            <li v-for="(item, index) in musicList[currentIndex]?.lyric"
                              :key="index" class="no-select">{{ item.words }}</li>
                          </ul>
                          <ul class="lrc-list" v-else>
                            <li>暂无歌词</li>
                          </ul>
                          <span class="start-time">{{ currentTime  }}</span>
                          <span class="end-time">{{ duration }}</span>
                          <span class="lyric-line" v-show="isDragging"></span>
                        </div>
                        <div class="playlist-warp">
                          <MusicList></MusicList>
                        </div>
                        <div class="comment-warp">
                          <comment 
                            key="track"    
                            name="track"
                            v-if="showComment && musicList.length > 0"
                            :uid="userInfo?.profile.userId"
                            :isLogin="isLogin"
                            :id="musicList[currentIndex]?.id"
                            :type="0"
                            :sortType="trackSortType"
                            :comments="trackComments"
                            :getSubComments="localStore.getFloorCommentsData"
                            :likeComment="localStore.handleLikeComment"
                            :handleComment="localStore.handleComment"
                            @loadComments="loadMoreComments"
                            @switchSortType="switchSortType"></comment>
                        </div>  
                      </div>                                              
                    </div>
                  </div>
                </div>
                <div class="drawer-footer">
                  <div class="progress-bar">                      
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
                  </div>
                  <div class="left"></div>
                  <div class="center">
                    <div class="player-mode">
                      <i v-show="loop === 0" @click="changePlayerMode" class="iconfont icon-bofang-xunhuanbofang"></i>
                      <i v-show="loop === 1" @click="changePlayerMode" class="iconfont icon-mayi-shunxubofang"></i>
                      <i v-show="loop === 2" @click="changePlayerMode" class="iconfont icon-suijibofang"></i>
                    </div>
                    <button @click="localStore.switchMusic(-1)"><i class="iconfont icon-shangyishou"></i></button>
                    <button v-show="!isPlaying" @click="musicOn_off"><i class="iconfont icon-bofang"></i></button>
                    <button v-show="isPlaying" @click="musicOn_off"><i class="iconfont icon-zanting"></i></button>
                    <button @click="localStore.switchMusic(1)"><i class="iconfont icon-xiayishou"></i></button>                                
                    <div v-show="true" class="favorite"><i class="iconfont icon-xiai"></i></div>
                    <div v-show="false" class="favorite"><i class="iconfont icon-xiaisel"></i></div>
                  </div>
                  <div class="right">
                    <div class="handle-volume-warp">
                      <div  class="player-volume">
                        <i v-show="isMuted" @click="hanleMute" class="iconfont icon-jingyin"></i>
                        <i v-show="!isMuted" @click="hanleMute" class="iconfont icon-laba"></i>
                      </div>
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
            </div>            
        </div>
    </Transition>
</template>

<script setup>
import Slider from './Slider.vue';
import SwitchBtn from './utils/SwitchBtn.vue';
import MusicList from './MusicList.vue';
import comment from './comment.vue';
import { computed, onBeforeUnmount, onMounted, ref, inject, defineAsyncComponent } from 'vue';
import { useLocalStore } from '@/store/localStore';
import { useUserStore } from '../store/userStore';
import { storeToRefs } from 'pinia';
import useAudioVisualizer from '@/hooks/useAudioVisualizer';
const props = defineProps({
  show: Boolean
})
const audioVisualizer = useAudioVisualizer()
const localStore = useLocalStore()
const userStore = useUserStore()
const { 
  localPlayer, 
  musicList, 
  currentIndex, 
  isPlaying, 
  volume, 
  loop, 
  currentTime, 
  duration, 
  progress, 
  isDragging, 
  trackSortType,
  trackComments,
} = storeToRefs(localStore)
const { userInfo, isLogin } = storeToRefs(userStore)
const message = inject('message')
const isMuted = computed(() => volume.value === 0)
const lastVolume = ref(volume.value)
const showFunc = ref(0)
const showComment = ref(false)
const switchBtnOptions = ref([
    {
        id:'lyric',
        label: '歌词',
        value: 0
    },
    {
        id:'playlist',
        label: '列表',
        value: 1
    },
    {
        id:'comment',
        label: '评论',
        value: 2
    },
])
const pageSize = ref(10)
const pageNo = ref(1)
// 操作进度条的回调
const handleProgress = (e) => {
  isDragging.value = e
  if(!isDragging.value) {
      localPlayer.value.currentTime = localPlayer.value.duration * progress.value * 0.01
  }  
}
// 音乐开关
const musicOn_off = () => {    

  // 确保音乐列表不为空，避免除以零的错误
  if (musicList.value.length === 0) {
      message.value.addMessage({ text: "音乐列表为空，无法播放音乐", duration: 3000 });  
      return;
  }

  if(localPlayer.value.paused){
      localPlayer.value.play()
  }else{
      localPlayer.value.pause()
  }
  isPlaying.value = !isPlaying.value
}
// 音量调节
const handleVolume = () => {
  localPlayer.value.volume = volume.value
}
// 静音
const hanleMute = () => {
    if(isMuted.value){        
        localPlayer.value.volume = lastVolume.value
        volume.value = lastVolume.value
    }else{
        lastVolume.value = volume.value
        volume.value = 0
        localPlayer.value.volume = 0
    }
}
// 改变播放器模式
const changePlayerMode = () => {
    const modes = ['单曲循环', '顺序播放', '随机播放'];
    loop.value = (loop.value + 1) % modes.length; // 计算下一个播放模式
    const msg = `已切换为${modes[loop.value]}`;
    message.value.addMessage({ text: msg, duration: 3000 });  
}
// 处理窗口大小变化
const handleResize = (e) => {
  const funcLayout = document.querySelector('.func-layout')
  funcLayout.style.transform = `translateX(-${e.width/3 * showFunc.value}px)`
}
// 切换歌词、评论、列表
const handleSwitchBtnClick = (value) => {
  const doms = {
    layout:document.querySelector('.func-layout'),
    lyric:document.querySelector('.func-container .lyric-warp'),
    playlist:document.querySelector('.func-container .playlist-warp'),
    comment:document.querySelector('.func-container .comment-warp')
  }
  const width = doms.layout.clientWidth
  const offset = width / 3
  showFunc.value = value
  switch (+value) {
    case 0:
      doms.lyric.classList.add('active')
      doms.playlist.classList.remove('active')
      doms.comment.classList.remove('active')
      doms.layout.style.transform = `translateX(-${offset * value}px)`
      break;
    case 1:
      doms.lyric.classList.remove('active')
      doms.playlist.classList.add('active')
      doms.comment.classList.remove('active')
      doms.layout.style.transform = `translateX(-${offset * value}px)`
      break;
    case 2:
      doms.lyric.classList.remove('active')
      doms.playlist.classList.remove('active')
      doms.comment.classList.add('active')
      doms.layout.style.transform = `translateX(-${offset * value}px)`
      showComment.value = true
      if(musicList.value.length > 0){
        loadComments()
      }
      break;
    default:
      break;
  }
}
// 歌词滚动
const updateLyric = () => {
  if(isDragging.value) {
    return
  }
  const lyricDoms = {
    audio:document.querySelector('#player'),
    ul:document.querySelector('.lyric-warp ul'),
    container:document.querySelector('.lyric-warp')
  }
  let lyricIndex = 0 // 当前歌词的索引
  const lyric = musicList.value[currentIndex.value].lyric
  const lyricLen = lyric?.length? lyric.length : 0
  
  for(let i = 0; i < lyricLen; i++) {
    if(lyricDoms.audio.currentTime < lyric[i].time && lyric[i] !== NaN){
      lyricIndex = i - 1 
      break
    }
    if(i === lyricLen - 1) {
      lyricIndex = i - 1
      break
    }
  }
  
  let liHeight = lyricDoms.ul.children[0].clientHeight  // 单个li的高度
  let maxOffset = lyricDoms.ul.clientHeight - lyricDoms.container.clientHeight  // 歌词滚动区域的最大偏移量
  let minOffset = lyricDoms.container.clientHeight/2 // 歌词滚动区域的最小偏移量
  let offset = liHeight * lyricIndex + liHeight/2 - lyricDoms.container.clientHeight/2    // 歌词滚动区域的偏移量
  // if(offset < 0) {
  //   offset = 0
  // }
  // if (offset > maxOffset) {
  //     offset = maxOffset
  // }
  lyricDoms.ul.style.transform = `translateY(calc(-1 * ${offset}px))`
  
  
  // 消除所有li的active再添加高亮li的active
  let activeLi = lyricDoms.ul.querySelector('.active')
  if (activeLi) {
      activeLi.classList.remove('active')
  }
  let curLi = lyricDoms.ul.children[lyricIndex]
  // 为了避免错误，如果当前li对象存在有值才执行高亮
  if (curLi) {
      // curLi.className = 'active'
      curLi.classList.add('active') 
  }   
}
// 切换评论排序方式
const switchSortType = async (type) => {
  trackSortType.value = type
  if(musicList.value.length > 0){
    loadComments()
  }
}
// 加载评论
const loadComments = async () => {
  const id = musicList.value[currentIndex.value]?.id
  pageNo.value = 1
  const params = {
    id: id, 
    type: 0, 
    sortType: trackSortType.value, 
    pageSize: pageSize.value, 
    pageNo: pageNo.value++, 
  }
  
  await localStore.getCommentsData(params)
}
// 加载更多评论
const loadMoreComments = async () => {
  let cursor = null
  if(trackSortType.value === 3 && pageNo.value > 1){
    const len = trackComments.value[trackSortType.value].length
    cursor = trackComments.value[trackSortType.value][len - 1].time
  }
  const params = {
    type: 0, 
    sortType: trackSortType.value, 
    pageSize: pageSize.value, 
    pageNo: pageNo.value++, 
    cursor: cursor,
  }
  await localStore.getMoreComments(params)
}
onMounted(() => {
  const canvas = document.getElementById('visualizer')
  const audio = document.getElementById('player')
  audioVisualizer(audio, canvas)
  audio.addEventListener('timeupdate',updateLyric)
})
onBeforeUnmount(() => {
  const audio = document.getElementById('player')
  audio.removeEventListener('timeupdate',updateLyric)
})
</script>

<style scoped>
.drawer-mask {
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    display: flex;
    transition: opacity 0.3s ease;
}
.drawer-container {
    width: 100%;
    height: 100%;
    background-color: transparent;
    border-radius: 2px;
    transition: all 0.3s ease;
}
.drawer-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);
}
.drawer-header {
  height: 64px;
  width: 100%;
  display: flex;
  align-items: center;
}
.drawer-header .iconfont {
  font-size: 32px;
  color: #000;
  margin-left: 16px;
  cursor: pointer;
}

.drawer-header .iconfont:hover {
  color: white;
}

.drawer-content {
  width: 100%;
  flex: 1;
  /* background-color: #fff; */
  padding-bottom: 8px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.record-warp {
  height: 100%;
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.music-name {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-top: 20px;
  text-align: center;
  cursor: default;
}
.author-list {
  max-width: 480px;
  font-size: 14px;
  color: white;
  margin-top: 10px;
  text-align: center;
  cursor: default;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.music-picUrl {
  position: relative;
  width: 400px;
  height: 400px;
}
.record-warp img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 256px;
  height: 256px;;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  animation: pic-rotate 10s linear infinite forwards;
}
.func-warp {
  height: 100%;
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.func-switch-btn {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.func-container {
  width: 100%;
  overflow: hidden;  
}
.func-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 300%;
  transition: all 0.3s ease;
}
.start-time,
.end-time {
  position: absolute;
  top: 50%;  
  left: 48px;
  transform: translateY(-50%);
  font-size: 10px;
  color: #fff;
  margin: 0 10px;
}
.end-time {
  left: auto;
  right: 48px;
}
.lyric-line {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 75%;
  border-top: #fff 1.5px dashed ;
  transition: all 0.3s ease;
}
.lyric-warp,
.playlist-warp,
.comment-warp {
  width: 100%;
  height: 480px;
  overflow: hidden;
  transition: all 0.1s ease;
  transform: scale(0.8);
  opacity: 0;
}
.lyric-warp.active,
.playlist-warp.active,
.comment-warp.active {
  opacity: 1;
  transform: scale(1);
}
.lyric-warp {
  position: relative;
}
.lrc-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: .4s;
}
.lrc-list li {
  max-width: 100%;
  height: 32px;
  line-height: 32px;
  transition: .4s;
  font-size: 12px;
  color: #fff;
  text-align: center;
  cursor: pointer;  
}
.lrc-list li:hover {
  color: #000;
}
.lrc-list li.active {
  
  font-weight: bold;
  color: #fff;
  transform: scale(1.4);
}

.playlist-warp,
.comment-warp {
  background-color: #e6e6e65e;
  border-top-left-radius: var(--border-radius-light);
  border-bottom-left-radius: var(--border-radius-light);
}










.drawer-footer {
  position: relative;
  height: 92px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 200px;
  cursor: pointer;
}
.left {
  width: 200px;
  height: 100%;
}
.center {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
}
.center button {
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
.center button .iconfont {
    font-size: 32px;
    color: var(--footer-player-btn-color);
    transition: all 0.3s ease;
}
.center button .iconfont:hover {
    font-size: 36px;
    color: var(--footer-player-btn-hover-color);
}
.center .player-mode,
.center .favorite {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;  
}
.center .favorite {
  transform: translateY(1.6px);
}
.center .player-mode .iconfont,
.center .favorite .iconfont.icon-xiai,
.center .favorite .iconfont.icon-xiaisel {
  font-size: 24px;
  color: var(--footer-player-btn-color);
}
.center .favorite .iconfont.icon-xiaisel {
  color: red;
}
.center .player-mode:hover .iconfont,
.center .favorite:hover .iconfont.icon-xiai{
  color: white;
}

.right {
  width: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.handle-volume-warp {
  width: 124px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}
.handle-volume-warp .player-volume .iconfont {
  font-size: 24px;
  color: #000;
}










.player-drawer-enter-from {
  opacity: 0;
}

.player-drawer-leave-to {
  opacity: 0;
}

.player-drawer-enter-from .drawer-container,
.player-drawer-leave-to .drawer-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

@keyframes pic-rotate {
    from {
        transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}
</style>