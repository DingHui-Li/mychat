import { ipcMain, app, shell, dialog } from 'electron'
import path, { resolve } from 'path'
import { createPyServer, exitPyServer } from '../main/pyServer'
const fs = require('fs')

ipcMain.handle('appQuit', async (event, query) => {
  app.quit()
})

ipcMain.handle('openUrl', async (event, url) => {
  if (url) {
    shell.openExternal(url)
  }
})

ipcMain.handle('exportFile', async (event, { content = '', name = '*.json', type = ['json'] }) => {
  return new Promise((resolve, reject) => {
    if (!content || typeof content != 'string') return reject('json为空或不为字符串')
    dialog
      .showSaveDialog({
        title: '保存 JSON 文件',
        defaultPath: path.join(__dirname, name),
        filters: [
          { name: 'JSON 文件', extensions: type },
          { name: '所有文件', extensions: ['*'] }
        ]
      })
      .then((result) => {
        if (!result.canceled && result.filePath) {
          // 将 JSON 数据写入文件
          fs.writeFile(result.filePath, content, (err) => {
            if (err) {
              dialog.showErrorBox('错误', '保存文件失败')
              reject('保存文件失败：')
            } else {
              console.log('文件保存成功:', result.filePath)
              resolve(true)
            }
          })
        } else {
          reject('已取消')
        }
      })
      .catch((err) => {
        reject('文件保存对话框出错')
      })
  })
})

ipcMain.handle('initPyServer', async (event, url) => {
  exitPyServer()
  return createPyServer()
})
