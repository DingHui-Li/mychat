<template>
  <div class="statistic">
    <div class="title">统计</div>
    <el-icon class="close" @click="handleRemoveAction()">
      <Close />
    </el-icon>
    <div class="card">
      <comDistribution />
    </div>
    <div class="card">
      <comChatTypeChart />
    </div>
    <div class="card">
      <comChatSender />
    </div>
  </div>
</template>
<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'
import { handleRemoveAction } from '../../store/index'
import comDistribution from './_com_/chatDistribution.vue'
import comChatTypeChart from './_com_/chatTypeChart.vue'
import comChatSender from './_com_/chatSender.vue'

</script>
<style lang="less" scoped>
.statistic {
  position: relative;
  width: 30vw;
  height: 100%;
  overflow: auto;
  background-color: #fff;
  padding: 10px 5px;
  margin-left: 5px;
  border-radius: 25px;
  min-height: 40vh;
  color: #333;

  &.disabled {
    pointer-events: none;
  }

  .title {
    color: #333;
    font-size: 18px;
    font-weight: bold;
    padding: 0 10px;
    margin-bottom: 5px;
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

  .card {
    background-color: #f9f9f9;
    border-radius: 20px;
    padding: 10px;
    padding-top: 1px;
    margin-bottom: 5px;
  }
}
</style>