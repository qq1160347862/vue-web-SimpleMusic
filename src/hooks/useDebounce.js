import { ref, watch } from 'vue';
 
// 创建一个防抖函数，用于延迟执行传入的回调函数
function useDebounce(callback, delay) {
  // 用于存储setTimeout的ID
  const timeoutId = ref(null);
 
  // 防抖函数，清除之前的定时器并设置新的定时器
  const debouncedFunction = (...args) => {
    clearTimeout(timeoutId.value);
    timeoutId.value = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
 
  // 监听timeoutId的变化，如果timeoutId为null则清除定时器
  watch(() => timeoutId.value, () => {
    if (timeoutId.value === null) {
      clearTimeout(timeoutId.value);
    }
  });
 
  // 返回防抖函数
  return debouncedFunction;
}

export default useDebounce;