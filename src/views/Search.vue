<template>
    <div class="Search-layout">
        <h2 class="Search-title no-select"><span>{{ keywords }}</span>的搜索结果如下:找到{{ total }}首单曲</h2>
        <div class="Search-list-warp" v-hover="{
                enterClass: 'show-scrollbar',
                leaveClass: 'show-scrollbar',
            }">
            <table class="Search-song-list no-select">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>标题</th>
                        <th>专辑</th>
                        <th>时长</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(song, index) in searchResource" @click.prevent="addToPlayList(song)" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <div class="Search-song-name" v-lazy>
                                <img :src="picUrl" :data-src="song.al?.picUrl" class="lazy" alt="">
                                <div class="Search-song-info">
                                    <p>{{ song.name }}</p>
                                    <p>{{ song.ar?.map(item => item.name).join('/') }}</p>                                    
                                </div>                                
                            </div>                            
                        </td>
                        <td>{{ song.al.name }}</td>
                        <td>{{ formatTime(song.dt / 1000) }}</td>
                        <td>
                            <Tooltip content="添加到播放列表">
                                <i @click.stop="nextPlay(song)" class="iconfont icon-xiayishoubofang"></i>
                                <template #tip>下一首播放</template>
                            </Tooltip>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="ring" v-show="searchResource.length < total"></div>
        </div>
    </div>
</template>

<script setup>
import picUrl from '@/assets/images/music/default.png'
import Tooltip from '../components/utils/Tooltip.vue';
import { inject, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLocalStore } from '../store/localStore';
import { storeToRefs } from 'pinia';
import useSecondsToMinute from '@/hooks/useSecondsToMinute';
import useDebounce from '@/hooks/useDebounce';
const route = useRoute();
const message = inject('message');
const keywords = ref(route.query.keywords);
const type = ref(route.query.type);
const limit = ref(20);
const offset = ref(0);
const pageNum = ref(1);
const localStore = useLocalStore();
const searchResource = ref([]);
const total = ref(0);
const formatTime = useSecondsToMinute();

const addToPlayList = (song) => {
    localStore.pushMusicToList(song);
}

const nextPlay = (song) => {
    try {
        localStore.nextMusic(song);
        message.value.addMessage({text: '已添加至下一首', duration: 2000})
    }catch (error) {
        console.log(error);
        message.value.addMessage({text: error, duration: 2000})
    }
}

// 监听路由变化，更新keywords和type并重新搜索资源
watch(route, async (newValue) => {
    offset.value = 0;
    pageNum.value = 1;
    if (newValue.query.keywords !== keywords || newValue.query.type !== type) {
        keywords.value = newValue.query.keywords;
        type.value = newValue.query.type;
        const res = await localStore.searchResource({
            keywords: keywords.value,
            limit: limit.value,
            offset: offset.value,
            type: +type.value
        });
        switch (+type.value) {
            case 1: // 单曲
                searchResource.value = res.songs;
                total.value = res.songCount;
                break;
            case 100:   // 歌手
                break;
            case 1000:  // 歌单
                break;
            case 1004:  // Mv
                break;
            default:
                break;
        }        
    }
}, { deep: true, immediate: true });

const iobserver = shallowRef(null);
onMounted(() => {
    const loadMore = useDebounce(async () => {
        offset.value = pageNum.value++ * limit.value;
                const res = await localStore.searchResource({
                    keywords: keywords.value,
                    limit: limit.value,
                    offset: offset.value,
                    type: +type.value
                });
                switch (+type.value) {
                    case 1: // 单曲
                        searchResource.value.push(...res.songs);
                        total.value = res.songCount;   
                        break;
                    case 100:   // 歌手
                        break;
                    case 1000:  // 歌单
                        break;
                    case 1004:  // Mv
                        break;
                    default:
                        break;
                }                              
    }, 500);
    iobserver.value = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {            
            if (entry.isIntersecting) {
                console.log('加载更多');
                loadMore()
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
    });
    const ring = document.querySelector('.ring');
    iobserver.value.observe(ring);
});

onUnmounted(() => {
    iobserver.value.disconnect();
});
</script>

<style scoped>
.Search-layout {
    padding-left: var(--main-left-padding);
    width: 100%;
    height: 100%;
    overflow: hidden;
}
.Search-title {
    font-size: 14px;
    margin-top: 20px;
    margin-bottom: 20px;
}
.Search-title span {
    font-size: 16px;
    color: #ff0800;
    font-weight: bold;
    padding: 0 5px;
    letter-spacing: 1px;
}
.Search-list-warp {
    margin-top: 20px;
    width: 100%;
    height: 100%;
    overflow-y: scroll;   
    padding-bottom: 96px; 
}
.Search-song-list {
    width: 100%;
    border-collapse: collapse;
}
.Search-song-list thead {
    background-color: #f2f2f26b;
}
.Search-song-list thead tr th {
    padding: 10px;
    font-size: 12px;
    color: #333;
    text-align: left;
}
.Search-song-list tbody tr td {
    padding: 10px;
    font-size: 12px;
    color: #333;    
}
.Search-song-list tbody tr td:nth-child(1) {
    width: 3%;
}
.Search-song-list tbody tr td:nth-child(2) {
    width: 30%;
}
.Search-song-list tbody tr td:nth-child(3) {
    width: 20%;
}
.Search-song-list tbody tr td:nth-child(4) {
    width: 12%;
}
.Search-song-list tbody tr td:nth-child(5) {
    width: 25%;
}
.Search-song-list tbody tr {
    cursor: pointer;
    transition: background-color 0.3s;
}
.Search-song-list tbody tr:hover {
    background-color: #f2f2f26b;
}
.Search-song-name {
    display: flex;
    align-items: center;
}
.Search-song-name img {
    width: 36px;
    height: 36px;
    margin-right: 10px;
    border-radius: 8px;
}
.Search-song-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 10px;
}
.Search-song-info p {
    max-width: 160px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}



.ring {
    margin-top: 16px;
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
.Search-list-warp.show-scrollbar::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
.Search-list-warp.show-scrollbar::-webkit-scrollbar-track {
    background: var(--main-scrollbal-track-bg-color); /* 滚动条轨道背景色 */
    border-radius: 2px;
}
.Search-list-warp.show-scrollbar::-webkit-scrollbar-thumb{
    background: var(--main-scrollbal-thumb-bg-color); /* 滚动条滑块颜色 */
    border-radius: 2px;
}
.Search-list-warp.show-scrollbar::-webkit-scrollbar-thumb:hover{
    background: var(--main-scrollbal-thumb-hover-bg-color); /* 滚动条滑块悬停颜色 */
}
</style>