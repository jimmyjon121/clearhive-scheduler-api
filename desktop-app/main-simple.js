const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

// Simple error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

function createMainWindow() {
  console.log('Creating main window...');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    show: true,
    autoHideMenuBar: false
  });

  console.log('Loading index.html...');
  
  // Load the HTML file
  const htmlPath = path.join(__dirname, 'renderer', 'index.html');
  console.log('HTML path:', htmlPath);
  
  mainWindow.loadFile(htmlPath).catch(err => {
    console.error('Failed to load HTML file:', err);
  });

  // Show dev tools for debugging
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load page:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });
}

// App event handlers
app.whenReady().then(() => {
  console.log('App is ready, creating window...');
  createMainWindow();
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

console.log('Electron app starting...');
console.log('Node version:', process.version);
console.log('Electron version:', process.versions.electron);
console.log('Working directory:', process.cwd());
console.log('__dirname:', __dirname);
