const electron = require('electron');
const {app, BrowserWindow, ipcMain} = electron;

let win;

app.on('ready', ()=>{
    win = new BrowserWindow({show: false});
    win.loadURL(`file://${__dirname}/index.html`);
    win.maximize();
    win.setResizable(false);
    win.once('ready-to-show', () => {
        win.show()
    });
    //win.webContents.openDevTools();
})
