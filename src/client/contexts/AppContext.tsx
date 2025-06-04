import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import obsService, { OBSConnectionOptions, OBSServiceCallbacks } from '../services/obsService';
import { OBSEventTypes, OBSResponseTypes } from 'obs-websocket-js';
import { formatHMS, parseTimecodeToSeconds } from '../utils/timeUtils';

// --- Interfaces (assuming these are defined as before) ---
export interface OBSSettings { host: string; port: string; password?: string; }
export interface OBSConnectionState { isConnected: boolean; isConnecting: boolean; error: string | null; obsVersion?: string; }
export interface OBSRecordingState {
  isRecording: boolean; // Actively recording (not paused)
  isPaused: boolean;    // Recording is paused
  outputActive: boolean; // OBS output (record/stream) is active
  outputPaused: boolean; // OBS output is paused
  recordTimecode: string; // HH:MM:SS format from polling, or HH:MM:SS.ms from events
  currentSessionSeconds: number; // Seconds accumulated in the current recording session based on timecode
}

interface AppState {
  settings: OBSSettings;
  obsConnection: OBSConnectionState;
  obsRecording: OBSRecordingState;
  totalTimeSeconds: number; // Total accumulated time in seconds
  isSettingsModalOpen: boolean;
  isCurrentTimeFocused: boolean;
  connectionTestResult: string | null;
  isTestingConnection: boolean;
}

// --- Context Value Interface ---
interface AppContextValue extends AppState {
  saveSettings: (settings: OBSSettings) => Promise<void>;
  connectToOBS: (settings?: OBSSettings) => Promise<void>;
  disconnectFromOBS: () => Promise<void>;
  testOBSConnection: (settings: OBSSettings) => Promise<void>;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  toggleTimerFocus: () => void;
  resetTotalTime: () => void;
  currentStatusIcon: string;
  currentStatusIconClass: string;
  formattedTotalTime: string; // Derived state for display
  formattedCurrentTime: string; // Derived state for display
}

// --- Default Initial State ---
const initialSettings: OBSSettings = { host: 'localhost', port: '4455', password: '' };
const initialOBSConnectionState: OBSConnectionState = { isConnected: false, isConnecting: false, error: null };
const initialOBSRecordingState: OBSRecordingState = {
  isRecording: false, isPaused: false, outputActive: false, outputPaused: false,
  recordTimecode: '00:00:00', currentSessionSeconds: 0,
};
const initialState: AppState = {
  settings: initialSettings,
  obsConnection: initialOBSConnectionState,
  obsRecording: initialOBSRecordingState,
  totalTimeSeconds: 0,
  isSettingsModalOpen: false,
  isCurrentTimeFocused: true,
  connectionTestResult: null,
  isTestingConnection: false,
};

const AppContext = createContext<AppContextValue>({
  ...initialState,
  formattedTotalTime: '00:00:00',
  formattedCurrentTime: '00:00:00',
  saveSettings: async () => {},
  connectToOBS: async () => {},
  disconnectFromOBS: async () => {},
  testOBSConnection: async () => {},
  openSettingsModal: () => {},
  closeSettingsModal: () => {},
  toggleTimerFocus: () => {},
  resetTotalTime: () => {},
  currentStatusIcon: '■',
  currentStatusIconClass: 'stopped',
});

export const useAppContext = () => useContext(AppContext);

interface AppProviderProps { children: ReactNode; }

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<OBSSettings>(initialSettings);
  const [obsConnection, setObsConnection] = useState<OBSConnectionState>(initialOBSConnectionState);
  const [obsRecording, setObsRecording] = useState<OBSRecordingState>(initialOBSRecordingState);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState<number>(0);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isCurrentTimeFocused, setIsCurrentTimeFocused] = useState(true);
  const [connectionTestResult, setConnectionTestResult] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const obsTimecodePollInterval = useRef<NodeJS.Timeout | null>(null);
  // To track previous recording state for saving total time
  const prevOutputActiveRef = useRef<boolean>(false);


  // Load initial settings and total time from localStorage
  useEffect(() => {
    const storedSettings = localStorage.getItem('obsTimerAppSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
        // Trigger initial connection attempt with loaded settings
        connectToOBS(parsedSettings);
      } catch (e) { console.error('Failed to parse stored settings:', e); localStorage.removeItem('obsTimerAppSettings'); }
    } else {
      // If no stored settings, attempt connection with initial default settings
      connectToOBS(initialSettings);
    }

    const storedTotalTime = localStorage.getItem('obsTimerTotalSeconds');
    if (storedTotalTime) {
      setTotalTimeSeconds(parseInt(storedTotalTime, 10) || 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Connect on mount

  const saveSettings = async (newSettings: OBSSettings) => {
    setSettings(newSettings);
    localStorage.setItem('obsTimerAppSettings', JSON.stringify(newSettings));
    if (obsConnection.isConnected || obsConnection.isConnecting) {
      await disconnectFromOBS(); // Disconnect before reconnecting with new settings
    }
    // Automatically try to connect with new settings after a short delay
    // to allow disconnect to complete.
    setTimeout(() => connectToOBS(newSettings), 500);
  };

  const connectToOBS = async (currentSettingsParam?: OBSSettings) => {
    const activeSettings = currentSettingsParam || settings;
    if (!activeSettings.host || !activeSettings.port) {
      setObsConnection({ isConnected: false, isConnecting: false, error: 'Host or Port missing.', obsVersion: undefined });
      return;
    }
    setObsConnection({ isConnected: false, isConnecting: true, error: null, obsVersion: undefined });
    setConnectionTestResult(null); // Clear previous test results
    try {
      const obsConnectOpts: OBSConnectionOptions = {
        address: `\${activeSettings.host}:\${activeSettings.port}`,
        password: activeSettings.password,
      };
      await obsService.connect(obsConnectOpts);
    } catch (error: any) {
      if (!obsService.isConnected) {
         setObsConnection(prev => ({ ...prev, isConnected: false, isConnecting: false, error: error.message || 'Connection failed directly' }));
      }
    }
  };

  const disconnectFromOBS = async () => {
    if (obsService.isConnected) {
      await obsService.disconnect(); // This will trigger onDisconnected callback
    } else {
      // If not connected but trying, ensure state reflects disconnected
      setObsConnection({ isConnected: false, isConnecting: false, error: null });
    }
    setObsRecording(initialOBSRecordingState); // Reset recording state
    if (obsTimecodePollInterval.current) { // Stop polling on disconnect
      clearInterval(obsTimecodePollInterval.current);
      obsTimecodePollInterval.current = null;
    }
  };

  const testOBSConnection = async (testSettings: OBSSettings) => {
    // Similar to before, unchanged
    if (!testSettings.host || !testSettings.port) {
      setConnectionTestResult('Error: Host or Port missing.');
      return;
    }
    setIsTestingConnection(true);
    setConnectionTestResult('Testing connection...');
    const testObs = new OBSWebSocket();
    try {
      await testObs.connect(`\${testSettings.host}:\${testSettings.port}`, testSettings.password);
      const versionInfo = await testObs.call('GetVersion');
      setConnectionTestResult(\`✓ Connected to OBS \${versionInfo.obsVersion}\`);
      await testObs.disconnect();
    } catch (error: any) {
      setConnectionTestResult(\`✗ Connection failed: \${error.message || 'Unknown error'}\`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const updateObsRecordingState = (data: Partial<OBSRecordingState>) => {
    setObsRecording(prev => ({ ...prev, ...data }));
  };

  // Function to poll GetRecordStatus
  const pollRecordStatus = async () => {
    if (obsService.isConnected && (obsRecording.outputActive || prevOutputActiveRef.current)) {
      try {
        const status = await obsService.getRecordStatus();
        if (status) {
          const currentSessionSeconds = parseTimecodeToSeconds(status.outputTimecode);
          updateObsRecordingState({
            recordTimecode: status.outputTimecode.split('.')[0], // Store as HH:MM:SS
            currentSessionSeconds: currentSessionSeconds,
            // Update active/paused state directly from polled status as it's most reliable
            outputActive: status.outputActive,
            outputPaused: status.outputPaused,
            isRecording: status.outputActive && !status.outputPaused,
            isPaused: status.outputActive && status.outputPaused,
          });

          // If output just became inactive, it means recording/streaming stopped
          if (prevOutputActiveRef.current && !status.outputActive) {
             console.log('Output stopped. Saving session time:', currentSessionSeconds);
             setTotalTimeSeconds(prevTotal => {
                const newTotal = prevTotal + currentSessionSeconds;
                localStorage.setItem('obsTimerTotalSeconds', newTotal.toString());
                return newTotal;
             });
             updateObsRecordingState({ currentSessionSeconds: 0 }); // Reset session for next recording
          }
          prevOutputActiveRef.current = status.outputActive;

        }
      } catch (e) {
        console.error('Error polling GetRecordStatus:', e);
        // Potentially handle disconnect if polling fails consistently
      }
    } else {
        // If not outputting, ensure polling stops and session seconds are reset if needed.
        if (prevOutputActiveRef.current) { // Was active, now it's not (e.g. OBS closed)
            // This case should ideally be caught by onDisconnected or specific event
            // but as a fallback:
            if (obsRecording.currentSessionSeconds > 0) {
                 setTotalTimeSeconds(prevTotal => {
                    const newTotal = prevTotal + obsRecording.currentSessionSeconds;
                    localStorage.setItem('obsTimerTotalSeconds', newTotal.toString());
                    return newTotal;
                 });
                 updateObsRecordingState({ currentSessionSeconds: 0 });
            }
        }
        prevOutputActiveRef.current = false;
        if (obsTimecodePollInterval.current) {
            clearInterval(obsTimecodePollInterval.current);
            obsTimecodePollInterval.current = null;
        }
    }
  };

  useEffect(() => {
    const serviceCallbacks: OBSServiceCallbacks = {
      onConnected: async () => {
        setObsConnection({ isConnected: true, isConnecting: false, error: null });
        try {
          const version = await obsService.getVersion();
          if (version) setObsConnection(prev => ({ ...prev, obsVersion: version.obsVersion }));
          await pollRecordStatus(); // Initial poll after connecting
        } catch (e) { console.error('Error fetching initial OBS state post-connection:', e); }
      },
      onDisconnected: () => {
        setObsConnection({ isConnected: false, isConnecting: false, error: 'Disconnected from OBS.' });
        // Save any pending session time if was recording
        if (prevOutputActiveRef.current && obsRecording.currentSessionSeconds > 0) {
             setTotalTimeSeconds(prevTotal => {
                const newTotal = prevTotal + obsRecording.currentSessionSeconds;
                localStorage.setItem('obsTimerTotalSeconds', newTotal.toString());
                return newTotal;
             });
        }
        setObsRecording(initialOBSRecordingState);
        prevOutputActiveRef.current = false; // Reset ref
        if (obsTimecodePollInterval.current) {
          clearInterval(obsTimecodePollInterval.current);
          obsTimecodePollInterval.current = null;
        }
      },
      onConnectionError: (error: Error) => {
        setObsConnection({ isConnected: false, isConnecting: false, error: error.message || 'Connection Error' });
        setObsRecording(initialOBSRecordingState);
        prevOutputActiveRef.current = false; // Reset ref
         if (obsTimecodePollInterval.current) {
          clearInterval(obsTimecodePollInterval.current);
          obsTimecodePollInterval.current = null;
        }
      },
      onRecordStateChanged: (data: OBSEventTypes['RecordStateChanged']) => {
        // This event tells us the state changed. We should then poll GetRecordStatus for accurate time.
        // The event itself might not have the final timecode, especially on stop.
        console.log('RecordStateChanged event:', data.outputState);
        // Update active/paused state immediately based on event for responsiveness
        updateObsRecordingState({
            outputActive: data.outputActive,
            outputPaused: data.outputPaused,
            isRecording: data.outputActive && !data.outputPaused,
            isPaused: data.outputActive && data.outputPaused,
        });

        if (data.outputActive) {
          if (!obsTimecodePollInterval.current) {
            pollRecordStatus(); // Poll immediately
            obsTimecodePollInterval.current = setInterval(pollRecordStatus, 250); // Poll every 250ms
          }
        } else { // Output stopped
          if (obsTimecodePollInterval.current) {
            clearInterval(obsTimecodePollInterval.current);
            obsTimecodePollInterval.current = null;
          }
          // Final poll to get definitive stop time and save session
          pollRecordStatus();
        }
      },
    };
    obsService.registerCallbacks(serviceCallbacks);

    return () => { // Cleanup on provider unmount (app close)
      if (obsService.isConnected) obsService.disconnect();
      if (obsTimecodePollInterval.current) clearInterval(obsTimecodePollInterval.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obsRecording.currentSessionSeconds]); // Rerun if currentSessionSeconds changes to save it (e.g. disconnect)

  // Derived state for status icon
  let currentStatusIcon = '■'; let currentStatusIconClass = 'stopped';
  if (!obsConnection.isConnected && !obsConnection.isConnecting) {
    currentStatusIcon = '✕'; currentStatusIconClass = 'disconnected';
  } else if (obsConnection.isConnecting) {
    currentStatusIcon = '…'; currentStatusIconClass = 'connecting';
  } else if (obsConnection.isConnected) {
    if (obsRecording.isRecording) { currentStatusIcon = '●'; currentStatusIconClass = 'recording'; }
    else if (obsRecording.isPaused) { currentStatusIcon = '❚❚'; currentStatusIconClass = 'paused'; }
    else { currentStatusIcon = '■'; currentStatusIconClass = 'stopped'; }
  }

  const resetTotalTime = () => {
    if (window.confirm('Reset total time to 00:00:00? This will clear your project time.')) {
      setTotalTimeSeconds(0);
      updateObsRecordingState({ currentSessionSeconds: 0 }); // Also reset current session if any
      localStorage.setItem('obsTimerTotalSeconds', '0');
    }
  };

  const contextValue: AppContextValue = {
    settings, obsConnection, obsRecording, totalTimeSeconds,
    isSettingsModalOpen, isCurrentTimeFocused, connectionTestResult, isTestingConnection,
    formattedTotalTime: formatHMS(totalTimeSeconds + (obsRecording.isRecording ? obsRecording.currentSessionSeconds : 0)),
    formattedCurrentTime: formatHMS(obsRecording.currentSessionSeconds),
    saveSettings, connectToOBS, disconnectFromOBS, testOBSConnection,
    openSettingsModal: () => setSettingsModalOpen(true),
    closeSettingsModal: () => { setSettingsModalOpen(false); setConnectionTestResult(null); },
    toggleTimerFocus: () => setIsCurrentTimeFocused(prev => !prev),
    resetTotalTime,
    currentStatusIcon, currentStatusIconClass,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
