# CLAUDE.md

This file provides guidance to AI agents working with this repository.

## Project Overview

Electron desktop application providing a multi-mode timer with OBS Studio integration. Creates an always-on-top floating window for content creators to track recording time.

## IMPORTANT ARCHITECTURAL RULES

See the [docs/app_structure_and_themes.md](docs/app_structure_and_themes.md) file for the most important architectural rules. These rules are enforced by the AI agent.

## Tech Stack

- **Electron 27** - Desktop framework with frameless window
- **React 19 + TypeScript** - Frontend UI
- **Vite** - Build tool and dev server
- **OBS WebSocket v5** - Recording integration

## Key Entry Points

- `src/main.js` - Electron main process
- `src/client/App.tsx` - React root with mode switching
- `src/client/contexts/AppContext.tsx` - Global state management
- `src/client/services/obsService.ts` - OBS WebSocket with auto-reconnect

## Development Commands

```bash
npm run dev                  # Start development
npm run lint                 # Run linting
npm test                     # Run tests

# Production builds (includes test + lint)
npm run build:prod           # Current platform
npm run build:prod:mac       # macOS universal
npm run build:prod:win       # Windows installer
npm run build:prod:linux     # Linux AppImage

# Release management
npm run version:patch        # Bump patch version
npm run release:patch:github # Automated GitHub release
```

## Important Notes

**Testing:**
- Jest + React Testing Library
- Tests in `__tests__/` directory (NOT `src/client/__tests__/`)
- OBS WebSocket fully mocked to avoid ES module issues

**OBS Integration:**
- WebSocket v5 with 10-second auto-reconnection
- 250ms polling during active recording
- Graceful OBS startup/shutdown handling

**Build Configuration:**
- Multi-platform: macOS (DMG), Windows (NSIS), Linux (AppImage)
- App ID: `com.obstools.timer`
- Vite outputs to `dist/client/`
- Node.js >= 18.0.0 required