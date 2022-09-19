<template>
  <div class="com-container">
    <div class="com-chart" ref="rankRef"></div>
  </div>
</template>

<script>
import { markRaw } from 'vue'
import { mapState } from 'vuex'

export default {
  created() {
    this.$socket.registerCallback('rankData', this.getData) // 在组件创建时注册回调函数
  },
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'rankData',
      chartName: 'rank',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  unmounted() {
    clearInterval(this.timerId)
    window.removeEventListener('resize', this.screenAdapter)
  },
  data() {
    return {
      echartsInstance: null,
      data: [],
      startValue: 0, // 数据缩放的起始值
      endValue: 9, // 数据缩放的结束值
      timerId: null
    }
  },
  methods: {
    initChart() {
      this.echartsInstance = markRaw(this.$echarts.init(this.$refs.rankRef, this.theme, { renderer: 'svg' }))
      const initOption = {
        title: {
          text: '| 地区销售排行',
          left: '1%',
          top: '2%'
        },
        grid: {
          left: '5%',
          top: '40%',
          right: '5%',
          bottom: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value'
        },
        tooltip: {}
      }
      this.echartsInstance.setOption(initOption)
      this.echartsInstance.on('mouseover', () => clearInterval(this.timerId))
      this.echartsInstance.on('mouseout', () => this.startInterval())
    },
    async getData(data) {
      // const { data } = await this.$http.get('http://localhost:3000/api/rank')
      if (data.status !== 200) return alert(data.msg)
      this.data = data.data
      this.data.sort((a, b) => b.value - a.value) // 从大到小排序
      this.updateChart()
      this.startInterval()
    },
    updateChart() {
      const colorArray = [ // 渐变颜色值
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
      ]
      const provinceArray = this.data.map(item => item.name) // 所有省份
      const valueArray = this.data.map(item => item.value) // 所有省份对应的数据
      const dataOption = {
        xAxis: {
          data: provinceArray
        },
        dataZoom: {
          show: false,
          // 展示第 startValue 到第 endValue 条数据，从 0 开始
          startValue: this.startValue,
          endValue: this.endValue
        },
        series: [
          {
            itemStyle: {
              color: params => { // 不同数值用不同的渐变颜色
                let targetColorArray
                if (params.value > 300) targetColorArray = colorArray[0]
                else if (params.value > 200) targetColorArray = colorArray[1]
                else targetColorArray = colorArray[2]
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [ // 从上往下线性渐变
                  {
                    offset: 0,
                    color: targetColorArray[0]
                  },
                  {
                    offset: 1,
                    color: targetColorArray[1]
                  }
                ])
              }
            },
            data: valueArray
          }
        ]
      }
      this.echartsInstance.setOption(dataOption)
    },
    screenAdapter() {
      const titleFontSize = this.$refs.rankRef.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            type: 'bar',
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
            }
          }
        ]
      }
      this.echartsInstance.setOption(adapterOption)
      this.echartsInstance.resize()
    },
    startInterval() {
      if (this.timerId) clearInterval(this.timerId)
      this.timerId = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > this.data.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 2000)
    }
  },
  computed: {
    ...mapState(['theme'])
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
