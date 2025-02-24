<template>
  <div class="export">
    <div class="title">导出</div>
    <el-icon class="close" @click="handleRemoveAction()">
      <Close />
    </el-icon>
    <div class="label">选择时间范围</div>
    <el-config-provider :locale="zhCn">
      <el-date-picker v-model="filterTime" type="datetimerange" unlink-panels range-separator="To"
        start-placeholder="开始日期" end-placeholder="结束日期" :shortcuts="shortcuts" size="large" :editable="false" />
    </el-config-provider>
    <div class="label">选择消息类型</div>
    <el-select v-model="filterMsgType" multiple>
      <el-option v-for="item in msgTypeList" :key="item.key" :label="item.label" :value="item.key"
        :disabled="item.disabled" />
    </el-select>
    <el-button class="btn" type="primary" :disabled="disabled" style="margin-top: 60px;" @click="exportJSON">导出为
      JSON</el-button>
    <el-button class="btn" type="primary" :disabled="disabled" @click="exportTXT">导出为
      TXT</el-button>
    <el-button @click="exportHtmlPopup = true" :class="['btn']" type="primary" :disabled="disabled">导出为 HTML</el-button>
    <el-dialog v-model="exportHtmlPopup">
      <div class="export-html">
        <comExportHtml ref="exportHtmlEl" :filter-time="filterTime" :filter-msg-type="filterMsgType" />
      </div>
      <div class="actions">
        <el-button plain type="info" @click="exportHtmlPopup = false">取消</el-button>
        <el-button type="success" @click="exportHtml">导出</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
// import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { ref, computed, createSSRApp } from 'vue'
import { msgList, chatRoomInfo } from '../../store/msg'
import { activeSession } from '../../store/session'
import { handleRemoveAction } from '../../store/index'
import moment from 'moment';
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import comExportHtml from './_com_/exportHtml.vue'
import { renderToString } from '@vue/server-renderer';
import { shortcuts, msgStyle, msgTypeList } from './_com_/export'


const filterMsgType = ref(['文本'])
const filterTime = ref([
  new Date(msgList.value[0].CreateTime * 1000),
  new Date(msgList.value[msgList.value.length - 1].CreateTime * 1000)
])
const disabled = computed(() => {
  return !filterMsgType.value.length || !filterTime.value?.length
})
const exportHtmlPopup = ref(false)
const exportHtmlEl = ref()

function exportJSON() {
  let exportList: Array<any> = []
  let startTime = filterTime.value[0].getTime() / 1000
  let endTime = filterTime.value[1].getTime() / 1000
  // exportList = msgList.value.filter(item => {
  //   return item.CreateTime >= startTime && item.CreateTime <= endTime
  // })
  msgList.value.forEach(item => {
    if (item.CreateTime >= startTime && item.CreateTime <= endTime) {
      exportList.push({
        ...item,
        BytesExtra: "",
        CompressContent: ""
      })
    }
  })
  let fileName = getExportFileName('json')

  // @ts-ignore (define in dts)
  window.exportFile({
    content: JSON.stringify(exportList),
    name: fileName,
    type: ['json']
  }).catch(err => {
    console.log(err)
  })
}

function exportHtml() {
  let fileName = getExportFileName('html')
  console.log(exportHtmlEl.value)
  renderToString(createSSRApp(comExportHtml,
    {
      filterMsgType: filterMsgType.value,
      filterTime: filterTime.value
    })).then(html => {
      const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${fileName}</title>
        <style>
          ${msgStyle}
        </style>
      </head>
      <body style="margin:0;">
        ${html}
      </body>
      </html>
        `;
      // @ts-ignore(define in dts)
      window.exportFile({
        content: fullHtml,
        name: fileName,
        type: ['json']
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        exportHtmlPopup.value = false
      })
    })
}
function exportTXT() {
  let exportList: Array<any> = []
  let startTime = filterTime.value[0].getTime() / 1000
  let endTime = filterTime.value[1].getTime() / 1000
  msgList.value.forEach(item => {
    if (item.CreateTime >= startTime && item.CreateTime <= endTime) {
      exportList.push(`
      ${item.IsSender ? "我" : (item.talkerInfo.Remark || item.talkerInfo.strNickName || item.StrTalker)}
      ${new Date(item.CreateTime * 1000).format('yyyy-MM-dd hh:mm:ss')}
      ${item.TypeName == '文本' ? item.StrContent : ('[' + item.TypeName + ']')}\n
      `)
    }
  })
  let fileName = getExportFileName('txt')

  // @ts-ignore (define in dts)
  window.exportFile({
    content: exportList.join('\n'),
    name: fileName,
    type: ['txt']
  }).catch(err => {
    console.log(err)
  })
}

function getExportFileName(type = 'json') {
  let to = activeSession.value?.Remark || activeSession.value?.strNickName
  let time = `${moment(filterTime.value[0]).format('LLL')}至${moment(filterTime.value[1]).format('LLL')}`
  let fileName = `与${to}的聊天记录(${time}).${type}`
  if (chatRoomInfo.value) {
    fileName = `${to}_的聊天记录(${time}).${type}`
  }
  return fileName
}
</script>
<style lang="less" scoped>
.export {
  position: relative;
  width: 30vw;
  height: 100%;
  overflow: auto;
  background-color: #fff;
  padding: 10px 15px;
  color: #333;
  padding-bottom: 15px;

  &.disabled {
    pointer-events: none;
  }

  .title {
    color: #333;
    font-size: 18px;
    font-weight: bold;
  }

  .close {
    position: absolute;
    top: 15px;
    right: 15px;
    font-size: 20px;
    color: #999;
    cursor: pointer;

    &:active {
      opacity: 0.7;
    }
  }

  .label {
    margin-bottom: 5px;
    font-size: 14px;
    color: #999;
    margin-top: 15px;
  }

  &:deep(.el-date-editor) {
    border: none;
    box-shadow: none;
    background-color: #f5f5f5;
    border-radius: 10px;
  }

  .btn {
    width: 100%;
    text-align: center;
    padding: 10px;
    border-radius: 10px;
    background-color: var(--el-color-primary);
    font-size: 13px;
    color: #fff;
    margin: 0;
    margin-top: 10px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }

    &.is-disabled {
      opacity: 0.8;
      cursor: not-allowed;
    }
  }

  &:deep(.el-date-editor) {
    width: 100%;
  }

  &:deep(.el-button) {
    border-radius: 10px;
    padding: 20px;
  }
}

.disabled {
  opacity: 0.7;
  pointer-events: none;
  cursor: not-allowed;
}

.export-html {
  height: 60vh;
}

.actions {
  text-align: right;
  margin-top: 10px;
}
</style>./_com_/export