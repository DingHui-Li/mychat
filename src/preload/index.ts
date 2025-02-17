import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  //默认
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('appQuit', () => ipcRenderer.invoke('appQuit'))
    contextBridge.exposeInMainWorld('initWxDb', (path) => ipcRenderer.invoke('initWxDb', path))
    contextBridge.exposeInMainWorld('dbQuery', (params) => ipcRenderer.invoke('dbQuery', params))
    contextBridge.exposeInMainWorld('initPyServer', (params) =>
      ipcRenderer.invoke('initPyServer', params)
    )
    contextBridge.exposeInMainWorld('initWxMsgDb', (params) =>
      ipcRenderer.invoke('initWxMsgDb', params)
    )
    contextBridge.exposeInMainWorld('exportFile', (params) =>
      ipcRenderer.invoke('exportFile', params)
    )
    contextBridge.exposeInMainWorld('findMsgDb', (params) =>
      ipcRenderer.invoke('findMsgDb', params)
    )
    contextBridge.exposeInMainWorld('openUrl', (url) => ipcRenderer.invoke('openUrl', url))
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
}
