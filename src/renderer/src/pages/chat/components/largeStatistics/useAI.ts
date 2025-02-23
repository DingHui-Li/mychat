import { activeSession } from '../../store/session'
import { ref } from 'vue'
import { marked } from 'marked'
import { getAiReply } from '@renderer/store/ai'

export const AISetting = ref({
  show: false,
  style: '专业分析师',
  content: '简短',
  timeRange: [new Date(), new Date()]
})
export const AIingCount = ref(0)

export default function (name) {
  const AIResult = ref('')
  const AIing = ref(false)
  const cacheKey = `AI-${name}-${activeSession.value?.strUsrName}`

  AIResult.value = localStorage[cacheKey]

  function callAI(prompts: Array<string>) {
    if (AIing.value) return
    AIing.value = true
    AIingCount.value += 1
    getAiReply(
      [
        `以${AISetting.value.style}风格回答以下问题。
        以下数据跨度为：${AISetting.value.timeRange[0].format('yyyy-MM-dd')}至${AISetting.value.timeRange[1].format('yyyy-MM-dd')}。
        要求:不要标题，结果内容密度${AISetting.value.content}。
        `,
        ...prompts
      ],
      true
    )
      .then(async (res) => {
        let str = ''
        // @ts-ignore (define in dts)
        for await (const chunk of res.stream) {
          str += chunk.choices[0]?.delta?.content || ''
          if (str) {
            AIResult.value = await marked(str)
          }
        }
        localStorage[cacheKey] = AIResult.value
      })
      .finally(() => {
        AIing.value = false
        AIingCount.value -= 1
      })
  }

  function clearAICache() {
    localStorage[cacheKey] = ''
    AIResult.value = ''
  }

  return {
    AIResult,
    AIing,
    callAI,
    clearAICache
  }
}
