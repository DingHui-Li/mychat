<template>
  <div class="export-html">
    <div class="list" v-if="exportList">
      <comSingleMsg v-for="(item, index) in exportList" :data="item" :prev-msg="index > 0 && exportList[index - 1]" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, computed } from 'vue'
import comSingleMsg from '../../singleMsg.vue'
import { msgList } from '../../../store/msg'

const props = defineProps({
  filterTime: Array<any>,
  filterMsgType: Array<any>
})

let exportList = computed(() => {
  if (props.filterTime) {
    let startTime = props.filterTime[0].getTime() / 1000
    let endTime = props.filterTime[1].getTime() / 1000
    return msgList.value.filter(item => item.CreateTime >= startTime && item.CreateTime <= endTime)
  }
  return []
})
</script>
<style lang="less" scoped>
.export-html {
  height: 100%;
  overflow: auto;

  .list {
    height: fit-content;
    overflow: auto;
  }
}
</style>