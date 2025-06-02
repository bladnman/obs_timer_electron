const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let obsWebSocket = null;
let isOBSConnected = false;

function createWindow() {
  // Create the browser window with specified requirements
  mainWindow = new BrowserWindow({
    width: 300,
    height: 120,
    minWidth: 200,
    minHeight: 80,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    transparent: false,
    frame: true,
    title: 'OBS Timer',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  // Load the HTML file
  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  // Set window to be visible on all workspaces and full screen
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    // Quit the application when window is closed
    app.quit();
  });

  // Development mode handling
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent) => {
    navigationEvent.preventDefault();
  });
});

// Handle IPC messages from renderer
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// OBS WebSocket IPC handlers
ipcMain.handle('obs-connect', async (event, { address, password }) => {
  try {
    // Dynamic import for obs-websocket-js
    const OBSWebSocket = await import('obs-websocket-js').then(m => m.default || m);
    
    if (obsWebSocket) {
      try {
        await obsWebSocket.disconnect();
      } catch {
        // Ignore disconnect errors
      }
    }
    
    obsWebSocket = new OBSWebSocket();
    
    // Set up event listeners
    obsWebSocket.on('ConnectionClosed', () => {
      isOBSConnected = false;
      if (mainWindow) {
        mainWindow.webContents.send('obs-disconnected');
      }
    });
    
    obsWebSocket.on('ConnectionError', (error) => {
      isOBSConnected = false;
      if (mainWindow) {
        mainWindow.webContents.send('obs-connection-error', error.message);
      }
    });
    
    obsWebSocket.on('RecordStateChanged', (data) => {
      if (mainWindow) {
        if (data.outputState === 'OBS_WEBSOCKET_OUTPUT_STARTED') {
          mainWindow.webContents.send('obs-recording-started', data);
        } else if (data.outputState === 'OBS_WEBSOCKET_OUTPUT_STOPPED') {
          mainWindow.webContents.send('obs-recording-stopped', data);
        } else if (data.outputState === 'OBS_WEBSOCKET_OUTPUT_PAUSED') {
          mainWindow.webContents.send('obs-recording-paused', data);
        } else if (data.outputState === 'OBS_WEBSOCKET_OUTPUT_RESUMED') {
          mainWindow.webContents.send('obs-recording-resumed', data);
        }
      }
    });
    
    // Legacy events
    obsWebSocket.on('RecordingStarted', (data) => {
      if (mainWindow) {
        mainWindow.webContents.send('obs-recording-started', data);
      }
    });
    
    obsWebSocket.on('RecordingStopped', (data) => {
      if (mainWindow) {
        mainWindow.webContents.send('obs-recording-stopped', data);
      }
    });
    
    // Connect
    await obsWebSocket.connect(address, password || '');
    isOBSConnected = true;
    
    if (mainWindow) {
      mainWindow.webContents.send('obs-connected');
    }
    
    return { success: true };
  } catch (error) {
    isOBSConnected = false;
    return { success: false, error: error.message };
  }
});

ipcMain.handle('obs-disconnect', async () => {
  try {
    if (obsWebSocket && isOBSConnected) {
      await obsWebSocket.disconnect();
    }
    obsWebSocket = null;
    isOBSConnected = false;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('obs-get-version', async () => {
  try {
    if (!obsWebSocket || !isOBSConnected) {
      throw new Error('Not connected to OBS');
    }
    const version = await obsWebSocket.call('GetVersion');
    return { success: true, data: version };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('obs-get-recording-status', async () => {
  try {
    if (!obsWebSocket || !isOBSConnected) {
      throw new Error('Not connected to OBS');
    }
    const status = await obsWebSocket.call('GetRecordStatus');
    
    return { 
      success: true, 
      data: status  // Pass through raw OBS response as single source of truth
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}); 