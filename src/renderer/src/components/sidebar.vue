<template>
  <div class="sidebar">
    <img class="avatar" v-if="myWxUserinfo.avatar" :src="myWxUserinfo.avatar" />
    <div class="logo" v-else>MyChat</div>
    <div class="list">
      <div :class="['item', actived == item.key && 'active']" v-for="item in sidebar" @click="jumpPage(item)">
        <el-icon class="icon">
          <component :is="item.icon" />
        </el-icon>
        <div class="label">{{ item.label }}</div>
      </div>
    </div>
    <div :class="['item', actived == 'setting' && 'active']"
      @click="jumpPage({ path: '/setting/index', key: 'setting' })">
      <el-icon class="icon">
        <Tools />
      </el-icon>
      <div class="label">设置</div>
    </div>
    <div class="item">
      <el-switch v-model="darkMode" size="small"></el-switch>
      <div class="label">黑暗模式</div>
    </div>
    <el-tooltip placement="left" :content="'AI服务' + (aiInstance ? '可用' : '不可用')">
      <div class="item" @click="router.replace('/setting/index?tab=ai')">
        <div class="icon">
          <div :class="['status', aiInstance && 'active']"></div>
        </div>
        <div class="label">AI</div>
      </div>
    </el-tooltip>
  </div>
</template>
<script setup lang="ts">
import { Comment, UserFilled, Tools } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import { myWxUserinfo } from '@renderer/store/wx'
import { aiInstance } from '@renderer/store/ai'

const router = useRouter()
const route = useRoute()
const actived = ref('chat')
const darkMode = ref(false)
darkMode.value = localStorage['darkMode'] == 'true'

const sidebar = [
  {
    label: "聊天",
    icon: Comment,
    path: '/chat/index',
    key: "chat"
  },
  {
    label: "联系人",
    icon: UserFilled,
    path: '/contact/index',
    key: "contact"
  }
]

watch(route, v => {
  actived.value = sidebar.find(item => v.path == item.path)?.key || 'setting'
})
watch(darkMode, v => {
  localStorage['darkMode'] = v
  if (v) {
    // @ts-ignore (define in dts)
    DarkReader.enable({
      brightness: 100,
      contrast: 90,
      sepia: 10
    });
  } else {
    // @ts-ignore (define in dts)
    DarkReader.disable();
  }
}, {
  immediate: true
})

function jumpPage(item) {
  actived.value = item?.key
  if (item?.path) {
    router.replace(item.path)
  }
}

</script>
<style lang="less" scoped>
.sidebar {
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 10px;
  padding-right: 0;
  text-align: center;

  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    object-fit: cover;
    margin: 0 auto;
    margin-top: 5px;
    margin-bottom: 60px;
  }

  .logo {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 60px;
    padding: 5px;
  }

  .list {
    flex: 1;
  }

  .item {
    position: relative;
    padding: 10px 20px;
    text-align: center;
    opacity: 0.8;
    border-radius: 12px;
    cursor: pointer;
    transition: all .1s;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #33333350;
      border-radius: 12px;
      transform: translateX(-100%);
      opacity: 0;
      transition: all .3s;
    }

    &.active {
      opacity: 1;

      &::before {
        transform: translateY(0);
        opacity: 1;
      }

      &:hover {
        opacity: 1;
      }
    }

    &:hover {
      opacity: 0.5;
    }

    .icon {
      font-size: 25px;

      .status {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #F44336;
        margin: 0 auto;

        &.active {
          background-color: #4CAF50;
        }
      }
    }

    .label {
      font-size: 12px;
      color: #999;
    }
  }
}
</style>