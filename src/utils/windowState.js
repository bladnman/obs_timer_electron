const { app, screen } = require('electron');
const fs = require('fs');
const path = require('path');

class WindowStateManager {
  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'window-state.json');
    this.defaultState = {
      width: 300,
      height: 120,
      x: undefined,
      y: undefined,
      isMaximized: false,
      displayId: null,
      isCurrentTimeFocused: true
    };
    // Store application state that should be persisted
    this.appState = {};
  }

  /**
   * Load saved window state from disk
   * @returns {Object} Window state object
   */
  loadState() {
    try {
      if (fs.existsSync(this.configPath)) {
        const savedState = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        
        // Validate the saved state and check if the display still exists
        if (this.isValidState(savedState)) {
          return this.validateDisplayExists(savedState);
        }
      }
    } catch (error) {
      console.warn('Failed to load window state:', error.message);
    }
    
    return this.getDefaultState();
  }

  /**
   * Save window state to disk
   * @param {BrowserWindow} window - The window to save state for
   */
  saveState(window) {
    try {
      if (!window || window.isDestroyed()) {
        return;
      }

      const bounds = window.getBounds();
      const display = screen.getDisplayMatching(bounds);
      
      const state = {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        isMaximized: window.isMaximized(),
        displayId: display.id,
        isCurrentTimeFocused: this.appState?.isCurrentTimeFocused ?? true
      };

      fs.writeFileSync(this.configPath, JSON.stringify(state, null, 2), 'utf8');
    } catch (error) {
      console.warn('Failed to save window state:', error.message);
    }
  }

  /**
   * Set up event listeners to automatically save window state
   * @param {BrowserWindow} window - The window to monitor
   */
  manage(window) {
    if (!window || window.isDestroyed()) {
      return;
    }

    // Debounce save operations to avoid excessive writes
    let saveTimeout;
    const debouncedSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        this.saveState(window);
      }, 500);
    };

    // Save state on window events
    window.on('moved', debouncedSave);
    window.on('resized', debouncedSave);
    window.on('maximize', debouncedSave);
    window.on('unmaximize', debouncedSave);
    
    // Save state when window is about to be closed
    window.on('close', () => {
      clearTimeout(saveTimeout);
      this.saveState(window);
    });

    // Also save when app is about to quit
    app.on('before-quit', () => {
      clearTimeout(saveTimeout);
      this.saveState(window);
    });
  }

  /**
   * Validate that the saved state contains required properties
   * @param {Object} state - The state to validate
   * @returns {boolean} True if state is valid
   */
  isValidState(state) {
    return (
      state &&
      typeof state.width === 'number' &&
      typeof state.height === 'number' &&
      state.width > 0 &&
      state.height > 0 &&
      state.width <= 4096 && // Reasonable max width
      state.height <= 2160   // Reasonable max height
    );
  }

  /**
   * Check if the display from saved state still exists, fallback if not
   * @param {Object} state - The saved state
   * @returns {Object} Validated state
   */
  validateDisplayExists(state) {
    const displays = screen.getAllDisplays();
    
    // If we have a saved display ID, check if it still exists
    if (state.displayId) {
      const savedDisplay = displays.find(d => d.id === state.displayId);
      
      if (savedDisplay) {
        // Check if the saved position is still within the display bounds
        if (this.isPositionOnDisplay(state, savedDisplay)) {
          return state;
        }
      }
    }

    // If we have saved coordinates but no valid display, check all displays
    if (typeof state.x === 'number' && typeof state.y === 'number') {
      for (const display of displays) {
        if (this.isPositionOnDisplay(state, display)) {
          return {
            ...state,
            displayId: display.id
          };
        }
      }
    }

    // Fallback to default state on primary display
    console.log('Saved display not found or position invalid, using default state');
    return this.getDefaultState();
  }

  /**
   * Check if a position is within a display's bounds
   * @param {Object} state - Window state with x, y coordinates
   * @param {Object} display - Display object from screen.getAllDisplays()
   * @returns {boolean} True if position is on the display
   */
  isPositionOnDisplay(state, display) {
    const { bounds } = display;
    return (
      state.x >= bounds.x &&
      state.y >= bounds.y &&
      state.x < bounds.x + bounds.width &&
      state.y < bounds.y + bounds.height
    );
  }

  /**
   * Get default window state centered on primary display
   * @returns {Object} Default state
   */
  getDefaultState() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { bounds } = primaryDisplay;
    
    // Center the window on the primary display
    const x = Math.round(bounds.x + (bounds.width - this.defaultState.width) / 2);
    const y = Math.round(bounds.y + (bounds.height - this.defaultState.height) / 2);
    
    return {
      ...this.defaultState,
      x,
      y,
      displayId: primaryDisplay.id
    };
  }

  /**
   * Get window creation options with saved state
   * @returns {Object} Options object for BrowserWindow constructor
   */
  getWindowOptions() {
    const state = this.loadState();
    
    const options = {
      width: state.width,
      height: state.height,
      show: false // Don't show until ready to prevent flashing
    };

    // Only set position if we have valid coordinates
    if (typeof state.x === 'number' && typeof state.y === 'number') {
      options.x = state.x;
      options.y = state.y;
    }

    return options;
  }

  /**
   * Apply saved state to an existing window
   * @param {BrowserWindow} window - The window to apply state to
   */
  applyState(window) {
    if (!window || window.isDestroyed()) {
      return;
    }

    const state = this.loadState();
    
    // Apply maximize state
    if (state.isMaximized) {
      window.maximize();
    } else {
      // Set bounds if not maximized
      if (typeof state.x === 'number' && typeof state.y === 'number') {
        window.setBounds({
          x: state.x,
          y: state.y,
          width: state.width,
          height: state.height
        });
      } else {
        window.setSize(state.width, state.height);
        window.center();
      }
    }
  }

  /**
   * Update the display mode state
   * @param {boolean} isCurrentTimeFocused - Whether current timer is focused
   */
  updateDisplayMode(isCurrentTimeFocused) {
    this.appState.isCurrentTimeFocused = isCurrentTimeFocused;
  }

  /**
   * Get the saved display mode
   * @returns {boolean} Whether current timer should be focused
   */
  getDisplayMode() {
    const state = this.loadState();
    return state.isCurrentTimeFocused ?? true;
  }

  /**
   * Save display mode immediately (used when mode changes)
   * @param {boolean} isCurrentTimeFocused - Whether current timer is focused
   */
  saveDisplayMode(isCurrentTimeFocused) {
    this.updateDisplayMode(isCurrentTimeFocused);
    
    try {
      const currentState = this.loadState();
      const updatedState = {
        ...currentState,
        isCurrentTimeFocused
      };
      
      fs.writeFileSync(this.configPath, JSON.stringify(updatedState, null, 2), 'utf8');
    } catch (error) {
      console.warn('Failed to save display mode:', error.message);
    }
  }
}

module.exports = WindowStateManager; 