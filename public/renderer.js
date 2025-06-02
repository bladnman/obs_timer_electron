/**
 * OBS Floating Timer - Renderer Process
 * Main application logic for the floating timer UI
 */

/**
 * OBS Data Interpreter - Single source of truth for OBS status
 */
class OBSStatusInterpreter {
  constructor(rawOBSData) {
    this.raw = rawOBSData || {};
  }

  get isOutputActive() {
    return Boolean(this.raw.outputActive);
  }

  get isOutputPaused() {
    return Boolean(this.raw.outputPaused);
  }

  get timecode() {
    return this.raw.outputTimecode || '00:00:00';
  }

  get duration() {
    return this.raw.outputDuration || 0;
  }

  get displayTimecode() {
    // Parse OBS timecode format "00:01:23.456" to display format "00:01:23"
    const parts = this.timecode.split('.');
    return parts[0]; // Return just the HH:MM:SS portion
  }

  get durationInSeconds() {
    try {
      const timeOnly = this.timecode.split('.')[0]; // Remove milliseconds if present
      const [hours, minutes, seconds] = timeOnly.split(':').map(Number);
      return (hours * 3600) + (minutes * 60) + seconds;
    } catch (error) {
      console.error('Error parsing timecode:', this.timecode, error);
      return 0;
    }
  }

  get recordingState() {
    if (this.isOutputActive && this.isOutputPaused) {
      return 'paused';
    } else if (this.isOutputActive && !this.isOutputPaused) {
      return 'recording';
    } else if (this.timecode !== '00:00:00') {
      return 'stopped';
    } else {
      return 'idle';
    }
  }

  get hasRecordedTime() {
    return this.timecode && this.timecode !== '00:00:00';
  }
}

class FloatingTimer {
  constructor() {
    // Check if electronAPI is available
    if (!window.electronAPI) {
      this.showError('Electron API not available!');
      return;
    }

    // DOM elements
    this.statusIcon = document.getElementById('status-icon');
    this.mainTimer = document.getElementById('main-timer');
    this.totalTimer = document.getElementById('total-timer');
    this.connectionStatus = document.getElementById('connection-status');
    this.connectionText = document.getElementById('connection-text');

    // Control elements
    this.toggleDisplayButton = document.getElementById('toggle-display');
    this.resetTotalButton = document.getElementById('reset-total');

    // Settings modal elements
    this.settingsButton = document.getElementById('settings-button');
    this.settingsModal = document.getElementById('settings-modal');
    this.closeModal = document.getElementById('close-modal');
    this.obsHostInput = document.getElementById('obs-host');
    this.obsPortInput = document.getElementById('obs-port');
    this.obsPasswordInput = document.getElementById('obs-password');
    this.saveSettingsButton = document.getElementById('save-settings');
    this.testConnectionButton = document.getElementById('test-connection');
    this.connectionResult = document.getElementById('connection-result');

    // Timer state
    this.isRecording = false;
    this.recordingStartTime = null;
    this.currentSessionSeconds = 0;
    this.totalSeconds = 0;
    this.timerInterval = null;
    this.reconnectInterval = null;

    // Display state - true = current time focused, false = total time focused
    this.isCurrentTimeFocused = true;

    // Settings
    this.settings = new Settings();

    // Event cleanup functions
    this.eventCleanupFunctions = [];

    // Initialize
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Load saved total time
      this.loadTotalTime();
      this.updateTotalDisplay();

      // Load settings and populate form
      this.loadSettings();

      // Set up event listeners
      this.setupEventListeners();

      // Set up OBS event listeners
      this.setupOBSEventListeners();

      // Set initial state
      this.setNotRecordingState();

      // Set initial display focus
      this.updateDisplayFocus();

      // Start connection attempt
      await this.connectToOBS();

    } catch (error) {
      console.error('Error initializing Floating Timer:', error);
      this.showError('Initialization failed: ' + error.message);
    }
  }

  /**
   * Show error state
   */
  showError(message) {
    if (this.mainTimer) {
      this.mainTimer.textContent = message;
    }
    if (this.connectionText) {
      this.connectionText.textContent = 'Error';
    }
    if (this.connectionStatus) {
      this.connectionStatus.className = 'connection-status error';
      this.connectionStatus.classList.remove('hidden');
    }
  }

  /**
   * Set up OBS event listeners using the new IPC API
   */
  setupOBSEventListeners() {
    // Connected event
    const onConnected = () => this.handleOBSConnected();
    this.eventCleanupFunctions.push(window.electronAPI.obs.onConnected(onConnected));

    // Disconnected event
    const onDisconnected = () => this.handleOBSDisconnected();
    this.eventCleanupFunctions.push(window.electronAPI.obs.onDisconnected(onDisconnected));

    // Connection error event
    const onConnectionError = (event, error) => this.handleOBSConnectionFailed(error);
    this.eventCleanupFunctions.push(window.electronAPI.obs.onConnectionError(onConnectionError));

    // Recording started event
    const onRecordingStarted = (event, data) => this.handleRecordingStarted(data);
    this.eventCleanupFunctions.push(window.electronAPI.obs.onRecordingStarted(onRecordingStarted));

    // Recording stopped event
    const onRecordingStopped = (event, data) => this.handleRecordingStopped(data);
    this.eventCleanupFunctions.push(window.electronAPI.obs.onRecordingStopped(onRecordingStopped));

    // Recording paused event
    const onRecordingPaused = (event, data) => this.handleRecordingPaused(data);
    this.eventCleanupFunctions.push(window.electronAPI.obs.onRecordingPaused(onRecordingPaused));

    // Recording resumed event
    const onRecordingResumed = (event, data) => this.handleRecordingResumed(data);
    this.eventCleanupFunctions.push(window.electronAPI.obs.onRecordingResumed(onRecordingResumed));
  }

  /**
   * Connect to OBS using the new IPC API
   */
  async connectToOBS() {
    try {
      this.updateConnectionStatus('Connecting to OBS...', 'connecting');
      this.connectionStatus.classList.remove('hidden');

      const settings = this.settings.load();
      const address = `ws://${settings.obsHost}:${settings.obsPort}`;
      
              const result = await window.electronAPI.obs.connect(address, settings.obsPassword);
      
      if (!result.success) {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error) {
      this.handleOBSConnectionFailed(error.message);
      this.startReconnectTimer();
    }
  }

  /**
   * Start automatic reconnection timer
   */
  startReconnectTimer() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
    
    this.reconnectInterval = setInterval(() => {
      this.connectToOBS();
    }, 5000);
  }

  /**
   * Stop automatic reconnection timer
   */
  stopReconnectTimer() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  /**
   * Handle successful OBS connection
   */
  async handleOBSConnected() {
    this.updateConnectionStatus('Connected', 'connected');
    this.stopReconnectTimer();
    
    // Hide connection status after a brief moment
    setTimeout(() => {
      this.connectionStatus.classList.add('hidden');
    }, 2000);

    // Start polling OBS for recording status regardless of initial state
    this.startOBSPolling();

    // Check initial recording state
    try {
      const result = await window.electronAPI.obs.getRecordingStatus();
      if (result.success && result.data.isRecording) {
        this.isRecording = true;
        this.recordingStartTime = Date.now(); // Fallback timestamp
      } else {
        this.isRecording = false;
      }
      // The polling will handle updating the display
    } catch (error) {
      this.setNotRecordingState();
    }
  }

  /**
   * Handle OBS connection failure
   */
  handleOBSConnectionFailed(errorMessage) {
    this.updateConnectionStatus('OBS WS ✕', 'disconnected');
    this.connectionStatus.classList.remove('hidden');
    this.setDisconnectedState();
    this.startReconnectTimer();
  }

  /**
   * Handle OBS disconnection
   */
  handleOBSDisconnected() {
    this.updateConnectionStatus('OBS WS ✕', 'disconnected');
    this.connectionStatus.classList.remove('hidden');
    this.setDisconnectedState();
    
    // Stop polling OBS
    this.stopOBSPolling();
    
    // If we were recording, stop the timer and save progress
    if (this.isRecording) {
      this.stopRecordingTimer();
      this.saveCurrentSession();
    }

    this.startReconnectTimer();
  }

  /**
   * Handle recording started event
   */
  handleRecordingStarted(data) {
    this.startRecordingTimer();
  }

  /**
   * Handle recording stopped event
   */
  handleRecordingStopped(data) {
    this.stopRecordingTimer();
    this.saveCurrentSession();
  }

  /**
   * Handle recording paused event
   */
  handleRecordingPaused(data) {
    this.setPausedState();
  }

  /**
   * Handle recording resumed event
   */
  handleRecordingResumed(data) {
    this.setRecordingState();
  }

  /**
   * Start polling OBS for recording status
   */
  startOBSPolling() {
    // Stop any existing polling
    this.stopOBSPolling();

    // Start polling OBS for recording status every 250ms
    this.timerInterval = setInterval(async () => {
      await this.updateRecordingTimeFromOBS();
    }, 250);
  }

  /**
   * Stop polling OBS for recording status
   */
  stopOBSPolling() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Start the recording timer (now just updates state, polling handles display)
   */
  startRecordingTimer() {
    if (this.isRecording) {
      return; // Already recording
    }

    this.isRecording = true;
    this.recordingStartTime = Date.now(); // Fallback timestamp
    this.currentSessionSeconds = 0;
  }

  /**
   * Stop the recording timer
   */
  stopRecordingTimer() {
    if (!this.isRecording) {
      return; // Not recording
    }

    this.isRecording = false;

    // Note: We don't stop the OBS polling here - we want to keep 
    // showing the paused time from OBS
  }

  /**
   * Save the current recording session to total time
   */
  saveCurrentSession() {
    if (this.currentSessionSeconds > 0) {
      this.totalSeconds += this.currentSessionSeconds;
      this.saveTotalTime();
      this.updateTotalDisplay();
      this.currentSessionSeconds = 0;
    }
  }

  /**
   * Set UI to recording state (icon only)
   */
  setRecordingState() {
    this.statusIcon.textContent = '●';
    this.statusIcon.className = 'status-icon recording';
    // Timer display is handled centrally in updateRecordingTimeFromOBS
  }

  /**
   * Set UI to paused state (icon only)
   */
  setPausedState() {
    this.statusIcon.textContent = '❚❚';
    this.statusIcon.className = 'status-icon paused';
    // Timer display is handled centrally in updateRecordingTimeFromOBS
  }

  /**
   * Set UI to not recording state (icon only)
   */
  setNotRecordingState() {
    this.statusIcon.textContent = '■';
    this.statusIcon.className = 'status-icon stopped';
    // Timer display is handled centrally in updateRecordingTimeFromOBS
  }

  /**
   * Set UI to disconnected state
   */
  setDisconnectedState() {
    this.statusIcon.textContent = '✕';
    this.statusIcon.className = 'status-icon disconnected';
    this.mainTimer.textContent = '00:00:00';
  }

  /**
   * Update recording time from OBS WebSocket
   */
  async updateRecordingTimeFromOBS() {
    try {
      const result = await window.electronAPI.obs.getRecordingStatus();
      if (result.success) {
        // Use single source of truth interpreter
        const obsStatus = new OBSStatusInterpreter(result.data);
        
        // Update display with OBS timecode
        this.mainTimer.textContent = obsStatus.displayTimecode;
        
        // Update internal counter for total time tracking
        this.currentSessionSeconds = obsStatus.durationInSeconds;
        
        // Update recording state tracking
        const wasRecording = this.isRecording;
        this.isRecording = obsStatus.recordingState === 'recording';
        
        // Update total display in real-time
        this.updateTotalDisplay();
        
        // Update UI state based on recording state
        switch (obsStatus.recordingState) {
          case 'recording':
            this.setRecordingState();
            break;
          case 'paused':
            this.setPausedState();
            break;
          case 'stopped':
          case 'idle':
          default:
            this.setNotRecordingState();
            break;
        }
      } else {
        // Fallback to our own timer if OBS doesn't have recording data
        this.currentSessionSeconds = window.timeUtils.getElapsedSeconds(this.recordingStartTime);
        this.updateMainTimerDisplay();
      }
    } catch (error) {
      console.error('Error getting recording status from OBS:', error);
      // Fallback to our own timer
      this.currentSessionSeconds = window.timeUtils.getElapsedSeconds(this.recordingStartTime);
      this.updateMainTimerDisplay();
    }
  }

  // Note: parseOBSTimecode and parseTimecodeToSeconds functions removed
  // All timecode parsing is now handled by OBSStatusInterpreter class

  /**
   * Update the main timer display
   */
  updateMainTimerDisplay() {
    const displaySeconds = this.isRecording ? this.currentSessionSeconds : 0;
    this.mainTimer.textContent = window.timeUtils.formatHMS(displaySeconds);
  }

  /**
   * Update the total timer display
   */
  updateTotalDisplay() {
    // Calculate real-time total while recording
    const realTimeTotal = this.totalSeconds + (this.isRecording ? this.currentSessionSeconds : 0);
    this.totalTimer.textContent = window.timeUtils.formatHMS(realTimeTotal);
  }

  /**
   * Update connection status display
   */
  updateConnectionStatus(text, statusClass) {
    this.connectionText.textContent = text;
    this.connectionStatus.className = `connection-status ${statusClass}`;
  }

  /**
   * Load total time from localStorage
   */
  loadTotalTime() {
    const saved = localStorage.getItem('obs-timer-total-seconds');
    this.totalSeconds = saved ? parseInt(saved, 10) : 0;
  }

  /**
   * Save total time to localStorage
   */
  saveTotalTime() {
    localStorage.setItem('obs-timer-total-seconds', this.totalSeconds.toString());
  }

  /**
   * Toggle which timer is prominently displayed
   */
  toggleDisplayFocus() {
    this.isCurrentTimeFocused = !this.isCurrentTimeFocused;
    this.updateDisplayFocus();
  }

  /**
   * Update display focus styling
   */
  updateDisplayFocus() {
    if (this.isCurrentTimeFocused) {
      // Current time is focused (large, white)
      this.mainTimer.className = 'main-timer focused';
      this.totalTimer.className = 'total-timer unfocused';
    } else {
      // Total time is focused (large, white)
      this.mainTimer.className = 'main-timer unfocused';
      this.totalTimer.className = 'total-timer focused';
    }
  }

  /**
   * Reset total time (for new projects)
   */
  resetTotalTime() {
    // Confirm reset action
    const confirmed = window.confirm('Reset total time to 00:00:00? This will clear your project time.');
    if (!confirmed) {
      return;
    }

    this.totalSeconds = 0;
    this.saveTotalTime();
    this.updateTotalDisplay();
  }

  /**
   * Set up DOM event listeners
   */
  setupEventListeners() {
    // Settings button
    this.settingsButton.addEventListener('click', () => this.showSettingsModal());

    // Toggle display focus - button
    this.toggleDisplayButton.addEventListener('click', () => this.toggleDisplayFocus());

    // Toggle display focus - clicking on timers
    this.mainTimer.addEventListener('click', () => this.toggleDisplayFocus());
    this.totalTimer.addEventListener('click', () => this.toggleDisplayFocus());

    // Reset total time
    this.resetTotalButton.addEventListener('click', () => this.resetTotalTime());

    // Close modal
    this.closeModal.addEventListener('click', () => this.hideSettingsModal());

    // Save settings
    this.saveSettingsButton.addEventListener('click', () => this.saveSettings());

    // Test connection
    this.testConnectionButton.addEventListener('click', () => this.testConnection());

    // Close modal when clicking outside
    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) {
        this.hideSettingsModal();
      }
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.settingsModal.classList.contains('hidden')) {
        this.hideSettingsModal();
      }
    });
  }

  /**
   * Load settings and populate form
   */
  loadSettings() {
    const settings = this.settings.load();
    this.obsHostInput.value = settings.obsHost;
    this.obsPortInput.value = settings.obsPort;
    this.obsPasswordInput.value = settings.obsPassword;
  }

  /**
   * Show settings modal
   */
  showSettingsModal() {
    this.loadSettings(); // Refresh form with current settings
    this.settingsModal.classList.remove('hidden');
    this.connectionResult.textContent = '';
    this.obsHostInput.focus();
  }

  /**
   * Hide settings modal
   */
  hideSettingsModal() {
    this.settingsModal.classList.add('hidden');
    this.connectionResult.textContent = '';
  }

  /**
   * Save settings from form
   */
  async saveSettings() {
    const settings = {
      obsHost: this.obsHostInput.value.trim() || 'localhost',
      obsPort: parseInt(this.obsPortInput.value) || 4455,
      obsPassword: this.obsPasswordInput.value || ''
    };

    this.settings.save(settings);
    this.hideSettingsModal();

    // Reconnect with new settings
    try {
      await window.electronAPI.obs.disconnect();
    } catch {
      // Ignore disconnect errors
    }

    // Wait a moment then reconnect
    setTimeout(() => {
      this.connectToOBS();
    }, 500);
  }

  /**
   * Test OBS connection with current form values
   */
  async testConnection() {
    const obsHost = this.obsHostInput.value.trim() || 'localhost';
    const obsPort = parseInt(this.obsPortInput.value) || 4455;
    const obsPassword = this.obsPasswordInput.value || '';

    this.connectionResult.textContent = 'Testing connection...';
    this.connectionResult.className = 'connection-result testing';

    try {
      const address = `ws://${obsHost}:${obsPort}`;
      const result = await window.electronAPI.obs.connect(address, obsPassword);
      
      if (result.success) {
        this.connectionResult.textContent = '✓ Connection successful!';
        this.connectionResult.className = 'connection-result success';
        
        // Get version info for confirmation
        try {
          const versionResult = await window.electronAPI.obs.getVersion();
          if (versionResult.success) {
            this.connectionResult.textContent = `✓ Connected to OBS ${versionResult.data.obsVersion}`;
          }
        } catch {
          // Version check failed, but connection was successful
        }
        
        // Disconnect the test connection
        setTimeout(async () => {
          try {
            await window.electronAPI.obs.disconnect();
          } catch {
            // Ignore disconnect errors
          }
        }, 1000);
      } else {
        throw new Error(result.error || 'Unknown connection error');
      }
    } catch (error) {
      console.error('Test connection failed:', error);
      this.connectionResult.textContent = `✗ Connection failed: ${error.message}`;
      this.connectionResult.className = 'connection-result error';
    }
  }

  /**
   * Clean up resources when the app is closing
   */
  destroy() {
    // Clean up timers
    this.stopOBSPolling();
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }

    // Clean up event listeners
    this.eventCleanupFunctions.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });

    // Save current session if recording
    if (this.isRecording) {
      this.stopRecordingTimer();
      this.saveCurrentSession();
    }

    // Disconnect from OBS
    if (window.electronAPI && window.electronAPI.obs) {
      window.electronAPI.obs.disconnect().catch(console.error);
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.floatingTimer = new FloatingTimer();
});

// Clean up when the window is closed
window.addEventListener('beforeunload', () => {
  if (window.floatingTimer) {
    window.floatingTimer.destroy();
  }
}); 