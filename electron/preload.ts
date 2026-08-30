import { contextBridge, ipcRenderer } from 'electron'

// via electron-dev: contextBridge exposeInMainWorld polyroot ONLY — NEVER nodeIntegration
contextBridge.exposeInMainWorld('polyroot', {
  ping: () => ipcRenderer.invoke('ping'),
  heatingBoom: (count: number) => ipcRenderer.invoke('heating:boom', count),
  onMainMessage: (cb: (v: string) => void) => ipcRenderer.on('main-process-message', (_e, v) => cb(v)),
})

// Keep legacy ipcRenderer for compat but sandboxed
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...a) => (listener as (...a: unknown[]) => void)(event, ...a))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})
