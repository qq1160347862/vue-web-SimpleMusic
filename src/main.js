import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/assets/css/index.css'
import '@/assets/css/theme.css'
import '@/assets/css/animation.css'
import App from './App.vue'
import router from './router'
import vHover from './directives/vHover'
import vAnimate from './directives/vAnimate'
import vResize from './directives/vResize'
import vLazy from './directives/vLazy'

const pinia = createPinia()

createApp(App)
.directive('hover', vHover)
.directive('animate', vAnimate)
.directive('resize', vResize)
.directive('lazy', vLazy)
.use(pinia)
.use(router)
.mount('#app')
