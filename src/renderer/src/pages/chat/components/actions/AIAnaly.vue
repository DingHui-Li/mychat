<template>
  <div :class="['ai-analy']" ref="containerEl">
    <div class="title">AI分析
      <PulseLoading v-if="loading" />
      <el-icon class="close" @click="handleRemoveAction()">
        <Close />
      </el-icon>
    </div>
    <div class="tip" v-if="result.html">
      by <span>{{ result.model }}</span>.{{ moment(result.time).format('LLL') }}.仅供参考
      <div class="btn" v-if="!loading" @click="startAnaly">重新分析</div>
    </div>
    <div :class="['time', loading && 'disabled']" v-if="msgList.length">
      分析范围：<span v-if="lengthOverflow">内容过长已截取时间范围：</span> <span class="t">{{ moment(filterTime[0]).format('LLL') }}~{{
    moment(filterTime[1]).format('LLL') }}
        <el-config-provider :locale="zhCn">
          <el-date-picker v-model="filterTime" type="datetimerange" unlink-panels range-separator="To"
            start-placeholder="开始日期" end-placeholder="结束日期" :shortcuts="shortcuts" size="large" :editable="false"
            :clearable="false" @change="startAnaly" />
        </el-config-provider>
      </span>
    </div>
    <div class="reason" v-html="reasonResult" v-if="reasonResult && !result.html"></div>
    <div class="content" v-html="result.html"></div>
  </div>
</template>
<script setup lang="ts">
import moment from 'moment'
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { msgList, chatRoomInfo } from '../../store/msg'
import { activeSession } from '../../store/session'
import { getAiReply } from '@renderer/store/ai'
import { handleRemoveAction } from '../../store/index'
import * as indexDB from '@renderer/util/indexDB.js'
import { shortcuts } from './_com_/export'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import PulseLoading from '@renderer/components/pulseLoading.vue'

const result = ref<{
  time: number,
  model: string,
  html: string,
  timeRange: Array<number>
}>({
  time: new Date().getTime(),
  model: "",
  html: "",
  timeRange: []
})
const containerEl = ref()
const reasonResult = ref('')
const loading = ref(false)
const filterTime = ref([
  new Date(msgList.value[0].CreateTime * 1000),
  new Date(msgList.value[msgList.value.length - 1].CreateTime * 1000)
])

const eachRoundMaxLength = 60000//每对话的最大字符数
const lengthOverflow = ref(false)//长度超出

onMounted(async () => {
  try {
    let cache = await indexDB.read('AI-analy', activeSession.value?.strUsrName)
    let timeRange = cache.timeRange
    result.value = {
      time: cache.time,
      model: cache.model,
      html: await marked(cache.markdown),
      timeRange
    }
    filterTime.value = [new Date(timeRange[0]), new Date(timeRange[1])]
  } catch (err) {
    console.log(err)
    startAnaly()
  }
})

async function startAnaly() {
  loading.value = true
  try {
    let startTime = filterTime.value[0].getTime() / 1000
    let endTime = filterTime.value[1].getTime() / 1000
    let chatData: Array<any> = []
    msgList.value.forEach(item => {
      if (item.CreateTime >= startTime && item.CreateTime <= endTime) {
        chatData.push({
          sender: item.IsSender ? "我" : item.talkerInfo?.strNickName,
          sendMsg: item.TypeName == '文本' ? item.StrContent : `[${item.TypeName}]`,
          msgType: item.TypeName,
          time: item.CreateTime
        })
      }
    })
    if (!chatData.length) {
      ElMessage({
        message: "所选日期无聊天数据",
        type: 'warning',
      })
      if (result.value.timeRange.length) {
        filterTime.value = [
          new Date(result.value.timeRange[0]),
          new Date(result.value.timeRange[1])
        ]
      }
      loading.value = false
      return
    }
    const condition = `从核心话题与事件、 关系分析、聊天节奏、互动方式、情感波动、情感表达、用户画像、隐含需求与建议，最后进行总结。`
    let prompts: Array<string> = []
    let page = 1
    let length = 0
    for (let i = chatData.length; i >= 0; i -= 100) {
      let sliceArr = chatData.slice(Math.max(i - 100, 0), i)
      length += JSON.stringify(sliceArr).length
      if (sliceArr.length) {
        filterTime.value[0] = new Date(sliceArr[0].time * 1000)
        if (i == chatData.length) {
          filterTime.value[1] = new Date(sliceArr[sliceArr.length - 1].time * 1000)
          let t = `群名为"${activeSession.value?.strNickName}"的群`
          prompts.push(`分析以下${chatRoomInfo.value ? t : ""}聊天，要求：${condition}：\n第1页：\n${JSON.stringify(sliceArr)}`)
        } else {
          prompts.push(`第${page}页：\n${JSON.stringify(sliceArr)}`)
        }
      }
      page++
      lengthOverflow.value = false
      if (length >= eachRoundMaxLength) {
        lengthOverflow.value = true
        break
      }
    }
    getAiReply(prompts, true).then(async (res) => {
      let time = new Date().getTime()
      let str = ''
      let reasonStr = ''
      const timeRange = [filterTime.value[0].getTime(), filterTime.value[1].getTime()]
      result.value = {
        time,
        model: res.model,
        timeRange,
        html: ""
      }
      // @ts-ignore (define in dts)
      for await (const chunk of res.stream) {
        str += chunk.choices[0]?.delta?.content || '';
        reasonStr += chunk.choices[0]?.delta?.reasoning_content || '';
        if (reasonStr) {
          reasonResult.value = await marked(reasonStr)
        }
        if (str) {
          result.value.html = await marked(str)
        }
        containerEl.value.scroll({ top: containerEl.value?.scrollHeight, behavior: "smooth" })
      }

      indexDB.update('AI-analy', {
        userName: activeSession.value?.strUsrName,
        talker: activeSession.value?.Remark || activeSession.value?.strNickName,
        avatar: activeSession.value?.avatar,
        time: time,
        model: res.model,
        markdown: str,
        timeRange: timeRange
      })
      loading.value = false
    }).catch(err => {
      ElMessage.error(err?.message || err?.msg || "未知错误")
      console.log(err)
      handleRemoveAction()
    }).finally(() => {
      loading.value = false
    })
  } catch (err) {
    console.log(err)
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.ai-analy {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #fff;
  padding: 10px 15px;
  padding-top: 0;
  color: #333;

  .disabled {
    pointer-events: none;
    opacity: 0.7;
  }

  .title {
    position: sticky;
    z-index: 9;
    top: 0;
    color: #333;
    font-size: 18px;
    font-weight: bold;
    display: flex;
    align-items: center;
    background-color: #fff;
    padding: 10px 0;
  }

  .close {
    position: absolute;
    top: 15px;
    right: 0;
    font-size: 20px;
    color: #999;
    cursor: pointer;

    &:active {
      opacity: 0.7;
    }
  }

  .tip {
    font-size: 12px;
    color: #999;
    margin-bottom: 15px;

    span {
      color: var(--el-color-primary);
    }

    .btn {
      display: inline-block;
      margin-left: 15px;
      background-color: #FF5722;
      color: #fff;
      border-radius: 0;
      cursor: pointer;
      padding: 2px 10px;
      font-size: 12px;
      transition: all .3s;

      &:hover {
        opacity: 0.7;
      }
    }
  }

  .time {
    font-size: 12px;
    padding-bottom: 10px;
    margin-bottom: 10px;

    span {
      display: inline-block;
      position: relative;

      &.t {
        color: #FF5722;
        cursor: pointer;
        text-decoration: underline;

        &:hover {
          opacity: 0.7;
        }
      }

      &:deep(.el-date-editor) {
        top: 0;
        left: 0;
        position: absolute;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden;
        opacity: 0;
        cursor: pointer;

        input {
          display: none;
        }
      }
    }
  }

  .reason {
    font-size: 12px;
    color: #333;
    border-radius: 10px;
    padding: 10px;
    background-color: #f7f7f7;
  }

  &:deep(.content) {
    cursor: text;
    user-select: text;

    h3,
    h4,
    strong {
      font-weight: bold;
    }

    strong {
      font-size: 15px;
    }

    li {
      font-size: 14px;
    }

    p {
      font-size: 14px;
    }

    h4 {
      border-top: 1px solid #eee;
      margin-top: 10px;
      padding-top: 10px;
    }

    hr {
      display: none;
    }
  }
}
</style>