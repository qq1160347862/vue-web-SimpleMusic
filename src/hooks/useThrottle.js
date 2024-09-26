import { ref, watch } from 'vue';
 
// 创建一个节流函数
function useThrottle(fn, delay) {
  let timer = null;
  let lastTime = 0;
  
  const throttledFn = function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
        lastTime = Date.now();
      }, delay);
    }
  };
  
  return throttledFn;
}

export default useThrottle;