<template>
  <div class="com-container" @dblclick="revertMap">
    <div class="com-chart" ref="mapRef"></div>
  </div>
</template>

<script>
import { markRaw } from 'vue'
import { mapState } from 'vuex'
import axios from 'axios'
import { getProvinceMapInfo } from '@/utils/mapUtils'

export default {
  created() {
    this.$socket.registerCallback('mapData', this.getData) // 在组件创建时注册回调函数
  },
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map',
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
      provinceMapCache: {} // 缓存已获取过的省份地图
    }
  },
  methods: {
    async initChart() {
      this.echartsInstance = markRaw(this.$echarts.init(this.$refs.mapRef, this.theme, { renderer: 'svg' }))
      const { data: chinaMap } = await axios.get('http://localhost:8080/static/map/china.json') // 请求 public 文件夹下的资源
      this.$echarts.registerMap('chinaMap', chinaMap)
      const initOption = {
        title: {
          text: '| 商家分布',
          left: '1%',
          top: '2%'
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical' // 竖着排列
        },
        geo: {
          type: 'map',
          map: 'chinaMap',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2E72BF',
            borderColor: '#333'
          }
        }
      }
      this.echartsInstance.setOption(initOption)

      // 点击省份展示对应省份地图
      this.echartsInstance.on('click', async params => {
        const provinceMapInfo = getProvinceMapInfo(params.name) // 根据点击的省份获取对应的名称和文件路径
        if (!this.provinceMapCache[provinceMapInfo.name]) { // 判断是否缓存
          const { data: provinceMap } = await axios.get('http://localhost:8080' + provinceMapInfo.path) // 请求对应省份的矢量数据
          this.provinceMapCache[provinceMapInfo.name] = provinceMap // 缓存省份数据
          this.$echarts.registerMap(provinceMapInfo.name, provinceMap)
        }
        const changeOption = {
          geo: {
            map: provinceMapInfo.name // 更换为当前省份地图
          }
        }
        this.echartsInstance.setOption(changeOption)
      })
    },
    async getData(data) {
      // const { data } = await this.$http.get('/api/map')
      if (data.status !== 200) return alert(data.msg)
      this.data = data.data
      this.updateChart()
    },
    updateChart() {
      const legendArray = this.data.map(item => item.name) // 图例数据
      const seriesArray = this.data.map(item => ({ // 返回的这个对象就代表的是一个类别下的所有散点数据
        type: 'effectScatter',
        name: item.name,
        coordinateSystem: 'geo',
        rippleEffect: {
          scale: 5,
          brushType: 'stroke' // 涟漪波纹类型
        },
        data: item.children
      }))
      const dataOption = {
        legend: {
          data: legendArray
        },
        series: seriesArray
      }
      this.echartsInstance.setOption(dataOption)
    },
    screenAdapter() {
      const titleFontSize = this.$refs.mapRef.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }
      }
      this.echartsInstance.setOption(adapterOption)
      this.echartsInstance.resize()
    },
    revertMap() { // 双击回到中国地图
      const revertOption = {
        geo: {
          map: 'chinaMap'
        }
      }
      this.echartsInstance.setOption(revertOption)
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
