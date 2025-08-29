const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load a simple HTML string instead of a file
  mainWindow.loadURL(`data:text/html,
    <html>
      <head><title>Test App</title></head>
      <body>
        <h1>Electron Test App</h1>
        <p>If you can see this, Electron is working!</p>
        <p>API URL: https://clearhive-scheduler-api-production-4c35.up.railway.app</p>
        <button onclick="testAPI()">Test API Connection</button>
        <div id="result"></div>
        <script>
          function testAPI() {
            fetch('https://clearhive-scheduler-api-production-4c35.up.railway.app/health')
              .then(r => r.json())
              .then(d => document.getElementById('result').innerHTML = 'API Response: ' + JSON.stringify(d))
              .catch(e => document.getElementById('result').innerHTML = 'API Error: ' + e.message);
          }
        </script>
      </body>
    </html>
  `);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
