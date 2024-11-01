<template>  
    <aside>
        <ul class="menu1 no-select">
            <li class="menu1-item">
                <h2>发现音乐</h2>
                <ul class="menu2">
                    <li @click="router.push('/home')" :class="{'menu2-item active':route.name==='Home','menu2-item':route.name!=='Home'}">
                        <a><i class="iconfont icon-home"></i><span>首页</span></a>
                    </li>
                    <li @click="router.push('/discover')" :class="{'menu2-item active':route.name==='Discover','menu2-item':route.name!=='Discover'}">
                        <a><i class="iconfont icon-config-auto-discover--"></i><span>发现</span></a>
                    </li>
                    <li @click="router.push('/album')" :class="{'menu2-item active':route.name==='Album','menu2-item':route.name!=='Album'}">
                        <a><i class="iconfont icon-20gl-videoAlbum"></i><span>专辑</span></a>
                    </li>
                    <li @click="router.push('/singer')" :class="{'menu2-item active':route.name==='Singer','menu2-item':route.name!=='Singer'}">
                        <a><i class="iconfont icon-geshou"></i><span>歌手</span></a>
                    </li>
                </ul>
            </li>
            <li class="menu1-item">
                <h2>我的音乐</h2>
                <ul class="menu2">
                    <li @click="router.push('/download')" :class="{'menu2-item active':route.name==='Download','menu2-item':route.name!=='Download'}">
                        <a><i class="iconfont icon-xiazai"></i><span>下载</span></a>
                    </li>
                    <li @click="router.push('/localPlayList')" :class="{'menu2-item active':route.name==='MyMusicList','menu2-item':route.name!=='MyMusicList'}">
                        <a><i class="iconfont icon-20gl-videoAlbum"></i><span>我的歌单</span></a>
                    </li>
                    <li class="menu2-item" @click="showDialog=true">
                        <a><i class="iconfont icon-plus"></i><span>创建歌单</span></a>
                    </li>
                </ul>
            </li>
            <li class="menu1-func" ref="menu1Func" 
                v-hover="{
                    enterClass: 'show-scrollbar',
                    leaveClass: 'show-scrollbar',
                }">
                <ul>
                    <li>
                        <Button :configuration="ButtonConfig">
                            <template #text>
                                <i class="iconfont icon-theme"></i>
                                <span class="btn-title">主题</span>
                            </template>
                        </Button>
                    </li>
                </ul>
            </li>
        </ul>        
    </aside>
    <Dialog v-model="showDialog" id="create-playlist-dialog">
        <template #title>创建歌单</template>
        <template #content>
            <div class="create-form-warp">
                <form @submit.prevent="createPlaylist" class="create-form">
                    <div class="form-group-name">
                        <label for="create-playlist-name">歌单名称:</label>
                        <input type="text" id="create-playlist-name" placeholder="请输入歌单名称" required>
                    </div>
                    <div class="form-group-img">
                        <label for="create-playlist-img">封面图片:</label>
                        <input type="file" id="create-playlist-img" accept="image/*">
                    </div>
                    <div class="form-group-tags">
                        <label for="create-playlist-tags">标签:</label>
                        <select name="tags" id="create-playlist-tags" @change="handleSelectTag">
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
                    <Dialog v-model="showTagDialog" type="modal" id="create-playlist-tag-dialog">
                        <template #title>创建标签</template>
                        <template #content>
                            <form @submit.prevent="createTag" class="form-group-tagDiv">
                                <label for="create-playlist-tagDiv">自定义标签:</label>
                                <input type="text" id="create-playlist-tagDiv" placeholder="回车创建标签" required>
                            </form>
                        </template>
                    </Dialog>
                    <div class="form-group-desc">
                        <label for="create-playlist-desc">描述:</label>
                        <textarea id="create-playlist-desc" placeholder="请输入歌单描述"></textarea>
                    </div>
                    <div class="form-group-btn">
                        <button type="submit">创建</button>
                        <button type="button" @click="showDialog=false">取消</button>
                    </div>
                </form>
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { ref } from 'vue';
import Button from './utils/Button.vue';
import Dialog from './utils/Dialog.vue';
import { useRoute,useRouter } from 'vue-router';
import { useLocalStore } from '../store/localStore';
import { storeToRefs } from 'pinia';
const localStore = useLocalStore()
const { localTags } = storeToRefs(localStore)
const tagsSelected = ref([])
const menu1Func = ref(null)
const route = useRoute()
const router = useRouter()
const showDialog = ref(false)
const showTagDialog = ref(false)
const ButtonConfig = {
    name: 'aside-menu1-func',
    animated: true,
    width: 48,
    height: 48,
    size: 12,
    animated: true,
    borderRadius: getComputedStyle(document.documentElement).getPropertyValue('--border-radius-light'),    
}

// 创建新标签
const createTag = (e) => {
    const tag = e.target[0].value.trim()
    if (!tag) {
        return;
    }
    e.target[0].value = ''
    showTagDialog.value = false
    tagsSelected.value.push(tag)
    localTags.value.push(tag)
}

// 选择标签
const handleSelectTag = (e) => {
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

// 创建歌单
const createPlaylist = () => {
    const name = document.getElementById('create-playlist-name').value.trim()
    const description = document.getElementById('create-playlist-desc').value.trim()
    const tags = tagsSelected.value
    if (!name) {
        alert('歌单名称不能为空')
        return;
    }    
    
    localStore.createLocalPlaylist({ name, description, tags })    
    showDialog.value = false
    tagsSelected.value = []
    // 清空表单数据
    document.getElementById('create-playlist-name').value = ''
    document.getElementById('create-playlist-desc').value = ''
    // 使select标签选中状态恢复
    document.getElementById('create-playlist-tags').selectedIndex = 0
}
</script>

<style scoped>
aside {
    width: var(--sizebar-width);
    height: 100%;
    padding: var(--left-screen-padding);
    box-shadow: var(--aside-box-shadow);
}

.menu1 {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
.menu1 h2 {
    font-size: 16px;
    font-weight: bold;
    cursor: default;
    color: var(--aside-memu1-h2-color);
}
.menu1 span {
    cursor: default;
}

.menu1 .menu1-item {
    width: 100%;
    margin-bottom: 1rem;
}
.menu1 .menu1-item:nth-child(2) {
    margin-bottom: 0;
    border-bottom: var(--aside-menu1-item-border-bottom);
}

.menu2 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 12px;
}

.menu2 .menu2-item {
    display: flex;
    align-items: center;
    padding: 0 12px;
    height: 44px;
    margin-bottom: 8px;
    border-radius: var(--border-radius-light);
    transition: all 0.2s ease;
}
.menu2 .menu2-item:hover {
    background-color: var(--aside-menu2-item-hover-bg-color);
}
.menu2-item a {
    display: flex;
    justify-content: center;
    align-items: center;
}
.menu2-item span {
    margin-left: 4px;
    font-size: 12px;
    font-weight: bold;
    color: var(--aside-menu2-item-font-color);
    transition: all 0.2s ease;
}
.menu2-item.active span {
    margin-left: 4px;
    font-size: 12px;
    font-weight: bold;
    color: var(--aside-menu2-item-active-font-color);
    transition: all 0.2s ease;
}
.menu2-item:hover span {
    color: var(--aside-menu2-item-hover-font-color);
}
.menu2-item .iconfont {
    font-size: 20px;
    color: var(--aside-menu2-item-icon-color);
    margin-right: 8px;
    transition: all 0.2s ease;
}
.menu2-item.active .iconfont {
    color: var(--aside-menu2-item-active-icon-color);
}
.menu2-item:hover .iconfont {
    color: var(--aside-menu2-item-hover-icon-color);
}

.menu1-func {
    flex: 1;
    width: 100%;
    margin-top: 1rem;    
    overflow-y: scroll;
}
.menu1-func ul {
    padding: 12px;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
}
.menu1-func ul li .btn-title{
    color: var(--aside-menu1-func-btn-color);
    font-size: 10px;
}
.menu1-func ul li {
    margin: 0 var(--aside-menu1-func-gap) 12px; /* 网格布局 */
}
.menu1-func ul li:nth-child(2n-1) {
    margin-left: 0;
}
.menu1-func ul li:nth-last-child(-n+2) {
    margin-bottom: 0;
}



.create-form-warp {
    width: 100%;
    height: 100%;
    
   
}
.create-form {
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
.create-form label {
    font-size: 14px;
    font-weight: bold;
    color: #333;
}
.create-form input[type="text"],
.create-form textarea,
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
.create-form textarea {
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
#create-playlist-tags {
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
#create-playlist-tags:focus-visible {
    outline: none;
}
#create-playlist-tags option {
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
.menu1-func.show-scrollbar::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
.menu1-func.show-scrollbar::-webkit-scrollbar-track {
    background: var(--aside-menu1-func-scrollbar-track-bg-color); /* 滚动条轨道背景色 */
    border-radius: 2px;
}
.menu1-func.show-scrollbar::-webkit-scrollbar-thumb{
    background: var(--aside-menu1-func-scrollbar-thumb-bg-color); /* 滚动条滑块颜色 */
    border-radius: 2px;
}
.menu1-func.show-scrollbar::-webkit-scrollbar-thumb:hover{
    background: var(--aside-menu1-func-scrollbar-thumb-hover-bg-color); /* 滚动条滑块悬停颜色 */
}
</style>