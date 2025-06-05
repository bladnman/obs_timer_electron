const { app, BrowserWindow, Menu } = require('electron'); // Added Menu
const path = require('path');

// No longer need fs for settings here as it's client-side localStorage

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 270, // Adjusted width for better content fit
    height: 160, // Adjusted height
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
    minWidth: 150,
    minHeight: 100,
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
    console.log('Loading from production build: dist/client/index.html');
    mainWindow.loadFile(path.join(__dirname, '../dist/client/index.html'));
  }

  // Make window draggable by its content (since frame:false)
  // This is a common pattern, but might need to be selective with CSS.
  // For now, the whole window is draggable.
  // Consider adding a specific draggable region later if needed.
  // mainWindow.webContents.on('did-finish-load', () => {
  //   mainWindow.webContents.insertCSS('body { -webkit-app-region: drag; } button, input, select, textarea, .clickable-timer, .menu-button, .toggle-button, .modal-content { -webkit-app-region: no-drag; }');
  // });
  
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
