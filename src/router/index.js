import { createRouter, createWebHashHistory } from 'vue-router'
import ScreenView from '@/views/ScreenView'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: ScreenView
    }
  ]
})

export default router
