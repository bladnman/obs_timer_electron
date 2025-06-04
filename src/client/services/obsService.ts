import OBSWebSocket, { OBSResponseTypes, OBSEventTypes, OBSRequestTypes } from 'obs-websocket-js';

// Define a type for connection options
export interface OBSConnectionOptions {
  address: string; // e.g., 'localhost:4455'
  password?: string;
}

// Define a type for the service's state/callbacks
export interface OBSServiceCallbacks {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onConnectionError?: (error: Error) => void;
  onRecordStateChanged?: (data: OBSEventTypes['RecordStateChanged']) => void;
  // Add more specific event callbacks as needed
  // onStreamStateChanged?: (data: OBSEventTypes['StreamStateChanged']) => void;
  // onCurrentProgramSceneChanged?: (data: OBSEventTypes['CurrentProgramSceneChanged']) => void;
}

class OBSService {
  private obs: OBSWebSocket;
  private connectionOptions: OBSConnectionOptions | null = null;
  private callbacks: OBSServiceCallbacks = {};
  public isConnected: boolean = false;
  private isAttemptingConnection: boolean = false;

  constructor() {
    this.obs = new OBSWebSocket();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.obs.on('ConnectionOpened', () => {
      this.isConnected = true;
      this.isAttemptingConnection = false;
      console.log('OBS WebSocket Connected');
      if (this.callbacks.onConnected) {
        this.callbacks.onConnected();
      }
      // Example: Get initial state after connection
      // this.getRecordStatus().then(status => console.log('Initial Record Status:', status));
    });

    this.obs.on('ConnectionClosed', () => {
      this.isConnected = false;
      this.isAttemptingConnection = false; // Reset if connection attempt failed or was closed
      console.log('OBS WebSocket Disconnected');
      if (this.callbacks.onDisconnected) {
        this.callbacks.onDisconnected();
      }
    });

    this.obs.on('ConnectionError', (error) => {
      this.isConnected = false;
      this.isAttemptingConnection = false;
      console.error('OBS WebSocket Connection Error:', error);
      if (this.callbacks.onConnectionError) {
        // Ensure error is an Error object
        const err = error instanceof Error ? error : new Error(JSON.stringify(error));
        this.callbacks.onConnectionError(err);
      }
    });

    // Recording state events
    this.obs.on('RecordStateChanged', (data) => {
      console.log('RecordStateChanged:', data);
      if (this.callbacks.onRecordStateChanged) {
        this.callbacks.onRecordStateChanged(data);
      }
    });

    // Example for other events if needed in the future
    // this.obs.on('StreamStateChanged', (data) => {
    //   console.log('StreamStateChanged:', data);
    //   if (this.callbacks.onStreamStateChanged) {
    //     this.callbacks.onStreamStateChanged(data);
    //   }
    // });

    // It's good practice to listen for vendor-specific events if any are critical
    // this.obs.on('VendorEvent', (data) => {
    //   console.log('VendorEvent:', data);
    // });
  }

  public registerCallbacks(callbacks: OBSServiceCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public async connect(options: OBSConnectionOptions): Promise<void> {
    if (this.isConnected || this.isAttemptingConnection) {
      console.log('OBS connection attempt already in progress or connected.');
      return Promise.resolve();
    }

    this.isAttemptingConnection = true;
    this.connectionOptions = options;
    console.log(\`Attempting to connect to OBS at \${options.address}\`);

    try {
      // obs-websocket-js v5 expects address and password as separate arguments to connect
      // It no longer takes a single URL string if password is involved.
      // The address should be 'hostname:port'
      await this.obs.connect(options.address, options.password, {
        rpcVersion: 1 // Specify RPC version if needed, defaults to latest supported by lib
      });
      // ConnectionOpened event will handle setting isConnected
    } catch (error: any) {
      this.isAttemptingConnection = false; // Reset on direct connect method failure
      // The 'ConnectionError' event should also fire, but catch direct errors too.
      console.error('Direct connection error:', error);
      if (this.callbacks.onConnectionError) {
         const err = error instanceof Error ? error : new Error(error.message || JSON.stringify(error));
        this.callbacks.onConnectionError(err);
      }
      // Rethrow or handle as appropriate for the calling context
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.obs.disconnect();
      // ConnectionClosed event will handle setting isConnected
    }
    this.isAttemptingConnection = false; // Stop any connection attempts
  }

  // --- Request Methods ---
  public async getVersion(): Promise<OBSResponseTypes['GetVersion'] | null> {
    if (!this.isConnected) return null;
    try {
      return await this.obs.call('GetVersion');
    } catch (error) {
      console.error('Error calling GetVersion:', error);
      return null;
    }
  }

  public async getRecordStatus(): Promise<OBSResponseTypes['GetRecordStatus'] | null> {
    if (!this.isConnected) return null;
    try {
      return await this.obs.call('GetRecordStatus');
    } catch (error) {
      console.error('Error calling GetRecordStatus:', error);
      return null;
    }
  }

  // Add more specific request methods as needed:
  // e.g., startRecord, stopRecord, pauseRecord, resumeRecord

  // public async startRecord(): Promise<OBSResponseTypes['StartRecord'] | null> {
  //   if (!this.isConnected) return null;
  //   try {
  //     return await this.obs.call('StartRecord');
  //   } catch (error) {
  //     console.error('Error calling StartRecord:', error);
  //     return null;
  //   }
  // }

  // Example of sending a request with arguments
  // public async setScene(sceneName: string): Promise<void> {
  //   if (!this.isConnected) return;
  //   try {
  //     await this.obs.call('SetCurrentProgramScene', { sceneName });
  //   } catch (error) {
  //     console.error('Error calling SetCurrentProgramScene:', error);
  //   }
  // }

}

// Export a singleton instance of the service
const obsService = new OBSService();
export default obsService;
