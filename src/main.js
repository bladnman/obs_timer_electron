const { app, BrowserWindow, Menu, ipcMain } = require('electron'); // Added Menu
const path = require('path');
const Store = require('electron-store');
const { ASPECT_RATIO, calculateHeight, getDefaultDimensions, getMinimumDimensions } = require('./config/dimensions');

const store = new Store();

const defaultDimensions = getDefaultDimensions();
const minDimensions = getMinimumDimensions();
let mainWindow = null;
let settingsWindow = null;

function loadRenderer(window, query = {}) {
  const viteDevServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (viteDevServerUrl) {
    const url = new URL(viteDevServerUrl);
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    console.log(`Loading from Vite dev server: ${url.toString()}`);
    window.loadURL(url.toString());
    return;
  }

  let indexPath;
  if (app.isPackaged) {
    indexPath = path.join(__dirname, '..', 'dist', 'client', 'index.html');
  } else {
    indexPath = path.join(__dirname, '..', 'dist', 'client', 'index.html');
  }
  console.log(`Loading from production build: ${indexPath}`);
  window.loadFile(indexPath, { query }).catch((error) => {
    console.error('Failed to load index.html:', error);
  });
}

function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return settingsWindow;
  }

  settingsWindow = new BrowserWindow({
    width: 520,
    height: 420,
    minWidth: 420,
    minHeight: 320,
    parent: mainWindow || undefined,
    modal: false,
    show: false,
    frame: true,
    title: 'OBS Timer Settings',
    backgroundColor: '#171717',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
    settingsWindow.focus();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  loadRenderer(settingsWindow, { view: 'settings' });
  return settingsWindow;
}

function createWindow() {
  const { width: savedWidth, x, y } = store.get('windowBounds', { width: defaultDimensions.width });
  const height = calculateHeight(savedWidth);

  mainWindow = new BrowserWindow({
    width: savedWidth,
    height: height,
    x,
    y,
    frame: false,      // Frameless window
    transparent: true, // Transparent background
    alwaysOnTop: true, // Always on top
    resizable: true,   // Allow resizing
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Consider sandbox: true for more security if preload is minimal/empty
    },
    // Setting a minimum size can be useful
    minWidth: minDimensions.width,
    minHeight: minDimensions.height,
    aspectRatio: 1 / ASPECT_RATIO.HEIGHT_RATIO, // Electron expects width/height ratio
  });

  mainWindow.on('resize', () => {
    const [width, height] = mainWindow.getSize();
    const newHeight = calculateHeight(width);
    
    // Enforce the aspect ratio if the height is not correct
    if (height !== newHeight) {
      mainWindow.setSize(width, newHeight, false); // `false` for not animating
    }

    const bounds = mainWindow.getBounds();
    store.set('windowBounds', bounds);
  });

  mainWindow.on('move', () => {
    const bounds = mainWindow.getBounds();
    store.set('windowBounds', bounds);
  });

  // Ensure app quits when window is closed
  mainWindow.on('close', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
    }
    app.quit();
  });

  // --- Menu ---
  // Create a minimal menu, especially for macOS (app menu, copy/paste)
  // and to provide a way to quit and open DevTools.
  const menuTemplate = [
    ...(process.platform === 'darwin' ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(process.platform === 'darwin' ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' }, // Keep DevTools accessible
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    }
  ];
  // @ts-ignore
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  loadRenderer(mainWindow);

  // Add error handling for renderer process
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load page:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('crashed', (event, killed) => {
    console.error('Renderer process crashed:', { killed });
  });

  // Log when the page starts loading
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('Started loading page...');
  });

  // Make window draggable by its content (since frame:false)
  // This makes the whole window draggable while keeping interactive elements clickable
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading successfully');
    mainWindow.webContents.insertCSS(`
      body { 
        -webkit-app-region: drag; 
      } 
      button, 
      input, 
      select, 
      textarea, 
      .timer-display, 
      .menu-button, 
      .toggle-button, 
      .modal-content,
      .settings-modal,
      .clickable-timer { 
        -webkit-app-region: no-drag; 
      }
    `);
  });
  
} // End of createWindow

ipcMain.handle('settings-window:open', () => {
  createSettingsWindow();
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  // For a utility app like timer, quit when window is closed on all platforms
  app.quit();
});

// Ensure app quits on SIGINT (Ctrl+C) from terminal
app.on('before-quit', () => {
  // Perform cleanup if any needed
});
