# OBS Timer (React Edition)

A cross-platform desktop utility built with Electron and React, that connects to OBS Studio via WebSocket and displays a floating timer for recording sessions. This is a modernized version of the original OBS Timer, rebuilt with React and TypeScript.

## Features

- **Live session timer**: Real-time HH:MM:SS timer while OBS is recording.
- **Accumulated total time**: Persistent tracking across multiple recording sessions (stored in `localStorage`).
- **Always on top**: Floats above all applications.
- **Frameless & Transparent Design**: Clean, modern look that integrates well with your desktop.
- **Configurable OBS Connection**: Settings for OBS host, port, and password.
- **Auto-reconnection**: Automatically attempts to reconnect to OBS if the connection is lost.
- **Cross-platform**: Works on macOS, Windows, and Linux.

## Prerequisites

- **OBS Studio** with WebSocket plugin enabled.
- **Node.js** (v18.0.0 or higher for development).
- **npm** package manager (comes with Node.js).

## OBS Studio Setup

1.  Open OBS Studio.
2.  Go to **Tools** → **WebSocket Server Settings**.
3.  Ensure **Enable WebSocket server** is checked.
4.  Set **Server Port** (default is `4455`).
5.  Optionally, set a **Server Password**.
6.  Click **Apply** and **OK**.

## Installation (After Building)

After building the application (see "Building for Production" below), you'll find installer files in the `dist/` folder. Installation instructions are similar to common applications for your OS (DMG for macOS, EXE for Windows, AppImage for Linux).

## Development

### Setup

1.  Clone this repository:
    ```bash
    git clone <repository-url>
    cd obs-timer-react
    # Replace <repository-url> and obs-timer-react with actual project details if known, otherwise leave generic
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

To run the application in development mode (with live reloading for the React client):

```bash
npm run dev
```

This command starts the Vite development server for the React frontend and then launches the Electron application. Electron will load the frontend from the Vite server. Developer tools for both the main Electron process and the renderer (React app) can be accessed (usually via the View menu added in `main.js` or standard shortcuts).

### Key Technologies

-   **Electron**: For the desktop application shell.
-   **React**: For building the user interface.
-   **TypeScript**: For static typing and improved code quality.
-   **Vite**: For frontend bundling and development server (fast HMR).
-   **obs-websocket-js**: For communication with OBS Studio.
-   **Jest & React Testing Library**: For unit and component testing.

### Project Structure

-   `src/main.js`: Electron main process entry point. Handles window creation and application lifecycle.
-   `src/preload.js`: Electron preload script for context bridge (currently minimal).
-   `src/client/`: Contains the React/TypeScript frontend application.
    -   `src/client/main.tsx`: Entry point for the React app.
    -   `src/client/App.tsx`: Root React component.
    -   `src/client/components/`: Reusable UI components.
    -   `src/client/contexts/`: React Context for global state management (`AppContext.tsx`).
    -   `src/client/services/`: Services like `obsService.ts` for OBS WebSocket communication.
    -   `src/client/utils/`: Utility functions (e.g., `timeUtils.ts`).
    -   `src/client/App.css`: Global styles for the React app.
-   `vite.config.js`: Configuration for Vite.
-   `jest.config.js`: Configuration for Jest.
-   `public/`: Static assets and the `index.html` template for Vite.
-   `__tests__/`: Contains all test files.

## Building for Production

### Quick Production Build with Testing
```bash
# Build with tests and linting (recommended)
npm run build:prod

# Platform-specific builds with testing
npm run build:prod:mac
npm run build:prod:win  
npm run build:prod:linux
```

### Basic Builds (without testing)
```bash
# Build for all configured platforms
npm run build

# Build for specific platforms
npm run build:mac
npm run build:win
npm run build:linux
```

Packaged applications will be found in the `dist/` directory.

## Releases

We have automated release workflows that handle testing, building, version bumping, and GitHub releases.

### Create a Release
```bash
# Patch release (1.0.1 -> 1.0.2) with GitHub release
npm run release:patch:github

# Minor release (1.0.1 -> 1.1.0) 
npm run release:minor:github

# Major release (1.0.1 -> 2.0.0)
npm run release:major:github
```

For complete release documentation, see [docs/RELEASE.md](docs/RELEASE.md).

## Troubleshooting

-   **"OBS WS ✕" or Connection Errors**:
    *   Ensure OBS Studio is running.
    *   Verify WebSocket server is enabled in OBS (Tools → WebSocket Server Settings).
    *   Check that the host, port, and password in the app's settings match OBS.
    *   Check firewall settings if OBS is on a different machine or in a restrictive environment.
-   **Timer Not Updating**:
    *   Ensure you are connected to OBS.
    *   Start recording in OBS. The timer only runs when OBS is actively recording.

## Contributing

Contributions are welcome! Please follow standard fork-and-pull-request workflow. Ensure new features or fixes are accompanied by tests if applicable.

## License

MIT License. See the `LICENSE` file for details.
