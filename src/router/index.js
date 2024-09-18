import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/Home.vue')
    },
    {
        path: '/discover',
        name: 'Discover',
        component: () => import('@/views/Discover.vue')
    },
    {
        path: '/album',
        name: 'Album',
        component: () => import('@/views/Album.vue')
    },
    {
        path: '/albumDetail/:id',
        name: 'AlbumDetail',
        component: () => import('@/views/AlbumDetail.vue')
    }
  ]
})

export default router