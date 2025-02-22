<template>
  <div class="large-statistics" v-if="activeSession">
    <el-icon class="close" @click="showLargeStatistics = false">
      <Close />
    </el-icon>
    <div class="page-box" ref="pageEl" v-if="!refreshing">
      <div class="title">
        <span v-if="chatRoomInfo"><span class="name">{{ activeSession.strNickName }}</span>的聊天分析统计</span>
        <span v-else>与<span class="name">{{ activeSession.Remark || activeSession.strNickName }}</span>的聊天分析统计</span>
        <el-button v-if="!saving" @click="handleSave" :icon="Download" circle style="margin-left: 10px;"></el-button>
        <el-button v-if="!saving" @click="handleRefresh" :icon="Refresh" circle style="margin-left: 10px;"></el-button>
      </div>
      <div class="subtitle">
        {{ moment(timeRange[0]).format('LLL') }} 至 {{ moment(timeRange[1]).format('LLL') }} 期间
        <div class="choose-date" v-if="!saving">
          选择时间范围>
          <el-config-provider :locale="zhCn">
            <el-date-picker v-model="timeRange" type="datetimerange" unlink-panels range-separator="To"
              start-placeholder="开始日期" end-placeholder="结束日期" :shortcuts="shortcuts" size="large" :editable="false" />
          </el-config-provider>
        </div>
      </div>
      <comWordDistribution v-if="filterMsgList.length" :msgList="filterMsgList" />
      <comChatTypeChart :msgList="filterMsgList" />
      <comDailyChatPeriods :msgList="filterMsgList" />
      <comDailyChatDistribution :msgList="filterMsgList" :timeRange="timeRange" />
      <div class="from">by.
        <img src="@renderer/assets/icon.png" alt="">
        mychat
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { activeSession } from '../store/session'
import { chatRoomInfo, msgList } from '../store/msg'
import { showLargeStatistics } from '../store/index'
import { Close, Download, Refresh } from '@element-plus/icons-vue'
import { ref, computed, nextTick } from 'vue'
import moment from 'moment';
import comDailyChatDistribution from './largeStatistics/dailyChatDistribution.vue'
import comDailyChatPeriods from './largeStatistics/dailyChatPeriods.vue'
import comWordDistribution from './largeStatistics/wordDistribution.vue'
import comChatTypeChart from './largeStatistics/chatTypeChart.vue'
import html2canvas from 'html2canvas'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { shortcuts } from './actions/_com_/export'

const pageEl = ref()
const saving = ref(false)
const refreshing = ref(false)
const timeRange = ref<Array<Date>>([new Date(msgList.value[0].CreateTime * 1000), new Date(msgList.value[msgList.value.length - 1].CreateTime * 1000)])

const filterMsgList = computed(() => {
  let start = timeRange.value[0]?.getTime() / 1000
  let end = timeRange.value[1]?.getTime() / 1000
  handleRefresh()
  return msgList.value.filter(item => {
    return item.CreateTime >= start && item.CreateTime <= end
  })
})

function handleSave() {
  saving.value = true
  nextTick(() => {
    try {
      html2canvas(pageEl.value).then(canvas => {
        const dataURL = canvas.toDataURL('image/png'); // 可以改为'image/jpeg'来生成JPEG格式的图片
        const link = document.createElement('a');
        link.download = `${chatRoomInfo.value ? "" : "与"}"${activeSession.value?.strNickName}"的聊天分析统计.png`; // 图片文件名
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

  .title {
    position: relative;
    font-size: 20px;
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

  .subtitle {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #999;
    margin-bottom: 5px;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    padding-left: 10px;
  }

  .page-box {
    padding: 10px;
    height: fit-content;
    background-color: #f9f9f9;
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