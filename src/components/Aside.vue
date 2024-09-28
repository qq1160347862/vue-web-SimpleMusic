<template>  
    <aside>
        <ul class="menu1">
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
                    <li @click="router.push('/myMusicList')" :class="{'menu2-item active':route.name==='MyMusicList','menu2-item':route.name!=='MyMusicList'}">
                        <a><i class="iconfont icon-20gl-videoAlbum"></i><span>我的歌单</span></a>
                    </li>
                    <li class="menu2-item">
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
</template>

<script setup>
import { ref } from 'vue';
import Button from './utils/Button.vue';
import { useRoute,useRouter } from 'vue-router';
const menu1Func = ref(null)
const route = useRoute()
const router = useRouter()
const ButtonConfig = {
    name: 'aside-menu1-func',
    animated: true,
    width: 48,
    height: 48,
    size: 12,
    animated: true,
    borderRadius: getComputedStyle(document.documentElement).getPropertyValue('--border-radius-light'),    
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
    transition: all 0.3s ease;
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
    transition: all 0.3s ease;
}
.menu2-item.active span {
    margin-left: 4px;
    font-size: 12px;
    font-weight: bold;
    color: var(--aside-menu2-item-active-font-color);
    transition: all 0.3s ease;
}
.menu2-item:hover span {
    color: var(--aside-menu2-item-hover-font-color);
}
.menu2-item .iconfont {
    font-size: 20px;
    color: var(--aside-menu2-item-icon-color);
    margin-right: 8px;
    transition: all 0.3s ease;
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