<template>
  <div :id="'msg-' + data.MsgSvrID">
    <div class="msg-date" v-if="showDate"> {{ moment(data.CreateTime * 1000).format("LLLL") }}</div>
    <div class="system-msg" v-if="data.TypeName == '系统通知' || data.TypeName == '拍一拍'">
      {{ data.StrContent }}
    </div>
    <div :class="['single-msg', data.TypeName == '动画表情' && 'special']" v-else>
      <div class="avatar-box">
        <div class="avatar" v-if="!data.IsSender">
          <img v-if="data.talkerInfo?.avatar" :src="data.talkerInfo.avatar" referrerpolicy="no-referrer">
          <span v-else>
            <span v-if="talkerDisplayName">{{ talkerDisplayName[0] }}</span>
          </span>
        </div>
      </div>
      <div :class="['msg-content-box', data.IsSender && 'isSender']">
        <div class="nickname" v-if="!data.isSender && chatRoomInfo">{{ talkerDisplayName }}</div>
        <img class="emoji" v-if="props.data.TypeName == '动画表情'" :src="data.StrContent" referrerpolicy="no-referrer" />
        <div class="msg-box" v-else>
          <div class="triangle"></div>
          <div class="msg-content">
            <div class="text" v-if="props.data.TypeName == '文本'">{{ props.data.StrContent }}</div>
            <div v-else class="other-msg">[{{ props.data.TypeName }}](暂未支持此类型消息)</div>
            <div class="actions">
              <div class="btns"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="avatar-box" style="margin-right: 10px;">
        <div class="avatar" v-if="data.IsSender">
          <img v-if="myWxUserinfo?.avatar" :src="myWxUserinfo.avatar" referrerpolicy="no-referrer" />
          <span v-else>
            <span v-if="myWxUserinfo?.nickName">{{ data.talkerInfo.nickName[0] }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import moment from 'moment';
import { myWxUserinfo } from '@renderer/store/wx'
import { chatRoomInfo } from '../store/msg'

const props = defineProps<{ data: any, prevMsg: any }>()

const showDate = computed(() => {
  let diff = props.data?.CreateTime - props.prevMsg?.CreateTime
  return !diff || diff >= (0.5 * 60 * 60)
})

const talkerDisplayName = computed(() => {
  return props.data.talkerInfo?.remark || props.data.talkerInfo?.strNickName//(Remark||NickName)
})

</script>
<style lang="less" scoped>
.msg-date {
  background-color: #eee;
  border-radius: 5px;
  padding: 2px 5px;
  font-size: 12px;
  width: fit-content;
  margin: 0 auto;
  margin-bottom: 10px;
  color: #999;
}

.system-msg {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 30px;
}

.single-msg {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  &.special {
    align-items: flex-start;
  }

  .avatar-box {
    width: 35px;
    height: 35px;
    overflow: hidden;
    font-size: 20px;
    font-weight: bold;
    color: #e0e0e0;

    .avatar {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      align-items: center;
      // border-radius: 8px;
      background-color: #eee;
      overflow: hidden;
    }

    img {
      width: 100%;
      height: 100%;
    }
  }

  .msg-content-box {
    position: relative;
    flex: 1;
    overflow: hidden;
    padding: 0 5px;

    .nickname {
      position: relative;
      font-size: 12px;
      color: #999;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-left: 10px;
    }

    .emoji {
      max-width: 200px;
      height: fit-content;
      margin: 0 10px;
    }

    .msg-box {
      display: inline-block;
      position: relative;

      .triangle {
        position: absolute;
        left: -7px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border: 8px solid transparent;
        border-right: 10px solid #fff;
      }

      .msg-content {
        position: relative;
        width: fit-content;
        max-width: 100%;
        border-radius: 4px;
        padding: 6px 8px;
        background-color: #fff;
        margin-left: 8px;
        overflow: hidden;
        cursor: text;

        .text {
          font-size: 14px;
          color: #333;
          overflow: hidden;
          user-select: text;
        }
      }
    }

    &.isSender {
      text-align: right;

      .triangle {
        left: calc(100% - 10px);
        border-right: none;
        border-left: 8px solid #95EC69;
      }

      .msg-content {
        margin-left: 0;
        margin-right: 8px;
        border-bottom-right-radius: 0;
        background-color: #95EC69;

        .text {}
      }
    }

    .other-msg {
      font-size: 12px;
    }
  }
}
</style>