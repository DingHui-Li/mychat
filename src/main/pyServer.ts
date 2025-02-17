import { app } from 'electron'

const path = require('path')
let pyServer: any = null

export async function createPyServer() {
  try {
    let pythonExecutable = 'mychat'
    if (process.platform === 'win32') {
      pythonExecutable = 'mychat.exe'
    }
    let script = ''
    if (app.isPackaged) {
      script = path.join(__dirname, '../pydist/mychat', pythonExecutable)
      pyServer = require('child_process').execFile(script)
    } else {
      script = path.join(__dirname, '../../py', 'mychat.py')
      pyServer = require('child_process').spawn('python', [script])
    }
    if (pyServer != null) {
      console.log('py process success')
      return script
    }
  } catch {
    return false
  }
  return false
}

export function exitPyServer() {
  pyServer?.kill()
  pyServer = null
}
