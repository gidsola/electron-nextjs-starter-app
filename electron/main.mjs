import electron from 'electron';
import serve from 'electron-serve';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const isDev = true;
const serveURL = serve({ directory: 'out' });
const __dirname = dirname(fileURLToPath(import.meta.url));

const { app, BrowserWindow, ipcMain, Menu, MenuItem } = electron;

const contextMenu = new Menu();

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 768,
    frame: isDev,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false
    },
  });

  isDev
    ? await mainWindow.loadURL('http://localhost:3000')
    : await serveURL(mainWindow);

  ipcMain.on('minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.on('maximize', () => {
    mainWindow.isMaximized()
      ? mainWindow.unmaximize()
      : mainWindow.maximize();
  });

  ipcMain.on('close', () => {
    mainWindow.close();
  });


  mainWindow.webContents.on('context-menu', (_, params) => {
    contextMenu.popup({ window: mainWindow, x: params.x, y: params.y });
  });

};

app.on('ready', async () => {

  await createWindow();

  const WebContents = BrowserWindow.getFocusedWindow().webContents

  contextMenu.append(new MenuItem({
    label: 'Print Page', click() {
      WebContents.print((success, e) => {
        if (!success) console.log(e);
      });
    }
  }));

  contextMenu.append(new MenuItem({ type: 'separator' }));
  contextMenu.append(new MenuItem({
    label: 'Copy', click() {
      WebContents.copy();
    }
  }));

  contextMenu.append(new MenuItem({
    label: 'Paste', click() {
      WebContents.paste();
    }
  }));
})
  .on('window-all-closed', async () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  })
  .on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });

