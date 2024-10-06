<template>
    <div class="localPlayList-layout">
        <div class="localPlayList-container" v-hover="{
            enterClass: 'show-scrollbar',
            leaveClass: 'show-scrollbar',}">
            <ul class="playList-container">
                <li class="playList-card" 
                    v-for="(item, index) in userPlayList" 
                    :key="index">
                    
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore} from '../store/userStore'
import { storeToRefs } from 'pinia';
const userStore = useUserStore();
const { userPlayList } = storeToRefs(userStore);

onMounted(async () => {
    if (userPlayList.value.length !== 0) {
        return;
    }
    await userStore.getUserPlayListData();
    console.log(userPlayList.value);
})
</script>

<style scoped>
.localPlayList-layout {
    height: 100%;
    width: 100%;
    padding-left: var(--main-left-padding);
}
.localPlayList-container {
    height: 100%;
    width: 100%;
    overflow-y: scroll;
    margin-top: 20px;
}
.playList-container {
    /* columns: 5;
    column-gap: 10px; */
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-auto-rows: dense;
    gap: 20px;
}
.playList-card {
    /* break-inside: avoid; */
    /* margin-bottom: 10px; */
    width: 100%;
    height: 100px;    
    overflow: hidden;
    box-shadow: 0px 8px 20px #00000022;
    /* background-image: linear-gradient(to bottom right,
            #91defe,
            #99c0f9,
            #bdb6ec,
            #d7b3e3,
            #efb3d5,
            #f9bccc); */
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    
    animation: slide-fade-in both;
    /* 使用浏览器的视图时间线，允许动画根据视口的变化而变化 */
    /* 元素运动到视口的75%时动画结束 */
    animation-timeline: view(75% 0);
    /* animation-range: 0vh 10vh; */
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
.localPlayList-container.show-scrollbar::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
.localPlayList-container.show-scrollbar::-webkit-scrollbar-track {
    background: var(--main-scrollbal-track-bg-color); /* 滚动条轨道背景色 */
    border-radius: 2px;
}
.localPlayList-container.show-scrollbar::-webkit-scrollbar-thumb{
    background: var(--main-scrollbal-thumb-bg-color); /* 滚动条滑块颜色 */
    border-radius: 2px;
}
.localPlayList-container.show-scrollbar::-webkit-scrollbar-thumb:hover{
    background: var(--main-scrollbal-thumb-hover-bg-color); /* 滚动条滑块悬停颜色 */
}
</style>