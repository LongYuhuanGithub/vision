import '@/assets/fonts/iconfont.css'
import '@/assets/css/global.scss'
import { createApp } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'
import '@/assets/theme/chalk'
import App from '@/App'
import router from '@/router'
import store from '@/store'

axios.defaults.baseURL = 'http://localhost:3000'

const vue = createApp(App)

// 全局注册 vue 的原型属性
vue.config.globalProperties.$echarts = echarts
vue.config.globalProperties.$http = axios

vue.use(store).use(router).mount('#app')
