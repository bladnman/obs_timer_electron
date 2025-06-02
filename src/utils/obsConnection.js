/**
 * OBS WebSocket Connection Manager
 * Handles connection, reconnection, and event subscription to OBS Studio
 */
class OBSConnection {
  constructor(eventHandlers = {}, settings = null) {
    this.obs = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectInterval = null;
    this.eventHandlers = eventHandlers;
    this.settings = settings;
    
    // Default connection settings
    this.connectionSettings = {
      address: 'ws://localhost:4455',
      password: '', // No password by default as per PRD
      rpcVersion: 1
    };
  }

  /**
   * Initialize the OBS WebSocket connection
   */
  async connect() {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;

    try {
      // Load obs-websocket-js - handle different environments
      let OBSWebSocket;
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
        // In test environment, use the mocked version
        OBSWebSocket = require('obs-websocket-js');
      } else if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.OBSWebSocket) {
        // In Electron renderer, use the exposed API
        OBSWebSocket = window.electronAPI.OBSWebSocket;
      } else {
        throw new Error('OBS WebSocket module not available');
      }
      
      this.obs = new OBSWebSocket();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Get connection settings from settings manager if available
      let address = this.connectionSettings.address;
      let password = this.connectionSettings.password;
      
      if (this.settings) {
        address = this.settings.getConnectionUrl();
        password = this.settings.getPassword();
      }
      
      // Attempt connection - handle empty password properly
      if (password) {
        await this.obs.connect(address, password, { rpcVersion: this.connectionSettings.rpcVersion });
      } else {
        // For no authentication, connect without password parameter
        await this.obs.connect(address, '', { rpcVersion: this.connectionSettings.rpcVersion });
      }
      
      this.isConnected = true;
      this.isConnecting = false;
      
      // Clear any existing reconnect attempts
      this.clearReconnectTimer();
      
      // Notify connection success
      if (this.eventHandlers.onConnected) {
        this.eventHandlers.onConnected();
      }
      
    } catch (error) {
      this.isConnecting = false;
      this.isConnected = false;
      console.error('Failed to connect to OBS:', error.message);
      
      // Notify connection failure
      if (this.eventHandlers.onConnectionFailed) {
        this.eventHandlers.onConnectionFailed(error);
      }
      
      // Start reconnection attempts
      this.startReconnectTimer();
    }
  }

  /**
   * Set up event listeners for OBS events
   */
  setupEventListeners() {
    if (!this.obs) return;

    // Connection events
    this.obs.on('ConnectionClosed', () => {
      this.isConnected = false;
      
      if (this.eventHandlers.onDisconnected) {
        this.eventHandlers.onDisconnected();
      }
      
      // Start reconnection attempts
      this.startReconnectTimer();
    });

    this.obs.on('ConnectionError', (error) => {
      this.isConnected = false;
      console.error('OBS WebSocket connection error:', error);
      
      if (this.eventHandlers.onConnectionFailed) {
        this.eventHandlers.onConnectionFailed(error);
      }
    });

    // Recording events
    this.obs.on('RecordStateChanged', (data) => {
      if (data.outputState === 'OBS_WEBSOCKET_OUTPUT_STARTED') {
        if (this.eventHandlers.onRecordingStarted) {
          this.eventHandlers.onRecordingStarted(data);
        }
      } else if (data.outputState === 'OBS_WEBSOCKET_OUTPUT_STOPPED') {
        if (this.eventHandlers.onRecordingStopped) {
          this.eventHandlers.onRecordingStopped(data);
        }
      }
    });

    // Legacy event names (for older OBS versions)
    this.obs.on('RecordingStarted', (data) => {
      if (this.eventHandlers.onRecordingStarted) {
        this.eventHandlers.onRecordingStarted(data);
      }
    });

    this.obs.on('RecordingStopped', (data) => {
      if (this.eventHandlers.onRecordingStopped) {
        this.eventHandlers.onRecordingStopped(data);
      }
    });
  }

  /**
   * Start the reconnection timer
   */
  startReconnectTimer() {
    this.clearReconnectTimer();
    
    this.reconnectInterval = setInterval(() => {
      if (!this.isConnected && !this.isConnecting) {
        this.connect();
      }
    }, 5000); // Reconnect every 5 seconds as per PRD
  }

  /**
   * Clear the reconnection timer
   */
  clearReconnectTimer() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  /**
   * Disconnect from OBS WebSocket
   */
  async disconnect() {
    this.clearReconnectTimer();
    
    if (this.obs && this.isConnected) {
      try {
        await this.obs.disconnect();
      } catch (error) {
        console.error('Error disconnecting from OBS:', error);
      }
    }
    
    this.isConnected = false;
    this.isConnecting = false;
    this.obs = null;
  }

  /**
   * Get current recording status
   */
  async getRecordingStatus() {
    if (!this.obs || !this.isConnected) {
      return { isRecording: false };
    }

    try {
      const response = await this.obs.call('GetRecordStatus');
      return {
        isRecording: response.outputActive,
        recordTimecode: response.outputTimecode,
        outputBytes: response.outputBytes
      };
    } catch (error) {
      console.error('Error getting recording status:', error);
      return { isRecording: false };
    }
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.OBSConnection = OBSConnection;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OBSConnection;
} 