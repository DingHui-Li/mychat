<template>
  <div class="info-card" v-if="activeContact">
    <div class="cover" v-if="activeContact.extraInfo && activeContact.extraInfo['朋友圈背景']">
      <img :src="activeContact.extraInfo['朋友圈背景']" referrerpolicy="no-referrer" />
    </div>
    <div class="card"
      :style="`margin-bottom: 15px;margin-top:${activeContact.extraInfo && activeContact.extraInfo['朋友圈背景'] ? '150px' : ''};`">
      <div class="user-info">
        <div class="avatar">
          <img v-if="activeContact.avatar" :src="activeContact.avatar" />
          <span v-else>
            <span v-if="activeContact.displayName">{{ activeContact.displayName[0] }}</span>
          </span>
        </div>
        <div class="info">
          <div class="name">{{ activeContact.displayName }}
            <span v-if="activeContact.extraInfo && activeContact.extraInfo['性别[1男2女]']">
              <el-icon class="icon" v-if="activeContact.extraInfo['性别[1男2女]'] == 1" color="#2196F3">
                <Male />
              </el-icon>
              <el-icon class="icon" v-else color="#FF4081">
                <Female />
              </el-icon>
            </span>
          </div>
          <div class="nick-name" v-if="activeContact.Remark">昵称: {{ activeContact.NickName }}</div>
          <div class="nick-name" v-if="activeContact.Alias">微信号: {{ activeContact.Alias }}</div>
          <div class="nick-name" v-if="area">地区: {{ area }}</div>
        </div>
      </div>
      <div class="desc" v-if="activeContact.extraInfo?.个性签名">{{ activeContact.extraInfo['个性签名'] }}</div>
    </div>
    <div class="card">
      <div class="item">
        <div class="label">微信ID</div>
        <div class="value" style="cursor: text;user-select: text;">{{ activeContact.UserName }}</div>
      </div>
    </div>
    <div class="card" v-if="activeContact.LabelIDList && labelMap">
      <div class="item">
        <div class="label">标签</div>
        <div class="value">{{ labelMap[activeContact.LabelIDList] }}</div>
      </div>
    </div>
    <div class="card" v-if="activeContact.extraInfo && activeContact.extraInfo['手机号']">
      <div class="item">
        <div class="label">手机号</div>
        <div class="value">{{ activeContact.extraInfo['手机号'] }}</div>
      </div>
    </div>
    <div v-if="sessionIndex != undefined && sessionIndex >= 0">
      <el-button class="btn" type="primary" @click="jumpChat">聊天数据</el-button>
    </div>

  </div>
</template>
<script setup lang="ts">
import { activeContact, labelMap } from '../store/index'
import { computed } from 'vue'
import { Male, Female } from '@element-plus/icons-vue'
import { sessionList, handleChooseSession } from '../../chat/store/session'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
let sessionIndex = ref(-1)
let index = sessionList.value?.findIndex(item => item.strUsrName == activeContact.value?.UserName)
sessionIndex.value = index != undefined ? index : -1

const area = computed(() => {
  let extra = activeContact.value?.extraInfo
  if (extra) {
    return `${extra['国'] || ""} ${extra['省'] || ""} ${extra['市'] || ""}`.trim()
  }
  return ''
})

function jumpChat() {
  handleChooseSession(sessionIndex.value)
  router.replace('/chat/index')
}
</script>
<style lang="less" scoped>
.info-card {
  position: relative;
  background-color: #fff;
  border-radius: 25px;
  margin-left: 5px;
  color: #333;
  padding: 10px;
  padding-right: 15px;
  width: 40vw;
  height: 100%;
  overflow: hidden;

  .cover {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 50%;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background: linear-gradient(to top, #fff 10%, transparent);
    }

    img {
      width: 100%;
      object-fit: cover;
    }
  }

  .card {
    position: relative;
    z-index: 1;
    background-color: #f8f8f8;
    border-radius: 25px;
    padding: 10px;
    margin-bottom: 2px;

    .user-info {
      display: flex;
      align-items: center;
      padding: 10px;
      border-radius: 30px;
      cursor: pointer;
      transition: all .3s;

      .avatar {
        width: 60px;
        height: 60px;
        border-radius: 10px;
        background-color: #eee;
        overflow: hidden;
        margin-right: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 35px;
        color: #fff;
        font-weight: bold;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .info {
        flex: 1;
        overflow: hidden;
        color: #333;
        white-space: nowrap;

        .name {
          display: flex;
          font-size: 20px;
          font-weight: bold;
          overflow: hidden;
          text-overflow: ellipsis;

          .icon {
            position: relative;
            top: 2px;
            margin-left: 4px;
            font-size: 20px;
          }
        }

        .nick-name {
          font-size: 12px;
          color: #999;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        &:deep(.el-tag) {
          border-radius: 30px;
          overflow: hidden;
        }
      }
    }

    .desc {
      font-size: 14px;
      padding: 10px;
    }

    .item {
      display: flex;
      align-items: center;
      padding: 5px;

      .label {
        font-size: 14px;
        color: #999;
        width: 50px;
      }

      .value {
        font-size: 15px;
        color: #333;
      }
    }
  }

  &:deep(.el-button) {
    position: relative;
    z-index: 2;
    margin-top: 30px;
    border-radius: 30px;
    width: 100%;
    padding: 22px 0;
  }
}
</style>