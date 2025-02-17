<template>
  <div :class="['ai-setting',]">
    <div class="title">AI配置
      <el-button class="btn" :icon="lockForm ? Lock : Unlock" circle :type="lockForm ? 'info' : 'warning'"
        @click="handleSave"></el-button>
    </div>
    <div class="item">
      <div class="label">AI模型
        <el-tooltip placement="top" content="支持DeepSeek官网和硅基流动平台的模型">
          <el-icon class="icon">
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </div>
      <div :class="['value', lockForm && 'disabled']">
        <el-input type="text" v-model="form.model" />
        <el-btn icon=""></el-btn>
      </div>
    </div>
    <div class="item">
      <div class="label">ApiKey
        <el-tooltip placement="top" content="请自行申请">
          <el-icon class="icon">
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </div>
      <div :class="['value', lockForm && 'disabled']">
        <el-input type="text" v-model="form.apiKey" />
      </div>
      <div class="tip">
        推荐使用 <span @click="openUrl">硅基流动</span> 平台，api服务更加稳定。
      </div>
    </div>
    <div class="item">
      <div class="label">BaseUrl
      </div>
      <div :class="['value', lockForm && 'disabled']">
        <el-select v-model="form.baseURL">
          <el-option v-for="item in BaseUrlList" :key="item.url" :label="item.label" :value="item.url"></el-option>
        </el-select>
      </div>
    </div>
    <div class="item">
      <div class="state">
        <div :class="['dot', aiInstance && 'active']"></div>
        AI服务{{ aiInstance ? "可用" : "不可用" }}
      </div>
      <el-button :disabled="aiInstance" type="primary" @click="initAI" :loading="creatingInstance">AI服务初始化</el-button>
    </div>
    <div class="statement">
      使用AI服务时须了解以下信息:
    </div>
    <comStatement />
  </div>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Lock, Unlock, QuestionFilled } from '@element-plus/icons-vue'
import { aiConfig, changeAiConfig, init, aiInstance, creatingInstance } from '@renderer/store/ai'
import { ref } from 'vue'
import comStatement from './statement.vue'

const lockForm = ref(true)
const form = ref({
  model: '',
  apiKey: '',
  baseURL: ''
})
const BaseUrlList = [
  {
    url: "https://api.deepseek.com",
    label: 'DeepSeek官网'
  },
  {
    url: "https://api.siliconflow.cn/v1",
    label: '硅基流动'
  },
]
form.value = aiConfig.value

function openUrl() {
  // @ts-ignore (define in dts)
  window.openUrl("https://cloud.siliconflow.cn/i/nxih8N0i")
}

function handleSave() {
  lockForm.value = !lockForm.value
  if (lockForm.value) {
    changeAiConfig(form.value)
    initAI()
  }
}
function initAI() {
  init().then(() => {
    ElMessage({
      message: 'AI配置成功',
      type: 'success',
    })
  }).catch(err => {
    ElMessage.error(err?.msg || "AI初始化失败")
  })
}
</script>
<style lang="less" scoped>
.ai-setting {
  max-width: 500px;
  margin: 0 auto;
  overflow: auto;
  padding-bottom: 100px;

  .title {
    font-size: 20px;
    color: #333;
    font-weight: bold;
    margin-bottom: 30px;
    display: flex;
    align-items: center;

    .btn {
      margin-left: 10px;
    }

    &:deep(.el-button) {
      .el-icon {
        font-size: 20px;
      }
    }
  }

  .item {
    margin-bottom: 30px;

    .label {
      display: flex;
      align-items: center;
      font-size: 13px;
      color: #999;
      margin-bottom: 5px;

      .icon {
        font-size: 15px;
        margin-left: 5px;
      }
    }

    .value {
      display: flex;

      &.disabled {
        pointer-events: none;
        opacity: 0.7;
      }
    }

    .state {
      color: #333;
      font-size: 13px;
      display: flex;
      align-items: center;
      margin-bottom: 5px;

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #F44336;
        margin-right: 5px;

        &.active {
          background-color: #4CAF50;
        }
      }
    }

    .tip {
      font-size: 12px;
      color: #999;
      margin-top: 5px;

      span {
        color: var(--el-color-primary);
        text-decoration: underline;

        &:hover {
          opacity: 0.8;
        }
      }
    }

    &:deep(.el-input) {
      flex: 1;
      overflow: hidden;

      .el-input__wrapper {
        box-shadow: none;
        background-color: #f9f9f9;
        border: 1px solid transparent;
        transition: all .3s;

        &:hover {
          border-color: var(--el-color-primary);
        }
      }
    }

    &:deep(.el-select) {}
  }

  .statement {
    color: #333;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }
}
</style>