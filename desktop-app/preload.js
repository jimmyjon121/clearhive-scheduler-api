const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // API and connectivity
  checkConnection: () => ipcRenderer.invoke('check-connection'),
  getApiUrl: () => ipcRenderer.invoke('get-api-url'),
  saveApiUrl: (url) => ipcRenderer.invoke('save-api-url', url),

  // Settings and preferences
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
