const { contextBridge, ipcRenderer } = require('electron');

// Expose a minimal or empty API if nothing else is needed from the main process.
// This maintains contextIsolation and a clear boundary.
contextBridge.exposeInMainWorld('electronAPI', {
  openSettingsWindow: () => ipcRenderer.invoke('settings-window:open'),
});

console.log('Preload script loaded. electronAPI context bridged (minimal).');
