<template>
    <form @submit.prevent="formSubmit(null)" class="search">
        <div class="search-icon">
            <i class="iconfont icon-sousuo"></i>
        </div>
        <input type="text" :placeholder="placeholder" 
        
        :value="inputValue" @input="handleInput" :clearable="clearable">
        <span 
        :class="{'clear-icon':isShowClearIcon,'clear-icon-hidden':!isShowClearIcon}">
            <i class="iconfont icon-close" @click="handleClear"></i>
        </span>
        <div class="suggest no-select" tabindex="-1" v-show="!isShowSuggest">
            <h2 class="history-title">
                搜索历史
                <span><i @click="clearHistoryList" class="iconfont icon-shanchu"></i></span>
            </h2>
            <div class="history-warp">
                <TransitionGroup name="history-list" tag="ul" class="history-list">                    
                    <li v-for="(keyWord, index) in historyList" @click="formSubmit(keyWord)" :key="index">
                        {{ keyWord }}
                    </li>                    
                </TransitionGroup>
            </div>
            <h2>热搜榜</h2>
            <div class="suggest-warp" v-hover="{
                enterClass: 'show-scrollbar',
                leaveClass: 'show-scrollbar',
            }">
                <ul class="hot-list">
                    <li v-for="(item, index) in hotList" @click="formSubmit(item.first)" :key="index">
                        <span>{{ index + 1 }}</span>
                        {{ item.first }}
                    </li>
                </ul>
            </div>            
        </div>
        <div class="suggest no-select" tabindex="-1" v-show="isShowSuggest">
            <h2>猜你想搜</h2>
            <ul class="suggest-list">                
                <li v-for="(item, index) in suggestList" @click="formSubmit(item.keyword)" :key="index">
                    {{ item.keyword }}
                </li>
            </ul>
        </div>
    </form>
    <div class="focusEle" tabindex="0"></div>
</template>

<script setup>
import { computed, ref, toRefs, watch } from 'vue';
import useDebounce from '../hooks/useDebounce'

const emit = defineEmits(['update:inputValue','update:historyList', 'inputFunction', 'submitFunction'])
const props = defineProps({
    inputValue: {
        type: String,
        default: ''
    },
    clearable: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: 'say something'
    },
    suggestList: {
        type: Array,
        default: () => []
    },
    hotList: {
        type: Array,
        default: () => []
    },
    historyList: {
        type: Array,
        default: () => []
    }
})
const {inputValue, clearable, placeholder} = toRefs(props)
const isShowClearIcon = computed(() => {
    return (inputValue.value.length) > 0 && clearable.value
})
const isShowSuggest = computed(() => {
    return inputValue.value.trim().length > 0
})
const handleInput = useDebounce((event)=>{
    emit('update:inputValue', event.target.value)
}, 200)
watch(inputValue, (newValue) => {
    if(newValue.trim().length > 0) {
        // 有输入内容才触发 inputFunction 事件
        emit('inputFunction', newValue)
    }  
})
const handleClear = () => {
    emit('update:inputValue', '')
    const inputDom = document.querySelector('.search input')
    inputDom.focus() // 聚焦到输入框
}
const formSubmit = (keyWord) => {   
    if(keyWord){
        emit('update:inputValue', keyWord)
    }

    if(inputValue.value.trim() === '' && !keyWord){
        // 输入内容为空时，使用 placeholder 内容替换
        emit('update:inputValue', props.placeholder)        
    }
    emit('submitFunction','search')  
    const inputDom = document.querySelector('.search input')
    const focusEle = document.querySelector('.focusEle')
    inputDom.blur() // 搜索时输入框失焦  
    focusEle.focus() // 聚焦到 focusEle 元素
}
const clearHistoryList = () => {
    emit('update:historyList', [])
}
</script>

<style scoped>
.search {
    position: relative;
    /* width: 240px; */
    height: 36px;    
    background-color: var(--nav-search-bg-color);
    border-radius: var(--border-radius-light);
    border: none;
}
.search .search-icon{
    position: absolute;
    top: 50%;
    left: 8px;
    transform: translateY(-50%);
}
.search input { 
    width: 160px;
    height: 100%;
    margin: 0 32px;
    border: none;
    outline: none;
    font-size: 0.8em;
    color: var(--nav-search-color);
    text-indent: 0;
    background: transparent;
}
.search input::placeholder {
    color: var(--nav-search-placeholder-color);
    font-size: 0.8em;
}
.search .clear-icon {
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
}
.search .clear-icon-hidden {
    display: none;
}
.search .clear-icon .iconfont:hover {
    cursor: pointer;
    color: red;
}
.suggest {
    position: absolute;
    top: 100%;
    left: 50%;
    width: 132%;
    height: 480px;
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    background-color: var(--nav-search-bg-color);
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    opacity: 0;
    transition: all 0.3s ease-in-out;
    transform: translate(-50%, -5px);
    z-index: 999;
    pointer-events: none;
}
.search:focus-within .suggest {
    opacity: 1;
    transform: translate(-50%, 0);
    pointer-events: auto;
}
.suggest-warp {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
}
.suggest h2 {
    margin: 16px 8px;
    font-size: 14px;
    color: #2b2b2b;
}
.history-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.history-title .iconfont {
    font-size: 16px;
    color: #696969;
    cursor: pointer;
}
.history-warp {
    width: 100%;
}
.history-list-enter-active,
.history-list-leave-active {
    transition: all 0.3s ease-in-out;
}
.history-list-enter,
.history-list-leave-to {
    opacity: 0;
    transform: scale(0.8);
}
.history-list {
    padding: 0 8px;
    display: flex;
    flex-wrap: wrap;
}
.history-list li {
    margin: 8px 8px 0 0;
    height: 24px;
    line-height: 24px;
    text-align: center;
    padding: 0 16px;
    font-size: 12px;
    color: #575757;
    border-radius: 24px;
    background-color: #e7e7e7;
    transition: all 0.2s ease-in-out;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
.history-list li:hover {
    background-color: #d8d8d8;
}
.hot-list,
.suggest-list {
    display: flex;
    flex-direction: column;
    /* padding: 16px; */
}
.hot-list span {
    margin-right: 8px;
    font-size: 14px;
    color: #696969;
}
.hot-list li:nth-child(1) span,
.hot-list li:nth-child(2) span,
.hot-list li:nth-child(3) span {
    font-weight: bold;
    color: red;
}
.hot-list li,
.suggest-list li {
    width: 100%;
    height: 48px;
    display: flex;
    align-items: center;
    padding: 0 0 0 8px;
    font-size: 12px;
    color: #2b2b2b;
    transition: all 0.2s ease-in-out;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
.hot-list li:hover,
.suggest-list li:hover {
    background-color: #f5f5f5;
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
.suggest-warp.show-scrollbar::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
.suggest-warp.show-scrollbar::-webkit-scrollbar-track {
    background: var(--main-scrollbal-track-bg-color); /* 滚动条轨道背景色 */
    border-radius: 2px;
}
.suggest-warp.show-scrollbar::-webkit-scrollbar-thumb{
    background: var(--main-scrollbal-thumb-bg-color); /* 滚动条滑块颜色 */
    border-radius: 2px;
}
.suggest-warp.show-scrollbar::-webkit-scrollbar-thumb:hover{
    background: var(--main-scrollbal-thumb-hover-bg-color); /* 滚动条滑块悬停颜色 */
}
</style>