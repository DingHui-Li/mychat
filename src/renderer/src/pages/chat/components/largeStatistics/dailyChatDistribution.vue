<template>
  <div class="daily-chat-distribution">
    <div class="label">
      每日聊天分布
      <comLoading v-if="AIing" />
    </div>
    <div class="charts">
      <div class="desc" v-html="AIResult"></div>
      <div class="desc" v-if="!AIResult" style="margin-bottom: 0;">
        在<span>{{ periodTotalDayCount }}</span>天里,
        有<span>{{ Object.keys(dailyData).length
          }}</span>天有过交流，占比 <span>{{ (Object.keys(dailyData).length / periodTotalDayCount * 100).toFixed(1) }}%</span>;
        <span>{{ new Date(maxPeriod[0]).format('yyyy年M月') }}</span>荣登「话痨冠军月」;
        <span>{{ new Date(maxCountDay).format('M月d日') }}</span>单日输出 <span>{{ dailyData[maxCountDay] }}</span> 条.
      </div>
      <div class="desc" v-if="!AIResult">
        每人平均发送 <span>{{ chatRoomCountData.avg }}</span> 条消息;
        <template v-if="!chatRoomInfo">
          双方消息量相差< <span>{{ countDeviation * 100 }}%</span>({{ countDeviation < 0.15 ? '高度均衡' : countDeviation < 0.3
        ? '轻度失衡' : countDeviation < 0.5 ? '显著失衡' : '极端垄断' }}). </template>
              <template v-else>
                有 <span>{{ chatRoomCountData.greaterRate * 100 }}%</span>的用户相对活跃.
                话题主导者: <span style="max-width: 50px;overflow: hidden;text-overflow: ellipsis;">{{
        chatRoomCountData.activeUser?.name }}</span>;
                个体偏离度<span>{{ chatRoomCountData.deviation * 100 }}%</span>
                ({{ chatRoomCountData.deviation < 0.3 ? '轻度主导' : chatRoomCountData.deviation < 0.5 ? '显著主导' : '完全主导' }})
                  </template>
      </div>
      <div class="item" ref="itemEl">
        <div class="chart" ref="lineChartEl" :style="`height:${itemEl?.clientWidth / 2}px`"></div>
        <div class="tip" style="text-align: left;padding-left: 25px">每天聊天数量</div>
      </div>
      <div class="item">
        <div class="chart" ref="dotChartEl" :style="`height:${itemEl?.clientWidth / 2}px`"></div>
        <div class="tip">每天每人聊天数量</div>
      </div>
    </div>
    <div class="calendar-chart">
      <div class="chart" ref="calendarChartEl" :style="`height:${yearList.length * 180}px`"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, computed, shallowRef, ref, onMounted, nextTick, defineExpose } from 'vue'
import * as echarts from 'echarts';
import { chatRoomInfo } from '../../store/msg';
import comLoading from '@renderer/components/pulseLoading.vue'
import useAI from './useAI'

const { AIing, callAI, AIResult, clearAICache } = useAI('dailyChatDistribution')
defineExpose({
  AIAnaly: () => {
    if (!Object.keys(dailyDataForPerson).length) return
    let prompt = `分析以下各用户不同时间消息发送数量的数据:\n${JSON.stringify(dailyDataForPerson.value)}`
    callAI([prompt])
  },
  clearAICache
})

const props = defineProps<{ msgList: Array<any>, timeRange: Array<Date> }>()
const itemEl = ref()
const lineChartEl = ref()
const lineChartIns = shallowRef()
const dotChartEl = ref()
const dotChartIns = shallowRef()
const calendarChartEl = ref()
const calendarChartIns = shallowRef()

const dailyData = computed(() => {
  let t = {}//{date:count}
  let date;
  props.msgList.forEach(item => {
    date = new Date(item.CreateTime * 1000).format('yyyy/MM/dd')
    t[date] = (t[date] || 0) + 1
  })
  return t
})

const dailyDataForPerson = computed(() => {
  let t = {}//{ name: { date: count } }
  let date;
  let name;
  props.msgList.forEach(item => {
    name = !item.IsSender ? (item.talkerInfo?.Remark || item.talkerInfo?.strNickName) : '我'
    date = new Date(item.CreateTime * 1000).format('yyyy/MM/dd')
    if (!t[name]) {
      t[name] = {}
    }
    if (!t[name][date]) {
      t[name][date] = 0
    }
    t[name][date]++
  })
  return t
})

const yearList = computed(() => {
  let dateList = Object.keys(dailyData.value)
  let startYear = new Date(dateList[0]).getFullYear()
  let endYear = new Date(dateList[dateList.length - 1]).getFullYear()
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => {
    return endYear - i
  })
})

//消息时间跨度(天)-number
const periodTotalDayCount = computed(() => {
  let t = (props.timeRange[1]?.getTime() - props.timeRange[0]?.getTime()) / 86400000
  return Math.floor(t)
})
//消息高峰日期(月)-string
const maxPeriod = computed(() => {
  return findMaxPeriod(dailyData.value)
})
//消息高峰日期(日)-string
const maxCountDay = computed(() => {
  return Object.keys(dailyData.value).sort((a, b) => {
    return dailyData.value[b] - dailyData.value[a]
  })[0]
})
//绝对差值,验证双方消息量是否均衡
const countDeviation = computed(() => {
  if (chatRoomInfo.value) return 0
  let users = Object.keys(dailyDataForPerson.value)
  let user1Count = Object.keys(dailyDataForPerson.value[users[0]]).reduce((t, date) => t + dailyDataForPerson.value[users[0]][date], 0)
  let user2Count = Object.keys(dailyDataForPerson.value[users[1]]).reduce((t, date) => t + dailyDataForPerson.value[users[1]][date], 0)
  return Number((Math.abs(user1Count - user2Count) / (user1Count + user2Count)).toFixed(1))
})
//群聊
const chatRoomCountData = computed(() => {
  const users = Object.keys(dailyDataForPerson.value)
  let avg = Number((props.msgList.length / users.length).toFixed(0))
  let greaterUserCount = 0
  let t: any = []
  users.forEach(user => {
    let userTotal = Object.keys(dailyDataForPerson.value[user]).reduce((t, date) => t + dailyDataForPerson.value[user][date], 0)
    if (userTotal >= avg) {
      greaterUserCount++
    }
    t.push({ name: user, count: userTotal })
  })
  let activeUser = t.sort((a, b) => b.count - a.count)[0]
  return {
    avg,
    greaterRate: Number((greaterUserCount / users.length).toFixed(1)),
    activeUser,
    deviation: Number((Object.keys(dailyDataForPerson.value[activeUser.name]).length / avg).toFixed(1))
  }
})

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

function getYearDataByDailyData(year) {
  let t: Array<Array<any>> = []
  Object.keys(dailyData.value).map(date => {
    if (date.includes(year)) {
      t.push([date.replace(/\//g, '-'), dailyData.value[date]])
    }
  })
  return t
}

function initChart() {
  lineChartIns.value = echarts.init(lineChartEl.value)
  dotChartIns.value = echarts.init(dotChartEl.value)
  calendarChartIns.value = echarts.init(calendarChartEl.value)
  renderLineChart()
  renderDotChart()
  renderCalendarChart()
}

function renderLineChart() {
  const data = Object.keys(dailyData.value).map(day => {
    return [new Date(day), dailyData.value[day]]
  })
  const option = {
    tooltip: {
      trigger: 'axis',
      position: function (pt) {
        return [pt[0], '10%'];
      },
      axisPointer: {
        type: 'line'
      }
    },
    grid: {
      show: false,
      height: lineChartEl.value.clientHeight - 60 || "75%",
      width: lineChartEl.value.clientWidth - 40 || '85%',
      top: 20,
      left: 30
    },
    xAxis: {
      type: 'time',
      axisTick: {
        show: true,
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
        rotate: 45,
        fontSize: 8,
        color: "#999999",
        formatter: function (value) {
          return new Date(value).format('yy/M/d');
        },
      }
    },
    yAxis: {
      type: 'value',
      // show: false,
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
      axisLabel: {
        fontSize: 8,
        color: "#999999",
        formatter: function (value) {
          return value >= 1000 ? ((value / 1000).toFixed(1) + 'k') : value
        },
      }
    },
    series: [
      {
        name: '聊天量',
        type: 'bar',
        // smooth: true,
        symbol: 'none',
        // color: '#333333',
        large: true,
        data: data,
      }
    ]
  }
  lineChartIns.value?.setOption(option)
}

function renderDotChart() {
  let t = dailyDataForPerson.value
  //取聊天数前10的用户,避免渲染过多重叠
  let top10NameList = Object.keys(t).map(name => name).sort((a, b) => {
    let aTotal = Object.keys(t[a] || {}).reduce((count, date) => count + (t[a][date] || 0), 0)
    let bTotal = Object.keys(t[b] || {}).reduce((count, date) => count + (t[b][date] || 0), 0)
    return bTotal - aTotal
  }).slice(0, 10)
  const option = {
    tooltip: {
      // trigger: 'axis',
      showDelay: 0,
      formatter: function (params) {
        return (
          params.seriesName +
          ' :<br/>' +
          new Date(params.value[0]).format('yyyy年M月d日') + ': ' +
          params.value[1] + '条'
        );
      },
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      show: false,
      height: lineChartEl.value.clientHeight - 60 || "75%",
      width: lineChartEl.value.clientWidth - 40 || '85%',
      top: 20,
      left: 25
    },
    xAxis: [
      {
        type: 'time',
        scale: true,
        axisTick: {
          show: true,
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
          rotate: 45,
          fontSize: 8,
          color: "#999999",
          formatter: function (value) {
            return new Date(value).format('yy/M/d');
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "rgba(0,0,0,0.03)"
          }
        },
      }
    ],
    yAxis: {
      type: 'value',
      // show: false,
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
      axisLabel: {
        fontSize: 8,
        color: "#999999",
        formatter: function (value) {
          return value >= 1000 ? ((value / 1000).toFixed(1) + 'k') : value
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "rgba(0,0,0,0.03)"
        }
      },
    },
    series: Object.keys(dailyDataForPerson.value).map(name => {
      if (!top10NameList.includes(name)) return null
      return {
        name: name,
        type: 'scatter',
        symbolSize: function (val) {
          if (Object.keys(dailyDataForPerson.value).length > 2) {
            return 5
          } else {
            let size = Math.max(val[1], 10)
            size = Math.min(size, 20)
            return size
          }
        },
        emphasis: {
          focus: 'series'
        },
        data: Object.keys(dailyDataForPerson.value[name]).map(date => {
          return [new Date(date), dailyDataForPerson.value[name][date] || 0]
        }),
      }
    })
  }
  dotChartIns.value?.setOption(option)
}

function renderCalendarChart() {

  const option = {
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return (
          new Date(params.value[0]).format('yyyy年M月d日') + ': ' +
          params.value[1] + '条'
        );
      },
    },
    visualMap: {
      show: false,
      min: 0,
      max: 50,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: 'top',
      inRange: {
        color: ['#7879ef30', '#7879ef'],
        opacity: 1
      }
    },
    calendar:
      yearList.value?.map((year, i) => {
        return {
          range: year,
          top: 180 * i + 20,
          left: 60,
          cellSize: ['auto', 20],
          splitLine: {
            show: true,
            lineStyle: {
              color: "rgba(0,0,0,0.1)"
            }
          },
          itemStyle: {
            color: "transparent",
            borderColor: "rgba(0,0,0,0.02)"
          },
          dayLabel: {
            color: "#999999",
            fontSize: 10
          },
          monthLabel: {
            color: "#999999",
            fontSize: 10
          },
          yearLabel: {
            fontSize: 14,
            color: "#999999"
          }
        }
      }),
    series:
      yearList.value.map((year, i) => {
        return {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          calendarIndex: i,
          data: getYearDataByDailyData(year),
        }
      })
  }
  calendarChartIns.value?.setOption(option)
}

function findMaxPeriod(data, periodType = 'month') {
  const periodMap = {};
  const timePeriods = {
    'month': (dateStr) => {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${date.getMonth() + 1}`;
    }
  };

  // 按时间段聚合
  Object.entries(data).forEach(([dateStr, count]) => {
    const periodKey = timePeriods[periodType](dateStr);
    periodMap[periodKey] = (periodMap[periodKey] || 0) + count;
  });

  // 找出最大值
  return Object.entries(periodMap)
    .sort((a, b) => {
      // @ts-ignore (define in dts)
      return b[1] - a[1]
    })[0];
}

</script>
<style lang="less" scoped>
.daily-chat-distribution {
  width: 100%;
  // background-color: #fff;
  padding: 10px;
  border-radius: 10px;

  .label {
    position: relative;
    font-size: 20px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .action {
      .icon {
        font-size: 20px;
      }
    }
  }

  .charts {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 5px;

    &.enlarge {
      display: block;
    }

    .item {
      flex: 1;
      width: 50%;
      min-width: 250px;
      background-color: #fff;
      border-radius: 20px;
      margin-right: 5px;

      .chart {
        width: 100%;
        position: relative;
        margin: 0 auto;
        min-height: 210px;
      }
    }

    .desc {
      position: relative;
      width: 100%;
      background-color: transparent;
      font-size: 14px;
      color: #555;
      box-sizing: border-box;
      margin-bottom: 10px;

      span {
        font-weight: bold;
      }
    }

    .tip {
      font-size: 12px;
      text-align: right;
      color: #999;
      padding-right: 20px;
    }
  }

  .calendar-chart {
    background-color: #fff;
    border-radius: 20px;
    padding-top: 15px;
    padding-right: 20px;

    .chart {
      width: 100%;
    }
  }
}
</style>