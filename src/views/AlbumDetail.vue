<template>
    <div class="album-detail-container">
        <Transition name="scale-fade">
            <div class="album-detail-playList-warp" v-show="!showComment">
                <div class="playList-infos-warp">
                    <div class="left no-select" v-animate="{
                        name: 'albumImg',
                        duration: 2,
                        delay: 0,
                        timingFunction: 'ease-in-out',
                        direction: 'alternate-reverse',
                        iterationCount: 'infinite',
                    }">
                        <img :src="albumDetail?.coverImgUrl" alt="coverImgUrl" v-if="albumDetail?.coverImgUrl">
                        <img src="" alt="" v-else>
                    </div>
                    <div class="right">
                        <p class="title">{{ albumDetail?.name }}</p>
                        <div class="author">
                            <img class="no-select" :src="albumDetail?.creator.avatarUrl" alt="authorImgUrl">
                            {{ albumDetail?.creator.nickname }}                        
                        </div>
                        <div class="pulish no-select">
                            <span>{{ `创建时间:${formatDate(new Date(albumDetail?.createTime), '-')}`}}</span>
                            <span>{{ `最后更新时间:${formatDate(new Date(albumDetail?.updateTime), '-')}  ${albumDetail?.trackCount}首` }}</span>
                        </div>
                        <div class="tags no-select">
                            <ul>
                                <li v-for="tag in albumDetail?.tags" :key="tag">{{ tag }}</li>
                            </ul>
                        </div>
                        <p class="description">{{ albumDetail?.description }}</p>    
                        <div class="operation no-select">
                            <button @click="handlePlayClick">
                                <i class="iconfont icon-bofang"></i>
                                播放
                            </button>
                            <button v-if="isLogin && !isLocated">
                                <i class="iconfont icon-subscribe"></i>
                                {{ formatNumber(albumDetail?.subscribedCount) }}
                            </button>
                            <button v-if="isLogin && !isLocated">
                                <i class="iconfont icon-SHARE"></i>
                                {{ formatNumber(albumDetail?.shareCount) }}
                            </button>
                            <button v-if="isLogin && !isLocated" @click="handleShowComment">
                                <i class="iconfont icon-bofang"></i>
                                评论
                            </button>
                        </div>                
                    </div>                
                </div>
                <div class="playList-caption no-select">
                    <ul>
                        <li>#</li>
                        <li>标题</li>
                        <li>专辑</li>
                        <li>时长</li>
                        <li>MV</li>
                    </ul>
                </div>
                <div class="playList-tracks-warp no-select" v-hover="{
                        enterClass: 'show-scrollbar',
                        leaveClass: 'show-scrollbar',
                    }">
                    <ContextMenu 
                        @select="handleSelectClick"
                        watchClass="playList-tracks-item"
                        :menu="[{
                        label: '下一首播放',
                        icon: 'icon-Playlists-xiayishoubofang',
                    }, {
                        label: '添加到歌单',
                        icon: 'icon-shoucangdaogedan',
                    }, {
                        label: '下载',
                        icon: 'icon-xiazai',
                    },{
                        label: '删除',
                        icon: 'icon-shanchu',
                    }]">
                        <ul class="playList-tracks-list">
                            <TransitionGroup name="track-list">
                                <li @click="handleTrackClick(track)" 
                                    class="playList-tracks-item"
                                    v-for="(track, index) in albumTracks" 
                                    :key="track?.id">
                                    <div class="track-index">{{ index + 1}}</div>
                                    <div class="track-infos" v-lazy>
                                        <img src="" :data-src="track?.al.picUrl" class="lazy" alt="">
                                        <div>
                                            <p class="track-name">{{ track?.name }}</p>
                                            <p class="track-author">{{ track?.ar.map(item => item.name).join('/') }}</p>
                                        </div>                                        
                                    </div>
                                    <div class="track-album">
                                        <p>{{ track.ar.map(item => item.name).join('/') }}</p>
                                    </div>
                                    <div class="track-duration">
                                        {{ formatTime(track.dt / 1000) }}
                                    </div>
                                    <div class="track-mv" v-if="track?.mv && track?.mv !== 0">
                                        <i @click.stop="handleMvClick(track.mv)" class="iconfont icon-mv"></i>
                                    </div>
                                    <div class="track-mv hide" v-else></div>                        
                                </li>
                            </TransitionGroup>                    
                        </ul>
                    </ContextMenu>
                </div>
                <BackTop :query="'.playList-tracks-warp'"  class="playList-backTop"/>
            </div>
        </Transition>
        <Transition name="scale-fade">
            <div class="album-detail-comment-warp" v-show="showComment">
                <i class="iconfont icon-switch" @click="handleHideComment"></i>
                <comment 
                    key="album"                
                    name="album"
                    :uid="userInfo?.profile.userId"
                    :isLogin="isLogin"
                    :id="+albumId"
                    :type="2"
                    :sortType="albumSortType"
                    :comments="albumComments"
                    :getSubComments="localStore.getFloorCommentsData"
                    :likeComment="localStore.handleLikeComment"
                    :handleComment="localStore.handleComment"
                    @loadComments="loadMoreComments"
                    @switchSortType="switchSortType"></comment>                
            </div>
        </Transition>
        <Dialog v-model="showDialog" id="show-playlist-dialog">
            <template #title>歌单</template>
            <template #content>
                <div class="playlist-list-warp">
                    <div class="options-warp">
                        <SwitchBtn 
                            width="132px" 
                            height="28px" 
                            name="showPlayList"
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
import Dialog from '../components/utils/Dialog.vue';
import BackTop from '../components/utils/BackTop.vue';
import ContextMenu from '../components/utils/ContextMenu.vue';
import comment from '@/components/Comment.vue';
import SwitchBtn from '../components/utils/SwitchBtn.vue';
import unloading from '@/assets/images/playList/unloading.png';
import { onMounted, ref, shallowRef, inject, computed, watch } from 'vue';
import { useRoute } from 'vue-router'
import { getPlaylistDetail, getPlaylistTracks } from '@/request/musicApi/playlist'
import { useLocalStore } from '@/store/localStore';
import { useUserStore } from '../store/userStore';
import { storeToRefs } from 'pinia';
import useNumberToTenThousand from '../hooks/useNumberToTenThousand';
import useSecondsToMinute from '@/hooks/useSecondsToMinute';
import useDateFormat from '@/hooks/useDateFormat'
import useThrottle from '../hooks/useThrottle'
const route = useRoute()
const message = inject('message')
const localStore = useLocalStore()
const userStore = useUserStore()
const formatNumber = useNumberToTenThousand()
const formatTime = useSecondsToMinute();
const formatDate = useDateFormat()
const {
    albumCaches, 
    maxCacheCount,
    albumComments,
    albumSortType, 
    localPlayList,
} = storeToRefs(localStore)
const { isLogin, userInfo, userPlayList } = storeToRefs(userStore)
const isLocated = computed(() => {
    const location = route.params.location;
    return location === 'local'? true : false;
})
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
const albumId = route.params.id
const albumDetail = shallowRef(null)
const albumTracks = shallowRef(null)
const delay = 500
const showComment = ref(false)
const pageSize = ref(10)
const pageNo = ref(1)


const handleTrackClick = useThrottle((track) => {
    if (!track) return;
    // message.value.addMessage({text: `切换至:《${track.name}》`, duration: 2000})
    localStore.addMusicToList(track,'current')
},delay)
const handleSelectClick = (dom,menuItem) => {
    const index = parseInt(dom.children[0].innerText) - 1;
    const track = albumTracks.value[index];
    if (menuItem.label === '下一首播放') {
        localStore.nextMusic(track)                
    } else if (menuItem.label === '添加到歌单') {
        showDialog.value = true
        trackSelected.value = track
        console.log('添加到歌单')
    } else if (menuItem.label === '下载') {
        console.log('下载')
    } else if (menuItem.label === '删除') {
        if (isLocated.value) {
            console.log('删除本地歌单音乐');
            const res = localStore.deleteTrackFromLocalPlaylist(albumId, track.id)
            if(!res){
                message.value.addMessage({text: '删除失败', duration: 2000, type: 'error'})
                return;
            }
            message.value.addMessage({text: '删除成功', duration: 2000, type: 'success'})
            return;
        }
        if (!isLogin.value) {
            console.log('请先登录');
            return;
        }
        if (userInfo.value.userId !== albumDetail.value.userId) {
            console.log('不可删除别人歌单里的歌曲');
            return;
        }
        console.log('删除')
    }
}
const handlePlayClick = useThrottle(() => {
    if(!albumTracks.value) return;
    localStore.setMusicList(albumTracks.value)
},delay)
const handleMvClick = useThrottle((mvId)=>{
    console.log(mvId)
},delay)


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
            message.value.addMessage({text: '添加成功', duration: 2000, type: 'success'})
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


const handleShowComment = () => {
    showComment.value = true
    loadComments()
}
const handleHideComment = () => {
    showComment.value = false
}
// 加载更多评论
const loadMoreComments = async () => {
    let cursor = null
    if(albumSortType.value === 3 && pageNo.value > 1){
        const len = albumComments.value[albumSortType.value].length
        cursor = albumComments.value[albumSortType.value][len - 1]?.time
    }
    const params = {
        type: 2, 
        sortType: albumSortType.value, 
        pageSize: pageSize.value, 
        pageNo: pageNo.value++, 
        cursor: cursor,
    }
    await localStore.getMoreComments(params)
}
// 切换评论排序方式
const switchSortType = async (type) => {
    albumSortType.value = type
    loadComments()
}
// 加载评论
const loadComments = async () => {
    pageNo.value = 1
    const params = {
        id: +albumId, 
        type: 2, 
        sortType: albumSortType.value, 
        pageSize: pageSize.value, 
        pageNo: pageNo.value++, 
    }
    
    await localStore.getCommentsData(params)
}
// onMounted 在组件首次挂载完成时触发的，这里用来请求歌单详情和歌曲列表
onMounted( async () => {

    // 根据登陆状态判断选项卡
    if (isLogin.value) {
        switchBtnOptions.value[1].disabled = false
        switchOptions(0)
        if (userPlayList.value.length <= 0) {
            await userStore.getUserPlayListData();
        }        
    }

    if (isLocated.value) {
        console.log('加载本地歌单');
        const localPlayList = localStore.getLocalPlaylist(albumId);
        albumDetail.value = localPlayList.detail;
        albumTracks.value = localPlayList.tracks;
        return;        
    }
    const isCached = albumCaches.value.findIndex(item => item.id === albumId);
    // 缓存命中, 不用重新请求数据
    if (isCached !== -1) {
        console.log('缓存命中');
        albumDetail.value = albumCaches.value[isCached].detail;
        albumTracks.value = albumCaches.value[isCached].tracks;
        return;
    }

    // 缓存未命中, 请求数据
    try {
        const [res, tracksRes] = await Promise.all([
            getPlaylistDetail(albumId),
            getPlaylistTracks(albumId)
        ]);

        if (res.data.code !== 200) throw new Error('获取歌单详情失败');
        if (tracksRes.data.code !== 200) throw new Error('获取歌单曲目失败');

        albumDetail.value = res.data.playlist;
        albumTracks.value = tracksRes.data.songs;

        // 缓存当前歌单信息
        albumCaches.value.push({
            id: albumId,
            detail: res.data.playlist,
            tracks: tracksRes.data.songs
        });
        console.log('缓存新数据', albumCaches.value);
        
        // 缓存数量最多缓存maxCacheCount个
        if (albumCaches.value.length > maxCacheCount.value) {
            albumCaches.value.shift(); // 移除最早的缓存
        }
    } catch (error) {
        console.error(error.message);
    }
});

</script>

<style scoped>
.album-detail-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
}
.album-detail-playList-warp {
    position: relative;
    width: 100%;
    min-width: 420px;
    height: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
}
.playList-caption {
    width: 100%;
    margin: 2px 0;
}
.playList-caption ul {
    display: flex;
    align-items: center;
    /* justify-content: space-around; */
    font-size: 12px;
    background-color: #ffffffa8;
    border-radius: var(--border-radius-light);
    color: #999;
    padding: 0 12px;
}
.playList-caption ul li {
    padding: 4px 0;
    cursor: pointer;
}
.playList-caption ul li:nth-child(1) {
    width: 16px;
    margin-right: 16px;
}
.playList-caption ul li:nth-child(2) {
    width: 320px;
    margin-right: 16px;
}
.playList-caption ul li:nth-child(3) {
    width: 240px;
    margin-right: 16px;
}
.playList-caption ul li:nth-child(4) {
    width: 120px;
}
.playList-caption ul li:nth-child(5) {
    width: 32px;
    margin-left: auto;
    margin-right: 32px;
}
.playList-infos-warp {
    width: 100%;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
}
.playList-infos-warp .left {
    width: 224px;
    height: 224px;
    /* flex-grow: 1; */
    padding: 16px;
}
.left img {
    width: 100%;    
    aspect-ratio: 1/1;
    border-radius: 16px;
    object-fit: cover;
    cursor: pointer;
}
.playList-infos-warp .right {
    padding: 16px;
    flex: 1;
    min-width: 380px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 8px;
    cursor: default;
}
.right .title {
    font-size: 14px;
    font-weight: bold;
}
.right .author {
    display: flex;
    align-items: center;
    gap: 8px;
    color: black;
    font-size: 10px;
    cursor: pointer;
}
.right .author img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
}
.right .pulish {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
}
.tags ul{
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
}
.tags ul li {
    background-color: #000;
    color: #fff;
    padding: 4px 16px;
    border-radius: 16px;
    cursor: pointer;
}
.right .description {
    flex-grow: 1;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    line-clamp: 4;
    -webkit-line-clamp: 4;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    color: black;
    font-size: 12px;
    /* background-color: #ffffffa2; */
    border-radius: 4px;
}
.operation {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
}
.operation button {
    /* width: 40px; */
    /* height: 20px; */
    padding: 8px 16px;
    font-size: 10px;
    cursor: pointer;
    border-radius: 16px;
    border: none;
    color: rgb(243, 243, 243);
    background-color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: all 0.2s linear;
}
.operation button .iconfont {
    font-size: 12px;
}
.operation button:hover { 
    background-color: #f50057;
}



.playList-tracks-warp {
    overflow-y: scroll;
    flex-grow: 1;
    width: 100%;
    /* background: rgba(250, 235, 215, 0.842); */
    border-radius: var(--border-radius-light);
}
.playList-tracks-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.playList-tracks-list .playList-tracks-item {
    height: 48px;
    width: 100%;
    border-radius: var(--border-radius-light);
    display: flex;
    align-items: center;
    padding: 12px;
    background: #ffffffa8;
    cursor: pointer;
    transition: all 0.2s linear;
}
.playList-tracks-list .playList-tracks-item:hover {
    background: #ffffff;
}
.track-index {
    font-size: 12px;
    color: #999;
    margin-right: 16px;
    width: 16px;
    pointer-events: none;
}
.track-infos {
    display: flex;
    /* justify-content: center;    */
    align-items: center; 
    width: 320px;    
    pointer-events: none;
    margin-right: 16px;
}
.track-infos img {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    object-fit: cover;
    margin-right: 8px;
}
.track-infos div {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 4px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
.track-album,
.track-duration {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #999;    
    pointer-events: none;
}
.track-album {
    width: 240px;
    margin-right: 16px;
}
.track-duration {
    width: 120px;
}
.track-album p,
.track-duration p {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.track-mv,
.track-mv.hide {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 4px #999;
    margin-left: auto;
    margin-right: 32px;
    font-size: 10px;
    color: #999;
    cursor: pointer;
    transition: all 0.2s linear;
}
.track-mv.hide {
    opacity: 0;
    pointer-events: none;
}
.track-mv:hover {
    background-color: #f50057;
    color: #fff;
}
.track-mv .iconfont {
    font-size: 24px;
}
.track-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    font-weight: bold;
    color: #333;
}
.track-author { 
    color: #999;
    font-size: 10px;
}
.playList-backTop {
    right: 40px;
}

.album-detail-comment-warp {
    position: relative;
    width: 100%;
    height: 100%;
    /* min-width: 420px; */
    /* padding: 16px; */
}
.album-detail-comment-warp .iconfont {
    position: absolute;
    z-index: 999;
    top: 56px;
    left: 16px;
    font-size: 16px;
    cursor: pointer;
    border: none;
    color: black;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}
.album-detail-comment-warp .iconfont:hover {
    color: #fff;
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




.track-list-enter-active,
.track-list-leave-active {
    transition: all .2s ease-in-out;
}
.track-list-enter-from,
.track-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.scale-fade-enter-active {
    transition: all .3s ease-in-out;
}
.scale-fade-leave-active {
    transition: all .3s ease-in-out;
}
.scale-fade-enter-from {
    opacity: 0;
    transform: scale(0.9);
}
.scale-fade-enter-to {
    opacity: 1;
    transform: scale(1);
}
.scale-fade-leave-from {
    opacity: 1;
    transform: scale(1);
}
.scale-fade-leave-to {
  opacity: 0;
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
.playList-tracks-warp.show-scrollbar::-webkit-scrollbar,
.local-list-warp.show-scrollbar::-webkit-scrollbar,
.user-list-warp.show-scrollbar::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
.playList-tracks-warp.show-scrollbar::-webkit-scrollbar-track,
.local-list-warp.show-scrollbar::-webkit-scrollbar-track,
.user-list-warp.show-scrollbar::-webkit-scrollbar-track {
    background: var(--main-scrollbal-track-bg-color); /* 滚动条轨道背景色 */
    border-radius: 2px;
}
.playList-tracks-warp.show-scrollbar::-webkit-scrollbar-thumb,
.local-list-warp.show-scrollbar::-webkit-scrollbar-thumb,
.user-list-warp.show-scrollbar::-webkit-scrollbar-thumb{
    background: var(--main-scrollbal-thumb-bg-color); /* 滚动条滑块颜色 */
    border-radius: 2px;
}
.playList-tracks-warp.show-scrollbar::-webkit-scrollbar-thumb:hover,
.local-list-warp.show-scrollbar::-webkit-scrollbar-thumb:hover,
.user-list-warp.show-scrollbar::-webkit-scrollbar-thumb:hover{
    background: var(--main-scrollbal-thumb-hover-bg-color); /* 滚动条滑块悬停颜色 */
}
</style>