<template>
  <div class="chat-time">
    <div class="label">
      聊天时间分布
    </div>
    <div class="chart" ref="chartEl"></div>
  </div>
</template>
<script setup lang="ts">
import * as echarts from 'echarts';
import { ref, shallowRef, onMounted } from 'vue'
import { msgList } from '../../../store/msg'

const chartEl = ref()
const chartIns = shallowRef()

let data = ref({})
onMounted(() => {
  getData()
  chartIns.value = echarts.init(chartEl.value)
  renderChart()
})

function getData() {
  let t = {}
  msgList.value.forEach(item => {
    let hour = new Date(item.CreateTime * 1000).getHours()
    t[hour] = (t[hour] || 0) + 1
  })
  data.value = t
}

function renderChart() {
  let option = {
    xAxis: {
      type: 'category',
      show: true,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: "#999999",
        fontSize: 10,
        align: "center",
        padding: [0, 0, 0, 4]
      }
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    grid: {
      show: false,
      height: "80%",
      width: "100%",
      top: 0,
      left: 0
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{c}条聊天',
      axisPointer: {
        type: 'shadow',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      show: false
    },
    title: {
      show: false,
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: "#7879ef",
          width: 5,
        },
        data: Object.keys(data.value).map(hour => ([hour + '点', data.value[hour]]))
      }
    ]
  };
  chartIns.value?.setOption(option)
}
</script>
<style lang="less" scoped>
.chat-time {
  .label {
    font-size: 12px;
    color: #999;
    padding-top: 15px;
    margin-bottom: 5px;
  }

  .chart {
    width: 250px;
    height: 100px;
    margin: 0 auto;
  }
}
</style>