// FILE: main.js
import { app, BrowserWindow, ipcMain } from 'electron';
import { join, dirname } from 'path';  // ← Named imports
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);  // ← Use dirname

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
    // frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js')  // ← Use join
    }
  });
  
  mainWindow.loadFile(join(app.getAppPath(), 'dist-react', 'index.html'));
});

// IPC handlers
ipcMain.on('set-window-size', (event, width, height) => {
  if (mainWindow) mainWindow.setSize(width, height);
});

ipcMain.on('set-window-position', (event, x, y) => {
  if (mainWindow) mainWindow.setPosition(x, y);
});

ipcMain.on('set-window-opacity', (event, opacity) => {
  if (mainWindow) mainWindow.setOpacity(opacity);
});

ipcMain.on('set-window-pin', (event, isPinned) => {
  if (mainWindow) mainWindow.setAlwaysOnTop(isPinned);
});
