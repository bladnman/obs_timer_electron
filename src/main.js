const { app, BrowserWindow, Menu } = require('electron'); // Added Menu
const path = require('path');
const Store = require('electron-store');

const store = new Store();

const INITIAL_WIDTH = 422;
const ASPECT_RATIO = INITIAL_WIDTH / 102;
const INITIAL_HEIGHT = Math.round(INITIAL_WIDTH / ASPECT_RATIO);

function createWindow() {
  const { width: savedWidth, x, y } = store.get('windowBounds', { width: INITIAL_WIDTH });
  const height = Math.round(savedWidth / ASPECT_RATIO);

  const mainWindow = new BrowserWindow({
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
    minWidth: 211, // Half of the initial size
    minHeight: Math.round(211 / ASPECT_RATIO),
    aspectRatio: ASPECT_RATIO,
  });

  mainWindow.on('resize', () => {
    const [width, height] = mainWindow.getSize();
    const newHeight = Math.round(width / ASPECT_RATIO);
    
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


  const viteDevServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (viteDevServerUrl) {
    console.log(`Loading from Vite dev server: ${viteDevServerUrl}`);
    mainWindow.loadURL(viteDevServerUrl);
    // Optionally open DevTools if VITE_DEV_SERVER_URL is set (implies development)
    // mainWindow.webContents.openDevTools();
  } else {
    // In packaged app, files are relative to the app directory
    // In development, files are in dist/client relative to the project root
    let indexPath;
    if (app.isPackaged) {
      // In packaged app, the dist/client directory is at the root level of app.asar
      indexPath = path.join(__dirname, '..', 'dist', 'client', 'index.html');
    } else {
      // In development, look relative to the src directory
      indexPath = path.join(__dirname, '..', 'dist', 'client', 'index.html');
    }
    console.log(`Loading from production build: ${indexPath}`);
    mainWindow.loadFile(indexPath).catch((error) => {
      console.error('Failed to load index.html:', error);
    });
  }

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
  
  // IPC handlers removed as settings are client-side

} // End of createWindow

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Ensure app quits on SIGINT (Ctrl+C) from terminal
app.on('before-quit', () => {
  // Perform cleanup if any needed
});
