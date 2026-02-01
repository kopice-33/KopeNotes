// FILE: main.js
import { app, BrowserWindow, ipcMain } from 'electron';
import { join, dirname } from 'path';  // ← Named imports
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);  // ← Use dirname

let mainWindow;
let isDragging = false;
let dragStart = { x: 0, y: 0 };

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
    // frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: true, 
    movable: true,
    useContentSize: true,
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
  if (mainWindow) {
    // Use setContentSize instead of setSize
    mainWindow.setContentSize(width, height);
    
    // OR if you want exact size including frame:
    mainWindow.setSize(width, height);
    
    console.log('Set size to:', width, 'x', height);
  }
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

ipcMain.on('set-window-size', (event, width, height) => {
  if (mainWindow) {
    const [currentWidth, currentHeight] = mainWindow.getSize();
    
    mainWindow.setSize(width, height);
    
    const [newWidth, newHeight] = mainWindow.getSize();
  }
});
ipcMain.on('start-drag', (event) => {
  if (mainWindow) {
    const [x, y] = mainWindow.getPosition();
    const mousePos = screen.getCursorScreenPoint();
    
    // Calculate offset from window to mouse
    const offsetX = mousePos.x - x;
    const offsetY = mousePos.y - y;
    
    // Start system drag
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
    
    const moveHandler = (e) => {
      const newX = e.screenX - offsetX;
      const newY = e.screenY - offsetY;
      mainWindow.setPosition(newX, newY);
    };
    
    const upHandler = () => {
      mainWindow.setIgnoreMouseEvents(false);
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }
});