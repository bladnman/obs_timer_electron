# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Electron desktop application that provides a multi-mode timer with OBS Studio integration. The app creates an always-on-top floating window designed for content creators to track time during recordings.

## Architecture

**Main Technologies:**
- Electron (desktop app framework)
- React with TypeScript (frontend)
- Node.js (backend/main process)
- OBS WebSocket API integration

**Key Entry Points:**
- `src/main.js` - Electron main process, window management
- `src/client/App.tsx` - React root component with mode switching
- `src/client/contexts/AppContext.tsx` - Global state management via React Context

**Core Components:**
- `ClockMode` - Digital clock display
- `OBSMode` - OBS recording time tracker with WebSocket connection
- `StopwatchMode` - Manual stopwatch functionality  
- `CountdownMode` - Countdown timer with alerts
- `SettingsMode` - Configuration interface

**Services:**
- `src/client/services/obsService.ts` - OBS WebSocket connection management with auto-reconnection

## Development Commands

```bash
# Start development (both main and renderer processes)
npm run dev

# Start only client development server
npm run dev:client

# Run tests
npm test

# Run linting
npm run lint

# Build for current platform
npm run build

# Build for specific platforms
npm run build:mac
npm run build:windows
npm run build:linux
```

## Testing

- Jest with React Testing Library
- Tests located in `src/client/__tests__/`
- OBS WebSocket is mocked to avoid ES module issues
- Run single test: `npm test -- --testNamePattern="test name"`

## Key Patterns

**State Management:**
- React Context (`AppContext`) manages global application state
- Local state for component-specific data
- Settings persisted to localStorage

**Timer Implementation:**
- `setInterval` based with proper cleanup in `useEffect`
- Time formatting utilities in `src/client/utils/timeUtils.ts`

**Window Management:**
- Frameless, always-on-top Electron window
- Resizable with persistent position/size via settings
- Touch bar support on macOS

**OBS Integration:**
- WebSocket connection with automatic reconnection
- Recording status monitoring
- Handles OBS startup/shutdown gracefully

## Configuration

**Main Settings:**
- Window position, size, and always-on-top behavior
- OBS WebSocket connection details (host, port, password)
- Timer preferences and default modes

**Build Configuration:**
- `forge.config.js` - Electron Forge build configuration
- Platform-specific builds with proper signing and notarization setup
- GitHub Actions for automated releases

## Development Notes

- The app uses a frameless window design with custom title bar
- Touch/swipe gestures supported for mode switching
- Comprehensive error handling for OBS connection failures
- Settings are validated and provide fallback defaults