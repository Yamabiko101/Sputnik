import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { closeDatabase } from './database/connection.js'
import { initializeAccounts } from './services/auth.service.js'
import { registerIpcHandlers } from './ipc/registerIpcHandlers.js'

const isDev = !app.isPackaged

function createWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 760,
    minWidth: 900,
    minHeight: 620,
    title: 'Sputnik',
    backgroundColor: '#12100E',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  initializeAccounts()
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  closeDatabase()
})
