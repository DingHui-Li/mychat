<template>
  <div class="chat-type-chart">
    <div class="label">消息类型占比</div>
    <div class="chart" ref="chartEl"></div>
    <div class="legend">
      <div class="item" v-for="(type, index) in Object.keys(data)">
        <div class="dot" :style="`background:${colors[index]}`"></div>
        {{ type }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue'
import * as echarts from 'echarts';
import { msgList } from '../../../store/msg'

const chartEl = ref()
const chartIns = shallowRef()

let data = ref({})

onMounted(() => {
  getData()
  chartIns.value = echarts.init(chartEl.value)
  renderChart()
})

const colors = ['#3F51B5', '#F44336', '#FF4081', '#009688',
  '#9C27B0', '#7C4DFF', '#03A9F4',
  '#4CAF50', '#CDDC39', '#FFC107',
  '#FF5722', '#795548', '#607D8B']

function getData() {
  let t = {}
  msgList.value.forEach(item => {
    t[item.TypeName] = (t[item.TypeName] || 0) + 1
  })
  data.value = t
}

function renderChart() {
  const option = {
    tooltip: {
      trigger: 'item'
    },
    grid: {
      show: false,
      height: "100%",
      width: "100%",
      top: 0,
      left: 0
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 15,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        color: colors,
        data: Object.keys(data.value).map(type => ({ value: data.value[type], name: type }))
      }
    ]
  };
  chartIns.value?.setOption(option)
}
</script>
<style lang="less" scoped>
.chat-type-chart {

  .label {
    position: relative;
    top: 20px;
    font-size: 12px;
    color: #999;
  }

  .chart {
    width: 250px;
    height: 250px;
    margin: 0 auto;
  }

  .legend {
    position: relative;
    top: -20px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;

    .item {
      font-size: 12px;
      color: #999;
      display: flex;
      align-items: center;
      margin-right: 10px;

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 4px;
      }
    }
  }
}
</style>