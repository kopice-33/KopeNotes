import { app, BrowserWindow } from 'electron';
import { join } from 'path';


app.on('ready',() => {
    const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: { webSecurity: false }
    });
    win.loadFile(join(app.getAppPath() + '/dist-react/index.html'))
});