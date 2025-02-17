<template>
  <div class="actions">
    <div :class="['item', activeAction?.key == item.key && 'active']" v-for="item in actions"
      @click="handleChooseAction(item)">
      <div class="icon-box">
        <el-icon class="icon">
          <component :is="item.icon" />
        </el-icon>
      </div>
      <div class="label">{{ item.label }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { actions, handleChooseAction, activeAction } from '../store/index'


</script>
<style lang="less" scoped>
.actions {
  width: 100%;
  background-color: #f9f9f9;
  display: flex;
  flex-wrap: wrap;
  padding: 0 30px;
  border-radius: 20px;

  .item {
    width: 25%;
    padding: 20px 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: all .3s;
    cursor: pointer;

    &.active {
      .icon-box {
        background-color: var(--el-color-primary);

        .icon {
          color: #fff;
        }
      }
    }

    &:hover {
      opacity: 0.7;
    }

    &:active {
      opacity: 0.3;
    }

    .icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background-color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .icon {
        font-size: 20px;
        color: #333;
      }
    }

    .label {
      margin-top: 5px;
      font-size: 14px;
      color: #999;
    }
  }
}
</style>