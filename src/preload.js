const { contextBridge /*, ipcRenderer*/ } = require('electron');

// Expose a minimal or empty API if nothing else is needed from the main process.
// This maintains contextIsolation and a clear boundary.
contextBridge.exposeInMainWorld('electronAPI', {
  // No methods exposed for now as settings are client-side
  // and OBS connection is also client-side.
  // This can be expanded if specific main-process features are required later
  // (e.g., native dialogs, complex window manipulation beyond resize/alwaysOnTop).
});

console.log('Preload script loaded. electronAPI context bridged (minimal).');
