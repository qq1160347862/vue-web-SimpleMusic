let list = null                 // 真实数据
let currentIndex = null         // 当前播放歌曲索引
let index = null                // 被拖动的数据索引
let item = null                 // 被拖动的数据
let swapIndex = null            // 交换位置的数据索引
let draggingEle = null;         // 被拖动的dom元素
let dragstartHandler = null;    // 拖动开始事件处理函数
let dragoverHandler = null;     // 拖动过程中事件处理函数
let dragenterHandler = null;    // 拖动进入事件处理函数
let dragendHandler = null;      // 拖动结束事件处理函数
export default {
    mounted(el, binding) {        
        list = binding.value.musicList;    
        currentIndex = binding.value.currentIndex;
        const clear = () => {
            index = null;
            swapIndex = null;
            item = null;
            draggingEle = null;
        }            
        dragstartHandler = (e) => {
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';  // 设置鼠标拖动图标
            draggingEle = e.target;
            index = [...el.children].indexOf(draggingEle);
            item = list[index]
        }
        dragoverHandler = (e) => {
            e.preventDefault();
        }
        dragenterHandler = (e) => {
            e.preventDefault();
            if (e.target === el || e.target === draggingEle) {  // 忽略自身和被拖动的元素
                return;
            }
            
            const children = [...el.children];
            const draggingIndex = children.indexOf(draggingEle);
            const targetIndex = children.indexOf(e.target);        
            if (draggingIndex < targetIndex) { // 向下拖动
                el.insertBefore(draggingEle, e.target.nextSibling);                    
            } else { // 向上拖动
                el.insertBefore(draggingEle, e.target);
            }
            swapIndex = targetIndex;  // 记录最后一次交换位置索引   
        }
        dragendHandler = (e) => {
            e.target.classList.remove('dragging');
            if (swapIndex === index) { // 没有交换位置，不做任何处理
                return;
            }
            if (index === currentIndex) { // 正在播放的歌曲被拖动，更新当前播放歌曲索引
                binding.value.setCurrentIndex(swapIndex);
            }
            if (swapIndex === currentIndex) { // 交换位置的歌曲被拖动，更新当前播放歌曲索引
                binding.value.setCurrentIndex(currentIndex);
            }
            // 当前歌曲被夹在中间，更新当前播放歌曲索引
            if (index < currentIndex && currentIndex < swapIndex){ 
                binding.value.setCurrentIndex(currentIndex);
            }
            if (index > currentIndex && currentIndex > swapIndex){ 
                binding.value.setCurrentIndex(currentIndex);
            }
            list.splice(index, 1);
            list.splice(swapIndex, 0, item);
            clear()
        }
        el.addEventListener('dragstart', dragstartHandler);
        el.addEventListener('dragover', dragoverHandler);
        el.addEventListener('dragenter', dragenterHandler);
        el.addEventListener('dragend', dragendHandler);
    },
    updated(el, binding) {
        list = binding.value.musicList;
        currentIndex = binding.value.currentIndex;
    },
    unMounted(el) {
        el.removeEventListener('dragstart', dragstartHandler);
        el.removeEventListener('dragover', dragoverHandler);
        el.removeEventListener('dragenter', dragenterHandler);
        el.removeEventListener('dragend', dragendHandler);
    }
};