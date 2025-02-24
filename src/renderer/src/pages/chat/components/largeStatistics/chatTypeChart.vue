<template>
  <div class="chat-type-chart">
    <div class="label">消息类型占比
      <comLoading v-if="AIing" />
    </div>
    <div class="desc" v-html="AIResult">
    </div>
    <div class="des" v-if="!AIResult">
      <span> {{ typeCountList[0].type }}</span> 类型消息以 <span>{{ typeCountList[0].rate }}</span> 占比主导交互场景，
      <template v-if="typeCountList.length >= 2">
        <span>{{ typeCountList[1].type }}({{ typeCountList[1].rate }})</span>
        <template v-if="typeCountList.length >= 3">
          与 <span>{{ typeCountList[2].type }}({{ typeCountList[2].rate }})</span>
        </template>
        类型消息构成补充生态。
      </template>
      <div>
        其中 <span>{{ maxCountOfType[typeCountList[0].type].user }}</span> 在 <span>{{ typeCountList[0].type }}</span>
        消息维度发送最多.达到 <span>{{ maxCountOfType[typeCountList[0].type].max }}</span>条。
      </div>
    </div>
    <div class="charts">
      <div class="chart-box" ref="chartBoxEl">
        <div class="chart" ref="chartEl" :style="`height:${chartBoxEl?.clientWidth}px`"></div>
      </div>
      <div class="chart-box">
        <div class="chart" ref="radarChartEl" :style="`height:${chartBoxEl?.clientWidth}px`"></div>
      </div>
    </div>

  </div>
</template>
<script setup lang="ts">
import { ref, shallowRef, onMounted, defineProps, computed, nextTick, defineExpose } from 'vue'
import * as echarts from 'echarts';
import comLoading from '@renderer/components/pulseLoading.vue'
import useAI from './useAI'

const { AIing, callAI, AIResult, clearAICache } = useAI('chatTypeChart')
defineExpose({
  AIAnaly: () => {
    if (!Object.keys(typeDataByPerson).length) return
    let prompt = `分析以下各用户不同类型消息发送数量的数据:\n${JSON.stringify(typeDataByPerson.value)}`
    callAI([prompt])
  },
  clearAICache
})

const props = defineProps<{ msgList: Array<any> }>()
const chartEl = ref()
const chartIns = shallowRef()
const chartBoxEl = ref()
const radarChartEl = ref()
const radarChartIns = shallowRef()

onMounted(() => {
  nextTick(() => {
    chartIns.value = echarts.init(chartEl.value)
    radarChartIns.value = echarts.init(radarChartEl.value)
    renderChart()
    renderRadarChart()
  })
})

const colors = ['#7879ef70', '#7C4DFF70', '#03A9F470', '#FF408170', '#00968870',
  '#9C27B070',
  '#4CAF5070', '#CDDC3970', '#FFC10770',
  '#FF572270', '#79554870', '#607D8B70']
const types = ['语音', '转账', '语音通话', '视频', '文本', '动画表情', '图片', '其他']

const typeData = computed(() => {
  let t = {}//{type：count}
  props.msgList.forEach(item => {
    if (types.includes(item.TypeName)) {
      t[item.TypeName] = (t[item.TypeName] || 0) + 1
    } else {
      t['其他'] = (t['其他'] || 0) + 1
    }
  })
  return t
})
const typeDataByPerson = computed(() => {
  let t = new Map()//{name:{type：count}}
  let name;
  props.msgList.forEach(item => {
    name = !item.IsSender ? (item.talkerInfo?.Remark || item.talkerInfo?.strNickName) : '我'
    if (!t[name]) {
      t[name] = {}
    }
    if (types.includes(item.TypeName)) {
      t[name][item.TypeName] = (t[name][item.TypeName] || 0) + 1
    } else {
      t[name]['其他'] = (t['其他'] || 0) + 1
    }
  })
  return t
})
//各类型排序
const typeCountList = computed(() => {
  let t = Object.keys(typeData.value).map(type => type).sort((a, b) => typeData.value[b] - typeData.value[a])
  return t.map(type => {
    return {
      type: type,
      count: typeData.value[type],
      rate: (typeData.value[type] / props.msgList.length * 100).toFixed(1) + '%'
    }
  })
})

//每种类型的最大消息数量
const maxCountOfType = computed(() => {
  let t = {}//{type:{max,user}}
  types.forEach(type => {
    Object.keys(typeDataByPerson.value).forEach(name => {
      if ((t[type]?.max || 0) < typeDataByPerson.value[name][type]) {
        t[type] = {
          user: name,
          max: (typeDataByPerson.value[name][type] || 0)
        }
      }
    })
  })
  return t
})

//聊天数前100的用户名列表
const top100NameList = computed(() => {
  let t = typeDataByPerson.value
  return Object.keys(t).map(name => name).sort((a, b) => {
    let aTotal = Object.keys(t[a] || {}).reduce((count, type) => count + (t[a][type] || 0), 0)
    let bTotal = Object.keys(t[b] || {}).reduce((count, type) => count + (t[b][type] || 0), 0)
    return bTotal - aTotal
  }).slice(0, 100)
})

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
        radius: ['30%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          color: '#999999',
          fontSize: 10
          // position: 'center'
        },
        // emphasis: {
        //   label: {
        //     show: true,
        //     fontSize: 15,
        //     fontWeight: 'bold'
        //   }
        // },
        labelLine: {
          show: true
        },
        color: colors,
        data: Object.keys(typeData.value).map(type => ({ value: typeData.value[type], name: type }))
      }
    ]
  };
  chartIns.value?.setOption(option)
}
function renderRadarChart() {
  const option = {
    tooltip: {},
    radar: {
      shape: 'circle',
      indicator:
        types.map(type => {
          return { name: type, max: maxCountOfType.value[type]?.max || 0 }
        }),
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      axisName: {
        fontSize: 10,
        color: "#999999"
      },
      splitArea: {
        show: false
      },
    },
    series: [
      {
        type: 'radar',
        symbol: 'none',
        lineStyle: {
          width: 1,
          opacity: 0.5
        },
        areaStyle: {
          opacity: 0.15
        },
        data:
          Object.keys(typeDataByPerson.value).filter(name => top100NameList.value.includes(name)).map(name => {
            return {
              value: types.map(type => {
                return typeDataByPerson.value[name][type] || 0
              }),
              name
            }
          })
      }
    ]
  }
  radarChartIns.value?.setOption(option)
}
</script>
<style lang="less" scoped>
.chat-type-chart {
  padding: 10px;

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
    display: flex;

    .chart-box {
      flex: 1;
      overflow: hidden;
      background-color: #fff;
      border-radius: 20px;
      margin-right: 5px;

      .chart {
        width: 100%;
        margin: 0 auto;
      }
    }
  }

  .legend {
    position: relative;
    width: 100%;
    top: -20px;
    text-align: center;
    // display: flex;
    // flex-direction: column;
    // justify-content: center;
    // flex-wrap: wrap;

    .item {
      font-size: 12px;
      color: #999;
      display: flex;
      align-items: center;
      margin-right: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

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