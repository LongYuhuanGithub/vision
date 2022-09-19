<template>
  <div class="screen-view" :style="containerStyle">
    <!-- 头部标题区域 -->
    <header class="screen-header">
      <div>
        <img :src="headerBorderSrc" alt="">
      </div>
      <span class="logo">
        <img :src="logoSrc" alt=""/>
      </span>
      <span class="title">电商平台实时监控系统</span>
      <div class="title-right">
        <img :src="themeSrc" alt="" @click="handleThemeChange">
        <span class="datetime">2049-01-01 00:00:00</span>
      </div>
    </header>

    <!-- 图表展示区域 -->
    <div class="screen-body">
      <!-- 左边两个图表 -->
      <section class="screen-left">
        <!-- 销量趋势图表 trend -->
        <div id="left-top" :class="[fullScreenStatus.trend ? 'full-screen' : '']">
          <MyTrend ref="trend"></MyTrend>
          <div class="resize">
            <span :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('trend')"></span>
          </div>
        </div>
        <!-- 商家销量图表 seller -->
        <div id="left-bottom" :class="[fullScreenStatus.seller ? 'full-screen' : '']">
          <MySeller ref="seller"></MySeller>
          <div class="resize">
            <span :class="['iconfont', fullScreenStatus.seller ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('seller')"></span>
          </div>
        </div>
      </section>

      <!-- 中间两个图表 -->
      <section class="screen-middle">
        <!-- 商家分布图表 map -->
        <div id="middle-top" :class="[fullScreenStatus.map ? 'full-screen' : '']">
          <MyMap ref="map"></MyMap>
          <div class="resize">
            <span :class="['iconfont', fullScreenStatus.map ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('map')"></span>
          </div>
        </div>
        <!-- 销量排行图表 rank -->
        <div id="middle-bottom" :class="[fullScreenStatus.rank ? 'full-screen' : '']">
          <MyRank ref="rank"></MyRank>
          <div class="resize">
            <span :class="['iconfont', fullScreenStatus.rank ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('rank')"></span>
          </div>
        </div>
      </section>

      <!-- 右边两个图表 -->
      <section class="screen-right">
        <!-- 热销商品图表 hotproduct -->
        <div id="right-top" :class="[fullScreenStatus.hotproduct ? 'full-screen' : '']">
          <MyHotproduct ref="hotproduct"></MyHotproduct>
          <div class="resize">
            <span :class="['iconfont', fullScreenStatus.hotproduct ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('hotproduct')"></span>
          </div>
        </div>
        <!-- 库存信息图表 stock -->
        <div id="right-bottom" :class="[fullScreenStatus.stock ? 'full-screen' : '']">
          <MyStock ref="stock"></MyStock>
          <div class="resize">
            <span :class="['iconfont', fullScreenStatus.stock ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('stock')"></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import MyHotproduct from '@/components/MyHotproduct'
import MyMap from '@/components/MyMap'
import MyRank from '@/components/MyRank'
import MySeller from '@/components/MySeller'
import MyStock from '@/components/MyStock'
import MyTrend from '@/components/MyTrend'
import { getThemeValue } from '@/utils/themeUtils'

export default {
  created() {
    this.$socket.registerCallback('fullScreen', this.fullScreenData) // 注册全屏处理函数
    this.$socket.registerCallback('themeChange', this.themeChangeData) // 注册主题切换函数
  },
  unmounted() {
    this.$socket.unRegisterCallback('fullScreen') // 取消全屏函数
    this.$socket.unRegisterCallback('themeChange') // 取消主题切换函数
  },
  data() {
    return {
      fullScreenStatus: { // 每一个图表的全屏状态
        trend: false,
        seller: false,
        map: false,
        rank: false,
        hotproduct: false,
        stock: false
      }
    }
  },
  methods: {
    changeSize(chartName) { // 某个图表的全屏切换
      // this.fullScreenStatus[chartName] = !this.fullScreenStatus[chartName] // 将指定图表的全屏状态取反
      // this.$nextTick(() => this.$refs[chartName].screenAdapter()) // 调用对应图表的内的 screenAdapter() 函数进行屏幕适配
      // 用 WebSocket 改造
      this.$socket.send({
        action: 'fullScreen',
        socketType: 'fullScreen',
        chartName,
        value: !this.fullScreenStatus[chartName]
      })
    },
    fullScreenData(data) { // 接收到全屏数据之后的处理函数
      const chartName = data.chartName // 取出是哪一个图表需要进行切换
      this.fullScreenStatus[chartName] = data.value
      this.$nextTick(() => this.$refs[chartName].screenAdapter())
    },
    handleThemeChange() { // 处理主题切换
      // this.$store.commit('themeChange') // 改变 vuex 中的数据
      // 用 WebSocket 改造
      this.$socket.send({
        action: 'themeChange',
        socketType: 'themeChange',
        chartName: '',
        value: ''
      })
    },
    themeChangeData() { // 接收到主题切换数据之后的处理函数
      this.$store.commit('themeChange') // 改变 vuex 中的数据
    }
  },
  computed: {
    ...mapState(['theme']),
    logoSrc() {
      return '/static/images/' + getThemeValue(this.theme).logoSrc
    },
    headerBorderSrc() {
      return '/static/images/' + getThemeValue(this.theme).headerBorderSrc
    },
    themeSrc() {
      return '/static/images/' + getThemeValue(this.theme).themeSrc
    },
    containerStyle() {
      return {
        backgroundColor: getThemeValue(this.theme).backgroundColor,
        color: getThemeValue(this.theme).titleColor
      }
    }
  },
  components: {
    MyHotproduct,
    MyMap,
    MyRank,
    MySeller,
    MyStock,
    MyTrend
  }
}
</script>

<style lang="scss" scoped>
.screen-view {
  padding: 0 20px;
  width: 100%;
  height: 100%;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;

  // 头部标题区域
  .screen-header {
    position: relative;
    width: 100%;
    height: 64px;
    font-size: 20px;

    div {
      img {
        width: 100%;
      }
    }

    .logo {
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-55%);

      img {
        width: 128px;
        height: 35px;
      }
    }

    .title {
      position: absolute;
      top: 50%;
      left: 50%;
      font-size: 20px;
      transform: translate(-50%, -50%);
    }

    .title-right {
      position: absolute;
      top: 50%;
      right: 0;
      display: flex;
      align-items: center;
      transform: translateY(-80%);

      img {
        width: 28px;
        height: 21px;
        cursor: pointer;
      }

      span {
        margin-left: 10px;
        font-size: 15px;
      }
    }
  }

  // 图表展示区域
  .screen-body {
    display: flex;
    margin-top: 10px;
    width: 100%;
    height: 100%;

    // 左边两个图表
    .screen-left {
      width: 28%;
      height: 100%;

      #left-top {
        position: relative;
        height: 52%;
      }

      #left-bottom {
        position: relative;
        margin-top: 25px;
        height: 34%;
      }
    }

    // 中间两个图表
    .screen-middle {
      margin-left: 1.5%;
      margin-right: 1.5%;
      width: 41%;
      height: 100%;

      #middle-top {
        position: relative;
        width: 100%;
        height: 56%;
      }

      #middle-bottom {
        position: relative;
        margin-top: 25px;
        width: 100%;
        height: 30%;
      }
    }

    // 右边两个图表
    .screen-right {
      width: 28%;
      height: 100%;

      #right-top {
        position: relative;
        height: 46%;
      }

      #right-bottom {
        position: relative;
        margin-top: 25px;
        height: 40%;
      }
    }

    // 每个图表右上角的全屏按钮
    .resize {
      position: absolute;
      right: 20px;
      top: 20px;
      cursor: pointer;
    }

    // 每个图表点击全屏后的样式
    .full-screen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      margin: 0 !important;
      width: 100% !important;
      height: 100% !important;
      z-index: 100;
    }
  }
}
</style>
