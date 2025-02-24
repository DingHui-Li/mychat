import { ref, nextTick } from 'vue'
import { activeSession } from './session'

export const msgList = ref<Array<Msg>>([])
export const chatRoomInfo = ref<{
  UserNameList: []
  DisplayNameList: []
  SelfDisplayName: ''
}>()
export const loading = ref(false)
export const listEl = ref()

export function getChatRoomInfo(id) {
  chatRoomInfo.value = undefined
  msgList.value = []
  return window
    .dbQuery({
      query: `
        SELECT UserNameList,DisplayNameList,SelfDisplayName
        FROM ChatRoom
        WHERE ChatRoomName=='${id}'
      `,
      dbname: 'de_MicroMsg'
    })
    .then((res) => {
      if (res.result?.length) {
        let t = res.result[0]
        chatRoomInfo.value = {
          UserNameList: t.UserNameList?.split('^G'),
          DisplayNameList: t.DisplayNameList?.split('^G'),
          SelfDisplayName: t.SelfDisplayName
        }
      }
    })
}

export function getMsgList(username) {
  loading.value = true
  msgList.value = []
  return window
    .findMsgDb(username)
    .then(async (res) => {
      res = res.map((item, index) => {
        item.index = index
        if ((!item.talker || !item.talkerInfo) && !item.IsSender) {
          item.talker = activeSession.value?.strUsrName
          item.talkerInfo = { ...activeSession.value }
        }
        if (chatRoomInfo.value) {
          let index = chatRoomInfo.value.UserNameList.findIndex((name) => name == item.talker)
          if (index >= 0) {
            item.talkerInfo.Remark =
              chatRoomInfo.value.DisplayNameList[index] || item.talkerInfo?.strNickName
          }
        }
        return item
      })
      msgList.value = res
      setTimeout(() => {
        nextTick(() => {
          listEl.value?.scrollTo(listEl.value?.scrollSize)
        })
      }, 300)
    })
    .finally(() => {
      loading.value = false
    })
}

export function scrollToMsg(index = 0) {
  nextTick(() => {
    listEl.value?.scrollToIndex(index)
  })
}
