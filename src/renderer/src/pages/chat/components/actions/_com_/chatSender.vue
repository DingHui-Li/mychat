<template>
  <div class="chat-sender">
    <div class="label">
      发送者消息数量
    </div>
    <div class="list">
      <div class="item-box" v-for="(name, index) in Object.keys(data)">
        <el-tooltip placement="top" :content="name + ': ' + data[name]">
          <div class="item">
            <div class="name">{{ name }}</div>
            <div class="progress-box">
              <div class="progress"
                :style="`background:${colors[index % colors.length]}; width:${data[name] / msgList.length * 100}%`">
              </div>
            </div>
          </div>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { msgList } from '../../../store/msg'
import { ref, onMounted } from 'vue'

const data = ref({})

onMounted(() => {
  getData()
})

function getData() {
  let t = {}
  msgList.value.forEach(item => {
    let name = item.IsSender ? "我" : (item.talkerInfo?.strNickName || '未知')
    t[name] = (t[name] || 0) + 1
  })
  data.value = t
}
const colors = ['#4CAF50', '#CDDC39', '#FFC107', '#3F51B5', '#F44336', '#FF4081', '#009688',
  '#9C27B0', '#7C4DFF', '#03A9F4',
  '#FF5722', '#795548', '#607D8B']

</script>
<style lang="less" scoped>
.chat-sender {
  .label {
    font-size: 12px;
    color: #999;
    padding-top: 15px;
    margin-bottom: 5px;
  }

  .list {
    .item-box {}

    .item {
      display: flex;
      align-items: center;
      padding: 2px 0;
      transition: all .3s;

      &:hover {
        opacity: 0.6;

        .progress {
          opacity: 0.8;
          transform: scale(1.2);
        }
      }

      .name {
        font-size: 14px;
        width: 50px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .progress-box {
        flex: 1;
        overflow: hidden;

        .progress {
          height: 10px;
          border-radius: 10px;
          transition: all .3s;
          transform-origin: left center;
          min-width: 10px;
        }
      }
    }
  }
}
</style>