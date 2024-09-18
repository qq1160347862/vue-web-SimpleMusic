export default {
    // 在绑定元素的父组件
    // 及他自己的所有子节点都挂载完成后调用
    // 当指令绑定到元素时调用，处理鼠标进入和离开事件
    mounted(el, binding, vnode) {
        const { value } = binding;
    
        el.addEventListener('mouseenter', () => {
            if (value.onEnter) {
                value.onEnter(el, binding, vnode);
            }
            if(value.enterClass){
                el.classList.add(value.enterClass);
            }
        });
    
        el.addEventListener('mouseleave', () => {
            if (value.onLeave) {
                value.onLeave(el, binding, vnode);
            }
            if(value.leaveClass){
                el.classList.remove(value.leaveClass);
            }
        });
    },
    
    // 绑定元素的父组件卸载后调用，移除事件监听器
    unmounted(el, binding, vnode) {
        el.removeEventListener('mouseenter', () => {
            if (value.onEnter) {
                value.onEnter(el, binding, vnode);
            }
            if(value.enterClass){
                el.classList.remove(value.enterClass);
            }
        });

        el.removeEventListener('mouseleave', () => {
            if (value.onLeave) {
                value.onLeave(el, binding, vnode);
            }
            if(value.leaveClass){
                el.classList.remove(value.leaveClass);
            }
        });
    }
};