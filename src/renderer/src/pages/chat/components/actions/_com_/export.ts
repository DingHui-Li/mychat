export const shortcuts = [
  {
    text: '近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '近一月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '近3月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  },
  {
    text: '今年至今',
    value: () => {
      const start = new Date(`${new Date().getFullYear()}-1-1`)
      const end = new Date()
      return [start, end]
    }
  }
]

export const msgTypeList = [
  {
    label: '文本',
    key: '文本'
  },
  {
    label: '图片（暂未支持）',
    key: '图片',
    disabled: true
  },
  {
    label: '语音（暂未支持）',
    key: '语音',
    disabled: true
  },
  {
    label: '文件（暂未支持）',
    key: '文件',
    disabled: true
  }
]

export const msgStyle = `
.export-html {
  height: 100vh;
  width:100vw;
  background:#fff;
  overflow: hidden;

  .list {
    width:100%;
    height: 100%;
    overflow: auto;
    max-width:1000px;
    margin:0 auto;
    padding:30px 15px;
    background:#f5f5f5;
    box-sizing: border-box;
  }
}
.msg-date {
  background-color: #eee;
  border-radius: 5px;
  padding: 2px 5px;
  font-size: 12px;
  width: fit-content;
  margin: 0 auto;
  margin-bottom: 10px;
  color: #999;
}

.system-msg {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 30px;
}

.single-msg {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  &.special {
    align-items: flex-start;
  }

  .avatar-box {
    width: 35px;
    height: 35px;
    overflow: hidden;
    font-size: 20px;
    font-weight: bold;
    color: #e0e0e0;

    .avatar {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      align-items: center;
      // border-radius: 8px;
      background-color: #eee;
      overflow: hidden;
    }

    img {
      width: 100%;
      height: 100%;
    }
  }

  .msg-content-box {
    position: relative;
    flex: 1;
    overflow: hidden;
    padding: 0 5px;

    .nickname {
      position: relative;
      font-size: 12px;
      color: #999;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-left: 10px;
    }

    .emoji {
      max-width: 200px;
      height: fit-content;
      margin: 0 10px;
    }

    .msg-box {
      display: inline-block;
      position: relative;

      .triangle {
        position: absolute;
        left: -7px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border: 8px solid transparent;
        border-right: 10px solid #fff;
      }

      .msg-content {
        position: relative;
        width: fit-content;
        max-width: 100%;
        border-radius: 4px;
        padding: 6px 8px;
        background-color: #fff;
        margin-left: 8px;
        overflow: hidden;
        cursor: text;

        .text {
          font-size: 14px;
          color: #333;
          overflow: hidden;
          user-select: text;
        }
      }
    }

    &.isSender {
      text-align: right;

      .triangle {
        left: calc(100% - 10px);
        border-right: none;
        border-left: 8px solid #95EC69;
      }

      .msg-content {
        margin-left: 0;
        margin-right: 8px;
        border-bottom-right-radius: 0;
        background-color: #95EC69;

        .text {}
      }
    }

    .other-msg {
      font-size: 12px;
    }
  }
}
`
