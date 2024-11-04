<template>
    <div ref="containerRef">
        <slot></slot>
        <Teleport to="body">            
            <section class="context-menu" ref="menuRef" v-resize="handleResize" :style="{
                left: `${x}px`,
                top: `${y}px`,
            }">        
                <p class="title no-select">{{ title }}</p>            
                <ul class="menu-list">                        
                    <li 
                        @click="handleClick(item)"
                        class="menu-item" 
                        v-for="(item, index) in menu" 
                        :key="item.label">
                        <div class="item-bg"></div>
                        <div class="item-warp">
                            <i :class="`iconfont ${item.icon}`"></i>
                            <span>{{ item.label }}</span>
                        </div>                            
                    </li>
                </ul>
            </section>
        </Teleport>        
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import useViewport from '@/hooks/useViewport'
const props = defineProps({
    menu: {
        type: Array,
        default: () => []
    },
    watchClass: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: 'menu'
    }
})
const emit = defineEmits(['select'])
const containerRef = ref(null)
const menuRef = ref(null)
// 菜单的位置
const x = ref(0)
const y = ref(0)
// 视口大小
const { vh, vw } = useViewport()
// 菜单大小
const w = ref(0)
const h = ref(0)
const target = ref(null)
const handleContextMenu = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const isTarget = event?.target.classList.contains(props.watchClass)
    if (!isTarget) return        

    // 显示菜单    
    menuRef.value.style.transition = 'none'
    menuRef.value.style.height = 'auto' 
    // 获取菜单大小(无法一次赋值)      
    w.value = menuRef.value.clientWidth
    h.value = menuRef.value.clientHeight    
    menuRef.value.style.height = 0    
    requestAnimationFrame(() => {
        menuRef.value.style.height = h.value + 'px'        
        menuRef.value.style.transition = 'height .3s,opacity .3s'
        menuRef.value.style.opacity = 1
    })

    // 判断菜单是否超出可视范围
    x.value = event.clientX
    y.value = event.clientY
    if (event.clientX + w.value > vw.value) {
        x.value = event.clientX - w.value
    }

    if (event.clientY + h.value > vh.value) {
        y.value = vh.value - h.value
    } 
    target.value = event.target
}
const handleClick = (item) => {
    emit('select', target.value,item)
}
const closeMenu = () => {
    menuRef.value.style.opacity = 0
    menuRef.value.style.height = 0
    menuRef.value.style.transition = 'none'
}
const handleResize = (e) => {
    if (!e.width && !e.height) return;
    w.value = e.width
    h.value = e.height            
}
onMounted(() => {
    const container = containerRef.value
    menuRef.value.style.opacity = 0
    menuRef.value.style.height = 0
    menuRef.value.style.transition = 'none'
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
    background: transparent;
    backdrop-filter: blur(8px);
    box-shadow: 0 0 8px 2px rgba(0, 0, 0, 0.3);
    min-width: 160px;
    border-radius: 4px;    
    white-space: nowrap;
    overflow: hidden;
}
.title {
    font-size: 14px;
    font-weight: bold;
    color: #1d1d1f;
    padding: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.5);
    letter-spacing: 1px;
}
.menu-item {
    width: 100%;
    height: 36px;
    position: relative;    
    padding: 8px;
    /* border-radius: 4px; */
    cursor: pointer;
    user-select: none;    
    transition: all 0.3s linear;
    
}
.menu-item .item-bg {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background-color: #222222;
    opacity: 0.8;
}
.menu-item .item-warp {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    font-size: 12px;
    color: #1d1d1f;
    font-weight: bold;
    transition: all 0.3s linear;
}
.menu-item span {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.3s linear;
}
.menu-item .iconfont {
    font-size: 16px;
    transition: all 0.3s linear;
}
.menu-item::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    transition: all 0.3s linear;
    
}
.menu-item:hover .item-bg {
    animation: bg-loading forwards 0.08s ease;
}
.menu-item:hover .item-warp {
    transform: translateX(8px);
}
.menu-item:hover span,
.menu-item:hover .iconfont {
    color: #fff;
}
.menu-item:hover::before {
    border-top: 6px solid transparent; 
    border-bottom: 6px solid transparent; 
    border-left: 6px solid #fff; 
}

@keyframes bg-loading {
    from {
        width: 0;
    }
    to {
        width: 100%;
    }
}
</style>