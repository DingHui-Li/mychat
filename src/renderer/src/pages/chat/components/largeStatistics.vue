<template>
  <div class="large-statistics" v-if="activeSession">
    <el-icon class="close" @click="showLargeStatistics = false">
      <Close />
    </el-icon>
    <div class="page-box" ref="pageEl" v-if="!refreshing">
      <div class="header">
        <div class="title">
          <span v-if="chatRoomInfo"><span class="name">{{ activeSession.strNickName }}</span>的聊天统计分析</span>
          <span v-else>与<span class="name">{{ activeSession.Remark || activeSession.strNickName }}</span>的聊天统计分析</span>
          <template v-if="!saving">
            <el-tooltip content="保存为图片">
              <el-button @click="handleSave" :icon="Download" :disabled="AIingCount > 0" circle
                style="margin-left: 10px;"></el-button>
            </el-tooltip>
            <el-tooltip content="刷新图表">
              <el-button @click="handleRefresh" :icon="Refresh" :disabled="AIingCount > 0" circle
                style="margin-left: 10px;"></el-button>
            </el-tooltip>
            <el-button class="ai-btn" @click="handleAIAnaly" style="margin-left: 10px;" type="primary"
              :disabled="AIingCount > 0" :loading="AIingCount > 0">AI解读
            </el-button>
            <el-button @click="AISetting.show = true" :icon="Operation" type="primary"
              style="margin: 0;margin-left:-2px;border-radius: 0 5px 5px 0;"></el-button>
          </template>
        </div>
        <div class="subtitle">
          {{ moment(timeRange[0]).format('LLL') }} 至 {{ moment(timeRange[1]).format('LLL') }} 期间
          <div class="choose-date" v-if="!saving && !AIingCount">
            选择时间范围>
            <el-config-provider :locale="zhCn">
              <el-date-picker @change="onTimeChange" v-model="timeRange" type="datetimerange" unlink-panels
                range-separator="To" start-placeholder="开始日期" end-placeholder="结束日期" :shortcuts="shortcuts" size="large"
                :editable="false" />
            </el-config-provider>
          </div>
        </div>
      </div>
      <template v-if="filterMsgList.length">
        <comWordDistribution ref="chartEl1" :msgList="filterMsgList" />
        <comChatTypeChart ref="chartEl2" :msgList="filterMsgList" />
        <comDailyChatPeriods ref="chartEl3" :msgList="filterMsgList" />
        <comDailyChatDistribution ref="chartEl4" :msgList="filterMsgList" :timeRange="timeRange" />
      </template>
      <div class="from">by.
        <img src="@renderer/assets/icon.png" alt="">
        mychat
      </div>
      <el-dialog v-model="AISetting.show">
        <div class="AI-setting">
          <el-form label-width="120px">
            <el-form-item label="AI风格">
              <el-select v-model="AISetting.style" style="width: 120px">
                <el-option v-for="item in ['专业分析师', '社交达人', '情感大师']" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="结果内容长度">
              <el-select v-model="AISetting.content" style="width: 120px">
                <el-option v-for="item in ['简短', '普通', '详细']" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="清空AI结果缓存">
              <el-button @click="clearCache">清空</el-button>
            </el-form-item>
          </el-form>
          <div style="font-size: 12px;color: #999;">提示：AI只分析以下图表中的数据，而不是原始聊天对话，结果仅供参考。</div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script setup lang="ts">
import { activeSession } from '../store/session'
import { chatRoomInfo, msgList } from '../store/msg'
import { showLargeStatistics } from '../store/index'
import { Close, Download, Refresh, Operation } from '@element-plus/icons-vue'
import { ref, nextTick, onMounted, watch } from 'vue'
import moment from 'moment';
import comDailyChatDistribution from './largeStatistics/dailyChatDistribution.vue'
import comDailyChatPeriods from './largeStatistics/dailyChatPeriods.vue'
import comWordDistribution from './largeStatistics/wordDistribution.vue'
import comChatTypeChart from './largeStatistics/chatTypeChart.vue'
import html2canvas from 'html2canvas'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { shortcuts } from './actions/_com_/export'
import { AISetting, AIingCount } from './largeStatistics/useAI'

const pageEl = ref()
const saving = ref(false)
const refreshing = ref(false)
const chartEl1 = ref()
const chartEl2 = ref()
const chartEl3 = ref()
const chartEl4 = ref()
const timeRange = ref<Array<Date>>([new Date(msgList.value[0].CreateTime * 1000), new Date(msgList.value[msgList.value.length - 1].CreateTime * 1000)])
const filterMsgList = ref<Array<Msg>>([])
const cacheKey = `statistics-time-range-${activeSession.value?.strUsrName}`
try {
  if (localStorage[cacheKey]) {
    let t = JSON.parse(localStorage[cacheKey])
    timeRange.value = [new Date(t[0]), new Date(t[1])]
  }
} catch { }

onMounted(() => {
  AIingCount.value = 0
  setTimeout(() => {
    nextTick(() => {
      getData()
    })
  }, 3);
})
watch(timeRange, () => {
  AISetting.value.timeRange = timeRange.value
}, { immediate: true })

function onTimeChange() {
  localStorage[cacheKey] = JSON.stringify([timeRange.value[0].getTime(), timeRange.value[1].getTime()])
  getData()
}
function getData() {
  let start = timeRange.value[0]?.getTime() / 1000
  let end = timeRange.value[1]?.getTime() / 1000
  handleRefresh()
  filterMsgList.value = msgList.value.filter(item => {
    return item.CreateTime >= start && item.CreateTime <= end
  })
}

function handleSave() {
  saving.value = true
  nextTick(() => {
    try {
      html2canvas(pageEl.value).then(canvas => {
        const dataURL = canvas.toDataURL('image/png'); // 可以改为'image/jpeg'来生成JPEG格式的图片
        const link = document.createElement('a');
        link.download = `${chatRoomInfo.value ? "" : "与"}"${activeSession.value?.strNickName}"的聊天统计分析报告.png`; // 图片文件名
        link.href = dataURL;
        link.click();
      })
    } finally {
      saving.value = false
    }
  })
}
function handleRefresh() {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
  }, 10);
}

function handleAIAnaly() {
  chartEl1.value?.AIAnaly()
  chartEl2.value?.AIAnaly()
  chartEl3.value?.AIAnaly()
  chartEl4.value?.AIAnaly()
}
function clearCache() {
  chartEl1.value?.clearAICache()
  chartEl2.value?.clearAICache()
  chartEl3.value?.clearAICache()
  chartEl4.value?.clearAICache()
  AISetting.value.show = false
}
</script>
<style lang="less" scoped>
.large-statistics {
  color: #333;
  position: fixed;
  z-index: 99;
  width: 100%;
  height: 100%;
  overflow: auto;
  min-width: 600px;
  background-color: #f9f9f9;

  .page-box {
    padding: 10px;
    height: fit-content;
    background-color: #f5f5f5;

    &:deep(hr) {
      margin: 8px 0;
      border-color: rgba(0, 0, 0, 0.06);
      border-width: 1px;
    }

    &:deep(.label) {
      position: relative;
      // padding-left: 10px;
      width: fit-content;
      margin-bottom: 5px;

      &::before {
        position: absolute;
        left: 0;
        bottom: -1px;
        transform: translateY(-50%);
        content: '';
        width: 100%;
        height: 6px;
        background-color: var(--el-color-primary);
        // border-radius: 5px;
        opacity: 0.8;
      }
    }
  }

  .title {
    position: relative;
    font-size: 25px;
    display: flex;
    align-items: center;
    padding-left: 10px;

    .name {
      color: var(--el-color-primary);
      font-weight: bold;
    }
  }

  .choose-date {
    position: relative;
    margin-left: 15px;
    color: #FF5722;

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

  .close {
    position: fixed;
    z-index: 9;
    font-size: 30px;
    top: 30px;
    right: 20px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  .ai-btn {
    border-radius: 5px 0 0 5px;
  }

  &:deep(.el-select) {
    left: -2px;

    .el-select__wrapper {
      background-color: var(--el-color-primary);
      border: none;
      box-shadow: none;

      .el-select__selected-item {
        color: #fff;
      }
    }
  }

  .subtitle {
    display: flex;
    align-items: center;
    font-size: 15px;
    color: #999;
    margin-bottom: 5px;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    padding-left: 10px;
  }

  .from {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 12px;
    color: #333;
    text-align: right;
    padding-right: 15px;
    padding-top: 5px;

    img {
      width: 15px;
      height: 15px;
      margin: 0 4px;
    }
  }
}
</style>