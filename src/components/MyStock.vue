<template>
  <div class="com-container">
    <div class="com-chart" ref="stockRef"></div>
  </div>
</template>

<script>
import { markRaw } from 'vue'
import { mapState } from 'vuex'

export default {
  created() {
    this.$socket.registerCallback('stockData', this.getData) // 在组件创建时注册回调函数
  },
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock',
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
      pagination: {
        current: 1, // 当前页
        size: 5, // 每页显示条数
        totalPage: 0 // 总页数
      },
      timerId: null
    }
  },
  methods: {
    initChart() {
      this.echartsInstance = markRaw(this.$echarts.init(this.$refs.stockRef, this.theme, { renderer: 'svg' }))
      const initOption = {
        title: {
          text: '| 库存和销量分析',
          left: '1%',
          top: '2%'
        }
      }
      this.echartsInstance.setOption(initOption)
      this.echartsInstance.on('mouseover', () => clearInterval(this.timerId))
      this.echartsInstance.on('mouseout', () => this.startInterval())
    },
    async getData(data) {
      // const { data } = await this.$http.get('/api/stock')
      if (data.status !== 200) return alert(data.msg)
      this.data = data.data
      this.pagination.totalPage = this.data.length % this.pagination.size === 0
        ? this.data.length / this.pagination.size
        : this.data.length / this.pagination.size + 1
      this.updateChart()
      this.startInterval()
    },
    updateChart() {
      const centerArray = [ // 每个饼图的中心点坐标
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      const colorArray = [ // 渐变颜色值
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF']
      ]
      const start = (this.pagination.current - 1) * this.pagination.size
      const end = this.pagination.current * this.pagination.size
      const showData = this.data.slice(start, end) // 取出前五个
      const seriesArray = showData.map((item, index) => ({
        center: centerArray[index],
        hoverAnimation: false, // 取消鼠标移入到饼图时的动画效果
        label: {
          position: 'center', // 让文字显示在圆环内部
          color: colorArray[index][0]
        },
        labelLine: {
          show: false // 隐藏指示线
        },
        data: [
          {
            value: item.sales, // 库存
            itemStyle: {
              color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [ // 从下往上线性渐变
                {
                  offset: 0,
                  color: colorArray[index][0]
                },
                {
                  offset: 1,
                  color: colorArray[index][1]
                }
              ])
            }
          },
          {
            name: `${item.name}\n\n${item.sales}`,
            value: item.stock, // 销量
            itemStyle: {
              color: '#333843'
            }
          }
        ]
      }))
      const dataOption = {
        series: seriesArray
      }
      this.echartsInstance.setOption(dataOption)
    },
    screenAdapter() {
      const titleFontSize = this.$refs.stockRef.offsetWidth / 100 * 3.6
      const innerRadius = titleFontSize * 2.8
      const outerRadius = innerRadius * 1.125
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
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
        if (++this.pagination.current > this.pagination.totalPage) this.pagination.current = 1
        this.updateChart()
      }, 5000)
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
