<template>
    <div class="localPlayList-layout">
        <div class="options-warp">
            <SwitchBtn 
                width="240px" 
                height="36px" 
                name="localPlayList"
                v-model:options="switchBtnOptions" 
                @handleClick="handleOptionsClick"/>
        </div>
        <div class="localPlayList-container">
            <div class="scroll-warp" :style="{'--warp-count': `calc(${switchBtnOptions.length} * 100%)`}" v-resize="handleResize">
                <div class="local-list-warp" v-hover="{
                    enterClass: 'show-scrollbar',
                    leaveClass: 'show-scrollbar',}">   
                    <ul class="playList-container">
                        <li class="playList-card" 
                            @click="handlePlayListClick(item, 'local')" 
                            v-for="(item, index) in localPlayList" 
                            :key="index">
                            <div class="card-box no-select">
                                <img :src="item.coverImgUrl" alt="">
                                <div class="card-info">
                                    <p class="card-title">{{item.name}}</p>
                                    <p class="card-trackCount">{{item.trackCount}}首</p>
                                    <p class="card-createTime">创建时间:{{formatDate(new Date(item.createTime),'-')}}</p>
                                    <p class="card-updateTime">更新时间:{{formatDate(new Date(item.updateTime),'-')}}</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="user-list-warp"  v-hover="{
                    enterClass: 'show-scrollbar',
                    leaveClass: 'show-scrollbar',}">
                    <ul class="playList-container" v-lazy>
                        <li class="playList-card" 
                            @click="handlePlayListClick(item, 'online')" 
                            v-for="(item, index) in userPlayList" 
                            :key="index">
                            <div class="card-box no-select">
                                <img src="" alt="" :data-src="item.coverImgUrl" class="lazy">
                                <div class="card-info">
                                    <p class="card-title">{{item.name}}</p>
                                    <p class="card-trackCount">{{item.trackCount}}首</p>
                                    <p class="card-createTime">创建时间:{{formatDate(new Date(item.createTime),'-')}}</p>
                                    <p class="card-updateTime">更新时间:{{formatDate(new Date(item.updateTime),'-')}}</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>                             
        </div>
    </div>
</template>

<script setup>
import SwitchBtn from '../components/utils/SwitchBtn.vue';
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router';
import { useUserStore} from '../store/userStore'
import { useLocalStore } from '../store/localStore';
import { storeToRefs } from 'pinia';
import useDateFormat from '@/hooks/useDateFormat'
const router = useRouter();
const formatDate = useDateFormat();
const userStore = useUserStore();
const localStore = useLocalStore();
const { userPlayList, isLogin } = storeToRefs(userStore);
const { localPlayList } = storeToRefs(localStore);
const optionIndex = ref(0)
const switchBtnOptions = ref([
    {
        id:'local-radio',
        label: '本地歌单',
        value: 0,
        disabled: false,
        checked: true
    },
    {
        id:'user-radio',
        label: '用户歌单',
        value: 1,
        disabled: true,
        checked: false
    },
])
// 点击歌单卡片
const handlePlayListClick = (item, location) => {
    router.push({ name: 'AlbumDetail', params: { id: item.id, location: location } })
}
// 处理窗口大小变化
const handleResize = (e) => {
    const scrollWarp = document.querySelector('.scroll-warp')
    if (!scrollWarp) return;
    scrollWarp.style.transform = `translateX(-${e.width/switchBtnOptions.value.length * optionIndex.value}px)`
}
// 切换选项卡
const handleOptionsClick = (value) => {
    const doms = {
        scroll:document.querySelector('.scroll-warp'),
        local:document.querySelector('.local-list-warp'),
        user:document.querySelector('.user-list-warp'),
        favorite:document.querySelector('.favorite-list-warp')
    }
    const width = doms.scroll.clientWidth
    const offset = width / switchBtnOptions.value.length
    optionIndex.value = value
    switch (+value) {
        case 0:
            doms.local.classList.add('active')
            doms.user.classList.remove('active')
            doms.scroll.style.transform = `translateX(-${offset * value}px)`
            break;
        case 1:
            doms.local.classList.remove('active')
            doms.user.classList.add('active')
            doms.scroll.style.transform = `translateX(-${offset * value}px)`
            break;
        default:
            break;
    }
}
const switchOptions = (n) => {
    switchBtnOptions.value.forEach((item, index) => {
        if (index === n) {
            item.checked = true
            return
        } 
        item.checked = false
    })
    handleOptionsClick(n)
}
// 监听登录状态并更新选项卡状态
watch(isLogin, async (newVal) => {
    if (newVal) {
        switchBtnOptions.value[1].disabled = false
        switchOptions(1)
        await userStore.getUserPlayListData();
    }
})
onMounted(async () => {
    if (isLogin.value) {
        switchBtnOptions.value[1].disabled = false
        switchOptions(0)
        await userStore.getUserPlayListData();
    }
})
</script>

<style scoped>
.localPlayList-layout {
    height: 100%;
    width: 100%;
    padding-left: var(--main-left-padding);
    overflow: hidden;
}
.options-warp {
    margin: 16px 0;
    display: flex;
    justify-content: center;
    align-items: center;
}
.localPlayList-container {
    height: calc(100% - 70px);
    width: 100%;
}
.scroll-warp {
    width: var(--warp-count);
    height: 100%;
    display: flex;
    align-items: center;
    transition: all 0.2s ease-in-out;
}
.local-list-warp,
.user-list-warp {
    height: 100%;
    width: 100%;
    overflow-y: scroll;
}
.playList-container {
    padding: 8px;
    /* columns: 5;
    column-gap: 10px; */
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-auto-rows: dense;
    gap: 8px;
}
.playList-card {
    /* break-inside: avoid; */
    /* margin-bottom: 10px; */ 
    cursor: pointer;    
    animation: slide-fade-in both;
    /* 使用浏览器的视图时间线，允许动画根据视口的变化而变化 */
    /* 元素运动到视口的75%时动画结束 */
    animation-timeline: view(75% 0);
    /* animation-range: 0vh 10vh; */
}
.card-box {
    padding: 16px;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    box-shadow: 0px 8px 20px #00000022;
    overflow: hidden;
    display: flex;
    align-items: center;
    flex-direction: column;
    transition: all 0.2s;
    transform: scale(0.95);
}
.card-box:hover {
    transform: scale(1);
}
.card-box img {
    width: 96px;
    height: 96px;
    object-fit: cover;
    border-radius: 8px;
}
.card-info {
    flex: 1;
    margin-left: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
}
.card-title {
    text-align: center;
    font-size: 14px;
    font-weight: bold;
}
.card-trackCount {
    font-size: 14px;
    color: #666;
}
.card-createTime {
    font-size: 12px;
    color: #999;
}
.card-updateTime {
    font-size: 12px;
    color: #999;
}

/* 因为容器高度原因，两行的样式写在前面，冲突时以后面的为准 */
.playList-card:nth-of-type(7n) {
    grid-column: span 1;
    grid-row: span 2;        
}
.playList-card:nth-of-type(7n) .card-box {
    justify-content: center;
    
}
.playList-card:nth-of-type(7n) .card-box img {
    width: 192px;
    height: 192px;
}
.playList-card:nth-of-type(7n) .card-info {
    margin-left: 0;
    margin-top: 16px;
    align-items: center;
    justify-content: center;
    gap: 24px;
}
.playList-card:nth-of-type(4n),
.playList-card:nth-of-type(5n) {
    grid-column: span 2;
    grid-row: span 1;
}
.playList-card:nth-of-type(4n) .card-box,
.playList-card:nth-of-type(5n) .card-box {
    flex-direction: row;
}
.playList-card:nth-of-type(4n) .card-box img,
.playList-card:nth-of-type(5n) .card-box img {
    width: 192px;
    height: 192px;
}
.playList-card:nth-of-type(4n) .card-info,
.playList-card:nth-of-type(5n) .card-info {
    margin-left: 24px;
    align-items: flex-start;
    gap: 24px;
}




@keyframes slide-fade-in {
    from {
        transform: scale(0.8) translateY(15px);
        opacity: 0;
        box-shadow: none;
    }
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
.local-list-warp.show-scrollbar::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
.local-list-warp.show-scrollbar::-webkit-scrollbar-track {
    background: var(--main-scrollbal-track-bg-color); /* 滚动条轨道背景色 */
    border-radius: 2px;
}
.local-list-warp.show-scrollbar::-webkit-scrollbar-thumb{
    background: var(--main-scrollbal-thumb-bg-color); /* 滚动条滑块颜色 */
    border-radius: 2px;
}
.local-list-warp.show-scrollbar::-webkit-scrollbar-thumb:hover{
    background: var(--main-scrollbal-thumb-hover-bg-color); /* 滚动条滑块悬停颜色 */
}

/* 滚动时显示滚动条 */
.user-list-warp.show-scrollbar::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
.user-list-warp.show-scrollbar::-webkit-scrollbar-track {
    background: var(--main-scrollbal-track-bg-color); /* 滚动条轨道背景色 */
    border-radius: 2px;
}
.user-list-warp.show-scrollbar::-webkit-scrollbar-thumb{
    background: var(--main-scrollbal-thumb-bg-color); /* 滚动条滑块颜色 */
    border-radius: 2px;
}
.user-list-warp.show-scrollbar::-webkit-scrollbar-thumb:hover{
    background: var(--main-scrollbal-thumb-hover-bg-color); /* 滚动条滑块悬停颜色 */
}
</style>