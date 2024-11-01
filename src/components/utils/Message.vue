<template>
    <Teleport to="body">
        <div class="message-container">
            <TransitionGroup tag="div" class="message-animation" name="message-animation">
                <div class="message" :style="{
                    '--msg-color': 
                    message.type === 'warning'? '#e6a23c' : 
                    message.type === 'error'? '#f56c6c' : 
                    message.type ==='success'? '#59d11d' : '#909399'
                }"
                    v-for="(message, index) in messages" 
                    :key="index">
                    <i class="iconfont icon-info" v-show="message.type === 'info'"></i>
                    <i class="iconfont icon-error-fill" v-show="message.type === 'error'"></i>
                    <i class="iconfont icon-success-fill" v-show="message.type ==='success'"></i>
                    <i class="iconfont icon-warning-fill" v-show="message.type === 'warning'"></i>
                    <span>{{ message.text }}</span>
                </div>
            </TransitionGroup tag="div">
        </div>                
    </Teleport>
</template>

<script setup>
import { ref, reactive } from 'vue'

const messages = reactive([])
const addMessage = (msg) => {
    // {text: msg, duration: 2000, type: 'info'} = msg
    // type: 'info' | 'error' |'success' | 'warning'
    messages.push(msg)
    setTimeout(() => {
        messages.shift()
    }, msg.duration)    
}

defineExpose({
    addMessage
})
</script>

<style scoped> 
.message-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999999;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
}
.message-animation {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.message {
    --msg-color:#fff;
    margin-top: 20px;
    height: 28px;
    width: fit-content;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 20px 36px;
    overflow: hidden;
    transform: translateX(0);
    background-color: #353738;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    color: var(--msg-color);
    letter-spacing: 1px;
    font-size: 12px;
}


.message-animation-enter-active,
.message-animation-leave-active {
  transition: all 0.3s ease;
}
.message-animation-enter-from,
.message-animation-leave-to {
  opacity: 0;
  transform: translateX(0);
}

</style>