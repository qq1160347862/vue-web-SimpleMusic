<template>
    <div class="slider-warp" ref="slider" :style="customStyle">
        <input type="range" class="slider-bar"
            :value="progress" @input="handleProgress" @change="handleChange"
            :min="min" :max="max" :step="step" />
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

const {name,min, max, step, progress, barHeight, barRadius, knobWidth, knobHeight, knobRadius, hover, Aysnc} = defineProps({
    name: {
        type: String,
        default: ''
    },
    min: {
        type: Number,
        default: 0
    },
    max: {
        type: Number,
        default: 100
    },
    step: {
        type: Number,
        default: 1
    },
    progress: {
        type: Number,
    },
    barHeight: {
        type: Number,
        default: 8
    },
    barRadius: {
        type: Number,
        default: 4
    },
    hover: {
        type: Boolean,
        default: false
    },
    knobWidth: {
        type: Number,
        default: 12
    },
    knobHeight: {
        type: Number,
        default: 12
    },
    knobRadius: {
        type: String,
        default: '50%'
    },
    Aysnc: {
        type: Boolean,
        default: false
    }
})
const slider = ref(null)
const emit = defineEmits(['update:progress','handleProgress'])
const isDragging = ref(false)
const handleProgress = (e) => {
    emit('update:progress', +e.target.value)
    if(Aysnc){
        emit('handleProgress', true)
        return
    }
    emit('handleProgress')
}
const handleChange = (e) => {
    if(Aysnc){
        emit('handleProgress', false)
        return
    }
}
const customStyle = computed(() => {
    return {
        '--progress-bg-color': `var(--${name}-progress-bg-color)`,
        '--progressed-bg-color': `var(--${name}-progressed-bg-color)`,
        '--knob-bg-color': `var(--${name}-knob-bg-color)`,
        '--slider-progress': progress / max * 100 + '%',
        '--bar-height': `${barHeight}px`,
        '--bar-radius': `${barRadius}px`,
        '--knob-width': `${knobWidth}px`,
        '--knob-height': `${knobHeight}px`,
        '--knob-radius': `${knobRadius}`,
    }
})
watch(() => progress, (newProgress) => {
    const radio = newProgress / max * 100;
    slider.value.style.setProperty('--slider-progress', radio + '%');
});
onMounted(() => {
    if(hover){
        slider.value.children[0].classList.add('hover')
    }    
})
</script>

<style scoped>
.slider-warp {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.slider-bar {
    -webkit-appearance: none; /* 去掉默认外观 */
    appearance: none;
    flex-grow: 1;
    cursor: pointer;
}
/* 轨道样式 */
.slider-bar {
    height: var(--bar-height);
    width: 0;
    background: var(--progress-bg-color);
    border-radius: var(--bar-radius);
}
/* 走过的进度条颜色（WebKit浏览器） */
.slider-bar::-webkit-slider-runnable-track {
    height: var(--bar-height);
    width: 0;
    border-radius: var(--bar-radius);
    background: linear-gradient(to right, var(--progressed-bg-color) 0%, var(--progressed-bg-color) var(--slider-progress), var(--progress-bg-color) var(--slider-progress), var(--progress-bg-color) 100%)
}

/* 走过的进度条颜色（Firefox） */
.slider-bar::-moz-range-track {
    height: var(--bar-height);
    width: 0;
    border-radius: var(--bar-radius);
    background: linear-gradient(to right, var(--progressed-bg-color) 0%, var(--progressed-bg-color) var(--slider-progress), var(--progress-bg-color) var(--slider-progress), var(--progress-bg-color) 100%)
}
/* 滑块按钮样式 */
.slider-bar::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: var(--knob-width);
    height: var(--knob-height);
    background: var(--knob-bg-color);
    border: none;
    border-radius: var(--knob-radius);
    transform: translateY(calc(-50% + var(--bar-height) / 2));
}
.slider-bar::-moz-range-thumb {
    width: var(--knob-width);
    height: var(--knob-height);
    background: var(--knob-bg-color);
    border: none;
    border-radius: var(--knob-radius);
    transform: translateY(calc(-50% + var(--bar-height) / 2));
}

/* hover样式 */
/* 滑块按钮样式 */
.slider-bar.hover::-webkit-slider-thumb {
    opacity: 0; 
    transition: all 0.1s ease-in-out;
}
.slider-bar.hover::-moz-range-thumb {
    transition: all 0.1s ease-in-out;
    opacity: 0; 
}
.slider-warp:hover .slider-bar.hover::-webkit-slider-thumb  {
    opacity: 1;
}
.slider-warp:hover .slider-bar.hover::-moz-range-thumb  {
    opacity: 1;
}
</style>