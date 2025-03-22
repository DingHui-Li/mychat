<template>
  <div class="account-setting" v-loading="loading">
    <div class="wx-info">
      <img v-if="myWxUserinfo.avatar" class="avatar" :src="myWxUserinfo.avatar" alt="">
      <div class="info">
        <div class="name">{{ myWxUserinfo.nickName }}</div>
        <div class="username">微信ID: {{ myWxUserinfo.userName }}</div>
      </div>
    </div>
    <el-tooltip content="新消息可能会在微信客户端关闭后同步" placement="top">
      <el-button class="btn" type="success" text bg @click="handleSyncWxDb">同步数据</el-button>
    </el-tooltip>
    <el-tooltip content="退出并删除所有数据" placement="top">
      <el-button class="btn" type="danger" text bg @click="logout" style="width:85px;margin-top: 30px">退出</el-button>
    </el-tooltip>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { myWxUserinfo, syncWxDb, logout } from '@renderer/store/wx'
import { useRouter } from 'vue-router'

const loading = ref(false)
const router = useRouter()

function handleSyncWxDb() {
  loading.value = true
  syncWxDb().then(() => {
    router.replace('/launch')
  }).finally(() => {
    loading.value = false
  })
}
</script>
<style lang="less" scoped>
.account-setting {
  color: #333;
  padding: 40px;

  .wx-info {
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    padding: 60px 30px;
    border-radius: 10px;
    max-width: 500px;
    margin: 0 auto;

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 10px;
    }

    .info {
      flex: 1;
      overflow: hidden;
      padding-left: 10px;

      .name {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .username {
        font-size: 14px;
        color: #666;
      }
    }
  }

  .btn {
    display: block;
    margin: 0 auto;
    margin-top: 60px;
  }
}
</style>