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
                            <button>
                                <i class="iconfont icon-subscribe"></i>
                                {{ formatNumber(albumDetail?.subscribedCount) }}
                            </button>
                            <button>
                                <i class="iconfont icon-SHARE"></i>
                                {{ formatNumber(albumDetail?.shareCount) }}
                            </button>
                            <button @click="handleShowComment">
                                <i class="iconfont icon-bofang"></i>
                                评论
                            </button>
                        </div>                
                    </div>                
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
                                    <div class="track-infos">
                                        <p class="track-name">{{ track?.name }}</p>
                                        <p class="track-author">{{ track?.ar.map(item => item.name).join('/') }}</p>
                                    </div>
                                    <div class="track-mv" v-if="track?.mv && track?.mv !== 0">
                                        <i @click.stop="handleMvClick(track.mv)" class="iconfont icon-mv"></i>
                                    </div>                        
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
    </div>
</template>

<script setup>
import BackTop from '../components/utils/BackTop.vue';
import ContextMenu from '../components/utils/ContextMenu.vue';
import comment from '@/components/Comment.vue';
import { onMounted, ref, shallowRef, inject } from 'vue';
import { useRoute } from 'vue-router'
import { getPlaylistDetail, getPlaylistTracks } from '@/request/musicApi/playlist'
import { useLocalStore } from '@/store/localStore';
import { useUserStore } from '../store/userStore';
import { storeToRefs } from 'pinia';
import useNumberToTenThousand from '../hooks/useNumberToTenThousand';
import useDateFormat from '@/hooks/useDateFormat'
import useThrottle from '../hooks/useThrottle'
const route = useRoute()
const message = inject('message')
const localStore = useLocalStore()
const userStore = useUserStore()
const formatNumber = useNumberToTenThousand()
const formatDate = useDateFormat()
const {
    albumCaches, 
    maxCacheCount,
    albumComments,
    albumSortType 
} = storeToRefs(localStore)
const { isLogin, userInfo } = storeToRefs(userStore)
const albumId = route.params.id
const albumDetail = shallowRef(null)
const albumTracks = shallowRef(null)
const delay = 2000
const showComment = ref(false)
const pageSize = ref(10)
const pageNo = ref(1)


const handleTrackClick = useThrottle((track) => {
    if (!track) return;
    // message.value.addMessage({text: `切换至:《${track.name}》`, duration: 2000})
    localStore.pushMusicToList(track)
},delay)
const handleSelectClick = (dom,menuItem) => {
    const index = parseInt(dom.children[0].innerText) - 1;
    const track = albumTracks.value[index];
    console.log(index,track)
    if (menuItem.label === '下一首播放') {
        localStore.nextMusic(track)                
    } else if (menuItem.label === '添加到歌单') {
        if (!isLogin.value) {
            console.log('请先登录');
            return;
        }
        console.log('添加到歌单')
    } else if (menuItem.label === '下载') {
        console.log('下载')
    } else if (menuItem.label === '删除') {
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
        cursor = albumComments.value[albumSortType.value][len - 1].time
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
        console.log('缓存新数据');
        
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
    font-size: 14px;
    color: #999;
    margin-right: 16px;
}
.track-infos {
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.track-mv {
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
.track-mv:hover {
    background-color: #f50057;
    color: #fff;
}
.track-mv .iconfont {
    font-size: 24px;
}
.track-name {
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
.playList-tracks-warp.show-scrollbar::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
.playList-tracks-warp.show-scrollbar::-webkit-scrollbar-track {
    background: var(--main-scrollbal-track-bg-color); /* 滚动条轨道背景色 */
    border-radius: 2px;
}
.playList-tracks-warp.show-scrollbar::-webkit-scrollbar-thumb{
    background: var(--main-scrollbal-thumb-bg-color); /* 滚动条滑块颜色 */
    border-radius: 2px;
}
.playList-tracks-warp.show-scrollbar::-webkit-scrollbar-thumb:hover{
    background: var(--main-scrollbal-thumb-hover-bg-color); /* 滚动条滑块悬停颜色 */
}
</style>