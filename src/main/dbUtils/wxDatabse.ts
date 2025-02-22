//微信数据库分析：https://github.com/xaoyaoo/PyWxDump/blob/master/doc/wx%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%80%E8%BF%B0.md
import Database from 'sql.js/dist/sql-wasm.js'
import { ipcMain } from 'electron'
import fs from 'fs'
import { findFiles, parseSQLResult, parseMsgType } from './util'

let MicroMsgDb: Database
let MsgDbPool: Array<Database> = []

let wxDBPath: string
let SQLInstance: Database

export async function init(path) {
  SQLInstance = await new Database()
  wxDBPath = path
  MicroMsgDb = new SQLInstance.Database(fs.readFileSync(path + '/de_MicroMsg.db'))
  await initMsgDb()
  console.log('wxDB init success')
}
export async function initMsgDb() {
  MsgDbPool = []
  let allMsgDbFileName = findFiles(wxDBPath, /^de_MSG\d+\.db$/)
  allMsgDbFileName.forEach((filePath) => {
    const db = new SQLInstance.Database(fs.readFileSync(filePath))
    MsgDbPool.push(db)
  })
  console.log('msgDB init success;total:', allMsgDbFileName)
}

ipcMain.handle('initWxDb', async (event, query) => {
  try {
    await init(query)
    return true
  } catch (err) {
    console.log(err)
    return false
  }
})
ipcMain.handle('initWxMsgDb', async (event, query) => {
  try {
    await initMsgDb()
    return true
  } catch (err) {
    console.log(err)
    return false
  }
})

ipcMain.handle('dbQuery', (event, { query = '', dbname = 'de_MicroMsg' }) => {
  try {
    const db = { de_MicroMsg: MicroMsgDb }[dbname]
    if (!db) {
      throw `${dbname}不存在或未读取`
    }
    console.log('exec query:' + query)
    let result = db.exec(query)
    return { result: parseSQLResult(result) }
  } catch (err) {
    return { error: err }
  }
})

//由于聊天数据是分库的，所以单独查询
ipcMain.handle('findMsgDb', async (event, username = '') => {
  if (!MsgDbPool.length) {
    throw `聊天数据库不存在或未读取`
  }
  if (!username) {
    throw `查询对象不能为空`
  }
  let list: Array<any> = []
  for (const db of MsgDbPool) {
    console.log('查询msgDB,', username)
    let result = db.exec(`
      SELECT localId,Type,SubType,IsSender,CreateTime,StrTalker,StrContent,DisplayContent,CompressContent,BytesExtra
      FROM MSG 
      WHERE StrTalker=='${username}'
      ORDER BY CreateTime ASC
    `)
    result = parseSQLResult(result)
    for (const index in result) {
      let item = result[index]
      item.TypeName = parseMsgType(item.Type, item.SubType)
      if (!item.talker && item.BytesExtra && !item.IsSender) {
        try {
          item.talker = getTalker(item.BytesExtra)
          item.talkerInfo = parseSQLResult(
            MicroMsgDb.exec(`
            SELECT A.smallHeadImgUrl,A.bigHeadImgUrl,B.UserName,B.Remark,B.NickName
            FROM ContactHeadImgUrl A INNER JOIN Contact B
            ON A.usrName=B.UserName
            WHERE A.UsrName=='${item.talker}'
          `)
          )[0]
          if (item.talkerInfo) {
            item.talkerInfo.avatar =
              item.talkerInfo.smallHeadImgUrl || item.talkerInfo.bigHeadImgUrl
            item.talkerInfo.strNickName = item.talkerInfo.Remark || item.talkerInfo.NickName
            delete item.talkerInfo.smallHeadImgUrl
            delete item.talkerInfo.bigHeadImgUrl
          }
          // db.exec(`
          //   UPDATE MSG
          //   SET Talker=${item.talker},TalkerInfo=${JSON.stringify(item.talkerInfo)}
          //   WHERE localId=${item.localId}
          // `)
        } catch (e) {
          console.log(e)
        }
      }
    }
    list.push(...result)
  }
  // console.log(list)
  return list.sort((a, b) => a.CreateTime - b.CreateTime)
})

function getTalker(BytesExtra) {
  if (!BytesExtra || !(BytesExtra instanceof Uint8Array)) {
    return null
  }
  try {
    let str = new TextDecoder('utf-8').decode(BytesExtra)
    str = str.replace(/[^a-zA-Z0-9\s.,_!?@-\\<\\>$""''=\\/]/g, '').trim()
    if (str.includes('<msgsource>')) {
      return str.split('<msgsource>')[0]
    } else {
      return str.split('$')[0]
    }
  } catch {
    return null
  }
}
