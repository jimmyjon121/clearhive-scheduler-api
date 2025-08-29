const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const Store = require('electron-store');

// Initialize electron store for settings
const store = new Store();

let mainWindow;
let preferencesWindow;
let scheduleWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'hiddenInset',
    show: false
  });

  mainWindow.loadFile('renderer/index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Check for saved API URL
    const savedApiUrl = store.get('apiUrl');
    if (savedApiUrl) {
      mainWindow.webContents.send('load-api-url', savedApiUrl);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createPreferencesWindow() {
  if (preferencesWindow) {
    preferencesWindow.focus();
    return;
  }

  preferencesWindow = new BrowserWindow({
    width: 600,
    height: 500,
    parent: mainWindow,
    modal: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  preferencesWindow.loadFile('renderer/preferences.html');

  preferencesWindow.once('ready-to-show', () => {
    preferencesWindow.show();
  });

  preferencesWindow.on('closed', () => {
    preferencesWindow = null;
  });
}

function createScheduleWindow() {
  if (scheduleWindow) {
    scheduleWindow.focus();
    return;
  }

  scheduleWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  scheduleWindow.loadFile('renderer/schedule-generator.html');

  scheduleWindow.once('ready-to-show', () => {
    scheduleWindow.show();
  });

  scheduleWindow.on('closed', () => {
    scheduleWindow = null;
  });
}

function createMenuTemplate() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Schedule',
          accelerator: 'CmdOrCtrl+N',
          click: () => createScheduleWindow()
        },
        {
          label: 'Export Data',
          accelerator: 'CmdOrCtrl+E',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              title: 'Export Schedules',
              defaultPath: 'schedules.json',
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'CSV Files', extensions: ['csv'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('export-data', result.filePath);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Preferences',
          accelerator: 'CmdOrCtrl+,',
          click: () => createPreferencesWindow()
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => mainWindow.webContents.send('navigate-to', 'dashboard')
        },
        {
          label: 'Programs',
          accelerator: 'CmdOrCtrl+2',
          click: () => mainWindow.webContents.send('navigate-to', 'programs')
        },
        {
          label: 'Vendors',
          accelerator: 'CmdOrCtrl+3',
          click: () => mainWindow.webContents.send('navigate-to', 'vendors')
        },
        {
          label: 'Schedules',
          accelerator: 'CmdOrCtrl+4',
          click: () => mainWindow.webContents.send('navigate-to', 'schedules')
        },
        { type: 'separator' },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.reload()
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => mainWindow.webContents.toggleDevTools()
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Generate Weekly Schedule',
          accelerator: 'CmdOrCtrl+W',
          click: () => mainWindow.webContents.send('quick-generate', 'week')
        },
        {
          label: 'Generate Monthly Schedule',
          accelerator: 'CmdOrCtrl+M',
          click: () => mainWindow.webContents.send('quick-generate', 'month')
        },
        { type: 'separator' },
        {
          label: 'Sync with API',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('sync-data')
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          click: () => mainWindow.minimize()
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: () => mainWindow.close()
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Family First Scheduler',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'Family First Scheduler',
              detail: 'Desktop application for managing therapeutic outing schedules.\n\nVersion 1.0.0\nBuilt with Electron'
            });
          }
        },
        {
          label: 'User Guide',
          click: () => shell.openExternal('https://github.com/yourusername/family-first-scheduler/wiki')
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: 'About ' + app.getName(), role: 'about' },
        { type: 'separator' },
        { label: 'Services', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: 'Hide ' + app.getName(), accelerator: 'Command+H', role: 'hide' },
        { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideothers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() }
      ]
    });
  }

  return template;
}

// IPC Handlers
ipcMain.handle('save-api-url', async (event, url) => {
  store.set('apiUrl', url);
  return { success: true };
});

ipcMain.handle('get-api-url', async () => {
  return store.get('apiUrl', '');
});

ipcMain.handle('save-preferences', async (event, preferences) => {
  store.set('preferences', preferences);
  return { success: true };
});

ipcMain.handle('get-preferences', async () => {
  return store.get('preferences', {
    notifications: true,
    autoSync: false,
    theme: 'light'
  });
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('save-report', async (event, reportData) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Report',
      defaultPath: `scheduler-report-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'CSV Files', extensions: ['csv'] }
      ]
    });

    if (!result.canceled) {
      const filePath = result.filePath;
      const extension = path.extname(filePath).toLowerCase();
      
      if (extension === '.csv') {
        // Convert to CSV format
        const csvData = convertToCSV(reportData);
        await fs.writeFile(filePath, csvData, 'utf8');
      } else {
        // Save as JSON
        await fs.writeFile(filePath, JSON.stringify(reportData, null, 2), 'utf8');
      }
      
      return { success: true, filePath };
    }
    
    return { success: false, canceled: true };
  } catch (error) {
    console.error('Save report error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('export-csv', async (event, data, filename) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export CSV',
      defaultPath: filename || 'export.csv',
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    });

    if (!result.canceled) {
      const csvData = convertToCSV(data);
      await fs.writeFile(result.filePath, csvData, 'utf8');
      return { success: true, filePath: result.filePath };
    }
    
    return { success: false, canceled: true };
  } catch (error) {
    console.error('Export CSV error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
  return { success: true };
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data || !data.schedules) return '';
  
  const schedules = data.schedules;
  if (schedules.length === 0) return '';
  
  // CSV headers
  const headers = ['Date', 'Program', 'Vendor', 'Participants', 'Status'];
  const csvRows = [headers.join(',')];
  
  // CSV data rows
  schedules.forEach(schedule => {
    const row = [
      schedule.scheduled_date || '',
      schedule.program_name || '',
      schedule.vendor_name || '',
      schedule.participant_count || 0,
      schedule.status || ''
    ];
    csvRows.push(row.map(field => `"${field}"`).join(','));
  });
  
  return csvRows.join('\n');
}

// App event handlers
app.whenReady().then(() => {
  createMainWindow();
  
  const menu = Menu.buildFromTemplate(createMenuTemplate());
  Menu.setApplicationMenu(menu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
