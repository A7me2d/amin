const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
try {
  // electron-squirrel-startup must be bundled in the packaged app.
  // If it's missing for any reason, do not crash the app.
  // eslint-disable-next-line global-require
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (_) {
  // ignore
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    icon: path.join(__dirname, 'dist/amin/browser/favicon.ico'),
    show: false, // Don't show until ready
    autoHideMenuBar: true // Hide menu bar (press Alt to show)
  });

  // Hide menu bar completely
  Menu.setApplicationMenu(null);

  // In development, load from Angular dev server
  // In production, load the built Angular app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:4200');
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    // Load the index.html of the app from the built Angular app
    const indexPath = path.join(__dirname, 'dist/amin/browser/index.html');
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Failed to load file:', err);
    });
  }

  // Show window when ready to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
