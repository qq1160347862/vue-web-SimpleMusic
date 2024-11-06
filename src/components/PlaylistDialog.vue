<template>
    <div class="playlist-dialog-container">
        <Dialog v-model="showDialog" id="playlist-dialog">
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
import Dialog from './utils/Dialog.vue';
import SwitchBtn from './utils/SwitchBtn.vue';
import unloading from '@/assets/images/playList/unloading.png';
import { watch, ref, onMounted, inject } from 'vue';
import { useLocalStore } from '../store/localStore';
import { useUserStore } from '../store/userStore';
import { storeToRefs } from 'pinia';
const message = inject('message')
const localStore = useLocalStore();
const userStore = useUserStore();
const { localPlayList } = storeToRefs(localStore);
const { isLogin, userPlayList } = storeToRefs(userStore);
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
// 打开窗口
const openDialog = () => {
    showDialog.value = true
}
// 设置选择歌曲
const setTrackSelected = (track) => {
    trackSelected.value = track
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
defineExpose({
    openDialog,
    setTrackSelected,
})
onMounted(async () => {
    // 根据登陆状态判断选项卡
    if (isLogin.value) {
        switchBtnOptions.value[1].disabled = false
        switchOptions(0)
        if (userPlayList.value.length <= 0) {
            await userStore.getUserPlayListData();
        }        
    }
})
</script>

<style scoped>
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
.local-list-warp.show-scrollbar::-webkit-scrollbar,
.user-list-warp.show-scrollbar::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
.local-list-warp.show-scrollbar::-webkit-scrollbar-track,
.user-list-warp.show-scrollbar::-webkit-scrollbar-track {
    background: var(--main-scrollbal-track-bg-color); /* 滚动条轨道背景色 */
    border-radius: 2px;
}
.local-list-warp.show-scrollbar::-webkit-scrollbar-thumb,
.user-list-warp.show-scrollbar::-webkit-scrollbar-thumb{
    background: var(--main-scrollbal-thumb-bg-color); /* 滚动条滑块颜色 */
    border-radius: 2px;
}
.local-list-warp.show-scrollbar::-webkit-scrollbar-thumb:hover,
.user-list-warp.show-scrollbar::-webkit-scrollbar-thumb:hover{
    background: var(--main-scrollbal-thumb-hover-bg-color); /* 滚动条滑块悬停颜色 */
}
</style>