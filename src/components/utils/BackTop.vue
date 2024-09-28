<template>  
    <a class="toTop" @click.prevent="scrollTop">
        <i class="iconfont icon-top"></i>
    </a>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
    query: {
        type: String,
        default: ''
    },
})
const dom = computed(() => document.querySelector(props.query) || document.documentElement)
const scrollTop = () => {
    dom.value.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}
</script>

<style scoped>
.toTop {
    position: absolute;
    bottom: 32px;
    right: 16px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--backTop-btn-bg-color);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 999;
    transition: all 0.3s ease;
}
.toTop .iconfont {
    transition: all 0.3s ease;
    color: var(--backTop-btn-color);
}
.toTop:hover {
    background-color: var(--backTop-btn-hover-bg-color);
}
.toTop:hover .iconfont {
    color: var(--backTop-btn-hover-color);
}
</style>