const { app, BrowserWindow } = require('electron');

let mainWindow;

app.whenReady().then(() => {
  //console.log("Electron is ready"); // Debugging log

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1200,
    icon: "Icon.icns", 
    webPreferences: {
      nodeIntegration: true
    }
  });

  console.log("BrowserWindow created"); // Debugging log

  mainWindow.loadFile('index.html').then(() => {
    console.log("index.html loaded successfully"); // Debugging log
  }).catch(err => console.error("Failed to load index.html", err));

  //mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});