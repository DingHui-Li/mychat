type Msg = {
  index: number
  localId: number
  CreateTime: number
  DisplayContent: string
  IsSender: number
  StrContent: string
  StrTalker: string
  Type: number
  SubType: number
  TypeName: string
  talker: string
  talkerInfo: {
    avatar: string
    strNickName: string
    UserName: string
  }
  CompressContent: any
  BytesExtra: any
}

type Session = {
  Remark: string
  strUsrName: string
  strNickName: string
  strContent: string
  nMsgType: number
  nTime: number
  avatar: string
}

interface Window {
  dbQuery: Function
  findMsgDb: Function
}

type Contact = {
  FirstLetter: string
  UserName: string
  Alias: string
  avatar: string
  Remark: string
  NickName: string
  displayName: string
  QuanPin: string
  RemarkQuanPin: string
  LabelIDList: string
  ChatRoomType: number
  extraInfo: {
    个性签名: string
    国: string
    省: string
    市: string
    '性别[1男2女]': number
    手机号: string
    朋友圈背景: string
  }
}
