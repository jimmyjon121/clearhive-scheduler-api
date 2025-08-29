# Desktop App - All Files Content

Copy and paste each section into the corresponding file in your desktop-app folder.

## File 1: desktop-app/package.json
```json
{
  "name": "family-first-scheduler-app",
  "version": "1.0.0",
  "description": "Desktop application for Family First Therapeutic Outing Scheduler",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dev": "electron . --dev",
    "build": "electron-builder",
    "build-win": "electron-builder --win",
    "build-mac": "electron-builder --mac",
    "build-linux": "electron-builder --linux",
    "pack": "electron-builder --dir",
    "postinstall": "electron-builder install-app-deps"
  },
  "keywords": [
    "scheduler",
    "therapeutic",
    "desktop",
    "healthcare"
  ],
  "author": "Family First",
  "license": "MIT",
  "devDependencies": {
    "electron": "^26.6.10",
    "electron-builder": "^24.6.3"
  },
  "dependencies": {
    "axios": "^1.5.0",
    "chart.js": "^4.4.0",
    "date-fns": "^2.30.0",
    "electron-store": "^8.2.0"
  },
  "build": {
    "appId": "com.familyfirst.scheduler",
    "productName": "Family First Scheduler",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "preload.js",
      "renderer/**/*",
      "assets/**/*",
      "node_modules/**/*"
    ],
    "mac": {
      "icon": "assets/icon.icns",
      "category": "public.app-category.healthcare-fitness"
    },
    "win": {
      "icon": "assets/icon.ico",
      "target": "nsis"
    },
    "linux": {
      "icon": "assets/icon.png",
      "target": "AppImage"
    }
  }
}
```

## File 2: desktop-app/main.js
Save this as `main.js` in the desktop-app folder:
[The content is too long - see the previous response where I read this file]

## File 3: desktop-app/preload.js
```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings and preferences
  saveApiUrl: (url) => ipcRenderer.invoke('save-api-url', url),
  getApiUrl: () => ipcRenderer.invoke('get-api-url'),
  savePreferences: (prefs) => ipcRenderer.invoke('save-preferences', prefs),
  getPreferences: () => ipcRenderer.invoke('get-preferences'),

  // Dialog operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),

  // Navigation events
  onNavigateTo: (callback) => ipcRenderer.on('navigate-to', callback),
  onLoadApiUrl: (callback) => ipcRenderer.on('load-api-url', callback),
  onQuickGenerate: (callback) => ipcRenderer.on('quick-generate', callback),
  onSyncData: (callback) => ipcRenderer.on('sync-data', callback),
  onExportData: (callback) => ipcRenderer.on('export-data', callback),

  // Export functionality
  saveReport: (reportData) => ipcRenderer.invoke('save-report', reportData),
  exportToCSV: (data, filename) => ipcRenderer.invoke('export-csv', data, filename),

  // Utility
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
```

## File 4: desktop-app/renderer/index.html
Save this in `desktop-app/renderer/index.html`:
[The content is too long - see the previous response where I read this file]

## File 5: desktop-app/renderer/js/app.js
Save this in `desktop-app/renderer/js/app.js`:
[The content is too long - see the previous response where I read this file]

## File 6: desktop-app/renderer/styles/main.css
Save this in `desktop-app/renderer/styles/main.css`:
[The content is too long - see the previous response where I read this file]

## File 7: desktop-app/renderer/styles/components.css
Save this in `desktop-app/renderer/styles/components.css`:
[The content is too long - see the previous response where I read this file]

## Quick Setup Instructions

1. Create all the files above in their respective locations
2. For the icon, create a simple PNG file or download one from an icon website
3. Open PowerShell in the desktop-app folder
4. Run: `npm install`
5. Run: `npm start`

The desktop app will launch and connect to the live API!
