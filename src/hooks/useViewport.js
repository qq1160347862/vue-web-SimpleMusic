import { ref } from 'vue';
// 屏幕大小
const vh = ref(document.documentElement.clientHeight)
const vw = ref(document.documentElement.clientWidth)
window.addEventListener('resize', () => {
  vh.value = document.documentElement.clientHeight
  vw.value = document.documentElement.clientWidth
})
export default function useViewport() {
  return {
    vh,
    vw
  }
}