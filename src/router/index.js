import { createRouter, createWebHashHistory } from 'vue-router'
import SellerView from '@/views/SellerView'
import TrendView from '@/views/TrendView'
import MapView from '@/views/MapView'
import RankView from '@/views/RankView'
import HotproductView from '@/views/HotproductView'
import StockView from '@/views/StockView'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/sellerview',
      component: SellerView
    },
    {
      path: '/trendview',
      component: TrendView
    },
    {
      path: '/mapview',
      component: MapView
    },
    {
      path: '/rankview',
      component: RankView
    },
    {
      path: '/hotproductview',
      component: HotproductView
    },
    {
      path: '/stockview',
      component: StockView
    }
  ]
})

export default router
