<template>
  <div class="contacts-page">
    <div class="list-container">
      <div class="filter">
        <el-input v-model="input" placeholder="搜索联系人" :clearable="true" @clear="searchContact">
          <template #append>
            <el-button circle :icon="Search" @click="searchContact" style="background-color: #fff;" />
          </template>
        </el-input>
        <el-button :icon="sort == 'desc' ? SortDown : SortUp" circle @click="handleChangeSort"></el-button>
        <el-select v-model="type" style="width:80px;margin-left: 5px;" placeholder="所有">
          <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="list" v-show="searchList.length">
        <div v-for="(item, index) in searchList">
          <div class="first-letter" v-if="index == 0 || list[index - 1].FirstLetter != item.FirstLetter">{{
          item.FirstLetter
        }}
          </div>
          <div class="item" @click="handleChooseContact(item)">
            <div class="avatar">
              <img v-if="item.avatar" :src="item.avatar" referrerpolicy="no-referrer" />
              <span v-else>
                <span v-if="item.displayName">{{ item.displayName[0] }}</span>
              </span>
            </div>
            <div class="info">
              <div class="name">{{ item.displayName }}</div>
              <div class="desc" v-if="item.extraInfo?.个性签名">{{ item.extraInfo['个性签名'] }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="list" v-loading="loading" v-show="!searchList.length">
        <VList class="v-list" ref="listEl" :data="displayList" #default="{ item, index }" style="height: 100%;"
          @scroll="onScroll">
          <div :key="item.UserName">
            <div class="first-letter" v-if="index == 0 || list[index - 1]?.FirstLetter != item.FirstLetter">{{
          item.FirstLetter
        }}
            </div>
            <div class="item" @click="handleChooseContact(item)">
              <div class="avatar">
                <img v-if="item.avatar" :src="item.avatar" referrerpolicy="no-referrer" />
                <span v-else>
                  <span v-if="item.displayName">{{ item.displayName[0] }}</span>
                </span>
              </div>
              <div class="info">
                <div class="name">{{ item.displayName }}</div>
                <div class="desc" v-if="item.extraInfo?.个性签名">{{ item.extraInfo['个性签名'] }}</div>
              </div>
            </div>
          </div>
        </VList>
      </div>
    </div>
    <Transition name="contact">
      <div class="right-side" v-if="activeContact">
        <comInfo />
      </div>
    </Transition>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onActivated, watch } from 'vue'
import { list, getList, getLabelMap, activeContact, handleChooseContact, type } from './store/index'
import { Search, SortUp, SortDown } from '@element-plus/icons-vue'
import comInfo from './components/info.vue'
// @ts-ignore (define in dts)
import { VList } from "virtua/vue";

const listEl = ref()
const typeList = [
  {
    value: '',
    label: '所有',
  },
  {
    value: '(2)',
    label: '群聊',
  },
  {
    value: '(1,3,513)',
    label: '好友',
  },
]

onActivated(() => {
  listEl.value?.scrollTo(Number(window.localStorage['contactPageScrollTop']))
})

const input = ref('')
const sort = ref('desc')
const displayList = ref<Array<Contact>>([])
const searchList = ref<Array<Contact>>([])
const loading = ref(true)

function searchContact() {
  if (input.value) {
    searchList.value = displayList.value.filter(item => {
      return item.NickName?.includes(input.value) || item.Remark?.includes(input.value) || item.QuanPin?.includes(input.value) || item.RemarkQuanPin?.includes(input.value)
    })?.slice(0, 20)
  } else {
    searchList.value = []
  }
}

onMounted(() => {
  getLabelMap()
  getList().then(() => {
    displayList.value = [...list.value]
  }).finally(() => {
    loading.value = false
  })
})

watch(list, () => {
  displayList.value = [...list.value]
})

function handleChangeSort() {
  sort.value = sort.value == 'desc' ? 'asc' : 'desc'
  filterList()
}
function filterList() {
  loading.value = true
  new Promise(() => {
    if (sort.value == 'asc') {
      displayList.value = [...list.value].reverse()
    } else {
      displayList.value = [...list.value]
    }
    loading.value = false
  })
}

function onScroll(e) {
  window.localStorage['contactPageScrollTop'] = e
}

</script>
<style lang="less" scoped>
.contacts-page {
  display: flex;
  padding: 0 !important;
  background-color: transparent !important;

  .list-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 25px;
    padding: 0 10px;
    padding-right: 0;
    height: 100%;
    box-sizing: border-box;
    min-width: 250px;
    transition: all .3s;
  }

  .right-side {
    height: 100%;
    overflow: hidden;
    overflow-y: auto;
    // min-width: 250px;
    max-width: 40vw;
  }

  .filter {
    display: flex;
    align-items: center;
    padding: 15px 0;
    margin-right: 15px;

    &:deep(.el-input) {
      flex: 1;
      border-radius: 30px;
      width: 100%;
      overflow: hidden;
      border: 1px solid #eee;
      margin-right: 5px;

      .el-input__wrapper {
        box-shadow: none;
        background-color: #fff;
      }

      .el-input-group__append {
        background-color: #fff;
        border: none;
        box-shadow: none;
      }
    }
  }

  .list {
    flex: 1;
    overflow: auto;

    .v-list {

      &::-webkit-scrollbar {
        width: 20px;
        height: 20px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--el-color-primary);
        border-radius: 10px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: var(--el-color-primary);
        width: 30px;
        height: 30px;
      }
    }

    .first-letter {
      color: #999;
      font-size: 14px;
    }

    .item {
      display: flex;
      align-items: center;
      padding: 10px;
      border-radius: 30px;
      cursor: pointer;
      transition: all .3s;

      &:hover {
        background-color: #eee;
      }

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #eee;
        overflow: hidden;
        margin-right: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 25px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .info {
        flex: 1;
        overflow: hidden;
        color: #333;
        white-space: nowrap;

        .name {
          font-size: 15px;
          font-weight: bold;
          overflow: hidden;
          text-overflow: ellipsis
        }

        .desc {
          font-size: 12px;
          color: #999;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
  }
}

.contact-enter-active,
.contact-leave-active {
  transition: all .3s;
}

.contact-enter-from,
.contact-leave-to {
  opacity: 0;
  transform: scale(0.9);
  transform: translateY(20px);
}

.contact-enter-to,
.contact-leave-from {
  opacity: 1;
  transform: scale(1);
  transform: translateY(0);
}
</style>