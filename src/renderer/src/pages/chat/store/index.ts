import { ref } from 'vue'
import { Wallet, PieChart, Lollipop, MagicStick } from '@element-plus/icons-vue'
import comAIAnaly from '../components/actions/AIAnaly.vue'
import comStatistic from '../components/actions/statistic.vue'
import comExport from '../components/actions/export.vue'
import comSuggest from '../components/actions/suggest.vue'

export const actions = [
  {
    icon: PieChart,
    label: '统计',
    key: 'statistic',
    component: comStatistic
  },
  {
    icon: Wallet,
    label: '导出',
    key: 'export',
    component: comExport
  },
  {
    icon: MagicStick,
    label: '回复建议',
    key: 'suggest',
    component: comSuggest
  },
  {
    icon: Lollipop,
    label: 'AI分析',
    key: 'AIAnaly',
    component: comAIAnaly
  }
]

export const activeAction = ref<{
  icon
  label: ''
  key: ''
  component: any
}>()

export const showLargeStatistics = ref(false)

export function handleChooseAction(action) {
  if (activeAction.value) {
    handleRemoveAction()
    setTimeout(() => {
      activeAction.value = action
    }, 300)
  } else {
    activeAction.value = action
  }
}

export function handleRemoveAction() {
  activeAction.value = undefined
}
