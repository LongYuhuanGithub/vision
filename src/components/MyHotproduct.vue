<template>
  <div class="com-container">
    <div class="com-chart" ref="hotproductRef"></div>
    <span class="iconfont arrow-left" :style="comStyle" @click="toLeft">&#xe6ef;</span>
    <span class="iconfont arrow-right" :style="comStyle" @click="toRight">&#xe6ed;</span>
    <span class="cat-name" :style="comStyle">| {{ catName }}</span>
  </div>
</template>

<script>
import { markRaw } from 'vue'
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/themeUtils'

export default {
  created() {
    this.$socket.registerCallback('hotproductData', this.getData) // 在组件创建时注册回调函数
  },
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'hotproductData',
      chartName: 'hotproduct',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  unmounted() {
    window.removeEventListener('resize', this.screenAdapter)
  },
  data() {
    return {
      echartsInstance: null,
      data: [],
      currentIndex: 0, // 当前展示的一级分类索引
      titleFontSize: 0
    }
  },
  methods: {
    initChart() {
      this.echartsInstance = markRaw(this.$echarts.init(this.$refs.hotproductRef, this.theme, { renderer: 'svg' }))
      const initOption = {
        title: {
          text: '| 热销商品的占比',
          left: '1%',
          top: '2%'
        },
        legend: {
          top: '20%',
          icon: 'circle'
        },
        tooltip: {
          formatter(params) {
            /*
            * 格式：
            *   三级分类1:占比1%
            *   三级分类2:占比2%
            *   ...
            * */
            /*
            * 示例：
            *   工装裤:41%
            *   阔腿裤:30%
            *   牛仔裤:30%
            * */
            // item.value / params.data.value（三级分类的值 / 二级分类的值，二级分类的值就是所有三级分类的值加起来）
            return params.data.children.reduce((total, item) => total + `${item.name}:${(item.value / params.data.value * 100).toFixed(0)}%<br>`, '')
          }
        },
        series: [
          {
            type: 'pie',
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true
              },
              labelLine: {
                show: false
              }
            }
          }
        ]
      }
      this.echartsInstance.setOption(initOption)
    },
    async getData(data) {
      // const { data } = await this.$http.get('/api/hotproduct')
      if (data.status !== 200) return alert(data.msg)
      this.data = data.data
      this.updateChart()
    },
    updateChart() {
      const legendArray = this.data[this.currentIndex].children.map(item => item.name)
      const dataOption = {
        legend: {
          data: legendArray
        },
        series: [
          {
            data: this.data[this.currentIndex].children
          }
        ]
      }
      this.echartsInstance.setOption(dataOption)
    },
    screenAdapter() {
      this.titleFontSize = this.$refs.hotproductRef.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        },
        series: [
          {
            center: ['50%', '60%'], // 饼图的中心（圆心）坐标
            radius: this.titleFontSize * 4.5
          }
        ]
      }
      this.echartsInstance.setOption(adapterOption)
      this.echartsInstance.resize()
    },
    toLeft() { // 展示上一个一级分类
      this.currentIndex--
      if (this.currentIndex < 0) this.currentIndex = this.data.length - 1
      this.updateChart()
    },
    toRight() { // 展示下一个一级分类
      this.currentIndex++
      if (this.currentIndex > this.data.length - 1) this.currentIndex = 0
      this.updateChart()
    }
  },
  computed: {
    ...mapState(['theme']),
    catName() { // 返回当前一级分类的名字
      if (!this.data || !this.data[this.currentIndex] || !this.data[this.currentIndex].name) return ''
      return this.data[this.currentIndex].name
    },
    comStyle() { // 返回组件的样式
      return {
        fontSize: this.titleFontSize * 1.5 + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    }
  },
  watch: {
    theme() {
      this.echartsInstance.dispose() // 销毁图表
      this.initChart()
      this.updateChart()
      this.screenAdapter()
    }
  }
}
</script>

<style lang="scss" scoped>
.arrow-left,
.arrow-right {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  cursor: pointer;
}

.arrow-left {
  left: 10%
}

.arrow-right {
  right: 10%
}

.cat-name {
  position: absolute;
  right: 10%;
  bottom: 5%;
  color: white;
}
</style>
