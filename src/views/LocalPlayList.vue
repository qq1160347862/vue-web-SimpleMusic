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
                    <ContextMenu
                        @select="handleRightClick"
                        watchClass="card-box"
                        :menu="[{
                            label: '播放全部',
                            icon: 'icon-Playlists-xiayishoubofang',
                        }, {
                            label: '编辑歌单',
                            icon: 'icon-shoucangdaogedan',
                        },{
                            label: '删除歌单',
                            icon: 'icon-shanchu',
                        }]">   
                        <ul class="playList-container">
                            <li class="playList-card" 
                                @click="handlePlayListClick(item, 'local')" 
                                v-for="(item, index) in localPlayList" 
                                :key="index">
                                <div class="card-box no-select" :data-id="item.id">
                                    <img :src="item.detail.coverImgUrl" alt="">
                                    <div class="card-info">
                                        <p class="card-title">{{item.detail.name}}</p>
                                        <p class="card-trackCount">{{item.detail.trackCount}}首</p>
                                        <p class="card-createTime">创建时间:{{formatDate(new Date(item.detail.createTime),'-')}}</p>
                                        <p class="card-updateTime">更新时间:{{formatDate(new Date(item.detail.updateTime),'-')}}</p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </ContextMenu>
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
        <Dialog v-model="showDialog" id="edit-playlist-dialog">
            <template #title>编辑歌单</template>
            <template #content>
                <div class="edit-form-warp" v-if="editedPlayList">
                    <form @submit.prevent="editPlaylist" class="edit-form">
                        <div class="form-group-name" v-once>
                            <label for="edit-playlist-name">歌单名称:</label>
                            <input type="text" id="edit-playlist-name" :value="editedPlayList.name" placeholder="请输入歌单名称" required>
                        </div>
                        <div class="form-group-img">
                            <label for="edit-playlist-img">封面图片:</label>
                            <input type="file" id="edit-playlist-img" accept="image/*">
                        </div>
                        <div class="form-group-tags">
                            <label for="edit-playlist-tags">标签:</label>
                            <select name="tags" id="edit-playlist-tags" @change="handleSelectTag">
                                <option value="" disabled selected>请选择</option>
                                <option v-for="(tag, index) in localTags" :key="index" :value="tag" >{{ tag }}</option>                            
                            </select>
                        </div>                    
                        <ul class="form-group-show-tags">
                            <li class="tagSelected" v-for="(tag, index) in tagsSelected" :key="index">
                                <span>{{ tag }}</span>
                                <i class="iconfont icon-close" @click="tagsSelected.splice(index, 1)"></i>
                            </li>
                            <li class="tagSelected plus" @click="showTagDialog=true">
                                <i class="iconfont icon-plus"></i>
                            </li>
                        </ul>
                        <Dialog v-model="showTagDialog" type="modal" id="edit-playlist-tag-dialog">
                            <template #title>创建标签</template>
                            <template #content>
                                <form @submit.prevent="createTag" class="form-group-tagDiv">
                                    <label for="edit-playlist-tagDiv">自定义标签:</label>
                                    <input type="text" id="edit-playlist-tagDiv" placeholder="回车创建标签" required>
                                </form>
                            </template>
                        </Dialog>
                        <div class="form-group-desc" v-once>
                            <label for="edit-playlist-desc">描述:</label>
                            <textarea id="edit-playlist-desc" :value="editedPlayList.description" placeholder="请输入歌单描述"></textarea>
                        </div>
                        <div class="form-group-btn">
                            <button type="submit">修改</button>
                            <button type="button" @click="showDialog=false">取消</button>
                        </div>
                    </form>
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import Dialog from '../components/utils/Dialog.vue';
import SwitchBtn from '../components/utils/SwitchBtn.vue';
import ContextMenu from '../components/utils/ContextMenu.vue';
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router';
import { useUserStore} from '../store/userStore'
import { useLocalStore } from '../store/localStore';
import { storeToRefs } from 'pinia';
import useDateFormat from '@/hooks/useDateFormat'
import useDeepClone from '../hooks/useDeepClone';
const router = useRouter();
const formatDate = useDateFormat();
const deepClone = useDeepClone();
const userStore = useUserStore();
const localStore = useLocalStore();
const { userPlayList, isLogin } = storeToRefs(userStore);
const { localPlayList, localTags } = storeToRefs(localStore);
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
const showDialog = ref(false)
const editedPlayList = ref(null)
const editId = ref(null)
const tagsSelected = ref([])
const showTagDialog = ref(false)

// 编辑歌单
const editPlaylist = ()=>{
    const name = document.getElementById('edit-playlist-name').value.trim()
    const description = document.getElementById('edit-playlist-desc').value.trim()
    const tags = tagsSelected.value
    if (!name) {
        alert('歌单名称不能为空')
        return;
    }
    localStore.updateLocalPlaylist(editId.value,{ name, description, tags })
    showDialog.value = false
    tagsSelected.value = []
    editedPlayList.value = null
}
// 选择标签
const handleSelectTag = (e)=>{
    const tag = e.target.value
    const tags = e.target.parentNode.children[1].children
    if (tagsSelected.value.includes(tag)) {
        console.log('已选择,不可以重复选择');        
    } else {
        tagsSelected.value.push(tag)        
    }
    for (let i = 0; i < tags.length; i++){
        const item = tags[i];
        if (i === 0) {
            item.selected = true
        }else{
            item.selected = false
        }
    }
}
// 创建标签
const createTag = (e)=>{
    const tag = e.target[0].value.trim()
    if (!tag) {
        return;
    }
    e.target[0].value = ''
    showTagDialog.value = false
    tagsSelected.value.push(tag)
    localTags.value.push(tag)
}
// 点击歌单卡片
const handlePlayListClick = (item, location) => {
    router.push({ name: 'AlbumDetail', params: { id: item.id, location: location } })
}
// 右键歌单卡片
const handleRightClick = (dom,menuItem)=>{
    const targetId = parseInt(dom.dataset.id)
    editId.value = targetId
    if (menuItem.label === '播放全部') {
        const tracks = localStore.getLocalPlaylist(targetId).tracks;
        localStore.setMusicList(tracks)            
    } else if (menuItem.label === '编辑歌单') {
        console.log('编辑')
        const detail = localStore.getLocalPlaylist(targetId).detail
        editedPlayList.value = deepClone(detail)
        tagsSelected.value = deepClone(detail.tags)
        showDialog.value = true
    } else if (menuItem.label === '删除歌单') {
        localStore.deleteLocalPlaylist(targetId)
    }
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
        if (userPlayList.value.length <= 0) {
            await userStore.getUserPlayListData();
        }
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
    gap: 8px;
}
.card-box:hover {
    transform: scale(1);
}
.card-box img {
    width: 96px;
    height: 96px;
    object-fit: cover;
    border-radius: 8px;
    pointer-events: none;
}
.card-info {
    flex: 1;
    margin-left: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
    pointer-events: none;
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



.edit-form-warp {
    width: 100%;
    height: 100%;
}
.edit-form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    padding: 20px;
    gap: 16px;
}
.form-group-name,
.form-group-img,
.form-group-tags,
.form-group-tagDiv,
.form-group-show-tags,
.form-group-desc,
.form-group-btn {
    width: 360px;
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 8px;
}
.form-group-show-tags {
    flex-wrap: wrap;
}
.form-group-desc {
    align-items: flex-start;
}
.edit-form label {
    font-size: 14px;
    font-weight: bold;
    color: #333;
}
.edit-form input[type="text"],
.edit-form textarea,
.form-group-tagDiv input[type="text"] {
    flex-grow: 1;
    border-radius: var(--border-radius-light);
    border: none;
    outline: none;
    transition: all 0.3s ease;
    font-size: 14px;
    color: #333;
    text-indent: 4px;
}
.edit-form textarea {
    height: 100px;
    resize: none;
    padding: 8px;
    box-shadow: #333 0px 0px 0px 1px;
}
.tagSelected {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 4px 8px 4px 16px;
    height: 24px;
    border-radius: 24px;
    background-color: #333;
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}
.tagSelected.plus {
    padding: 4px 16px;
}
.tagSelected:hover {
    background-color: palevioletred;
    color: #fff;
}
.form-group-tagDiv {
    margin-bottom: 24px;
}
#edit-playlist-tags {
    /* -webkit-appearance: none;
    -moz-appearance: none;
    appearance:none; */
    width: 96px;
    padding: 4px 16px;
    border-radius: 16px;
    border: none;
    cursor: pointer;
    background-color: #333;
    color: #fff;
    font-size: 12px;
    outline: none;
    transition: all 0.3s ease;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
#edit-playlist-tags:focus-visible {
    outline: none;
}
#edit-playlist-tags option {
    border: none; 
    outline: none;
}
.form-group-btn {
    justify-content: flex-end;
}
.form-group-btn button {
    /* width: 100%; */
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    background-color: #333;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
}
.form-group-btn button:hover {
    background-color: palevioletred;
    color: #fff;
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