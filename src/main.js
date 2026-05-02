const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron'); // Added Menu
const fs = require('fs');
const path = require('path');
const Store = require('electron-store');
const { ASPECT_RATIO, calculateHeight, getDefaultDimensions, getMinimumDimensions } = require('./config/dimensions');
const { createWindowPlacement, resolveWindowBounds } = require('./window_placement');

const store = new Store();

const defaultDimensions = getDefaultDimensions();
const minDimensions = getMinimumDimensions();
let mainWindow = null;
let settingsWindow = null;
let placementLogPath = null;
let isRestoringInitialBounds = false;

function getPlacementLogPath() {
  if (!placementLogPath) {
    placementLogPath = path.join(app.getPath('userData'), 'window-placement.log');
  }

  return placementLogPath;
}

function appendPlacementLog(eventName, details = {}) {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      event: eventName,
      pid: process.pid,
      ...details,
    };

    fs.appendFileSync(getPlacementLogPath(), `${JSON.stringify(entry)}\n`);
  } catch (error) {
    console.error('Failed to write window placement log:', error);
  }
}

function getDisplaySnapshot() {
  return screen.getAllDisplays().map((display) => ({
    id: display.id,
    label: display.label,
    bounds: display.bounds,
    workArea: display.workArea,
    scaleFactor: display.scaleFactor,
    rotation: display.rotation,
  }));
}

function getWindowSnapshot() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return null;
  }

  const bounds = mainWindow.getBounds();
  return {
    bounds,
    contentBounds: mainWindow.getContentBounds(),
    size: mainWindow.getSize(),
    contentSize: mainWindow.getContentSize(),
    displayMatchingBounds: screen.getDisplayMatching(bounds),
  };
}

function getInitialWindowBounds() {
  const savedBounds = store.get('windowBounds');
  const savedPlacement = store.get('windowPlacement');
  const displays = screen.getAllDisplays();
  const resolvedBounds = resolveWindowBounds({
    savedBounds,
    savedPlacement,
    displays,
    defaultWidth: defaultDimensions.width,
    calculateHeight,
  });

  appendPlacementLog('resolve-initial-window-bounds', {
    savedBounds,
    savedPlacement,
    resolvedBounds,
    displays: getDisplaySnapshot(),
  });

  return resolvedBounds;
}

function saveWindowPlacement(bounds, reason = 'unknown') {
  if (isRestoringInitialBounds) {
    appendPlacementLog('skip-save-during-initial-restore', {
      reason,
      bounds,
      window: getWindowSnapshot(),
    });
    return;
  }

  const display = screen.getDisplayMatching(bounds);
  const placement = createWindowPlacement(bounds, display);

  store.set('windowBounds', bounds);
  store.set('windowPlacement', placement);

  appendPlacementLog('save-window-placement', {
    reason,
    bounds,
    placement,
    window: getWindowSnapshot(),
  });
}

function saveMainWindowPlacement(reason = 'unknown') {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  saveWindowPlacement(mainWindow.getBounds(), reason);
}

function forceMainWindowBounds(bounds, reason) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.setBounds(bounds, false);
  appendPlacementLog('force-main-window-bounds', {
    reason,
    requestedBounds: bounds,
    window: getWindowSnapshot(),
  });
}

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
  const initialBounds = getInitialWindowBounds();

  mainWindow = new BrowserWindow({
    ...initialBounds,
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

  appendPlacementLog('created-main-window', {
    initialBounds,
    window: getWindowSnapshot(),
  });

  isRestoringInitialBounds = true;
  [0, 100, 500].forEach((delayMs) => {
    setTimeout(() => {
      forceMainWindowBounds(initialBounds, `initial-restore-${delayMs}ms`);
    }, delayMs);
  });

  setTimeout(() => {
    isRestoringInitialBounds = false;
    saveMainWindowPlacement('initial-restore-complete');
  }, 750);

  [100, 500, 1500].forEach((delayMs) => {
    setTimeout(() => {
      appendPlacementLog('post-create-window-snapshot', {
        delayMs,
        window: getWindowSnapshot(),
      });
    }, delayMs);
  });

  mainWindow.on('resize', () => {
    const [width, height] = mainWindow.getSize();
    const newHeight = calculateHeight(width);
    
    // Enforce the aspect ratio if the height is not correct
    if (height !== newHeight) {
      mainWindow.setSize(width, newHeight, false); // `false` for not animating
    }

    saveMainWindowPlacement('resize');
  });

  mainWindow.on('move', () => {
    saveMainWindowPlacement('move');
  });

  mainWindow.on('will-move', (_event, newBounds) => {
    saveWindowPlacement(newBounds, 'will-move');
  });

  mainWindow.on('resized', () => {
    saveMainWindowPlacement('resized');
  });

  // Ensure app quits when window is closed
  mainWindow.on('close', () => {
    saveMainWindowPlacement('close');

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
