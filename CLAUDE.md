# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Electron desktop application that provides a multi-mode timer with OBS Studio integration. The app creates an always-on-top floating window designed for content creators to track time during recordings.

## Architecture

**Main Technologies:**
- Electron 27 (desktop app framework)
- React 19 with TypeScript (frontend)
- Vite (build tool and dev server)
- OBS WebSocket v5 API integration

**Key Entry Points:**
- `src/main.js` - Electron main process, window management, frameless UI
- `src/preload.js` - Electron preload script for secure context isolation
- `src/client/App.tsx` - React root component with mode switching and touch gestures
- `src/client/main.tsx` - React app bootstrap
- `src/client/contexts/AppContext.tsx` - Global state management via React Context

**Core Timer Components:**
- `OBSMode` - OBS recording time tracker with WebSocket connection status
- `StopwatchMode` - Manual stopwatch with start/stop/reset functionality
- `TimerMode` - Countdown timer with setup mode and overtime detection  
- `ClockMode` - Digital clock with 12/24-hour format toggle

**Supporting Components:**
- `ThreeColumnLayout` - Consistent layout wrapper for all timer modes
- `ConnectionStatus` - OBS connection status display with retry capability
- `ModeSelector` - Visual mode switcher in sidebar
- `MenuBar` - Hamburger menu with settings and controls
- `SettingsModal` - OBS connection configuration dialog

**Services:**
- `src/client/services/obsService.ts` - OBS WebSocket connection with auto-reconnection every 10 seconds
- `src/client/utils/timeUtils.ts` - Time formatting utilities

## Development Commands

```bash
# Start development (Vite dev server + Electron)
npm run dev

# Start only React dev server on localhost:3000
npm run dev:client

# Build React app for production
npm run build:client

# Run tests with Jest
npm test

# Run linting with ESLint
npm run lint
npm run lint:fix

# Production builds (includes test + lint)
npm run build:prod          # Current platform
npm run build:prod:mac      # macOS (DMG with x64/arm64)
npm run build:prod:win      # Windows (NSIS installer)
npm run build:prod:linux    # Linux (AppImage)

# Development builds (skip tests)
npm run build               # Current platform
npm run build:mac
npm run build:win  
npm run build:linux

# Version management
npm run version:patch       # Bump patch version
npm run version:minor       # Bump minor version
npm run release:patch:github # Automated release with GitHub integration
```

## Testing

**Test Stack:**
- Jest with jsdom environment
- React Testing Library for component testing
- TypeScript support via ts-jest
- Tests located in `__tests__/` directory (not `src/client/__tests__/`)

**Mock Configuration:**
- OBS WebSocket completely mocked to avoid ES module issues
- localStorage globally mocked
- Static assets (images, CSS) mocked with jest-transform-stub
- Window APIs (confirm, etc.) mocked in setupTests.ts

**Running Tests:**
- `npm test` - Run all tests
- `npm test -- --testNamePattern="specific test"` - Run single test
- `npm test -- --watch` - Watch mode
- Coverage reports generated in `coverage/` directory

## Key Architecture Patterns

**State Management:**
- React Context (`AppContext`) manages all application state
- State persisted to localStorage for user preferences
- Derived state computed for formatted time strings
- Action handlers for state mutations and side effects

**Component Architecture:**
```
App
├── MenuBar (settings, brightness, reset controls)
├── ModeSelector (mode switching UI)  
└── Current Mode Component
    ├── ThreeColumnLayout (consistent layout)
    └── ConnectionStatus (for OBS mode)
```

**OBS Integration:**
- WebSocket v5 API with automatic reconnection
- Recording status monitoring with real-time updates
- 250ms polling interval during active recording
- Graceful handling of OBS startup/shutdown

**Electron Window Management:**
- Frameless window with custom draggable regions (`-webkit-app-region`)
- Always-on-top behavior with persistent positioning
- 422:102 aspect ratio lock during resize
- Window state persistence via electron-store
- Touch Bar support on macOS

**Timer Implementation:**
- `setInterval` based with proper cleanup in `useEffect`
- Individual timer states managed in AppContext
- Time formatting utilities handle duration display

## Build Configuration

**Electron Builder Setup:**
- Multi-platform builds: macOS (DMG), Windows (NSIS), Linux (AppImage)
- App ID: `com.obstools.timer`
- Universal macOS builds (x64 + arm64)
- Proper file inclusion patterns for Electron + Vite
- Icon and metadata configuration per platform

**Vite Configuration:**
- React plugin with TypeScript support
- Relative base path for Electron compatibility
- Development server integration with Electron main process
- Production build outputs to `dist/client/`

**Dependencies:**
- **Runtime**: electron-store (settings), obs-websocket-js (OBS), react-icons (UI)
- **Development**: Comprehensive TypeScript + React + Testing setup
- **Node.js >= 18.0.0** required