import { ref } from 'vue'
import { clear as clearIndexDB } from '../util/indexDB'

export const readingWxinfo = ref(false)
export const wxinfo = ref({ pid: '', wxid: '', wx_dir: '', key: '', msg: '' })
export const wxDbPath = ref('') //解密后的微信数据库路径
export const myWxUserinfo = ref({
  userName: '',
  nickName: '',
  avatar: ''
})

try {
  wxinfo.value = JSON.parse(localStorage['wxinfo'])
  wxDbPath.value = localStorage['wxDbPath']
} catch {}

export function logout() {
  localStorage.clear()
  clearIndexDB()
  // @ts-ignore (define in dts)
  window.appQuit()
}

export function getWxinfo() {
  readingWxinfo.value = true
  return fetch('http://127.0.0.1:4556/api/wxinfo')
    .then(async (response: Response) => {
      const res = await response.json()
      let info = res.data?.wxinfo
      let result = { msg: '' }
      if (Array.isArray(info) && info.length) {
        if (info[0]?.wxid && info[0]?.wxid != 'None') {
          return info[0]
        } else {
          result.msg = '微信未登录'
        }
      } else {
        result.msg = '微信未运行'
      }
      return result
    })
    .finally(() => {
      readingWxinfo.value = false
    })
}

export function syncWxDb() {
  readingWxinfo.value = true
  return fetch('http://127.0.0.1:4556/api/asyncwxdb', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      wxid: wxinfo.value.wxid,
      key: wxinfo.value.key,
      wxPath: wxinfo.value.wx_dir
    })
  })
    .then(async (response) => {
      const res = await response.json()
      if (res?.data) {
        wxDbPath.value = res.data.outDbPath
        localStorage['wxDbPath'] = wxDbPath.value
      }
    })
    .catch(() => {
      wxinfo.value.msg = '同步微信数据库失败'
    })
    .finally(() => {
      readingWxinfo.value = false
    })
}

export async function getWxUserinfo(username = '') {
  let nickName = ''
  let avatar = ''
  try {
    let res = await window.dbQuery({
      query: `
      SELECT A.NickName,B.smallHeadImgUrl,B.bigHeadImgUrl
      FROM Contact A LEFT JOIN ContactHeadImgUrl B ON A.UserName==B.usrName
      WHERE A.UserName=='${username}'
      `,
      dbname: 'de_MicroMsg'
    })
    if (res?.result) {
      nickName = res.result[0]?.NickName
      avatar = res.result[0].smallHeadImgUrl || res.result[0].bigHeadImgUrl
    } else {
      throw '查询用户信息为空:' + username
    }
  } catch (err) {
    throw err
  }
  return {
    nickName: nickName || '',
    avatar: avatar || ''
  }
}
