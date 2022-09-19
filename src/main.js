import '@/assets/fonts/iconfont.css'
import '@/assets/css/global.scss'
import { createApp } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'
import '@/assets/theme/chalk'
import '@/assets/theme/vintage'
import App from '@/App'
import router from '@/router'
import store from '@/store'
import WebSocketService from '@/utils/webSocketService'

axios.defaults.baseURL = 'http://localhost:3000'

WebSocketService.getInstance.connect() // 连接 WebSocket 服务器

const vue = createApp(App)

// 全局注册 vue 的原型属性
vue.config.globalProperties.$echarts = echarts
vue.config.globalProperties.$http = axios
vue.config.globalProperties.$socket = WebSocketService.getInstance

vue.use(store).use(router).mount('#app')
