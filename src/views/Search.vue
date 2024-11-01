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
                            <Tooltip content="下一首播放">
                                <i @click.stop="nextPlay(song)" class="iconfont icon-xiayishoubofang"></i>
                                <template #tip>下一首播放</template>
                            </Tooltip>
                            <Tooltip content="添加到播放列表">
                                <i @click.stop="openDialog(song)" class="iconfont icon-plus"></i>
                                <template #tip>添加到播放列表</template>
                            </Tooltip>
                        </td>
                    </tr>
                </tbody>
            </table>
            <BackTop :query="'.Search-list-warp'"  class="playList-backTop"/>
            <div class="ring" v-show="searchResource.length < total"></div>
        </div>
        <Dialog v-model="showDialog" id="search-playlist-dialog">
            <template #title>歌单</template>
            <template #content>
                <div class="playlist-list-warp">
                    <div class="options-warp">
                        <SwitchBtn 
                            width="132px" 
                            height="28px" 
                            name="searchPlayList"
                            v-model:options="switchBtnOptions" 
                            @handleClick="handleOptionsClick"/>
                    </div>
                    <div class="playlist-list">
                        <div class="scroll-warp" :style="{'--warp-count': `calc(${switchBtnOptions.length} * 100%)`}" v-resize="handleResize">
                            <div class="local-list-warp" v-hover="{
                                enterClass: 'show-scrollbar',
                                leaveClass: 'show-scrollbar',}">
                                <ul>
                                    <li @click="addMusicToPlaylist(playlist.id, 'local')" v-for="playlist in localPlayList" :key="playlist.id">
                                        <img :src="playlist.detail.coverImgUrl" alt="">
                                        <span>{{ playlist.detail.name }}</span>
                                    </li>
                                </ul>
                            </div>
                            <div class="user-list-warp" v-hover="{
                                enterClass: 'show-scrollbar',
                                leaveClass: 'show-scrollbar',}">
                                <ul v-lazy>
                                    <li @click="addMusicToPlaylist(playlist.id, 'online')" v-for="playlist in userPlayList" :key="playlist.id">
                                        <img :src="unloading" class="lazy" :data-src="playlist.coverImgUrl" alt="">
                                        <span>{{ playlist.name }}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import picUrl from '@/assets/images/music/default.png'
import unloading from '@/assets/images/playList/unloading.png'
import Tooltip from '../components/utils/Tooltip.vue';
import Dialog from '../components/utils/Dialog.vue';
import SwitchBtn from '../components/utils/SwitchBtn.vue';
import BackTop from '../components/utils/BackTop.vue';
import { inject, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLocalStore } from '../store/localStore';
import { useUserStore } from '../store/userStore';
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
const userStore = useUserStore();
const { localPlayList } = storeToRefs(localStore);
const { isLogin, userPlayList } = storeToRefs(userStore);
const searchResource = ref([]);
const total = ref(0);
const formatTime = useSecondsToMinute();
const addToPlayList = (song) => {
    localStore.addMusicToList(song, 'current');
}
const nextPlay = (song) => {
    try {
        localStore.nextMusic(song);
        message.value.addMessage({text: '已添加至下一首', duration: 2000, type:'success'})
    }catch (error) {
        console.log(error);
        message.value.addMessage({text: error, duration: 2000, type: 'error'})
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



const showDialog = ref(false)
const optionIndex = ref(0)
const trackSelected = ref(null)
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
// 打开歌单窗口
const openDialog = (song) => {
    trackSelected.value = song
    showDialog.value = true
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
const addMusicToPlaylist = (playlistId, where) => {
    console.log('添加歌曲到歌单', playlistId,trackSelected.value);
    showDialog.value = false
    if (where === 'local') {
        const res = localStore.addTrackToLocalPlaylist(playlistId, trackSelected.value)
        if (!res) {
            message.value.addMessage({text: '歌曲已存在或当前歌单不存在', duration: 2000, type: 'warning'})
        }else{
            message.value.addMessage({text: '添加成功', duration: 2000, type:'success'})
        }
    }else if (where === 'online') {

    }
    trackSelected.value = null;
}
// 监听登录状态并更新选项卡状态
watch(isLogin, async (newVal) => {
    if (newVal) {
        switchBtnOptions.value[1].disabled = false
        switchOptions(1)
        await userStore.getUserPlayListData();
    }
})





const iobserver = shallowRef(null);
onMounted(async () => {


    // 根据登陆状态判断选项卡
    if (isLogin.value) {
        switchBtnOptions.value[1].disabled = false
        switchOptions(0)
        if (userPlayList.value.length <= 0) {
            await userStore.getUserPlayListData();
        }        
    }

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
.Search-song-list tbody tr td:nth-child(5) .iconfont {
    font-size: 16px;
    cursor: pointer;
    padding: 0 8px;
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
.playList-backTop {
    right: 40px;
    bottom: 120px;
    cursor: pointer;
}







.playlist-list-warp {
    width: 360px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}
.playlist-list {
    width: 100%;
    overflow: hidden;
    margin-bottom: 16px;
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
    height: 240px;
    width: 100%;
    overflow-y: scroll;
}
.scroll-warp ul {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}
.scroll-warp ul li {
    width: 100%;
    height: 48px;
    display: flex;
    align-items: center;
    background-color: #0a0a0ae0;
    color: #f7f7f7;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}
.scroll-warp ul li img {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    object-fit: cover;
    margin: 16px;
}
.scroll-warp ul li span {
    font-size: 12px;
    margin-left: 16px;
    margin-right: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.scroll-warp ul li:hover {
    background-color: #b69f9f;
    color: #fff;
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
.Search-list-warp.show-scrollbar::-webkit-scrollbar,
.local-list-warp.show-scrollbar::-webkit-scrollbar,
.user-list-warp.show-scrollbar::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
.Search-list-warp.show-scrollbar::-webkit-scrollbar-track,
.local-list-warp.show-scrollbar::-webkit-scrollbar-track,
.user-list-warp.show-scrollbar::-webkit-scrollbar-track {
    background: var(--main-scrollbal-track-bg-color); /* 滚动条轨道背景色 */
    border-radius: 2px;
}
.Search-list-warp.show-scrollbar::-webkit-scrollbar-thumb,
.local-list-warp.show-scrollbar::-webkit-scrollbar-thumb,
.user-list-warp.show-scrollbar::-webkit-scrollbar-thumb{
    background: var(--main-scrollbal-thumb-bg-color); /* 滚动条滑块颜色 */
    border-radius: 2px;
}
.Search-list-warp.show-scrollbar::-webkit-scrollbar-thumb:hover,
.local-list-warp.show-scrollbar::-webkit-scrollbar-thumb:hover,
.user-list-warp.show-scrollbar::-webkit-scrollbar-thumb:hover{
    background: var(--main-scrollbal-thumb-hover-bg-color); /* 滚动条滑块悬停颜色 */
}
</style>