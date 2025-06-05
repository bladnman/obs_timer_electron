# Timer Display Color Specification

## Overview
All timer displays across all application modes should use consistent color coding to indicate the current state of the timer being displayed. This ensures users can quickly understand the status of any timer regardless of which mode they're using.

## Color Definitions

### Base Color Palette
- **Running/Active**: `#ff4444` (Red) - Timer is actively counting (up or down)
- **Paused**: `#ffcc00` (Yellow) - Timer is paused but can be resumed 
- **Stopped/Inactive**: `#888888` (Gray) - Timer is stopped or not running
- **Overtime/Warning**: Throbbing red - Timer has exceeded target (countdown went negative)

### Mode-Specific Applications

#### OBS Timer Mode
- **Recording**: Red (`#ff4444`) - Session timer while OBS is recording
- **Paused**: Yellow (`#ffcc00`) - Session timer while OBS recording is paused  
- **Stopped**: Gray (`#888888`) - When not recording
- **Total Time**: Always follows current session state colors

#### Stopwatch Mode  
- **Running**: Red (`#ff4444`) - Stopwatch is actively counting up
- **Paused**: Yellow (`#ffcc00`) - Stopwatch is paused but retains current time
- **Stopped**: Gray (`#888888`) - Stopwatch is reset to 00:00:00

#### Timer Mode (Countdown)
- **Running**: Red (`#ff4444`) - Timer is actively counting down
- **Paused**: Yellow (`#ffcc00`) - Timer is paused during countdown
- **Stopped**: Gray (`#888888`) - Timer is not set or has been reset
- **Overtime**: Throbbing red - Timer has gone below 00:00:00 and is counting negative

## Visual Effects

### Overtime Throbbing Effect
When a countdown timer goes below zero (negative time), the display should:
- Continue showing the negative time (e.g., "-00:02:15")
- Apply a throbbing opacity effect between 50% and 100%
- Use red color (`#ff4444`) for the throbbing effect
- Maintain legibility - not a full on/off flash

### Implementation Notes
- Color changes should be smooth with CSS transitions
- Status icons should use the same color palette where applicable
- All time displays (main timer, total timer, etc.) should follow these rules
- Colors should remain consistent across different window sizes and responsive states

## Accessibility
- Ensure sufficient contrast ratios for all color states
- Consider color-blind users - rely on additional visual cues (icons, positioning) alongside color
- Maintain readability in both normal and dimmed display modes