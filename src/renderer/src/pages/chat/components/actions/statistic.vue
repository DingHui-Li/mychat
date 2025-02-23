<template>
  <div class="statistic">
    <div class="title">统计
      <el-icon class="close" @click="handleRemoveAction()">
        <Close />
      </el-icon>
    </div>
    <div class="btn" @click="showLargeStatistics = true">生成报告</div>
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
import { handleRemoveAction, showLargeStatistics } from '../../store/index'
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
  padding-top: 0;
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
    position: sticky;
    top: 0;
    z-index: 9;
    background-color: #fff;
    padding-top: 10px;
    padding-bottom: 5px;
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

  .btn {
    background-color: var(--el-color-primary);
    text-align: center;
    box-sizing: border-box;
    margin-right: 5px;
    padding: 10px;
    color: #fff;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>