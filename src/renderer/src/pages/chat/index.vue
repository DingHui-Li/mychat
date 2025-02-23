<template>
  <div class="chat-page">
    <div class="container">
      <div class="list-container">
        <comSessionList />
      </div>
      <Transition name="page">
        <div class="content-container" v-if="activeSessionIndex >= 0">
          <comContent />
          <comAction v-if="msgList?.length" />
        </div>
      </Transition>
    </div>
    <Transition name="page">
      <comLargeStatistics v-if="showLargeStatistics && msgList.length" />
    </Transition>
    <Transition name="action">
      <div class="right-side" v-if="activeSessionIndex >= 0 && activeAction">
        <component :is="activeAction.component" />
      </div>
    </Transition>
  </div>
</template>
<script setup lang="ts">
import comSessionList from './components/session.vue'
import comContent from './components/content.vue'
import comAction from './components/actions.vue'
import comLargeStatistics from './components/largeStatistics.vue'

import { activeSessionIndex } from './store/session'
import { msgList } from './store/msg'
import { activeAction, showLargeStatistics } from './store/index'

</script>
<style lang="less" scoped>
.chat-page {
  height: 100%;
  overflow: hidden;
  display: flex;
  padding: 0 !important;
  background-color: transparent !important;
  transform: scale(1);

  .container {
    width: 100%;
    flex: 1;
    display: flex;
    overflow: hidden;
    background-color: #fff;
    // border-radius: 5px;

    .list-container {
      height: 100%;
      overflow: hidden;
    }

    .content-container {
      position: relative;
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-width: 300px;
    }
  }

  .right-side {
    height: 100%;
    overflow: hidden;
    overflow-y: auto;
    // min-width: 250px;
    max-width: 30vw;
    margin-left: 5px;
  }
}

.action-enter-active,
.action-leave-active {
  transition: all .3s;
}

.action-enter-from,
.action-leave-to {
  opacity: 0;
  transform: translateX(20px);
  width: 0;
}

.action-enter-to,
.action-leave-from {
  width: 30vw;
  opacity: 1;
  transform: translateX(0);
}

.page-enter-active,
.page-leave-active {
  transition: all .3s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  /* transform: scale(0.9); */
  transform: translateY(20px);
}

.page-enter-to,
.page-leave-from {
  opacity: 1;
  /* transform: scale(1); */
  transform: translateY(0);
}
</style>