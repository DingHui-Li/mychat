<template>
  <div :class="['suggest']" ref="containerEl">
    <div class="title">AI回复建议
      <PulseLoading v-if="loading" />
      <el-icon class="close" @click="handleRemoveAction()">
        <Close />
      </el-icon>
    </div>
    <div class="tip" v-if="result.html">
      by <span>{{ result.model }}</span>.{{ moment(result.time).format('LLL') }}.仅供参考
      <div class="btn" v-if="!loading" @click="startAnaly">重新建议</div>
    </div>
    <div class="tip">
      小建议：先进行"AI分析"再获取回复建议会更准确
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
import { msgList } from '../../store/msg'
import { activeSession } from '../../store/session'
import { getAiReply } from '@renderer/store/ai'
import { handleRemoveAction } from '../../store/index'
import * as indexDB from '@renderer/util/indexDB.js'
import PulseLoading from '@renderer/components/pulseLoading.vue'

const result = ref({
  time: new Date().getTime(),
  model: "",
  html: ""
})
const loading = ref(false)
const reasonResult = ref('')
const containerEl = ref()

onMounted(async () => {
  try {
    let cache = await indexDB.read('AI-suggest', activeSession.value?.strUsrName)
    result.value = {
      time: cache.time,
      model: cache.model,
      html: await marked(cache.markdown)
    }
  } catch (err) {
    console.log(err)
    startAnaly()
  }
})

async function startAnaly() {
  loading.value = true
  try {
    let chatData = msgList.value.slice(-100).map(item => {
      return {
        sender: item.IsSender ? "我" : item.talkerInfo?.strNickName,
        sendMsg: item.TypeName == '文本' ? item.StrContent : `[${item.TypeName}]`,
        msgType: item.TypeName,
        time: item.CreateTime
      }
    })
    let prompts: Array<string> = []
    try {
      let cache = await indexDB.read('AI-analy', activeSession.value?.strUsrName)
      prompts.push(`根据以下的聊天内容分析和最近聊天记录给出对“我”的多种建议回复：\n聊天内容分析：\n${cache.markdown}`)
    } catch { }
    prompts.push(`${prompts.length ? '最近聊天记录：\n' : "根据以下的最近聊天记录给出对“我”的建议回复"}：\n${JSON.stringify(chatData)}`)
    getAiReply(prompts, true).then(async (res) => {
      let time = new Date().getTime()
      let str = ''
      let reasonStr = ''
      result.value = {
        time,
        model: res.model,
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

      indexDB.update('AI-suggest', {
        userName: activeSession.value?.strUsrName,
        talker: activeSession.value?.Remark || activeSession.value?.strNickName,
        avatar: activeSession.value?.avatar,
        time: time,
        model: res.model,
        markdown: str,
      })
      loading.value = false
    }).catch(err => {
      ElMessage.error(err?.msg || "未知错误")
      handleRemoveAction()
    }).finally(() => {
      loading.value = false
    })
  } catch {
    loading.value = false
  }
}
</script>
<style lang="less" scoped>
.suggest {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #fff;
  padding: 10px 15px;
  padding-top: 0;
  margin-left: 5px;
  border-radius: 25px;
  min-height: 40vh;
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
      border-radius: 7px;
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
  }

  .reason {
    font-size: 12px;
    color: #333;
    border-radius: 10px;
    padding: 10px;
    background-color: #f7f7f7;
  }

  &:deep(.content) {
    border-top: 1px solid #eee;
    padding-top: 10px;
    outline: none;
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