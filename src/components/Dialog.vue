<template>
    <dialog :id="id" class="dialog" :style="customStyle">
        <div class="dialog-container">
            <div class="dialog-header">
                <h2><slot name="title"></slot></h2>                
            </div>
            <div class="dialog-body">
                <slot name="content"></slot>
            </div>            
        </div>
        <div class="dialog-close">
            <a @click.stop="closeDialog"><i class="iconfont icon-close"></i></a>        
        </div>
    </dialog> 
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
    margin: 0 auto;
    padding: 16px;
    background-color: var(--dialog-bg-color);
    backdrop-filter: blur(10px);
    box-shadow: var(--dialog-shadow);
    border: none;
    border-radius: 8px;
    transition: all 0.3s ease-in-out;
    opacity: 1;
    transform: translateY(24vh);
}
.dialog.modal {
    transform: translateY(24vh);
    transition: none;
}
.dialog:not([open]){
    display: block;
    opacity: 0;
    transform: translateY(calc(24vh - 24px));
    visibility: hidden;    
    pointer-events: none;
}
.dialog::backdrop {
    background-color: var(--dialog-modal-mask-bg-color);
    backdrop-filter: blur(10px);
}
.dialog-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: default;

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
    transition: all 0.3s ease-in-out;
    
}
.dialog-close:hover {
    box-shadow: var(--dialog-close-btn-hover-shadow)
}
.dialog-close a .iconfont{
    font-size: 16px;
    font-weight: bold;
    color: var(--dialog-close-color);
    transition: all 0.3s ease-in-out;
}
.dialog-close:hover a .iconfont{
    color: var(--dialog-close-hover-color);
}
</style>