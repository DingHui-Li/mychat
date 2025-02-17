<template>
  <div class="chat-chatDistribution">
    <div class="title">{{ selectYear }}年共有 {{ totalCountOfYear }} 条聊天
      <el-select class="years" v-model="selectYear">
        <el-option v-for="year in yearList" :label="year" :value="year" :key="year"></el-option>
      </el-select>
    </div>
    <div class="publish-count">
      <div class="chart">
        <div class="chart-box">
          <div class="week-indicate">
            <div class="item">周一</div>
            <div class="item">周四</div>
            <div class="item">周日</div>
          </div>
          <div class="week" v-for="(week, index) in weekListOfYear" @click="handleClick"
            :style="`justify-content: ${index == 0 ? 'flex-end' : 'flex-start'};`">
            <div class="day indicate" v-if="week[0]">
              <span v-if="index == 1 || (index > 0 && weekListOfYear[index - 1][0]?.month != week[0]?.month)">
                {{ week[0].month }}月
              </span>
              <!-- <span v-if="index % 7 == 1">{{ week[0].month }}月</span> -->
            </div>
            <div :class="['day', data[day.date] && 'active', new Date(day.date).getMonth() % 2 == 0 && 'stripe']"
              v-for="day in week"
              :data-tip="`${moment(new Date(day.date)).format('L')}有 ${data[day.date]?.length} 条聊天`">
              <div class="box" :style="`opacity:${1 - (8 - data[day.date]?.length) / 10}`" :data-date="day.date"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { msgList, scrollToMsg } from '../../../store/msg'
import moment from 'moment'

let selectYear = ref(new Date().getFullYear())
let data = ref<{ [key: string]: Array<Msg> }>({})
let totalCountOfYear = ref<Number>(0)
let yearList = ref([new Date().getFullYear()])

let weekListOfYear = computed(() => {
  let t: Array<Array<{ date: string, week: number, month: number }>> = []
  let firstDay = new Date(`${selectYear.value}/1/1`)
  let totalDayNum = 0
  for (let i = 1; i <= 12; i++) {
    totalDayNum += getDateLengthOfMonth(selectYear.value, i)
  }
  let week: Array<{ date: string, month: number, week: number }> = []
  for (let i = 0; i < totalDayNum; i++) {
    let date = new Date(firstDay.getTime() + i * 86400000)
    week.push({
      date: moment(date).format('L'),
      month: date.getMonth() + 1,
      week: date.getDay()
    })
    if (date.getDay() == 0) {
      t.push(week)
      week = []
    }
  }
  t.push(week)
  // console.log(t)
  return t
})

watch(selectYear, () => {
  getData()
}, { immediate: true })

function getDateLengthOfMonth(year: number, month: number) {
  let date = new Date(year, month, 0)
  return date.getDate()
}

function getData() {
  let t: { [key: string]: Array<Msg> } = {};
  let years = {}
  let totalCount = 0
  msgList.value.forEach((element: Msg) => {
    let date = new Date(element.CreateTime * 1000)
    let dateStr = moment(date).format('L')
    let year = date.getFullYear()
    years[year] = 1
    if (year == selectYear.value) {
      if (t[dateStr]) {
        t[dateStr].push(element)
      } else {
        t[dateStr] = [element]
      }
      totalCount++
    }
  });
  data.value = t
  totalCountOfYear.value = totalCount
  yearList.value = Object.keys(years).map(i => Number(i))
}

function handleClick(e: any) {
  let date = e.target.dataset.date
  if (data.value[date]) {
    scrollToMsg(data.value[date][0]?.index)
  }
}
</script>
<style lang="less" scoped>
.chat-chatDistribution {
  position: relative;
  z-index: 1;
  background-color: transparent;
  color: #333;
}

.title {
  font-size: 12px;
  padding-bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  margin-bottom: 10px;
  color: #999;

  .years {
    width: 100px;
  }
}

.publish-count {

  .week-indicate {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 10px;
    margin-right: 5px;
    padding-top: 15px;
    white-space: nowrap;
  }

  .chart {
    flex: 1;
    overflow: hidden;
    display: flex;
    border-radius: 5px;
    margin-right: 10px;
    justify-content: center;
    box-sizing: border-box;

    .chart-box {
      display: flex;
      overflow: auto;
      width: fit-content;
      padding-bottom: 5px;

      &::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }

      &::-webkit-scrollbar-track {
        background: #f9f9f9;
      }

      &::-webkit-scrollbar-thumb {
        background: #eee;
        border-radius: 10px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: #e0e0e0;
      }
    }

    .week {
      display: flex;
      flex-direction: column;

      .day {
        position: relative;
        width: 10px;
        height: 10px;
        padding: 1px;

        &.stripe {
          .box {
            border-radius: 50%;
          }
        }

        .box {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          background-color: #f5f5f5;
          border-radius: 2px;
        }

        &.indicate {
          background-color: transparent;
          font-size: 10px;
          margin-bottom: 5px;
          text-align: center;
          white-space: nowrap;
        }

        &.active {
          .box {
            background-color: var(--el-color-primary);
          }

          &::before {
            content: attr(data-tip);
            position: fixed;
            z-index: 2;
            transform: translate(-50%, -110%);
            background-color: #fff;
            font-size: 12px;
            white-space: nowrap;
            padding: 5px 10px;
            border-radius: 5px;
            box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.08);
            pointer-events: none;
            opacity: 0;
            transition: all .5s;
            color: var(--el-color-primary);
            font-weight: bold;
          }

          &:hover {
            .box {
              filter: brightness(60%);
            }

            &::before {
              display: block;
              opacity: 1;
            }
          }
        }
      }
    }
  }
}
</style>