import { app, BrowserWindow, Menu, dialog, ipcMain} from "electron";
import * as path from "path";
import * as isDev from "electron-is-dev";
// import {initIpcMain} from './ipc-main-handler';

ipcMain.on('openFileFromRenderer',(event:Electron.IpcMainEvent) => {
  openFile();
});

var win: BrowserWindow;

function createMenu() {
  const template = [
    {
      label: 'Electron',
      submenu: [
        {
          label: 'about'
        }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'Open..',
          accelerator: 'CmdOrCtrl+O', // ショートカットキーを設定
          click: () => { openFile() } // 実行される関数
        }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu);
}
// ファイル選択ダイアログを開く
function openFile() {
  const path = dialog.showOpenDialogSync({properties:['openFile']});
  if(path) {
    console.log(path);
    win.webContents.send('open_file',path);
  }
}

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:3000/index.html");
  } else {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  }

  // Hot Reloading
  if (isDev) {
    // 'node_modules/.bin/electronPath'
    require("electron-reload")(__dirname, {
      electron: path.join(
        __dirname,
        "..",
        "..",
        "node_modules",
        ".bin",
        "electron"
      ),
      forceHardReset: true,
      hardResetMethod: "exit",
    });
  }

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('ready', createMenu)

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// initIpcMain();