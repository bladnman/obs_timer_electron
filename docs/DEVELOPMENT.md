# OBS Timer: Developer Guide

This guide is for developers who want to contribute to the project, build it from source, or understand its technical architecture. For user-focused information, please see the main [README.md](../README.md).

## Development Setup

### Prerequisites

- **Node.js**: v18.0.0 or higher.
- **npm**: Comes bundled with Node.js.
- **Git**: For cloning the repository.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/obs-timer-electron.git
    cd obs-timer-electron
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

To run the application in development mode with live reloading:

```bash
npm run dev
```

This command starts the Vite development server for the React frontend and then launches the Electron application.

## Key Technologies

-   **Electron**: For the desktop application shell.
-   **React**: For building the user interface.
-   **TypeScript**: For static typing and improved code quality.
-   **Vite**: For frontend bundling and development server (fast HMR).
-   **obs-websocket-js**: For communication with OBS Studio.
-   **Jest & React Testing Library**: For unit and component testing.

## Project Structure

-   `src/main.js`: Electron main process entry point. Handles window creation and application lifecycle.
-   `src/preload.js`: Electron preload script for context bridge (currently minimal).
-   `src/client/`: Contains the React/TypeScript frontend application.
    -   `src/client/main.tsx`: Entry point for the React app.
    -   `src/client/App.tsx`: Root React component.
    -   `src/client/components/`: Reusable UI components.
    -   `src/client/contexts/`: React Context for global state management (`AppContext.tsx`).
    -   `src/client/services/`: Services like `obsService.ts` for OBS WebSocket communication.
    -   `src/client/utils/`: Utility functions (e.g., `timeUtils.ts`).
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

For complete release documentation, see [RELEASE.md](RELEASE.md).

## Contributing

Contributions are welcome! Please follow a standard fork-and-pull-request workflow. Ensure new features or fixes are accompanied by tests if applicable. We appreciate your help in making this tool better! 