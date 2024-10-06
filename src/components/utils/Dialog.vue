<template>
    <Teleport to="body">
        <dialog :id="id" class="dialog no-select" :style="customStyle">
            <div class="dialog-container">
                <div class="dialog-header">
                    <h2><slot name="title"></slot></h2>                
                </div>
                <div class="dialog-body">
                    <slot name="content"></slot>
                </div>            
                <div class="dialog-close">
                    <a @click.stop="closeDialog"><i class="iconfont icon-close"></i></a>        
                </div>
            </div>            
        </dialog> 
    </Teleport>    
</template>

<script setup>
import { watch, computed } from 'vue';

const { id, type, modelValue } = defineProps({
    id: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'normal'
    },
    modelValue: {
        type: Boolean,
        default: false
    }
});
const emit = defineEmits(['update:modelValue', 'handleClose']);
watch(() => modelValue, (newValue) => {
    if (newValue) {
        openDialog();
    } else {
        closeDialog();
    }
});

const openDialog = () => {    
    const dialogElement = document.getElementById(id);
    if(type === 'modal'){
        dialogElement.showModal();
        dialogElement.classList.add('modal');
        return
    }
    dialogElement.show();
};
const closeDialog = () => {    
    emit('handleClose');
    emit('update:modelValue', false);
    const dialogElement = document.getElementById(id);
    if(type ==='modal'){
        dialogElement.close();
        dialogElement.classList.remove('modal');
        return
    }
    dialogElement.close()
};
const customStyle = computed(() => {
    return {
        '--dialog-bg-color': `var(--${id}-bg-color)`,
        '--dialog-shadow': `var(--${id}-shadow)`,
        '--dialog-modal-mask-bg-color': `var(--${id}-modal-mask-bg-color)`,
        '--dialog-close-btn-hover-shadow': `var(--${id}-close-btn-hover-shadow)`,
        '--dialog-close-color': `var(--${id}-close-color)`,
        '--dialog-close-hover-color': `var(--${id}-close-hover-color)`,
        '--dialog-title-color': `var(--${id}-title-color)`,
        '--dialog-body-font-color': `var(--${id}-body-font-color)`
    }
});
</script>

<style scoped>
.dialog {
    position: fixed;
    margin: auto;
    inset: 0;
    width: fit-content;
    height: fit-content;
    display: block;
    border: none;    
    background-color: transparent;
    outline: none;
    visibility: hidden;
    opacity: 0;
    transform: translateY(-75%) scale(0.8);
    transition: .2s;
    pointer-events: none;
}
.dialog[open] {    
    visibility: visible;
    opacity: 1;
    transform: translateY(-75%) scale(1);
    pointer-events: auto;
}

.dialog.modal::backdrop {
    background: var(--dialog-modal-mask-bg-color);
    backdrop-filter: blur(10px);
}
.dialog-container {
    padding: 16px 64px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: default;    
    box-shadow: var(--dialog-shadow);
    border-radius: 8px;
    background-color: var(--dialog-bg-color);
    backdrop-filter: blur(10px);
}
.dialog-header h2 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--dialog-title-color);
}
.dialog-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--dialog-body-font-color);
}
.dialog-close {
    width: 16px;
    height: 16px;
    position: absolute;
    top: 8px;
    right: 8px;
    cursor: pointer;
    line-height: 16px;
    border-radius: 50%;
}
.dialog-close:hover {
    box-shadow: var(--dialog-close-btn-hover-shadow)
}
.dialog-close a .iconfont{
    font-size: 16px;
    font-weight: bold;
    color: var(--dialog-close-color);
    transition: all 0.2s ;
}
.dialog-close:hover a .iconfont{
    color: var(--dialog-close-hover-color);
}
</style>