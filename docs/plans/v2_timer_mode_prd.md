# V2 “Timer” Mode PRD

- Title: V2 “Timer” Mode
- Owner: TBD
- Status: Draft for review
- Target Version: V2
- Created: YYYY-MM-DD

## Summary

Port the legacy “Timer” mode into the new V2 screen architecture, using the standardized layout structure defined in `docs/app_layout_design/app_layout_design.md` (and `app_layout_design.png`) and adhering to architectural rules in `docs/app_structure_and_themes.md`. Implement unified mode navigation with arrow keys while preserving in-mode edit behavior. Outcome: two V2 modes available and navigable in order — Recording Timer (first) then Timer (second) — with correct arrow-key behavior, edit-mode gating, and consistent layout/theming using `em` units.

## Goals

- Consistent V2 layout: Implement Timer using V2 layout primitives; sizes/spacing in `em`.
- Mode navigation: Right/Down advances; Left/Up goes back; order matches the previous app, with Recording Timer first and Timer second.
- Input handling: Centralize arrow key handling so global mode changes never interfere with per-screen edit interactions.
- State clarity: Use `AppContext` (or equivalent) to manage active mode, edit state, and navigation rules.
- Test coverage: Add unit/integration tests for mode navigation and edit-mode gating.

## Non-Goals

- New timer features beyond parity with the previous Timer mode.
- OBS integration changes (Timer mode does not depend on OBS).
- Rework of other modes outside wiring them into the new navigation.

## User Stories

- As a user, I can switch between Recording Timer and Timer using arrow keys in the defined order.
- As a user, when I edit time values within Timer, arrow keys adjust values without changing the mode.
- As a user, I see a consistent, clean layout and typography across modes.

## Functional Requirements

- Mode registry: Define canonical mode order; include at least `recordingTimer` and `timer`.
- Navigation mapping: Right/Down ⇒ next mode; Left/Up ⇒ previous mode; wrap or clamp behavior (TBD; see Open Questions).
- Edit gating: When a mode is in edit state, global arrow navigation must be disabled; only the active mode consumes arrow keys.
- Timer features: Mirror prior Timer behavior (count down/up, set duration, start/stop, reset, audible/visual end cue if present previously); confirm exact feature set from the previous version.
- Focus rules: If a form control has focus in edit mode, arrow keys must not bubble to global navigation.

## Non-Functional Requirements

- Layout/theming: Follow `docs/app_layout_design/app_layout_design.md` and `app_layout_design.png`; use `em` units.
- Architecture guardrails: Respect `docs/app_structure_and_themes.md` conventions and constraints.
- Accessibility: Keyboard operable; logical focus order; labels for controls; avoid focus loss on mode switch.
- Performance: No jank on transitions; avoid excessive re-renders.
- Stability: No interference with OBS websocket service while in Timer.

## Architecture Decisions

- Mode registry: Introduce a central `modeOrder` and mode metadata (id, title, icon, component) in `src/client/constants/modes.ts` (or similar).
- Input management: Add a top-level keyboard handler in `src/client/App.tsx` or a `GlobalHotkeys` provider. It checks `AppContext.isEditing` (or a scoped input “lock”) before handling arrow keys for navigation.
- Edit scope: Provide a hook `useInputScope({ consumesArrowsWhenEditing: true })` for modes to declare they own arrow keys while editing.
- State: Extend `AppContext` to expose `activeModeId`, `setActiveModeId`, `isEditing`, and helpers `goNextMode()`/`goPrevMode()` that follow `modeOrder`.
- Composition: Timer mode implemented as a V2 “mode module” exporting a `ModeDefinition` (id, title, component, keymap options) and a screen component that composes V2 layout sections.

## Layout and UI

- Header: Mode title “Timer”; optional status or small controls if consistent with V2 header.
- Body: Primary timer display (large readable digits), secondary info (remaining vs elapsed), edit affordances, start/stop/reset controls.
- Footer/Hints: Arrow hints for mode switching (only when not editing) and key hints for Timer controls per V2 guidelines.
- Spacing: Use `em`-based sizes and spacing consistent with design; ensure visual parity with Recording Timer V2.

## Keyboard Behavior

- Global: Arrow Left/Up ⇒ previous mode; Arrow Right/Down ⇒ next mode; disabled when `isEditing === true`.
- Mode-local (Timer): Arrow Up/Down adjusts selected field in edit mode; Left/Right moves field caret/segment per Timer’s design; Enter toggles edit mode; Esc exits edit mode; Space toggles start/stop (confirm against prior behavior).
- Recording Timer: Refactor to use the same `useInputScope` so behavior matches and conflicts are avoided.
- Propagation: Use `preventDefault/stopPropagation` only within edit scope; otherwise let global handler act.

## State and Data

- AppContext: `activeModeId`, `modeOrder`, `isEditing`, `setIsEditing`, `goNextMode`, `goPrevMode`.
- Timer state: `duration`, `remaining`, `isRunning`, `lastStartAt` or tick source; derived `progress`.
- Persistence: Only if previous app persisted timer settings; otherwise session-only (TBD).

## Component Breakdown

- `TimerV2Screen`: Main screen; composes V2 layout primitives.
- `TimerDisplay`: Large digits; supports edit-mode segment highlighting.
- `TimerControls`: Start/Stop/Reset/Edit buttons plus keyboard hint badges.
- `ModeChromeV2`: Shared header/footer per V2.
- `GlobalHotkeys`/`InputScopeProvider`: Top-level keyboard dispatcher and scope management.

## File/Module Targets (Proposed)

- `src/client/constants/modes.ts`: Mode order and metadata.
- `src/client/contexts/AppContext.tsx`: Extend with mode + edit state and navigation helpers.
- `src/client/components/layout/V2/...`: Use existing layout components; add any missing wrappers.
- `src/client/modes/timer/TimerV2Screen.tsx`: New mode screen.
- `src/client/providers/GlobalHotkeys.tsx`: Centralized key handling and scope registry.

## Testing

- Unit: `AppContext` navigation helpers; `InputScope` gating logic; Timer reducers/utilities.
- Integration: Render App with both modes; assert arrow navigation skips while `isEditing=true`; assert correct order.
- Interaction: Timer edit mode — arrow keys change values and do not switch modes; exiting edit mode re-enables global nav.
- Snapshots/Accessibility: Basic a11y checks and focus flow.
- Location: `__tests__/` per repo convention; mock timers with Jest fake timers; no OBS dependencies.

## Acceptance Criteria

- Recording Timer appears first; Timer appears second in mode order.
- Right/Down switches to the next mode; Left/Up to the previous; order matches prior app, with the above two first.
- When editing within a mode, arrow keys never change modes; they only affect the field/value being edited.
- Timer mode layout matches V2 structure and uses `em` units.
- Tests cover navigation order, edit gating, and basic Timer interactions.

## Risks and Mitigations

- Conflicting legacy key handlers on Recording Timer — migrate to `InputScope` and remove page-level global handlers.
- Unclear legacy Timer feature set — quick audit of previous Timer spec/implementation; confirm parity list.
- Focus edge cases — add explicit focus tests and guard global handler when active element is editable.

## Open Questions

- Wrap vs clamp on mode navigation at ends? Proposed: wrap for cyclic navigation; confirm preference.
- Exact Timer features from previous version (e.g., count up, signals, presets)?
- Should the footer always show navigation hints, or only when not editing?
- Persist last-used duration or reset on app start?

## Milestones

1) Define mode registry and extend `AppContext` with mode + edit state and helpers.
2) Implement `GlobalHotkeys` and `InputScope`; refactor Recording Timer to use it.
3) Build `TimerV2Screen` with V2 layout and basic timer logic.
4) Wire Timer into registry (second position); add footer hints and visuals.
5) Tests for navigation, edit gating, Timer interactions; fix a11y/focus regressions.
6) Polish, docs, and QA sign-off.

## Estimated Effort

- M1–M2: 1–2 days
- M3–M4: 2–3 days
- M5–M6: 1–2 days

