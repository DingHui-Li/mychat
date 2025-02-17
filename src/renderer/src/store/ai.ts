import OpenAI from 'openai'
import { ref } from 'vue'

export let aiInstance = ref<OpenAI>()
export let creatingInstance = ref(false)
export const aiConfig = ref({
  model: 'Pro/deepseek-ai/DeepSeek-V3',
  apiKey: '',
  baseURL: 'https://api.siliconflow.cn/v1'
})

try {
  aiConfig.value = JSON.parse(localStorage['aiConfig'])
} catch {}

export async function init() {
  try {
    if (!aiConfig.value.apiKey) {
      throw { msg: 'ApiKey不能为空' }
    }
    creatingInstance.value = true
    aiInstance.value = new OpenAI({
      baseURL: aiConfig.value.baseURL,
      apiKey: aiConfig.value.apiKey,
      dangerouslyAllowBrowser: true
    })
    console.log('ai初始化成功')
  } catch (err) {
    throw err
  } finally {
    creatingInstance.value = false
  }
}

export function changeAiConfig(form) {
  aiConfig.value = form
  localStorage['aiConfig'] = JSON.stringify(form)
}

export async function getAiReply(prompts: Array<string>, stream = false) {
  if (!aiInstance.value) {
    throw { msg: 'AI未初始化' }
  }
  if (!prompt) {
    throw { msg: '提示词不能为空' }
  }
  try {
    const completion = await aiInstance.value.chat.completions.create({
      messages: prompts.map((prompt) => {
        return { role: 'user', content: filterPersonalInfo(prompt) }
      }),
      model: aiConfig.value.model,
      stream: stream
    })
    if (stream) {
      return {
        model: aiConfig.value.model,
        stream: completion
      }
    } else {
      return {
        model: aiConfig.value.model,
        // @ts-ignore (define in dts)
        result: completion.choices[0].message.content
      }
    }
  } catch (err) {
    // @ts-ignore (define in dts)
    throw { msg: err?.message }
  }
}

const patterns = {
  phone: /\b(\+?86[-\s]?)?1[3-9]\d{9}\b/g, // 手机号
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // 邮箱
  id_card: /\b\d{15}|\d{18}|\d{17}X\b/g, // 身份证号
  password: /\b(?:password|pwd|pass|psw|密码)[\s=:]*\S+\b/g, // 密码
  wechat: /\b(?:wechat|wx)[\s=:]*\S+\b/g // 微信号
}
function filterPersonalInfo(text) {
  let filteredText = text
  for (const key in patterns) {
    filteredText = filteredText.replace(patterns[key], `[${key.toUpperCase()}_FILTERED]`)
  }
  return filteredText
}
