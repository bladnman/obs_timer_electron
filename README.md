# OBS Timer

A cross-platform desktop utility built with Electron that connects to OBS Studio via WebSocket and displays a floating timer for recording sessions.

## Features

- **Live session timer** - Real-time HH:MM:SS timer while OBS is recording
- **Accumulated total time** - Persistent tracking across multiple recording sessions
- **Always on top** - Floats above all applications, including full-screen apps
- **Responsive UI** - Automatically scales and centers when window is resized
- **Auto-reconnection** - Automatically reconnects to OBS if connection is lost
- **Cross-platform** - Works on macOS, Windows, and Linux

## Prerequisites

- **OBS Studio** with WebSocket plugin enabled

## OBS Studio Setup

1. Open OBS Studio
2. Go to **Tools** → **WebSocket Server Settings**
3. Enable **WebSocket Server**
4. Set **Server Port** to `4455` (default)
5. Leave **Server Password** empty (or note it for configuration)
6. Click **Apply** and **OK**

## Installation

### Ready-to-Use Application

After building the application (see Development section below), you'll find installer files in the `dist/` folder:

#### macOS Installation

1. Open the `dist/` folder
2. Double-click `OBS Timer-1.0.0.dmg` (for Intel Macs) or `OBS Timer-1.0.0-arm64.dmg` (for Apple Silicon Macs)
3. Drag "OBS Timer" to your Applications folder
4. Launch from Applications or Spotlight search
5. If prompted about security, go to System Preferences → Security & Privacy → Allow "OBS Timer"

#### Windows Installation

1. Open the `dist/` folder
2. Double-click `OBS Timer Setup 1.0.0.exe`
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

#### Linux Installation

1. Open the `dist/` folder
2. Make the AppImage executable: `chmod +x OBS\ Timer-1.0.0.AppImage`
3. Double-click the AppImage file or run from terminal
4. Optionally, integrate with your desktop environment

### Running as Resident Application

Once installed, OBS Timer will:
- Start when you launch it
- Stay resident in your system (minimize to keep running)
- Remember your total recording time between sessions
- Automatically connect to OBS when available

**To keep it always available:**
- **macOS**: Add to Login Items in System Preferences → Users & Groups
- **Windows**: Pin to taskbar or add to Startup folder
- **Linux**: Add to your desktop environment's autostart applications

## Development Setup

### Prerequisites for Development

- **Node.js** (v18.0.0 or higher)
- **npm** package manager

### Development Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development version:
   ```bash
   npm start
   ```

   For development with DevTools:
   ```bash
   npm run dev
   ```

### Building for Production

#### macOS

```bash
npm run build:mac
```

This creates `.dmg` installers in the `dist/` folder for both Intel and Apple Silicon Macs.

#### Windows

```bash
npm run build:win
```

This creates a `.exe` installer in the `dist/` folder.

#### Linux

```bash
npm run build:linux
```

This creates an `AppImage` in the `dist/` folder.

#### All Platforms

```bash
npm run build
```

## Usage

1. **Launch the app** - A small floating window will appear
2. **Start OBS Studio** - Ensure WebSocket is enabled (see OBS Setup above)
3. **Connection Status**:
   - "Connecting to OBS..." - Initial connection attempt
   - "Connected" - Successfully connected (disappears after 2 seconds)
   - "OBS WS ✕" - Cannot connect to OBS (will retry every 5 seconds)

4. **Recording Status**:
   - `■ Not recording` - Gray square when OBS is not recording
   - `● 00:00:00` - Red circle with live timer when recording
   - Timer counts up in HH:MM:SS format

5. **Total Time** - Shows accumulated time across all recording sessions
6. **Window Controls**:
   - Drag to move the window
   - Resize by dragging edges/corners
   - Always stays on top of other applications

## Window Features

- **Initial size**: 300×120 pixels
- **Minimum size**: 200×80 pixels
- **Always on top**: Stays above all applications
- **Responsive**: Text scales automatically when resizing
- **Persistent**: Total time is saved between app restarts
- **Multi-workspace**: Visible on all virtual desktops

## Troubleshooting

### "OBS WS ✕" Message

This means the app cannot connect to OBS Studio's WebSocket server:

1. **Check OBS is running** - Launch OBS Studio
2. **Enable WebSocket** - Tools → WebSocket Server Settings → Enable
3. **Check port** - Ensure OBS WebSocket is using port 4455
4. **Check password** - If you set a password in OBS, you'll need to modify the app
5. **Firewall** - Ensure localhost connections are allowed

### Timer Not Starting

1. **Check connection** - Ensure "OBS WS ✕" is not showing
2. **Start recording** - Press "Start Recording" in OBS Studio
3. **Check events** - Some OBS versions use different event names

### App Won't Stay on Top

1. **macOS**: Check System Preferences → Mission Control → Displays have separate Spaces
2. **Windows**: Check if other software is forcing focus
3. **Restart** - Try restarting the app

## Development

### Project Structure

```
obs-timer-electron/
├── src/
│   ├── main.js              # Electron main process
│   ├── preload.js           # Secure IPC bridge
│   └── utils/
│       ├── timeUtils.js     # Time formatting utilities
│       └── obsConnection.js # OBS WebSocket manager
├── public/
│   ├── index.html           # Main UI
│   ├── styles.css           # Responsive styling
│   └── renderer.js          # UI logic and event handling
├── __tests__/               # Unit tests
├── docs/                    # Documentation
└── dist/                    # Built applications
```

### Running Tests

```bash
npm test
```

### Code Style

This project follows these principles:
- **DRY** (Don't Repeat Yourself)
- **Separation of Concerns**
- **Clean Architecture**
- **Comprehensive Error Handling**

## Technical Details

### Dependencies

- **Electron** - Cross-platform desktop framework
- **obs-websocket-js** - Official OBS WebSocket client
- **Jest** - Testing framework
- **electron-builder** - Application packaging

### Connection Details

- **WebSocket URL**: `ws://localhost:4455`
- **Default Password**: None
- **Reconnection**: Every 5 seconds
- **Events**: `RecordingStarted`, `RecordingStopped`, `RecordStateChanged`

### Storage

- **Method**: localStorage
- **Key**: `obsTotal`
- **Format**: Total seconds as integer
- **Persistence**: Survives app restarts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please check the existing issues or create a new one with:
- Operating system and version
- OBS Studio version
- Steps to reproduce the issue
- Expected vs actual behavior 