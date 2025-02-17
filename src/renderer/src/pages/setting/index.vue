<template>
  <div class="setting-page">
    <div class="title">设置</div>
    <div class="panel">
      <el-tabs v-model="tab" tab-position="left" class="tabs">
        <el-tab-pane label="账号" name="account">
          <comAccountSetting />
        </el-tab-pane>
        <el-tab-pane label="AI" name="ai">
          <comAISetting />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>

</template>
<script setup lang="ts">
import comAccountSetting from './components/account.vue'
import comAISetting from './components/AISetting.vue'
import { useRoute } from 'vue-router'
import { watch, ref } from 'vue'

const route = useRoute()
const tab = ref('account')

watch(route, v => {
  if (v?.query?.tab) {
    tab.value = v.query.tab + ''
  } else {
    tab.value = 'account'
  }
})
</script>
<style lang="less" scoped>
.setting-page {
  padding: 20px !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .title {
    font-size: 20px;
    color: #333;
    margin-bottom: 15px;
    font-weight: bold;
    padding-left: 20px;
  }

  .panel {
    flex: 1;
    height: 100%;
  }

  .tabs {
    height: 100%;

    &:deep(.el-tabs__header) {
      height: 100%;

      .el-tabs__item {
        padding: 0;
        width: 100px;
        padding-left: 20px;
        justify-content: flex-start;
        font-size: 14px;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: var(--el-color-primary);
          opacity: 0;
          transition: all .3s;
        }

        &.is-active {
          &::before {
            opacity: 0.1;
          }
        }
      }
    }

    &:deep(.el-tabs__content) {
      .el-tab-pane {
        height: 100%;
        overflow: auto;
      }
    }
  }
}

// .tabs>.el-tabs__content {
//   padding: 32px;
//   color: #6b778c;
//   font-size: 32px;
//   font-weight: 600;
// }

// .el-tabs--right .el-tabs__content,
// .el-tabs--left .el-tabs__content {
//   height: 100%;
// }</style>