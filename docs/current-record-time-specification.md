# Current Record Time Specification

**CRITICAL: This behavior must NEVER change.**

## Definition

The **Current Record Time** is the top timer display that shows the exact recording time from OBS Studio's WebSocket API. This is the single source of truth for current recording session time.

## Behavior

### Data Source
- Always uses `outputTimecode` from OBS WebSocket API `GetRecordStatus` call
- Polls OBS every 250ms for real-time updates
- Displays in format `HH:MM:SS` (strips milliseconds from OBS timecode)

### Recording States
1. **Recording** (`●`): Red circle, timer counts up in real-time
2. **Paused** (`❚❚`): Yellow pause symbol, timer shows paused time (no change)
3. **Stopped** (`■`): Gray square, timer shows last recorded time until reset
4. **Idle** (`■`): Gray square, timer shows `00:00:00`

### Key Principles
- **Always reflects OBS truth**: Timer shows exactly what OBS reports
- **Real-time updates**: Changes every 250ms while connected to OBS
- **State-driven display**: Icon and behavior changes based on OBS recording state
- **No manual manipulation**: This timer cannot be manually reset or modified
- **Session-specific**: Resets to `00:00:00` when OBS starts a new recording

### Technical Implementation
- Uses `OBSStatusInterpreter` class for consistent data interpretation
- Main timer display updates via `updateRecordingTimeFromOBS()` method
- Display element: `#main-timer` in HTML
- CSS class: `.main-timer` with large font size and white color

## What This Timer Does NOT Do
- Does not accumulate across multiple recordings
- Does not continue counting when recording is stopped
- Does not have manual reset functionality
- Does not store or persist values locally

This timer is purely a real-time reflection of OBS Studio's current recording session time. 