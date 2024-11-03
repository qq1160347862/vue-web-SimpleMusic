let arg = 'borderBoxSize';
let obTimer = null;
const map = new WeakMap();
const ob = new ResizeObserver(entries => {
    clearTimeout(obTimer);
    obTimer = setTimeout(() => {    
        for (let entry of entries) {
            const handler = map.get(entry.target);
            if (handler) {
                const box = arg === 'borderBoxSize'? entry.borderBoxSize[0] : entry.contentBoxSize[0];
                handler({
                    width: box.inlineSize,
                    height: box.blockSize
                });
            }
        }
    }, 500);    
});
export default {
  
    mounted(el, binding) {
        arg = binding.arg // 指令参数 borderBoxSize || contentBoxSize
        // 监听元素的大小变化
        ob.observe(el);
        map.set(el, binding.value);
    },

    unMounted(el, binding) {
        // 停止监听元素的大小变化
        console.log('unMounted');        
        ob.unobserve(el);
        ob.disconnect();
        clearTimeout(obTimer);
    }
};