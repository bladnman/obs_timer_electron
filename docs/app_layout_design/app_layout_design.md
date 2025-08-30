# Application Layout Definition (Lockdown)

## Definition

This document provides the **canonical layout specification** for the application window. It is intended for both humans and automated agents as the single source of truth for how the base structure of the app is organized. The goal is to ensure that all modes and features of the application render within a consistent, predictable framework that adapts to different window sizes.

**General Principles:**

* The layout prioritizes **consistency and symmetry** — left and right rails (`icon` and `action`) always match in width, margins, and placement.
* The **content region** is the core focus, vertically structured with optional `title` and `sub-display` around a dominant `display`. By default, those optional regions reserve space; modes may opt into a compact variant that collapses them when empty.
* A **status bar** is always visible at the bottom, containing required `settings` (left) and `clock` (right), plus optional `extra-info` (center).
* The entire system uses **relativistic sizing** (e.g., `em`, `%`) to remain fluid across viewports while preserving proportions.
* Reserved space is maintained for optional regions by default to avoid unpredictable reflows. A mode can enable a compact variant that collapses empty `title`/`sub-display` while keeping all other invariants.

This file is not prescriptive about **style** (colors, fonts, visuals), only **structure, invariants, and layout rules**. Styling should be layered on top of this structure.

---

# Application Layout Definition (Lockdown)

> Canonical description of the base window template. Ships with the app alongside `layout.png` (diagram). Styling here is illustrative only; this file defines **structure, invariants, and relative sizing**. Multiple modes must render **within** this template.

---

## Region Map (IDs)

* **window** – outer container (not necessarily a native OS window)

  * **body** – primary area; horizontal layout: `icon | content | action`

    * **icon** *(rail with static width; content optional)*
    * **content** *(always present; vertical layout)*

      * **title** *(optional; reserved space by default; collapsible when empty in compact variant)*
      * **display** *(primary region)*
      * **sub-display** *(optional; reserved space by default; collapsible when empty in compact variant)*
    * **action** *(rail with static width; content optional)*
  * **status-bar** – fixed bottom bar; horizontal: `settings | extra-info | clock`

    * **settings** *(left, required)*
    * **extra-info** *(center, optional)*
    * **clock** *(right, required)*

Refer to `layout.png` for labeled geometry only (colors are non-semantic).

---

## Global Principles

1. **Relativistic sizing**: All dimensions are expressed in relative units (e.g., `em`, `%`, flex fractions). The layout scales proportionally with the `window` size.
2. **Structure over style**: This template constrains **placement** and **proportions**, not typography, color, or visual treatments.
3. **Safe margins**: Content should never clip against container edges. `title` and `sub-display` reserve space by default to prevent explosive reflow. In compact layout, if both are empty they may collapse to zero height, allowing `display` to reclaim space.
4. **Always-on status bar**: `status-bar` is permanently visible at the bottom edge.

---

## Sizing & Spacing Tokens (relative)

* `space.xs = 0.5em`
* `space.sm = 0.75em`
* `space.md = 1em`
* `space.lg = 1.5em`
* `rail.width = 12em`  *(applies to **icon** and **action**; equal, static **relative** width)*
* `status.height = 2.75em`
* `title.minHeight = 2em` *(reserved by default; may collapse to 0 in compact variant when empty)*
* `subDisplay.minHeight = 2em` *(reserved by default; may collapse to 0 in compact variant when empty)

> Note: Values are **relative hints**; implementations may bind tokens to theme scales while keeping proportions and invariants intact.

---

## Layout Spec

### window

* Contains `body` and `status-bar`.
* Fills available viewport/container.

### body

* **Direction**: horizontal; **align**: stretch; **gap**: `space.lg`.
* **Children**: `icon`, `content`, `action`.
* **Edge padding**: `space.lg` (ensures equal left/right breathing room for `icon`/`action`).

### icon (rail)

* **Width**: `rail.width` (static relative). Height: stretch to content.
* **Presence**: the rail may be structurally present even when it renders no content; its width anchors centering and symmetry with `action`.
* **Margins**: equal inner/outer margin to mirror `action`.

### action (rail)

* **Width**: `rail.width` (== `icon` width). Height: stretch.
* **Presence**: the rail may be structurally present even when it renders no content; its width anchors centering and symmetry with `icon`.
* **Margins**: symmetric with `icon`.

### content (required)

* **Direction**: vertical; **gap**: `space.md`.
* **Top/Bottom padding**: `space.lg` to avoid clipping.
* **Children**: `title`, `display`, `sub-display`.

#### title (optional, reserved-by-default)

* **Reserved space (default)**: at least `title.minHeight` even if empty.
* **Compact variant**: when the window enables compact mode and `title` is empty, its height may collapse to `0` to free space for `display`.
* **Overflow**: wrap/ellipsize without increasing block height by default.

#### display (primary)

* **Flex**: grows to occupy remaining height.
* **Min height**: `6em` (or thematically derived) to ensure meaningful canvas.

#### sub-display (optional, reserved-by-default)

* **Reserved space (default)**: at least `subDisplay.minHeight` even if empty.
* **Compact variant**: when the window enables compact mode and `sub-display` is empty, its height may collapse to `0` to free space for `display`.

### status-bar (required)

* **Height**: `status.height`.
* **Direction**: horizontal; **justify**: space-between; **align**: center.
* **Padding**: `space.md`.
* **Slots**:

  * **settings** (left): fixed presence.
  * **extra-info** (center): optional; if absent the center region collapses, left and right stay anchored.
  * **clock** (right): fixed presence.

Note: Modes may place a small, non-interactive mode title in `extra-info` when using the compact variant (see below) to reclaim the vertical space otherwise used by `title`.

---

## Invariants (Must Hold)

1. `icon.width == action.width == rail.width` at all times. Rails may render no content, but their widths remain equal to maintain symmetry.
2. `status-bar` is always visible and docked at the bottom of `window`.
3. `title` and `sub-display` reserve their minimum space by default, even when empty.
4. `display` is the largest vertical consumer inside `content`.
5. No region clips or overflows the `window`; scroll behavior (if any) occurs *inside* `display` rather than the whole `window`.
6. Body edge spacing ensures `icon`/`action` have equal inner/outer padding relative to the `window` edges and `content`.

7. Compact-on-empty variant: when and only when both `title` and `sub-display` are empty and the window opts into compact mode, their heights may collapse to `0` and `display` may expand to reclaim the space.
8. If either `title` or `sub-display` contains content, their reserved heights apply; compact collapse must not occur.

---

## Responsive Behavior

* The template scales from small to large viewports using the same proportions. At extremely small widths:

  * If either side rail would cause clipping, **rails remain fixed** and the `content` shrinks first; when necessary, `display` becomes scrollable.
  * Rails may render no content; their widths remain reserved to preserve centering. Implementations may choose to omit rails entirely, but the reference template uses always-present rails with optional content.
* At large widths, `display` grows; `title`/`sub-display` do **not** expand vertically beyond reserved sizes unless explicitly allowed by the mode. In compact mode, if both are empty, `display` may grow to fill the reclaimed space.

---

## Optional Testing Surface Areas (Non‑Prescriptive)

> The following **hints** define measurable assertions that a QA suite or layout check can implement. They are *suggestions*, not requirements.

### Structural Assertions

* **A1**: Assert `status-bar` exists, is bottom-aligned, and has height ≈ `status.height ± tolerance`.
* **A2**: If `icon` and `action` exist, assert `abs(icon.width - action.width) ≤ tolerance` and both ≈ `rail.width`.
* **A3**: Assert `content` horizontally sits between `icon` and `action` and expands to fill remaining width.
* **A4**: Assert `title.minHeight` and `subDisplay.minHeight` are reserved even when their content is empty, unless the compact-on-empty variant is active and both are empty.
* **A5**: Assert `display.height ≥ (content.height - title.minHeight - subDisplay.minHeight - verticalGaps)`.
* **A6 (compact)**: If the window is in compact-on-empty mode and both `title` and `sub-display` are empty, assert those regions have height `0` and `display` expands vertically.

### Symmetry & Spacing

* **B1**: Left outer padding (window→icon) equals right outer padding (action→window) within tolerance.
* **B2**: Inner gaps match tokens: `gap(body) == space.lg`, `gap(content) == space.md`.

### Responsiveness (sample sizes)

Evaluate at S/M/L widths (example: 480, 960, 1440 units) and two heights (short/tall).

* **C1**: No clipping of `icon`, `action`, `status-bar` at all sizes.
* **C2**: When vertical space is constrained, `display` becomes the scrolling region; `status-bar` remains fixed.
* **C3**: With `icon` or `action` missing, `content` reflows to occupy that rail’s space.

### Overflow & Text Behavior

* **D1**: `title` ellipsizes or wraps without increasing block height beyond `title.minHeight` by default.
* **D2**: `sub-display` behaves similarly to `title`.
* **D3 (compact)**: If a mode shows its label in `status-bar > extra-info` while compact, assert it is centered and non-interactive.

### Anchors & Z‑Order

* **E1**: `status-bar` z-order ≥ body children; remains clickable and visible during scroll in `display`.

> **Tolerance**: Suggest starting at ±2 CSS pixels or ±0.15em, whichever is greater; adjust per platform density.

---

## Implementation Notes (Non-Binding)

* Any UI framework is acceptable (web, mobile, desktop). Bind tokens to the host system’s spacing scale and typographic root to maintain proportions.
* Modes should render **inside** `display`, `title`, and `sub-display` without altering this template’s structure.
* Reference implementation (web) uses the following class hooks:
  * Window opt-in for compact-on-empty: `.app-layout-window.app-layout-compact-when-empty`.
  * Empty region markers (used to reserve or collapse space): `.app-layout-title-empty`, `.app-layout-sub-display-empty`.
  * Status-bar center slot for mode label in compact layouts: `.app-layout-extra-info`.

---

## Diagram

Include `docs/app_layout_design/app_layout_design.png` for the default reserved layout, and `docs/app_layout_design/app_layout_design_compact.svg` for the compact-on-empty variant. Keep both in sync with this document.
