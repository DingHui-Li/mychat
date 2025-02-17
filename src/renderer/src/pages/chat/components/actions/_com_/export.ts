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
  background:#eeeeee;
  overflow: hidden;

  .list {
    width:100%;
    height: 100%;
    overflow: auto;
    max-width:1000px;
    margin:0 auto;
    padding:30px 15px;
    background:#ffffff;
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
  align-items: flex-end;
  margin-bottom: 10px;

  .avatar-box {
    width: 40px;
    height: 40px;
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
      border-radius: 8px;
      background-color: #eee;
      overflow: hidden;
    }

    img {
      width: 100%;
      height: 100%;
    }
  }

  .msg-content-box {
    display: flex;
    position: relative;
    flex: 1;
    overflow: hidden;

    .triangle {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 0;
      height: 0;
      border-bottom: 10px solid #7879EF10;
      border-left: 8px solid transparent;
    }

    .msg-content {
      position: relative;
      width: fit-content;
      max-width: 100%;
      border-radius: 12px;
      padding: 10px;
      background-color: #7879EF10;
      margin-left: 8px;
      border-bottom-left-radius: 0;
      overflow: hidden;

      .actions {
        display: flex;
        justify-content: space-between;

        .time {
          font-size: 12px;
          color: #999;
        }
      }
    }

    &.isSender {
      justify-content: flex-end;

      .triangle {
        left: calc(100% - 8px);
        border-bottom: 10px solid #7879EF;
        border-left: none;
        border-right: 8px solid transparent;
      }

      .msg-content {
        margin-left: 0;
        margin-right: 8px;
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 0;
        background-color: #7879EF;

        .text {
          color: #fff;
        }
      }
    }

    .nickname {
      position: relative;
      top: -5px;
      font-size: 12px;
      color: #999;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .text {
      font-size: 14px;
      color: #333;
      overflow: hidden;
    }

    .other-msg {
      font-size: 12px;
    }
  }
}
`
