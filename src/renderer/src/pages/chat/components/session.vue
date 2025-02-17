<template>
  <div :class="['session-list', loading && 'disabled']">
    <div style="margin-right: 5px;position: relative;height: 100%;">
      <VList ref="listEl" :data="sessionList" #default="{ item, index }" class="v-list">
        <div :key="item.strUsrName" :class="['item', index == activeSessionIndex && 'active']"
          @click="handleClick(index)">
          <div class="avatar">
            <img v-if="item.avatar" :src="item.avatar" alt="">
            <span v-else>{{ item.strNickName[0] }}</span>
          </div>
          <div class="info">
            <div class="name">
              <div class="nickname">
                {{ item.Remark || item.strNickName }}
              </div>
              <div class="time" v-if="item.nTime > 1000000">{{ moment(item.nTime * 1000).fromNow() }}</div>
            </div>
            <div class="content">{{ item.strContent }}</div>
          </div>
        </div>
      </VList>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getList, sessionList, activeSessionIndex, handleChooseSession, listEl } from '../store/session'
import { loading } from '../store/msg'
import { onMounted, onActivated } from 'vue'
// @ts-ignore (define in dts)
import { VList } from "virtua/vue";
import moment from 'moment'

async function handleClick(index) {
  handleChooseSession(index)
}

onMounted(() => {
  getList()
})
onActivated(() => {

  setTimeout(() => {
    if (activeSessionIndex.value >= 0) {
      listEl.value?.scrollToIndex(activeSessionIndex.value, { smooth: true })
    }
  }, 300);
})

</script>
<style lang="less" scoped>
.session-list {
  position: relative;
  color: #333;
  width: 250px;
  height: 100%;
  overflow: auto;
  margin-left: 5px;
  transition: all .3s;

  .v-list {
    height: 100%;
    padding: 10px 0;

    &::-webkit-scrollbar {
      width: 5px;
      height: 10px;
    }

    &::-webkit-scrollbar-track {
      background: #fff;
    }

    &::-webkit-scrollbar-thumb {
      background: #eee;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #e0e0e0;
      width: 10px;
      height: 10px;
    }
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .item {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    padding: 15px;
    cursor: pointer;
    transition: all .3s;
    height: 70px;
    box-sizing: border-box;
    border-radius: 15px;
    overflow: hidden;
    // transition: all .3s;

    &.active {
      background-color: #7879EF20;

      &:hover {
        opacity: 1;
      }
    }

    &:hover {
      opacity: 0.6;
    }

    &:active {
      opacity: 0.5;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background-color: #eee;
      margin-right: 10px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      align-items: center;
      font-size: 20px;
      font-weight: bold;
      color: #e0e0e0;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .info {
      flex: 1;
      overflow: hidden;
      white-space: nowrap;

      .name {
        display: flex;

        .nickname {
          font-size: 14px;
          font-weight: bold;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .time {
          font-size: 12px;
          color: #999;
        }
      }

      .content {
        font-size: 12px;
        color: #999;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>