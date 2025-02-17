<template>
  <div class="layout">
    <comSideBar v-if="route.path != '/launch'" />
    <div class="container">
      <router-view v-slot="{ Component }">
        <transition name="page">
          <keep-alive>
            <component :is="Component" class="page" />
          </keep-alive>
        </transition>
      </router-view>
    </div>
  </div>
</template>
<script setup lang="ts">
import "./util/momentCh.js";
import comSideBar from './components/sidebar.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

</script>
<style lang="less" scoped>
.layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  background-color: #212023;

  .container {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;
    padding: 10px;

    .page {
      position: absolute;
      top: 10px;
      left: 10px;
      width: calc(100% - 20px);
      height: calc(100% - 20px);
      overflow: hidden;
      box-sizing: border-box;
      padding: 10px;
      background-color: #fff;
      border-radius: 25px;
    }
  }
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