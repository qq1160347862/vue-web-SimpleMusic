<template>
    <div ref="containerRef">
        <slot></slot>
        <Teleport to="body">
            <Transition 
                @beforeEnter="handleBeforeEnter" 
                @enter="handleEnter" 
                @afterEnter="handleAfterEnter">
                <section v-show="showMenu" class="context-menu" :style="{
                    left: `${x}px`,
                    top: `${y}px`,
                }">
                    <ul class="menu-list" v-resize="handleResize">
                        <li 
                            @click="handleClick(item)"
                            class="menu-item" 
                            v-for="(item, index) in menu" 
                            :key="item.label">
                            <i :class="`iconfont ${item.icon}`"></i>
                            {{ item.label }}
                        </li>
                    </ul>
                </section>
            </Transition>
        </Teleport>        
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'
import useViewport from '@/hooks/useViewport'
const props = defineProps({
    menu: {
        type: Array,
        default: () => []
    },
    watchClass: {
        type: String,
        default: ''
    }
})
const emit = defineEmits(['select'])
const containerRef = ref(null)
// 菜单的位置
const x = ref(0)
const y = ref(0)
// 视口大小
const { vh, vw } = useViewport()
// 菜单大小
const w = ref(0)
const h = ref(0)
const showMenu = ref(false)
const target = ref(null)
const handleContextMenu = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const isTarget = event?.target.classList.contains(props.watchClass)
    if (!isTarget) return   
    // console.log(event.clientX, event.clientY);
    // console.log(vw.value, vh.value);
    // console.log(w.value, h.value);
    
    // 判断菜单是否超出可视范围
    x.value = event.clientX
    y.value = event.clientY
    if (event.clientX + w.value > vw.value) {
        x.value = event.clientX - w.value
    }
    if (event.clientY + h.value > vh.value) {
        y.value = vh.value - h.value
    }  
    showMenu.value = true
    target.value = event.target
}
const handleClick = (item) => {
    showMenu.value = false
    emit('select', target.value,item)
}
const closeMenu = () => {
    showMenu.value = false
}
const handleBeforeEnter = (el) => {
    // el.style.height = 0
    el.style.opacity = 0
}
const handleEnter = (el) => {
    // el.style.height = 'auto'
    // const h = el.clientHeight
    // el.style.height = 0    
    requestAnimationFrame(() => {
        // el.style.height = h + 'px'        
        el.style.transition = 'height .5s,opacity .5s'
        el.style.opacity = 1
    })
}
const handleAfterEnter = (el) => {
    el.style.transition = 'none'
}
const handleResize = (e) => {
    if (!e.width && !e.height) return;
    w.value = e.width
    h.value = e.height    
}
onMounted(() => {
    const container = containerRef.value
    w.value = 100
    container.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('click', closeMenu, true)
    window.addEventListener('contextmenu', closeMenu, true)
})
onBeforeUnmount(() => {
    const container = containerRef.value
    container.removeEventListener('contextmenu', handleContextMenu)
    window.removeEventListener('click', closeMenu, true)
    window.removeEventListener('contextmenu', closeMenu, true)
})
</script>

<style scoped>
.context-menu {
    position: absolute;
    z-index: 99999;
    background: rgba(255, 255, 255, 0.685);
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    min-width: 100px;
    border-radius: 4px;    
    white-space: nowrap;
    overflow: hidden;
}
.menu-item {
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    padding: 0 4px 4px 4px;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
    font-size: 10px;
    color: #1d1d1f;
    font-weight: bold;
}
.menu-item:last-child {
    padding-bottom: 0;
}
.menu-item:hover {
    background-color: #3477d9;
    color: #fff;
}
.menu-item .iconfont {
    font-size: 16px;
}
</style>