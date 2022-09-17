<template>
  <div class="com-container">
    <div class="title" :style="{fontSize: this.titleFontSize + 'px'}">
      <span>| {{ showTitle }}</span>
      <span class="iconfont title-arrow" :style="{fontSize: titleFontSize + 'px'}" @click="showSelect = !showSelect">&#xe6eb;</span>
      <div class="select" v-show="showSelect" :style="{marginLeft: titleFontSize + 5 + 'px'}">
        <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">{{ item.text }}</div>
      </div>
    </div>
    <div class="com-chart" ref="trendRef"></div>
  </div>
</template>

<script>
import { markRaw } from 'vue'

export default {
  mounted() {
    this.initChart()
    this.getData()
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
      showSelect: false, // 是否显示可选类型的下拉菜单
      selectType: 'map', // 当前选择显示的数据类型
      titleFontSize: 0 // 标题字体大小
    }
  },
  methods: {
    initChart() {
      this.echartsInstance = markRaw(this.$echarts.init(this.$refs.trendRef, 'chalk', { renderer: 'svg' }))
      const initOption = {
        legend: {
          left: '2%',
          top: '16%',
          icon: 'circle'
        },
        grid: {
          left: '3%',
          top: '35%',
          right: '4%',
          bottom: '1%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        },
        tooltip: {
          trigger: 'axis'
        }
      }
      this.echartsInstance.setOption(initOption)
    },
    async getData() {
      const { data } = await this.$http.get('/api/trend')
      if (data.status !== 200) return alert(data.msg)
      this.data = data.data
      this.updateChart()
    },
    updateChart() {
      const colorArray1 = [ // 半透明的颜色值
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
      ]
      const colorArray2 = [ // 全透明的颜色值
        'rgba(11, 168, 44, 0)',
        'rgba(44, 110, 255, 0)',
        'rgba(22, 242, 217, 0)',
        'rgba(254, 33, 30, 0)',
        'rgba(250, 105, 0, 0)'
      ]
      const timeArray = this.data.common.month // 类目轴的数据
      const valueArray = this.data[this.selectType].data // y 轴的数据
      const legendArray = valueArray.map(item => item.name) // 图例的数据
      const seriesArray = valueArray.map((item, index) => ({ // 定义 series 的数据
        type: 'line',
        name: item.name,
        stack: 'map',
        areaStyle: {
          color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [ // 从上往下线性渐变
            { offset: 0, color: colorArray1[index] },
            { offset: 1, color: colorArray2[index] }
          ])
        },
        data: item.data
      }))
      const dataOption = {
        legend: {
          data: legendArray
        },
        xAxis: {
          data: timeArray
        },
        series: seriesArray
      }
      this.echartsInstance.setOption(dataOption)
    },
    screenAdapter() {
      this.titleFontSize = this.$refs.trendRef.offsetWidth / 100 * 3.6
      const adapterOption = {
        legend: {
          itemGap: this.titleFontSize, // 图例间隔
          itemWidth: this.titleFontSize, // 图例宽度
          itemHeight: this.titleFontSize, // 图例高度
          textStyle: {
            fontSize: this.titleFontSize / 2 // 图例文字的字体大小
          }
        }
      }
      this.echartsInstance.setOption(adapterOption)
      this.echartsInstance.resize()
    },
    handleSelect(currentType) { // 处理选择类型
      this.selectType = currentType
      this.updateChart()
      this.showSelect = false
    }
  },
  computed: {
    selectTypes() { // 返回所有可选类型
      if (!this.data || !this.data.type) return []
      return this.data.type.filter(item => item.key !== this.selectType) // 去除掉当前选择的类型
    },
    showTitle() { // 返回当前选择的类型对应显示的标题
      if (!this.data) return ''
      return this.data[this.selectType].title
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  position: absolute;
  top: 2%;
  left: 1%;
  background-color: #222733;
  color: white;
  z-index: 1;

  .title-arrow {
    margin-left: 5px;
    cursor: pointer;
  }

  .select-item {
    cursor: pointer;
  }
}
</style>
