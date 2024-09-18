<template>
    <div class="container" :style="customStyle">
        <div class="text-body" ref="contentRef" v-html="content"></div>
        <div class="cursor" v-show="showCursor"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, onUpdated, onUnmounted, watch, computed } from 'vue';
const emit = defineEmits(['update:showCursor'])
const props = defineProps({
    text: {
        type: String,
        required: true
    },
    showCursor: {
        type: Boolean,
        default: false
    },
    size: {
        type: Number,
        default: 1
    },
    cursorColor: {
        type: String,
        default: 'black'
    },
    cursorWidth: {
        type: Number,
        default: 2
    },
    speed: {
        type: Number,
        default: 1000
    },
    reverse: {
        type: Boolean,
        default: false
    }
})
const customStyle = computed(() => {
    return {
        '--cursor-width': `${props.cursorWidth}px`,
        '--cursor-color': props.cursorColor,
        '--size': `${props.size}px`
    }
})
// 光标位置
const pos =  reactive({x: 0, y: 0})
const contentRef = ref(null)
const content = ref('')
const isReverse = ref(false)
let index = 0
let timer = null
 
// 递归查找最后一个非空文本节点
function getLastTextNode(dom) {
    const children = dom.childNodes
    // 倒序遍历
    for (let i = children.length - 1; i >= 0; i--) {
        const node = children[i]
        // 找到最后一个非空文本节点
        if (node.nodeType === Node.TEXT_NODE && /\S/.test(node.nodeValue)) {
            // 替换掉末尾的空白字符
            node.nodeValue = node.nodeValue.replace(/\s+$/, '')
            return node
        }
        else if (node.nodeType === Node.ELEMENT_NODE){
            // 递归查找
            const lastTextNode = getLastTextNode(node)
            if (lastTextNode) {
                return lastTextNode
            }
        }
    }
    return null
}
 
// 更新光标位置
function updateCursor() {
    const contentDom = contentRef.value            // 获取内容元素
    const lastText = getLastTextNode(contentDom)     // 获取最后一个非空文本节点
    const textNode = document.createTextNode('\u200b')  // 光标元素
    // 光标元素插入到最后一个非空文本节点后面
    if(lastText){
        lastText.parentElement.appendChild(textNode)
    }
    else{
        // 如果没有非空文本节点，则插入到内容元素后面
        contentDom.appendChild(textNode)
    }
    const domRect = contentDom.getBoundingClientRect() 
    // 设置光标元素的rect
    const range = document.createRange()
    range.setStart(textNode, 0)
    range.setEnd(textNode, 0)
    const rect = range.getBoundingClientRect()
    pos.x = rect.left - domRect.left
    pos.y = rect.top - domRect.top
    // 删除光标元素，让cursor样式显示在最后一个非空文本节点后面
    textNode.remove()     
}
 
watch(isReverse, (newVal) => {
    if (props.reverse) {
        if (newVal) {
            timer = setInterval(() => {
                if (index <= 0) {
                    clearInterval(timer)
                    isReverse.value = false
                    return
                }
                content.value = content.value.slice(0, --index)                
            }, props.speed)
        }else {
            timer = setInterval(() => {
                if (index >= props.text.length) {
                    clearInterval(timer)
                    isReverse.value = true
                    return
                }
                content.value += props.text[index++]
            }, props.speed)
        }
    }else {
        timer = setInterval(() => {
            if (index >= props.text.length) {
                clearInterval(timer)
                emit('update:showCursor', false)
                return
            }
            content.value += props.text[index++]
        }, props.speed)        
    }
},{immediate: true})


// 组件挂载时更新光标位置
onMounted(updateCursor)
// 组件更新时更新光标位置
onUpdated(updateCursor)
onUnmounted(() => {
    clearInterval(timer)
})
</script>

<style scoped>
.text-body {
    background: inherit;
    line-height: 1;
    cursor: default;
}
.container {
    position: relative;
}
.cursor {
    content: '';
    position: absolute;
    width: var(--cursor-width);
    height: var(--size);
    transform: translate(2px,3px);
    background: var(--cursor-color);
    animation: toggle 0.3s infinite;
    left: calc(v-bind('pos.x') * 1px);
    top: calc(v-bind('pos.y') * 1px);
}

@keyframes toggle {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>