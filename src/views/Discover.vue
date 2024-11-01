<template>
    <div class="discover-layout">
        <div class="discover-content" 
            v-hover="{
                    enterClass: 'show-scrollbar',
                    leaveClass: 'show-scrollbar',
                }">
            <div class="discover-album-warp no-select">
                <h2 class="discover-album-title">发现好歌单</h2>
                <div class="discover-album-list">
                    <div class="discover-album-list-item" v-for="album in discoverAlbumList" :key="album.id" v-memo="[album.id, album.name]">
                        <AlbumCard
                            @click="redirectToAlbum(album.id)" 
                            v-if="showDiscoverAlbumCard"
                            :AlbumId="album.id" 
                            :info="album.name" 
                            :playCount="album.playCount" 
                            :imgUrl="album.picUrl"></AlbumCard>
                    </div>
                </div>
            </div>
            <div class="recommend-album-warp no-select" v-if="isLogin">
                <h2 class="recommend-album-title">每日推荐</h2>
                <div class="recommend-album-list">
                    <div class="recommend-album-list-item" v-for="album in recommendAlbumList" :key="album.id" v-memo="[album.id, album.name]">
                        <AlbumCard 
                            @click="redirectToAlbum(album.id)" 
                            v-if="showRecommendAlbumCard"
                            :AlbumId="album.id" 
                            :info="album.name" 
                            :playCount="album.playcount" 
                            :imgUrl="album.picUrl"></AlbumCard>
                    </div>
                </div>
            </div>            
            <BackTop :query="'.discover-content'" />
        </div>
    </div>
</template>

<script setup>
import BackTop from '../components/utils/BackTop.vue';
import { getDiscoverPlaylist, getRecommendPlaylist } from '../request/musicApi/playlist';
import { defineAsyncComponent, onMounted, ref, inject } from 'vue';
const AlbumCard = defineAsyncComponent(() => import('@/components/AlbumCard.vue'));
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { storeToRefs } from 'pinia';
const router = useRouter()
const userStore = useUserStore()
const message = inject('message')
const { isLogin, cookie } = storeToRefs(userStore)
const showDiscoverAlbumCard = ref(false)
const showRecommendAlbumCard = ref(false)
const discoverAlbumList = ref([])
const recommendAlbumList = ref([])

const redirectToAlbum = (albumId) => {
    router.push({ name: 'AlbumDetail', params: { id: albumId, location: 'online' } })
}

onMounted(async () => {
    try {

        const discoverAlbum = await getDiscoverPlaylist(8);
        if (discoverAlbum.data.code === 200) {
            discoverAlbumList.value = discoverAlbum.data.result;
            showDiscoverAlbumCard.value = true;
        } else {
            console.error('获取发现好歌单失败:');
        }

        let recommendAlbum = null;
        if (isLogin.value){
            recommendAlbum = await getRecommendPlaylist(cookie.value);
            if (recommendAlbum.data.code === 200) {
                recommendAlbumList.value = recommendAlbum.data.recommend;
                showRecommendAlbumCard.value = true;
            } else {
                console.error('获取每日推荐专辑失败:');
            }
        }
        
    } catch (err) {
        console.error('请求失败:', err || '未知错误');
        if (err.status === 301 || err.response.status === 301) {
            isLogin.value = false;
        }
        message.value.addMessage({ text: `请求失败: ${err.response.data.msg || '未知错误'}`, duration: 3000, type: 'error' });  
    }
})

</script>

<style scoped>
.discover-layout {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: var(--main-left-padding);
    width: 100%;
    height: 100%;  
}
.discover-content {
    flex-grow: 1;
    padding: 24px 0;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}
.discover-album-warp,
.recommend-album-warp {
    width: 100%;
    margin-bottom: 24px;
}
.discover-album-title,
.recommend-album-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
    color: var(--album-title-color);
}
/* .discover-album-list {
    width: 95%;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    margin-top: 20px;
}
.discover-album-list-item {
    margin: 0 24px 24px 0;
} */
.discover-album-list,
.recommend-album-list {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    margin-top: 20px;
}
.discover-album-list-item,
.recommend-album-list-item {
    --col-n: 8;
    --gap: calc((100% - 108px * var(--col-n)) / var(--col-n) / 2);
    margin: 0 var(--gap) 20px;
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
.discover-content.show-scrollbar::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
.discover-content.show-scrollbar::-webkit-scrollbar-track {
    background: var(--main-scrollbal-track-bg-color); /* 滚动条轨道背景色 */
    border-radius: 2px;
}
.discover-content.show-scrollbar::-webkit-scrollbar-thumb{
    background: var(--main-scrollbal-thumb-bg-color); /* 滚动条滑块颜色 */
    border-radius: 2px;
}
.discover-content.show-scrollbar::-webkit-scrollbar-thumb:hover{
    background: var(--main-scrollbal-thumb-hover-bg-color); /* 滚动条滑块悬停颜色 */
}

/* 响应式布局 */
@media screen and (max-width: 1280px) {
    .discover-album-list-item,
    .recommend-album-list-item {
        --col-n: 7;
    }
}
@media screen and (max-width: 1180px) {
    .discover-album-list-item,
    .recommend-album-list-item {
        --col-n: 6;
    }
}
@media screen and (max-width: 1080px) {
    .discover-album-list-item,
    .recommend-album-list-item {
        --col-n: 5;
    }
}
@media screen and (max-width: 980px) {
    .discover-album-list-item,
    .recommend-album-list-item {
        --col-n: 4;
    }
}
@media screen and (max-width: 880px) {
    .discover-album-list-item {
        --col-n: 3;
    }
}
@media screen and (max-width: 780px) {
    .discover-album-list-item {
        --col-n: 2;
    }
}
</style>