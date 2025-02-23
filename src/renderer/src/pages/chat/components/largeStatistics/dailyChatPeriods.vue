<template>
  <div class="daily-chat-periods">
    <div class="label">每日聊天时间段
      <comLoading v-if="AIing" />
    </div>
    <div class="desc" v-html="AIResult"></div>
    <div class="desc" v-if="!AIResult">
      在 <span>{{ Object.keys(dailyPeriodData).length }}</span> 个活跃时段中,
      有<span>{{ (dailyPeriodData[maxCountPeriod] / msgList.length * 100).toFixed(1) }}%</span> 的互动发生在
      <span>{{ maxCountPeriod }}:00~{{ maxCountPeriod }}:59</span> ({{ maxCountPeriodDesc?.name }}).
    </div>
    <div class="charts">
      <div class="chart" ref="lineChartEl" :style="`height:${lineChartEl?.clientWidth / 2}px`"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, computed, shallowRef, ref, onMounted, nextTick, defineExpose } from 'vue'
import * as echarts from 'echarts';
import comLoading from '@renderer/components/pulseLoading.vue'
import useAI from './useAI'

const { AIing, callAI, AIResult, clearAICache } = useAI('dailyChatPeriods')
defineExpose({
  AIAnaly: () => {
    if (!Object.keys(dailyPeriodForPerson).length) return
    let prompt = `分析以下各用户不同时间段消息发送数量的数据:\n${JSON.stringify(dailyPeriodForPerson.value)}`
    callAI([prompt])
  },
  clearAICache
})

const props = defineProps<{ msgList: Array<any> }>()
const lineChartEl = ref()
const lineChartIns = shallowRef()

const dailyPeriodData = computed(() => {
  let t = {}//{date:count}
  let hour;
  props.msgList.forEach(item => {
    hour = new Date(item.CreateTime * 1000).getHours()
    t[hour] = (t[hour] || 0) + 1
  })
  return t
})
const dailyPeriodForPerson = computed(() => {
  let t = {}//{ name: { date: count } }
  let hour;
  let name;
  props.msgList.forEach(item => {
    name = !item.IsSender ? (item.talkerInfo?.Remark || item.talkerInfo?.strNickName) : '我'
    hour = new Date(item.CreateTime * 1000).getHours()
    if (!t[name]) {
      t[name] = {}
    }
    if (!t[name][hour]) {
      t[name][hour] = 0
    }
    t[name][hour]++
  })
  return t
})

const sortCountPeriod = computed(() => {
  return Object.keys(dailyPeriodData.value).sort((a, b) => {
    return dailyPeriodData.value[b] - dailyPeriodData.value[a]
  })
})
//最多聊天数的时间段
const maxCountPeriod = computed(() => {
  return Number(sortCountPeriod.value[0])
})

const maxCountPeriodDesc = computed(() => {
  const timePeriods = [
    { name: "深夜活跃期", start: 0, end: 5 },    // 00:00-05:59
    { name: "清晨时段", start: 6, end: 8 },     // 06:00-08:59
    { name: "上午工作期", start: 9, end: 11 },  // 09:00-11:59
    { name: "午休时段", start: 12, end: 13 },  // 12:00-13:59
    { name: "下午工作期", start: 14, end: 17 },// 14:00-17:59
    { name: "晚间休闲", start: 18, end: 19 },  // 18:00-19:59
    { name: "夜间活跃", start: 20, end: 22 },  // 20:00-22:59
    { name: "深夜前奏", start: 23, end: 23 }   // 23:00-23:59
  ];
  let t
  timePeriods.forEach(item => {
    if (maxCountPeriod.value >= item.start && maxCountPeriod.value <= item.end) {
      t = item
    }
  })
  return t
})

onMounted(() => {
  nextTick(() => {
    lineChartIns.value = echarts.init(lineChartEl.value)
    renderLineChart()
  })
})

function renderLineChart() {
  let t = dailyPeriodForPerson.value
  //取聊天数前10的用户,避免渲染过多重叠
  let top10NameList = Object.keys(t).map(name => name).sort((a, b) => {
    let aTotal = Object.keys(t[a] || {}).reduce((count, hour) => count + (t[a][hour] || 0), 0)
    let bTotal = Object.keys(t[b] || {}).reduce((count, hour) => count + (t[b][hour] || 0), 0)
    return bTotal - aTotal
  }).slice(0, 10)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      }
    },
    grid: {
      show: false,
      height: (lineChartEl.value?.clientHeight - 30) || "88%",
      width: (lineChartEl.value?.clientWidth - 25) || '95%',
      top: 10,
      left: 25
    },
    xAxis: {
      type: 'category',
      boundaryGap: [25, 0],
      axisTick: {
        show: false,
        lineStyle: {
          color: "rgba(0,0,0,0.3)"
        }
      },
      axisLine: {
        lineStyle: {
          color: "rgba(0,0,0,0.1)"
        }
      },
      axisLabel: {
        fontSize: 8,
        color: "#999999"
      },
      data: Object.keys(dailyPeriodData.value).map(i => i + ':00')
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 8,
        color: "#999999",
        formatter: function (value) {
          return value >= 1000 ? ((value / 1000).toFixed(1) + "k") : value;
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "rgba(0,0,0,0.03)"
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: "rgba(0,0,0,0.3)"
        }
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "rgba(0,0,0,0.1)"
        }
      },
    },
    series: [
      {
        type: 'bar',
        name: "总数",
        color: '#7879ef20',
        data: Object.keys(dailyPeriodData.value).map(date => dailyPeriodData.value[date]),
      },
      ...Object.keys(dailyPeriodForPerson.value).map(name => {
        if (!top10NameList.includes(name)) return null
        return {
          type: 'line',
          name: name,
          symbol: 'none',
          smooth: true,
          lineStyle: {
            width: 1,
            // type: 'dashed',
          },
          data: Object.keys(dailyPeriodForPerson.value[name]).map(hour => dailyPeriodForPerson.value[name][hour])
        }
      }),
    ]
  }
  lineChartIns.value?.setOption(option)
}

</script>
<style lang="less" scoped>
.daily-chat-periods {
  width: 100%;
  // background-color: #fff;
  padding: 10px;
  border-radius: 10px;

  .label {
    position: relative;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-weight: bold;
  }

  .desc {
    font-size: 14px;
    color: #555;
    margin-bottom: 10px;

    span {
      font-weight: bold;
    }
  }

  .charts {
    background-color: #fff;
    border-radius: 20px;
    padding: 10px;

    .chart {
      width: 100%;
      min-width: 250px;
    }
  }
}
</style>