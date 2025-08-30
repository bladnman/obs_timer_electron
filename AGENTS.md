# CLAUDE.md

This file provides guidance to AI agents working with this repository.

## Project Overview

Electron desktop application providing a multi-mode timer with OBS Studio integration. Creates an always-on-top floating window for content creators to track recording time.

## IMPORTANT ARCHITECTURAL RULES

See the [docs/app_structure_and_themes.md](docs/app_structure_and_themes.md) file for the most important architectural rules. These rules are enforced by the AI agent.

Always be aware of the [docs/app_layout_design/app_layout_design.md](docs/app_layout_design/app_layout_design.md) file and the SVG diagram `docs/app_layout_design/app_layout_design_compact.svg` (canonical). The older PNG is kept for reference only. We are building from a structured templated layout and using `em` as the unit of measurement in almost all cases.

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
npm run typecheck            # Run TypeScript type checks (no emit)
npm test                     # Run tests
npm run test:e2e             # Run Playwright e2e tests
npm run verify               # Lint + typecheck + unit + e2e

# Production builds (includes test + lint)
npm run build:prod           # Current platform
npm run build:prod:mac       # macOS universal
npm run build:prod:win       # Windows installer
npm run build:prod:linux     # Linux AppImage

# Release management
npm run version:patch        # Bump patch version
npm run release:patch:github # Automated GitHub release
npm run publish:patch        # Alias for release:patch:github
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

## Agent Guidance: Time Edit Mode

When implementing or modifying any feature that edits a displayed time (e.g., OBS Total Time, Timer), follow the shared specification in `docs/time_edit_mode.md`.

- Reuse `selectedTimeSegment` from `src/client/contexts/AppContext.tsx` for segment selection state.
- Reuse `use_time_adjustment` for key-hold behavior.
- Ensure arrow keys do not trigger mode navigation while a segment is selected.
- Apply `.v2-time-segment.selected` for the active segment styling; ensure interactive areas are `-webkit-app-region: no-drag` in Electron.
