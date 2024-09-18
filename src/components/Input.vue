<template>
    <form @submit.prevent="formSubmit" class="search">
        <div class="search-icon">
            <i class="iconfont icon-sousuo"></i>
        </div>
        <input type="text" :placeholder="placeholder" 
        :value="inputValue" @input="handleInput" :clearable="clearable">
        <span 
        :class="{'clear-icon':isShowClearIcon,'clear-icon-hidden':!isShowClearIcon}">
            <i class="iconfont icon-close" @click="handleClear"></i>
        </span>
    </form>
</template>

<script setup>
import { computed, toRefs } from 'vue';
import useDebounce from '../hooks/useDebounce'

const emit = defineEmits(['update:inputValue', 'inputFunction'])
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
    }
})
const {inputValue, clearable, placeholder} = toRefs(props)
const isShowClearIcon = computed(() => {
    return (inputValue.value.length) > 0 && clearable.value
})
const handleInput = useDebounce((event)=>{
    emit('update:inputValue', event.target.value)
}, 200)
const handleClear = () => {
    emit('update:inputValue', '')
}
const formSubmit = () => {
    if(inputValue.value.trim() === ''){
        console.log('请输入搜索内容')
        return
    }
    emit('inputFunction','search')
}
</script>

<style scoped>
.search {
    position: relative;
    /* width: 240px; */
    height: 36px;
    margin-left: 48px;
    margin-right: auto;
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
</style>