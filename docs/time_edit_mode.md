# Time Edit Mode Specification

This document defines the canonical behavior for "time edit mode" used across modes (OBS and Timer).

Goals:
- One consistent interaction model for selecting and editing time segments.
- Reuse the same state, handlers, and styling wherever possible.

Segments:
- Three segments: `hours`, `minutes`, `seconds`.

Enter/Exit Edit Mode:
- Click a specific segment to enter edit mode with that segment selected.
- Click outside the time display exits edit mode.
- Press `Esc` exits edit mode.
- Starting the underlying time process (e.g., starting the timer) exits edit mode.

While Editing:
- Up/Down (or K/J) adjust the selected segment by: hours ±3600s, minutes ±60s, seconds ±1s.
- Hold Shift while pressing Up/Down (or K/J) to adjust by x10 the normal step (e.g., minutes ±600s, seconds ±10s).
- Holding Up/Down (or K/J) repeats adjustments after a short delay, then at a steady interval. The Shift factor is captured at the start of the hold.
- Left/Right (or H/L) move the selection across segments, wrapping around.
- Arrow keys used for editing MUST NOT trigger app-level mode navigation while editing.

Accessibility:
- The time segments are focusable and operable via keyboard (Enter/Space to enter edit mode when applicable).

Architecture & Reuse:
- Shared selection state: use `selectedTimeSegment` from `AppContext` for both OBS and Timer modes.
- Key-hold behavior: use `use_time_adjustment` utility for repeat adjustments.
- Styling: use the same selected segment blue highlight (`.v2-time-segment.selected`).
- Electron: ensure interactive elements opt-out of drag regions with `-webkit-app-region: no-drag`.

Tests:
- Include tests that verify: enter/exit edit mode, per-segment selection, left/right navigation, up/down adjustment, and key-hold repeat.
