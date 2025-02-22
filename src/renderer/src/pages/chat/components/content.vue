<template>
  <div class="content" v-if="activeSession" v-loading="loading">
    <div class="info">
      <div class="left">
        <div class="name">{{ activeSession.Remark || activeSession.strNickName || "-" }}
          <span class="num" v-if="chatRoomInfo">({{ chatRoomInfo.UserNameList.length }})</span>
        </div>
      </div>
      <div class="actions">
        <el-tooltip content="获取实时消息" placement="left">
          <el-button @click="getRealtimeMsg" :loading="refreshing" :icon="Refresh" circle type="primary"></el-button>
        </el-tooltip>
      </div>
    </div>
    <div class="list">
      <VList ref="listEl" class="v-list" :data="msgList" #default="{ item, index }" style="height: 100%;"
        @scroll="onScroll">
        <comSingleMsg :key="item.localId" :data="item" :prev-msg="index > 0 && msgList[index - 1]" />
      </VList>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onActivated } from 'vue'
import { msgList, loading, chatRoomInfo, listEl, getMsgList } from '../store/msg'
import { activeSession } from '../store/session'
import comSingleMsg from './singleMsg.vue'
// @ts-ignore (define in dts)
import { VList } from "virtua/vue";
import { Refresh } from '@element-plus/icons-vue'
import { wxDbPath, getWxinfo } from '@renderer/store/wx'
import { ElMessage } from 'element-plus'

const refreshing = ref(false)

onActivated(() => {
  listEl.value?.scrollTo(Number(window.localStorage['chatPageScrollTop']))
})

function onScroll(e) {
  window.localStorage['chatPageScrollTop'] = e
}

function getRealtimeMsg() {
  refreshing.value = true
  getWxinfo().then(res => {
    if (res.msg) {
      ElMessage.error(res.msg)
    } else {
      fetch(`http://127.0.0.1:4556/api/syncrealtimedb?key=${res.key}&db_path=${res.wx_dir}&out_path=${wxDbPath.value}`)
        .then(async (response) => {
          const res = await response.json()
          if (res?.out_path) {
            //数据库文件更新后需要重新读取
            // @ts-ignore (define in dts)
            await window.initWxMsgDb(wxDbPath.value)
            getMsgList(activeSession.value?.strUsrName)
            ElMessage({
              message: '更新消息成功!',
              type: 'success',
            })
          }
        }).catch((err) => {
          ElMessage.error('更新消息错误!' + err,)
        }).finally(() => {
          refreshing.value = false
        })
    }
  }).catch(() => {
    refreshing.value = false
  })
}
</script>
<style lang="less" scoped>
.content {
  flex: 1;
  height: 100%;
  box-sizing: border-box;
  color: #333;
  overflow: hidden;
  display: flex;
  flex-direction: column;


  .info {
    position: relative;
    z-index: 2;
    top: 0;
    display: flex;
    align-items: center;
    padding: 10px;
    // border-bottom: 1px solid #eee;
    background-color: rgba(255, 255, 255, 0.8);
    width: 100%;

    .left {
      flex: 1;
      overflow: hidden;

      .name {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 20px;
        font-weight: bold;
      }

      .desc {
        font-size: 12px;
        color: #999;
        line-height: 12px;
      }
    }
  }

  .list {
    flex: 1;
    overflow: auto;
    padding: 10px;
    padding-right: 0;

    .v-list {
      &::-webkit-scrollbar {
        width: 15px;
        height: 10px;
      }

      &::-webkit-scrollbar-track {
        background: #fff;
      }

      &::-webkit-scrollbar-thumb {
        background: #7879EF70;
        border-radius: 10px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: #7879EF;
        width: 30px;
        height: 10px;
      }
    }
  }
}
</style>