<template>
  <div class="word-distribution">
    <div class="label">常用词
      <comLoading v-if="AIing" />
    </div>
    <div class="desc" v-html="AIResult"></div>
    <div class="word-cloud" ref="boxEl" v-loading="loading">
      <div class="chart-box" v-for="name in Object.keys(wordCountOfPerson)">
        <div class="chart" ref="wordChartEl" :style="`height:${(boxEl?.clientWidth - 20) / 4}px`"></div>
        <div class="tip" v-if="!chatRoomInfo">{{ name }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, ref, onMounted, nextTick, defineExpose } from 'vue'
import { chatRoomInfo } from '../../store/msg'
import * as echarts from 'echarts';
import 'echarts-wordcloud';
import comLoading from '@renderer/components/pulseLoading.vue'
import useAI from './useAI'

const { AIing, callAI, AIResult, clearAICache } = useAI('wordDistribution')

defineExpose({
  AIAnaly: () => {
    if (!Object.keys(wordCountOfPerson.value).length) return
    let prompt = `分析以下对话中出现的高频词汇数据：\n${JSON.stringify(wordCountOfPerson.value)}`
    callAI([prompt])
  },
  clearAICache
})

const props = defineProps<{ msgList: Array<any> }>()
const boxEl = ref()
const wordChartEl = ref()
const wordCountOfPerson = ref({})
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  let name;
  if (chatRoomInfo.value) {
    let wordCount = await getWordCount(props.msgList.map(item => {
      if (item.TypeName == '文本') {
        return item.StrContent
      }
      return ''
    }))
    wordCountOfPerson.value[props.msgList[0].StrTalker] = wordCount
  } else {
    let t = {}
    props.msgList.forEach(item => {
      name = !item.IsSender ? (item.talkerInfo?.Remark || item.talkerInfo?.strNickName) : '我'
      if (!t[name]) {
        t[name] = []
      }
      t[name].push(item)
    })
    for (const name of Object.keys(t)) {
      let wordCount = await getWordCount(t[name].map(item => {
        if (item.TypeName == '文本') {
          return item.StrContent
        }
        return ''
      }))
      wordCountOfPerson.value[name] = wordCount
    }
  }
  nextTick(() => {
    renderWordCloud()
    loading.value = false
  })
})

function getWordCount(list: Array<Msg>) {
  return fetch('http://127.0.0.1:4556/api/wordcut', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: list.join(';') })
  }).then(async (response) => {
    const res = await response.json()
    let t = {}
    res?.data.forEach(element => {
      if (element && element.length >= 2) {
        t[element] = (t[element] || 0) + 1
      }
    });
    let top200WordList = Object.keys(t).map(word => word).sort((a, b) => {
      return t[b] - t[a]
    }).slice(0, 500)
    let result = {}
    Object.keys(t).forEach(word => {
      if (top200WordList.includes(word)) {
        result[word] = t[word]
      }
    })
    return result
  }).catch(err => {
    console.log(err)
    return {}
  })
}

function renderWordCloud() {
  Object.keys(wordCountOfPerson.value).forEach((name, index) => {
    const wordChartIns = echarts.init(wordChartEl.value[index])
    let option = {
      series: {
        type: 'wordCloud',
        shape: 'square',
        keepAspect: false,
        left: 'center',
        top: 'center',
        width: '100%',
        height: '100%',
        right: null,
        bottom: null,
        sizeRange: [15, 30],
        rotationRange: [0, 0],
        gridSize: 8,
        drawOutOfBound: false,
        shrinkToFit: true,
        layoutAnimation: false,
        textStyle: {
          color: "#555555"
          // color: function () {
          //   // Random color
          //   return 'rgb(' + [
          //     Math.round(Math.random() * 150),
          //     Math.round(Math.random() * 150),
          //     Math.round(Math.random() * 150)
          //   ].join(',') + ')';
          // }
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            textShadowBlur: 10,
            textShadowColor: '#333'
          }
        },
        data: Object.keys(wordCountOfPerson.value[name]).map(word => {
          return {
            name: word,
            value: wordCountOfPerson.value[name][word],
          }
        })
      }
    }
    wordChartIns?.setOption(option)
  })
}
</script>
<style lang="less" scoped>
.word-distribution {
  width: 100%;
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

    &:deep(hr) {
      margin: 5px;
    }
  }

  .word-cloud {
    display: flex;
    flex-wrap: wrap;
    background-color: #fff;
    padding: 10px;
    border-radius: 20px;

    .chart-box {
      position: relative;
      flex: 1;
      min-width: 250px;
      min-height: 150px;
      border-radius: 20px;
      box-sizing: border-box;
      margin: 0 5px;
      padding: 5px;
      padding-bottom: 0;

      .tip {
        width: 100%;
        font-size: 12px;
        color: #999;
        text-align: right;
      }
    }
  }
}
</style>