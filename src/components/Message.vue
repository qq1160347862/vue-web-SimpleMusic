<template>
    <Teleport to="body">
        <div class="message-container">
            <TransitionGroup tag="div" name="message-animation">
                <div class="message" 
                    v-for="(message, index) in messages" 
                    :key="index">
                    {{ message.text }}
                </div>
            </TransitionGroup tag="div">
        </div>                
    </Teleport>
</template>

<script setup>
import { ref, reactive } from 'vue'

const messages = reactive([])
const addMessage = (msg) => {
    // {text: msg, duration: 2000} = msg
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
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
}
.message {
    margin-top: 20px;
    height: 28px;
    line-height: 28px;
    transform: translateX(0);
    padding: 0 20px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 14px;
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