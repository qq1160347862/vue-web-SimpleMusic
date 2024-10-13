<template>
    <div class="swich-btn no-select" :style="customStyle">
        <div class="switch-btn-warp" :class="name">
            <input type="radio" name="switch-btn"
                v-for="option in options" 
                :key="option.id"
                :id="option.id"
                :value="option.value"
                :checked="option.checked"
                :disabled="option.disabled"
                @click="handleClick">
            <label v-for="option in options"
                :key="option.id"
                :for="option.id">
                <span>{{ option.label }}</span>
            </label>
            <span class="slider"></span>
        </div>
    </div>    
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
const props = defineProps({
    options: {
        type: Array,
        default: () => []
    },
    name: {
        type: String,
        default: ''
    },
    width: {
        type: String,
        default: '172px'
    },
    height: {
        type: String,
        default: '32px'
    },
    backgroundColor: {
        type: String,
    },
    color: {
        type: String,
    },
    hoverColor: {
        type: String,
    },
    activeColor: {
        type: String,
    },
    activeBackgroundColor: {
        type: String,
    },
    disabledColor: {
        type: String,
    },
});
const customStyle = computed(() => {
    return {
        '--width': props.width,
        '--height': props.height,
        '--option-count': props.options.length,

        '--bg-color': 
            props.backgroundColor? 
            props.backgroundColor : 
            `var(--${props.name}-switchBtn-bg-color)`,
        '--active-background-color': 
            props.activeBackgroundColor? 
            props.activeBackgroundColor : 
            `var(--${props.name}-switchBtn-active-bg-color)`,
        '--color': 
            props.color?
            props.color :
            `var(--${props.name}-switchBtn-color)`,
        '--hover-color': 
            props.hoverColor?
            props.hoverColor :
            `var(--${props.name}-switchBtn-hover-color)`,
        '--active-color': 
            props.activeColor?
            props.activeColor :
            `var(--${props.name}-switchBtn-active-color)`,      
        '--disabled-color': 
            props.disabledColor?
            props.disabledColor :
            `var(--${props.name}-switchBtn-disabled-color)`,
    }
});
const emit = defineEmits(['handleClick','update:options']);
const handleClick = (e) => {
    emit('handleClick', e.target.value);
}
const inputDoms = shallowRef(null)
const labelDoms = shallowRef(null)
const sliderDom = shallowRef(null)
// 按钮disabled和checked的样式切换
const handleOptionEvent = (labelDoms, inputDoms, sliderDom, i) => {
    if(props.options[i].disabled) {
        const span = labelDoms[i].querySelector('span');
        span.style.color = 'var(--disabled-color)';
        span.style.textDecoration = 'line-through';
        inputDoms[i].style.cursor = 'not-allowed';
        inputDoms[i].style.pointerEvents = 'none';
    }else {
        const span = labelDoms[i].querySelector('span');
        span.style.color = 'var(--color)';
        span.style.textDecoration = 'none';
        inputDoms[i].style.cursor = 'pointer';
        inputDoms[i].style.pointerEvents = 'auto';
    }

    if(props.options[i].checked){
        sliderDom.style.transform = `translate(${i * 100}%, -50%)`;
        labelDoms[i].style.color = `var(--active-color)`;
    }
}
watch(() => props.options, () => {   
    for(let i = 0; i < props.options.length; i++) {
        handleOptionEvent(labelDoms.value, inputDoms.value, sliderDom.value, i);
    }
},{
    deep: true,
});
onMounted(() => {
    inputDoms.value = document.querySelectorAll(`.switch-btn-warp.${props.name} input[type="radio"]`);
    labelDoms.value = document.querySelectorAll(`.switch-btn-warp.${props.name} label`);
    sliderDom.value = document.querySelector(`.switch-btn-warp.${props.name} .slider`);
    for(let i = 0; i < props.options.length; i++) {
        // 监听input type="radio"的change事件，更新props.options
        // 并触发update:options事件
        // 同时更新样式
        inputDoms.value[i].addEventListener('change',()=> {
            if(inputDoms.value[i].checked){
                emit('update:options', props.options.map((option, index) => {
                    if(i === index){
                        option.checked = true;
                    }else {
                        option.checked = false;
                    }
                    return option;
                }));
                sliderDom.value.style.transform = `translate(${i * 100}%, -50%)`;
                labelDoms.value[i].style.color = `var(--active-color)`;
            }
        });

        handleOptionEvent(labelDoms.value, inputDoms.value, sliderDom.value, i);
    }
})
</script>

<style scoped> 
.swich-btn {
    width: var(--width);
    height: var(--height);
    padding: 4px;
    border-radius: calc(var(--height) / 2);
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--bg-color);
}
.switch-btn-warp {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background-color: var(--bg-color);
    display: flex;
    align-items: center;
    box-shadow: inset 0 8px 60px rgba(0, 0, 0, .1),
                inset 0 8px 8px rgba(0, 0, 0, .1),
                inset 0 4px -4px rgba(0, 0, 0, .1);
}
.switch-btn-warp input[type="radio"] {
    display: none;
}
.switch-btn-warp label {
    position: relative;
    z-index: 2;
    display: flex;
    width: calc(100% / var(--option-count));
    height: 100%;
    border-radius: inherit;
    padding: 8px 0;
    cursor: pointer;
    transition: all 0.3s ease;
}
.switch-btn-warp label:hover span {
    /* background-color: #444; */
    color: var(--hover-color);
}
.switch-btn-warp label span {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    font-weight: bold;
    color: var(--color);
    transition: all 0.3s ease;
}
.switch-btn-warp .slider {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 0;
    width: calc(100% / var(--option-count));
    height: 100%;
    transform: translate(0, -50%);
    border-radius: inherit;
    background-color: var(--active-background-color);
    transition: 0.3s ease,transform 0.25s ease-out;
}
</style>