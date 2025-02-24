import { ComputedRef, computed, ref } from 'vue'
import { handleRemoveAction } from '../store/index'
import { getMsgList, getChatRoomInfo } from '../store/msg'
import { XMLParser } from 'fast-xml-parser'

export const sessionList = ref<Array<Session>>([])
export const activeSessionIndex = ref(-1)
export const listEl = ref()

export const activeSession: ComputedRef<Session | null> = computed(() => {
  if (activeSessionIndex.value >= 0 && sessionList.value?.length) {
    return sessionList.value[activeSessionIndex.value]
  }
  return null
})

export async function getList() {
  let res = await window.dbQuery({
    query: `SELECT 
    A.strUsrName,A.strNickName,A.strContent,A.nMsgType,A.nTime,
    B.smallHeadImgUrl,B.bigHeadImgUrl,C.Remark 
    FROM Session A
    LEFT JOIN ContactHeadImgUrl B ON A.strUsrName=B.usrName
    LEFT JOIN Contact C ON A.strUsrName=C.UserName
    WHERE A.strUsrName NOT LIKE 'gh_%' 
    AND A.strUsrName != '@publicUser' 
    AND A.strUsrName != 'notification_messages'
    AND A.strUsrName != 'notifymessage'
    AND A.strUsrName != 'weixin'
    AND A.strNickName != ''
    ORDER BY A.nTime DESC;`,
    dbname: 'de_MicroMsg'
  })
  let xmlParser = new XMLParser()
  if (res.result) {
    for (let i = 0; i < res.result.length; i++) {
      res.result[i].avatar = res.result[i].smallHeadImgUrl || res.result[i].bigHeadImgUrl
      delete res.result[i].smallHeadImgUrl
      delete res.result[i].bigHeadImgUrl
    }
    sessionList.value = res.result.map((item) => {
      if (item.strContent) {
        item.strContent = xmlParser.parse(item.strContent)?.revokemsg || item.strContent
      }
      return item
    })
    // console.log(sessionList.value)
  }
}

export async function handleChooseSession(index) {
  if (activeSessionIndex.value == index || !sessionList.value) {
    return
  }
  handleRemoveAction()
  let item = sessionList.value[index]
  if (activeSessionIndex.value >= 0) {
    activeSessionIndex.value = -1
    setTimeout(async () => {
      activeSessionIndex.value = index
      await getChatRoomInfo(item.strUsrName)
      getMsgList(item.strUsrName)
    }, 300)
  } else {
    activeSessionIndex.value = index
    await getChatRoomInfo(item.strUsrName)
    getMsgList(item.strUsrName)
  }
}
