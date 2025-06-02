**Project Title:**
OBS Floating Timer – Electron Desktop App

---

## 1. Overview

Build a cross-platform desktop utility (Electron) that connects to OBS Studio via WebSocket and displays:

* **Live session timer** (HH\:MM\:SS) while OBS is recording.
* **Accumulated total time** across multiple recording sessions.

The window must be:

* Always on top (floating above all other applications, including full-screen).
* Resizable and movable.
* Minimal UI (just a big timer readout and a smaller “Total” line).

---

## 2. Objectives

1. **Real-time OBS integration**: Subscribe to OBS’s `RecordingStarted` and `RecordingStopped` events via `obs-websocket-js`.
2. **Persistent “total”**: Accumulate each session’s duration in localStorage (or a small JSON file) so the total persists between app restarts.
3. **Always-on-top window**: Use Electron’s BrowserWindow with `alwaysOnTop: true` and `setVisibleOnAllWorkspaces(true)` so the panel floats on every OS.
4. **Responsive UI**: Timer text scales/centers automatically when the user resizes the window.

---

## 3. Technical Stack & Dependencies

* **Electron (vXX)**
* **obs-websocket-js** (official JavaScript client for OBS WebSocket API)
* **Node.js** (LTS)
* **Optional bundler/compiler**: electron-builder or Electron Forge for packaging

---

## 4. Functional Requirements

1. **WebSocket Connection**

   * On launch, connect to OBS at `ws://localhost:4455` (allow an optional password).
   * If connection fails, display “OBS WS ✕” in place of the timer.

2. **Recording Events**

   * Subscribe to `RecordingStarted`:

     * Record a JavaScript `Date.now()` timestamp.
     * Switch the UI to a red “●” + live timer.
     * Start a `setInterval` that updates elapsed seconds every 250ms (or 1s).
   * Subscribe to `RecordingStopped`:

     * Read `info["total-record-time"]` (in seconds).
     * Stop the live stopwatch.
     * Add the session’s seconds to the running total, persist to localStorage, and update the “Total” display.
     * Switch back to a gray “■ Not recording” state.

3. **UI Layout (HTML/CSS/JS or React)**

   * **Live timer**: a large, monospace HH\:MM\:SS text—centered horizontally.
   * **Status icon**:

     * Gray ■ when not recording.
     * Red ● when recording.
   * **Total line**: smaller “Total: HH\:MM\:SS” below the live timer.
   * Fully responsive: CSS flexbox or similar so that resizing the window keeps text centered and legible.
   * Dark semi-transparent background (e.g., `rgba(30,30,30,0.9)`) and light text (#fff).

4. **Window Behavior**

   * Create an Electron `BrowserWindow` with:

     * `width: 300, height: 120` (initial), `minWidth: 200, minHeight: 80` (minimum).
     * `alwaysOnTop: true`
     * `transparent: false` (or `true` if you want full transparency)
     * `frame: true` (or `false` if you want a frameless panel)
     * `resizable: true`
     * `skipTaskbar: false` (or `true` to hide from Dock/taskbar)
     * After creation, call `mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })`.
   * Window title can be “OBS Floating Timer” (or no visible title if frameless).

5. **Persistence**

   * Store the running total in `localStorage` (in the renderer).
   * On app startup, read `localStorage.getItem("obsTotal")` (default to 0).
   * On each `RecordingStopped`, update `obsTotal` and write back to `localStorage`.
   * Display the persisted total on every launch.

6. **Error Handling & Edge Cases**

   * If OBS’s WebSocket is not enabled / wrong port / wrong password:

     * Show “OBS WS ✕” in place of the timer text.
     * Retry connect every 5 seconds until it succeeds.
   * If the user resizes the window extremely small (<200×80), clamp to minimum dimensions.
   * If the user closes the app normally, the running total must already be saved (no additional action needed).
   * If OBS disconnects mid-recording (crash or forced stop), handle as a “RecordingStopped” event: update total and flip back to “Not recording.”

7. **Packaging & Distribution**

   * Include a build script (using **electron-builder** or **Electron Forge**) that outputs:

     * macOS: a signed `.dmg` or `.app`.
     * Windows: a signed `.exe` installer or portable `.zip`.
   * Users should be able to download and launch without installing Node or Python.

---

## 5. Non-Functional Requirements

* **Cross-platform**: Must run on macOS Big Sur+ and Windows 10+ (Linux is a bonus but not required).
* **Low CPU/memory footprint**: The live timer and WebSocket poll should not exceed \~1% CPU.
* **Quick startup**: Window appears within \~2s of launch.
* **Single-window**: No extra dialogs or complex menus—just the floating timer.
* **Code quality**: Well-structured, commented code; consistent linting/style conventions.
* **Automated tests** (basic):

  * Unit-test the `formatHMS(seconds) → "HH:MM:SS"` function.
  * Mock OBS WebSocket events to ensure the UI updates correctly.

---

## 6. Deliverables

1. **Source code repository** (e.g., GitHub) with:

   * `package.json` (with scripts: `start`, `build:mac`, `build:win`).
   * `main.js` (Electron main process).
   * `public/index.html` (or `src/renderer.js` + React source if using React).
   * `renderer.js` (OBS WebSocket logic + UI updates).
   * `css/styles.css` (or embedded styles).
   * **Tests folder**: e.g., `__tests__/formatHMS.test.js` and any mocks for obs-websocket.
   * Build configuration for electron-builder or Forge (e.g., `forge.config.js` or `electron-builder.json`).

2. **README.md** with:

   * Project description.
   * Setup instructions (`npm install`, `npm run start`).
   * Packaging instructions (`npm run build:mac`, `npm run build:win`).
   * Usage: “Launch the app; if OBS is running with WebSocket enabled on port 4455, the timer appears.”

3. **Automated tests**:

   * At least one unit test for `formatHMS(seconds)`.
   * A stub/mock test that fakes `obsWebSocket.connect()` and `obsWebSocket.on("RecordingStarted")` to verify the UI transitions from “Not recording” to a numeric timer.

---

## 7. Acceptance Criteria

1. **Connection & Status**

   * When OBS is closed or WebSocket is disabled, the window displays “OBS WS ✕” and retries every 5 s.
   * When OBS WebSocket goes online, the UI switches to “■ Not recording.”

2. **Live Timer**

   * Pressing “Start Recording” in OBS immediately causes the window to update from “■ Not recording” to “● 00:00:00” and start counting.
   * The live timer increments every second in HH\:MM\:SS format, with leading zeros.

3. **Total Accumulation**

   * Pressing “Stop Recording” in OBS stops the live timer and adds that session’s duration to the “Total” line.
   * Relaunching the app preserves the total from previous runs.

4. **Window Behavior**

   * The window is always on top of every other application.
   * Resizing the window automatically re-centers and re-sizes the timer text.
   * Moving the window works by dragging the title bar (or entire background if frameless).

5. **Packaging**

   * A user can download a single installer (`.dmg` for macOS, `.exe` for Windows), install or unzip, and run without installing Node or any other dependencies.

6. **Tests**

   * `formatHMS(0)` → `"00:00:00"`, `formatHMS(3661)` → `"01:01:01"`.
   * Simulated “start” and “stop” events update the UI state in a headless test.

---

## 8. Example Prompt for a Coding Agent

> **Task:**
> Build a cross-platform Electron application named **“OBS Floating Timer”** that:
>
> 1. Connects to OBS Studio’s WebSocket API on `ws://localhost:4455` (no password by default).
> 2. Subscribes to `RecordingStarted` and `RecordingStopped` events using **obs-websocket-js**.
> 3. Displays a floating, always-on-top window with:
>
>    * A large status icon (`●` in red if recording, `■` in gray if not).
>    * A live HH\:MM\:SS timer while recording.
>    * A “Total: HH\:MM\:SS” line showing accumulated seconds across sessions (persisted in `localStorage`).
> 4. Automatically reconnects every 5 seconds if OBS WebSocket is unavailable, showing “OBS WS ✕” until connected.
> 5. Uses Electron’s `BrowserWindow` options:
>
>    ```js
>    alwaysOnTop: true,
>    resizable: true,
>    width: 300, height: 120,
>    minWidth: 200, minHeight: 80,
>    skipTaskbar: false,
>    transparent: false,
>    frame: true
>    ```
>
>    and after creation, calls:
>
>    ```js
>    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
>    ```
> 6. Persists the running total in `localStorage` so that closing and reopening the app retains the total.
> 7. Includes a helper function `formatHMS(seconds)` that converts seconds to `"HH:MM:SS"`, and write at least one unit test for it.
> 8. Provide a `package.json` with scripts:
>
>    * `"start": "electron ."`
>    * `"build:mac": "electron-builder --mac"`
>    * `"build:win": "electron-builder --win"`
> 9. Add a basic `README.md` with setup, build, and usage instructions.
> 10. Use **electron-builder** (or Forge) to produce standalone macOS `.dmg` and Windows `.exe` installer files.

> **Deliverables:**
>
> * Full source code (in a Git repo) including `main.js`, `renderer.js` (or React components), `index.html`, CSS, and test files.
> * Config files for Electron Builder (or Forge).
> * README with instructions.
> * Unit test(s) for `formatHMS`.

> **Acceptance Criteria:**
>
> * Launching the packaged app spawns a window that floats above all apps.
> * If OBS is not running or WS is disabled, text reads “OBS WS ✕.”
> * Starting/stopping a recording in OBS toggles the live timer and updates the total.
> * Resizing the window re-centers the timers.
> * Running `npm run build:mac` / `npm run build:win` yields a working installer.
