import fs from 'fs'
const path = require('path')

//解析查询结果为对象
export function parseSQLResult(result) {
  let list: Array<any> = []
  try {
    let keys = result[0].columns
    for (const item of result[0].values) {
      let t = {}
      for (const i in item) {
        t[keys[i]] = item[i]
      }
      list.push(t)
    }
  } catch {}
  return list
}

//按照正则查找文件
export function findFiles(dir, pattern) {
  let results: Array<string> = []
  const items = fs.readdirSync(dir)
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      results = results.concat(findFiles(fullPath, pattern))
    } else if (pattern.test(item)) {
      results.push(fullPath)
    }
  }
  return results
}

//解析消息类型
export function parseMsgType(type, subtype) {
  return {
    '1,0': '文本',
    '3,0': '图片',
    '34,0': '语音',
    '37,0': '添加好友',
    '42,0': '推荐公众号',
    '43,0': '视频',
    '47,0': '动画表情',
    '48,0': '位置',

    '49,0': '文件',
    '49,1': '粘贴的文本',
    '49,3': '(分享)音乐',
    '49,4': '(分享)卡片式链接',
    '49,5': '(分享)卡片式链接',
    '49,6': '文件',
    '49,7': '游戏相关',
    '49,8': '用户上传的GIF表情',
    '49,15': '未知-49,15',
    '49,17': '位置共享',
    '49,19': '合并转发的聊天记录',
    '49,24': '(分享)笔记',
    '49,33': '(分享)小程序',
    '49,36': '(分享)小程序',
    '49,40': '(分享)收藏夹',
    '49,44': '(分享)小说(猜)',
    '49,50': '(分享)视频号名片',
    '49,51': '(分享)视频号视频',
    '49,53': '接龙',
    '49,57': '引用回复',
    '49,63': '视频号直播或直播回放',
    '49,74': '文件(猜)',
    '49,87': '群公告',
    '49,88': '视频号直播或直播回放等',
    '49,2000': '转账',
    '49,2003': '赠送红包封面',

    '50,0': '语音通话',
    '65,0': '企业微信打招呼(猜)',
    '66,0': '企业微信添加好友(猜)',

    '10000,0': '系统通知',
    '10000,1': '消息撤回1',
    '10000,4': '拍一拍',
    '10000,5': '消息撤回5',
    '10000,6': '消息撤回6',
    '10000,33': '消息撤回33',
    '10000,36': '消息撤回36',
    '10000,57': '消息撤回57',
    '10000,8000': '邀请加群',
    '11000,0': '未知-11000,0'
  }[`${type},${subtype}`]
}
