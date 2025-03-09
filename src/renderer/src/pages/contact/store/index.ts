import { ref, watch } from 'vue'
import { Buffer } from 'buffer'

export const list = ref<Array<Contact>>([])
export const activeContact = ref<Contact>()
export const labelMap = ref()
export const type = ref('')

watch(type, () => {
  getList()
})

export function getList() {
  let query = `
      SELECT A.UserName,A.Alias,A.ReMark,A.NickName,A.QuanPin,A.RemarkQuanPin,A.LabelIdList,A.ChatRoomType,A.ExtraBuf,
      B.smallHeadImgUrl,B.bigHeadImgUrl
      FROM Contact A
      JOIN ContactHeadImgUrl B on A.UserName=B.usrName
      WHERE A.UserName NOT LIKE 'gh_%' 
      AND A.UserName != '@publicUser' 
      AND A.UserName != 'notification_messages'
      AND A.UserName != "notifymessage"
      AND A.UserName != "weixin"
    `
  if (type.value) {
    query += ` AND A.Type IN ${type.value}`
  }
  return window
    .dbQuery({
      query,
      dbname: 'de_MicroMsg'
    })
    .then((res) => {
      if (res.result) {
        res.result.forEach((item) => {
          item.avatar = item.smallHeadImgUrl || item.bigHeadImgUrl
          item.FirstLetter = (item.RemarkQuanPin || item.QuanPin)[0]?.toUpperCase()
          delete item.smallHeadImgUrl
          delete item.bigHeadImgUrl
          item.displayName = item.Remark || item.NickName
          if (item.ExtraBuf) {
            item.extraInfo = getExtraBuf(item.ExtraBuf)
            delete item.ExtraBuf
          }
        })
        list.value = res.result
          .filter((item) => item.FirstLetter !== undefined)
          .sort((a, b) => a.FirstLetter?.localeCompare(b.FirstLetter))
      }
    })
}

export function getLabelMap() {
  window
    .dbQuery({
      query: `
    SELECT LabelId,LabelName
    FROM ContactLabel
  `,
      dbname: 'de_MicroMsg'
    })
    .then((res) => {
      if (res.result) {
        let t = {}
        res.result.forEach((item) => {
          t[item.LabelId] = item.LabelName
        })
        labelMap.value = t
      }
    })
}

function getExtraBuf(ExtraBuf) {
  if (!ExtraBuf || ExtraBuf.length === 0) {
    return null
  }
  ExtraBuf = Buffer.from(ExtraBuf)

  const bufDict = {
    '74752C06': '性别[1男2女]',
    '46CF10C4': '个性签名',
    A4D9024A: '国',
    E2EAA8D1: '省',
    '1D025BBF': '市',
    F917BCC0: '公司名称',
    '759378AD': '手机号',
    '4EB96D85': '企微属性',
    '81AE19B4': '朋友圈背景',
    '0E719F13': '备注图片',
    '945f3190': '备注图片2',
    DDF32683: '0',
    '88E28FCE': '1',
    '761A1D2D': '2',
    '0263A0CB': '3',
    '0451FF12': '4',
    '228C66A8': '5',
    '4D6C4570': '6',
    '4335DFDD': '7',
    DE4CDAEB: '8',
    A72BC20A: '9',
    '069FED52': '10',
    '9B0F4299': '11',
    '3D641E22': '12',
    '1249822C': '13',
    B4F73ACB: '14',
    '0959EB92': '15',
    '3CF4A315': '16',
    C9477AC60201E44CD0E8: '17',
    B7ACF0F5: '18',
    '57A7B5A8': '19',
    '695F3170': '20',
    FB083DD9: '21',
    '0240E37F': '22',
    '315D02A3': '23',
    '7DEC0BC3': '24',
    '16791C90': '25'
  }

  const rdata = {}

  for (const bufName in bufDict) {
    const rdataName = bufDict[bufName]
    const bufBytes = Buffer.from(bufName, 'hex')
    let offset = ExtraBuf.indexOf(bufBytes)

    if (offset === -1) {
      rdata[rdataName] = ''
      continue
    }

    offset += bufBytes.length
    const typeId = ExtraBuf[offset]
    offset += 1

    if (typeId === 0x04) {
      rdata[rdataName] = ExtraBuf.readUInt32LE(offset)
    } else if (typeId === 0x18) {
      const length = ExtraBuf.readUInt32LE(offset)
      const start = offset + 4
      const strBuffer = ExtraBuf.subarray(start, start + length)
      rdata[rdataName] = strBuffer.toString('utf16le').replace(/\x00+$/, '')
    } else if (typeId === 0x17) {
      const length = ExtraBuf.readUInt32LE(offset)
      const start = offset + 4
      const strBuffer = ExtraBuf.subarray(start, start + length)
      rdata[rdataName] = strBuffer.toString('utf8').replace(/\x00+$/, '')
    } else if (typeId === 0x05) {
      const hexStr = ExtraBuf.subarray(offset, offset + 8).toString('hex')
      rdata[rdataName] = `0x${hexStr}`
    }
  }

  return rdata
}

export function handleChooseContact(contact: Contact) {
  activeContact.value = undefined
  setTimeout(() => {
    activeContact.value = contact
  }, 300)
}
