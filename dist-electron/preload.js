// FILE: preload.js (create in project root, same level as package.json)
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  setWindowSize: (width, height) => ipcRenderer.send('set-window-size', width, height),
  setWindowPosition: (x, y) => ipcRenderer.send('set-window-position', x, y),
  setWindowOpacity: (opacity) => ipcRenderer.send('set-window-opacity', opacity),
  setWindowPin: (isPinned) => ipcRenderer.send('set-window-pin', isPinned),
})