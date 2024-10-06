<template>
    <a class="button-shell" ref="btnRef" :style="customStyle" :href="redirect" :target="isRedirected? '_blank' : ''">
        <span class="no-select">
            <slot name="text"></slot>
        </span>
        <div class="anime-bg"></div>
        <div class="flash-bar" v-if="animated"></div>
    </a>
</template>

<script setup>
import { computed, ref } from 'vue';
const {configuration, redirect} = defineProps({
    configuration: {
        type: Object,
        required: false,
        default: () => ({
            name: 'default',
            width: 64,
            height: 32,
            size: 16,
            weight: 600,
            borderRadius: '50%',
            animated: true,
        })
    },
    redirect: {
        type: String,
        required: false,
        default: 'javascript:void(0)'
    }
})

const {width,height,size,weight,animated,borderRadius,name} = configuration
const btnRef = ref(null)
const isRedirected = computed(() => {
    return redirect === 'javascript:void(0)'? false : true
})
const customStyle = computed(() => {
    return {
        '--btn-width': width && typeof width === 'number' ? `${width}px` : width+'',
        '--btn-height': height && typeof height === 'number'? `${height}px` : height+'',
        '--btn-font-size': size && typeof size === 'number'? `${size}px` : size+'',    
        '--btn-font-weight': weight+'',
        '--btn-border-radius': borderRadius+'',


        '--btn-color': `var(--${name}-btn-color)`,
        '--btn-bg-color': `var(--${name}-btn-bg-color)`,
        '--btn-flash-color': `var(--${name}-btn-flash-color)`,        
    }
})
</script>

<style scoped>
.button-shell {
    display: block;
    width: var(--btn-width);
    height: var(--btn-height);
    border-radius: var(--btn-border-radius);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: .3s;
}
.button-shell span {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    font-size: var(--btn-font-size);
    font-weight: var(--btn-font-weight);
    color: var(--btn-color);
    z-index: 3;
}
.button-shell .anime-bg{
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 1;
    background: var(--btn-bg-color); 
    width: calc(var(--btn-width) * 2);
    height: calc(var(--btn-width) * 2);
    animation: rotate-animation 5s linear infinite forwards;
}

.button-shell .flash-bar{
    position: absolute;
    top: -50%;
    left: 0;
    z-index: 2;
    width: .5rem;
    height: calc(var(--btn-height) * 2);
    background-color: var(--btn-flash-color);
    /* animation: flash-bar-animation .5s ease-in-out forwards alternate; */
    transform: translateX(-200%)  skewX(-15deg);
    transition: .3s;
}

.button-shell:hover {
    border-right: 1px rgb(158, 158, 158) solid;
    border-bottom: 1px rgba(158, 158, 158, 1) solid;
    transform: translate(-5%,-5%);
    box-shadow: 2px 2px 4px 1px rgba(0, 0, 0, .5);
}
.button-shell:hover .flash-bar{
    transform: translateX(calc(var(--btn-width) * 1.2))  skewX(-15deg)
}

@keyframes rotate-animation {
    from{
        transform: translate(-50%,-25%) rotate(0);
    }
    to{
        transform: translate(-50%,-25%) rotate(360deg);
    }
}

@keyframes flash-bar-animation {
    from{
        transform: translateX(-125%)  skewX(-15deg)
    }
    to{
        transform: translateX(var(--btn-width))  skewX(-15deg)
    }
}
</style>