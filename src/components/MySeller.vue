<template>
  <div class="com-container">
    <div class="com-chart" ref="sellerRef"></div>
  </div>
</template>

<script>
import { markRaw } from 'vue'
import { mapState } from 'vuex'

export default {
  created() {
    this.$socket.registerCallback('sellerData', this.getData) // 在组件创建时注册回调函数
  },
  mounted() {
    this.initChart()
    // 用 WebSocket 改造
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'sellerData',
      chartName: 'seller',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter() // 页面加载完成后主动进行屏幕适配
  },
  unmounted() {
    clearInterval(this.timerId)
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallback('sellerData') // 在组件销毁时取消回调函数
  },
  data() {
    return {
      echartsInstance: null, // echarts 实例对象
      data: [], // 从服务器获取的数据
      pagination: {
        current: 1, // 当前页
        size: 5, // 每页显示条数
        totalPage: 0 // 总页数
      },
      timerId: null // 定时器ID
    }
  },
  methods: {
    initChart() { // 初始化 echartsInstance 对象
      // 用 markRaw 让 echarts 从监听对象变成普通对象，解决 tooltip.trigger: 'axis' 不显示问题
      this.echartsInstance = markRaw(this.$echarts.init(this.$refs.sellerRef, this.theme, { renderer: 'svg' }))
      const initOption = { // 图表初始化配置
        title: {
          text: '| 商家销售统计',
          left: '1%',
          top: '2%'
        },
        grid: {
          left: '3%',
          top: '20%',
          right: '6%',
          bottom: '3%',
          containLabel: true // 距离包含坐标轴上的文字
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0, // 显示在最下面一层，做一个阴影效果
            lineStyle: { // 虚线样式
              color: '#2D3443',
              type: 'solid'
            }
          }
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'white'
              }
            },
            itemStyle: {
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [ // 从左往右线性渐变
                { offset: 0, color: '#5052EE' }, // 0% 的颜色
                { offset: 1, color: '#AB6EE5' } // 100% 的颜色
              ])
            }
          }
        ]
      }
      this.echartsInstance.setOption(initOption)
      this.echartsInstance.on('mouseover', () => clearInterval(this.timerId)) // 鼠标移入关闭定时器
      this.echartsInstance.on('mouseout', () => this.startInterval()) // 鼠标移开启动定时器
    },
    async getData(data) { // 获取服务器的数据
      // 用 WebSocket 改造
      // const { data } = await this.$http.get('/api/seller')
      if (data.status !== 200) return alert(data.msg)
      this.data = data.data.sort((a, b) => a.value - b.value) // 按照 value 值从小到大排序
      this.pagination.totalPage = this.data.length % this.pagination.size === 0 // 计算总页数
        ? this.data.length / this.pagination.size
        : this.data.length / this.pagination.size + 1
      this.updateChart()
      this.startInterval() // 启用定时器
    },
    updateChart() { // 更新图表
      // 分页操作
      const start = (this.pagination.current - 1) * this.pagination.size
      const end = this.pagination.current * this.pagination.size
      const showData = this.data.slice(start, end)
      // 取出所有 name 和 value 值
      const names = showData.map(item => item.name)
      const values = showData.map(item => item.value)

      // 图表数据配置
      const dataOption = {
        yAxis: {
          data: names
        },
        series: [
          {
            data: values
          }
        ]
      }
      this.echartsInstance.setOption(dataOption)
    },
    startInterval() { // 每 3 秒翻一页
      if (this.timerId) clearInterval(this.timerId)
      this.timerId = setInterval(() => {
        if (++this.pagination.current > this.pagination.totalPage) this.pagination.current = 1
        this.updateChart()
      }, 3000)
    },
    screenAdapter() { // 屏幕适配，浏览器窗口大小发生变化时，会调用此方法
      const titleFontSize = this.$refs.sellerRef.offsetWidth / 100 * 3.6 // 根据图表容器宽度计算出合适的字体大小（1920 为 69.12）
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        tooltip: {
          axisPointer: {
            lineStyle: { // 虚线样式
              width: titleFontSize
            }
          }
        },
        series: [
          {
            type: 'bar',
            barWidth: titleFontSize, // 柱子的宽度
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0] // 设置柱子右半部分圆角
            }
          }
        ]
      }
      this.echartsInstance.setOption(adapterOption)
      this.echartsInstance.resize() // 调整图表大小，完成自适应
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
