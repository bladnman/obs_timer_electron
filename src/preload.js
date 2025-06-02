const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // OBS WebSocket functionality via IPC
  obs: {
    connect: (address, password) => ipcRenderer.invoke('obs-connect', { address, password }),
    disconnect: () => ipcRenderer.invoke('obs-disconnect'),
    getVersion: () => ipcRenderer.invoke('obs-get-version'),
    getRecordingStatus: () => ipcRenderer.invoke('obs-get-recording-status'),
    
    // Event listeners
    onConnected: (callback) => {
      ipcRenderer.on('obs-connected', callback);
      return () => ipcRenderer.removeListener('obs-connected', callback);
    },
    onDisconnected: (callback) => {
      ipcRenderer.on('obs-disconnected', callback);
      return () => ipcRenderer.removeListener('obs-disconnected', callback);
    },
    onConnectionError: (callback) => {
      ipcRenderer.on('obs-connection-error', callback);
      return () => ipcRenderer.removeListener('obs-connection-error', callback);
    },
    onRecordingStarted: (callback) => {
      ipcRenderer.on('obs-recording-started', callback);
      return () => ipcRenderer.removeListener('obs-recording-started', callback);
    },
    onRecordingStopped: (callback) => {
      ipcRenderer.on('obs-recording-stopped', callback);
      return () => ipcRenderer.removeListener('obs-recording-stopped', callback);
    },
    onRecordingPaused: (callback) => {
      ipcRenderer.on('obs-recording-paused', callback);
      return () => ipcRenderer.removeListener('obs-recording-paused', callback);
    },
    onRecordingResumed: (callback) => {
      ipcRenderer.on('obs-recording-resumed', callback);
      return () => ipcRenderer.removeListener('obs-recording-resumed', callback);
    }
  }
}); 