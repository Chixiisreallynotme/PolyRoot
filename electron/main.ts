import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// via electron-dev + electron-builder: ESM + fileURLToPath + VITE_DEV_SERVER_URL
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT!, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT!, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT!, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null
let puceCount = 0

function createWindow() {
  // [4th-wall:electron] PolyRoot a essayé de s'échapper de ton OS — boot
  console.log('[4th-wall:electron] PolyRoot a essayé de s\'échapper de ton OS — PID', process.pid, '—', new Date().toISOString())

  win = new BrowserWindow({
    title: 'Tu es coincé aussi ?',
    width: 960,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0a0a',
    autoHideMenuBar: true,
    icon: path.join(process.env.VITE_PUBLIC!, 'vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// IPC seam for heating:boom — logs [4th-wall:electron]
ipcMain.handle('ping', () => 'pong')
ipcMain.handle('heating:boom', (_e, count: number) => {
  puceCount = count
  console.log('[4th-wall:electron] PolyRoot a essayé de s\'échapper de ton OS — puce #' + puceCount + ' PID', process.pid, '—', new Date().toISOString())
  return { ok: true }
})

app.on('window-all-closed', () => {
  if (puceCount < 8) {
    console.log('[4th-wall:electron] PolyRoot a essayé de s\'échapper de ton OS — window-all-closed non fini 8/8 — PID', process.pid, '—', new Date().toISOString())
  }
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.whenReady().then(createWindow)
