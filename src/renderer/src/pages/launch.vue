<template>
  <div class="launch">
    <div class="logo">
      MyChat
    </div>
    <h1 v-if="readingWxinfo">获取微信数据中</h1>
    <div class="loading" v-loading="readingWxinfo"></div>
    <h1 v-if="wxinfo.msg" style="color: #F44336;"> {{ wxinfo.msg }}</h1>
    <h4 v-if="wxinfo.msg" style="color: #999;">第一次使用请先打开并登录微信后点击重试</h4>
    <div class="actions" v-if="wxinfo.msg">
      <el-button @click="tryAgain" type="warning">重试</el-button>
    </div>
    <el-dialog v-model="popup" :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="notice">
        <div class="title">声明</div>
        <div class="content">
          <comStatement />
        </div>
        <div class="actions">
          <el-button plain type="danger" @click="logout">退出</el-button>
          <el-button type="success" @click="readWxinfo">确认</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { onActivated, ref } from 'vue'
import { wxinfo, getWxinfo, readingWxinfo, myWxUserinfo, logout, getWxUserinfo, syncWxDb, wxDbPath } from '@renderer/store/wx'
import { init as initAI } from '@renderer/store/ai'
import { useRouter } from 'vue-router'
import comStatement from './setting/components/statement.vue'

const router = useRouter()

const popup = ref(false)
readingWxinfo.value = true

onActivated(async () => {
  if (!wxinfo.value.key) {//没有获取过key
    popup.value = true
  } else {//有缓存key
    afterSuccess()
  }
})

function readWxinfo() {
  popup.value = false
  getWxinfo().then((res) => {
    wxinfo.value = res
    localStorage['wxinfo'] = JSON.stringify(wxinfo.value)
    return syncWxDb()
  }).then(() => {
    if (wxinfo.value.key) {
      afterSuccess()
    }
  }).catch((err) => {
    wxinfo.value.msg = err?.msg || (err + "") || '获取微信信息失败'
  })
}

async function afterSuccess() {
  try {
    if (!wxDbPath.value) {
      await syncWxDb()
    }
    // @ts-ignore (define in dts)
    await window.initWxDb(wxDbPath.value)
    initAI()
    let userinfo = await getWxUserinfo(wxinfo.value.wxid)
    myWxUserinfo.value = {
      userName: wxinfo.value.wxid,
      nickName: userinfo.nickName,
      avatar: userinfo.avatar
    }
    router.replace('/chat/index')
  } catch (err) {
    console.log(err)
    wxinfo.value.msg = (err + '') || "数据库读取失败"
  } finally {
    readingWxinfo.value = false
  }
}

async function tryAgain() {
  let msg = wxinfo.value.msg
  wxinfo.value.msg = ''
  if (msg?.includes("Failed to fetch")) {
    // @ts-ignore (define in dts)
    let res = await window.initPyServer()
    if (!res) {
      wxinfo.value.msg = '微信数据库解密服务启动失败,请开启本地网络权限'
    }
  } else {
    readWxinfo()
  }
}
</script>
<style lang="less" scoped>
.launch {
  position: relative;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #333;

  .logo {
    position: absolute;
    top: 10px;
    left: 15px;
    font-size: 30px;
    font-weight: bold;
    color: var(--el-color-primary);
  }

  .loading {
    margin-top: 30px;
    width: 40px;
    height: 40px;
  }

  .actions {
    margin-top: 30px
  }

  &:deep(.el-dialog) {
    padding: 0;
    border-radius: 20px;
    overflow: hidden;

    .el-dialog__header {
      display: none;
    }
  }

  .notice {
    .title {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      color: #fff;
      background-color: var(--el-color-primary);
      padding: 10px 0;
    }

    .content {
      padding: 10px;
      padding-left: 30px;
      max-height: 60vh;
      overflow: auto;
    }

    .actions {
      text-align: center;
      padding: 15px;
    }
  }
}
</style>