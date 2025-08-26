import OBSWebSocket, {OBSEventTypes} from "obs-websocket-js";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import obsService, {
  OBSConnectionOptions,
  OBSServiceCallbacks,
} from "../services/obsService";
import {formatHMS, parseTimecodeToSeconds} from "../utils/timeUtils";

// --- Interfaces (assuming these are defined as before) ---
export interface OBSSettings {
  host: string;
  port: string;
  password?: string;
}
export interface OBSConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  obsVersion?: string;
  hasInitialStatus: boolean;
}
export interface OBSRecordingState {
  isRecording: boolean; // Actively recording (not paused)
  isPaused: boolean; // Recording is paused
  outputActive: boolean; // OBS output (record/stream) is active
  outputPaused: boolean; // OBS output is paused
  recordTimecode: string; // HH:MM:SS format from polling, or HH:MM:SS.ms from events
  currentSessionSeconds: number; // Seconds accumulated in the current recording session based on timecode
}

export type AppMode = "obs" | "stopwatch" | "timer" | "clock";

export interface StopwatchState {
  isRunning: boolean;
  seconds: number;
  startTime: number | null;
}

export interface TimerState {
  isRunning: boolean;
  isSetupMode: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  startTime: number | null;
  isOvertime: boolean;
}

export interface ClockState {
  is24Hour: boolean;
}

export type TimeSegment = "hours" | "minutes" | "seconds" | null;

interface AppState {
  settings: OBSSettings;
  obsConnection: OBSConnectionState;
  obsRecording: OBSRecordingState;
  totalTimeSeconds: number; // Total accumulated time in seconds
  isSettingsModalOpen: boolean;
  isCurrentTimeFocused: boolean;
  connectionTestResult: string | null;
  isTestingConnection: boolean;
  isDimmed: boolean; // Added for brightness control
  currentMode: AppMode;
  stopwatch: StopwatchState;
  timer: TimerState;
  clock: ClockState;
  showSettings: boolean; // For hamburger menu toggle
  selectedTimeSegment: TimeSegment; // For manual time adjustment
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
  toggleBrightness: () => void; // Added for brightness control
  setMode: (mode: AppMode) => void;
  toggleStopwatch: () => void;
  resetStopwatch: () => void;
  setupTimer: (hours: number, minutes: number, seconds: number) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  enterTimerSetup: () => void;
  toggleClockFormat: () => void;
  toggleSettings: () => void; // For hamburger menu toggle
  selectTimeSegment: (segment: TimeSegment) => void;
  adjustTotalTime: (amount: number) => void;
  currentStatusIcon: string;
  currentStatusIconClass: string;
  formattedTotalTime: string; // Derived state for display
  formattedCurrentTime: string; // Derived state for display
  formattedStopwatchTime: string; // Derived state for stopwatch display
  formattedTimerTime: string; // Derived state for timer display
}

// --- Default Initial State ---
const initialSettings: OBSSettings = {
  host: "localhost",
  port: "4455",
  password: "",
};
const initialOBSConnectionState: OBSConnectionState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  hasInitialStatus: false,
};
const initialOBSRecordingState: OBSRecordingState = {
  isRecording: false,
  isPaused: false,
  outputActive: false,
  outputPaused: false,
  recordTimecode: "00:00:00",
  currentSessionSeconds: 0,
};
const initialStopwatchState: StopwatchState = {
  isRunning: false,
  seconds: 0,
  startTime: null,
};

const initialTimerState: TimerState = {
  isRunning: false,
  isSetupMode: true,
  totalSeconds: 0,
  remainingSeconds: 0,
  startTime: null,
  isOvertime: false,
};

const initialClockState: ClockState = {
  is24Hour: true,
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
  isDimmed: false, // Default to bright
  currentMode: "obs",
  stopwatch: initialStopwatchState,
  timer: initialTimerState,
  clock: initialClockState,
  showSettings: false, // Default to display mode
  selectedTimeSegment: null,
};

const AppContext = createContext<AppContextValue>({
  ...initialState,
  formattedTotalTime: "00:00:00",
  formattedCurrentTime: "00:00:00",
  formattedStopwatchTime: "00:00:00",
  formattedTimerTime: "00:00:00",
  saveSettings: async () => {},
  connectToOBS: async () => {},
  disconnectFromOBS: async () => {},
  testOBSConnection: async () => {},
  openSettingsModal: () => {},
  closeSettingsModal: () => {},
  toggleTimerFocus: () => {},
  resetTotalTime: () => {},
  toggleBrightness: () => {},
  setMode: () => {},
  toggleStopwatch: () => {},
  resetStopwatch: () => {},
  setupTimer: () => {},
  toggleTimer: () => {},
  resetTimer: () => {},
  enterTimerSetup: () => {},
  toggleClockFormat: () => {},
  toggleSettings: () => {},
  selectTimeSegment: () => {},
  adjustTotalTime: () => {},
  currentStatusIcon: "■",
  currentStatusIconClass: "stopped",
});

export const useAppContext = () => useContext(AppContext);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({children}) => {
  console.log("AppProvider: Mounting");
  const [settings, setSettings] = useState<OBSSettings>(initialSettings);
  const [obsConnection, setObsConnection] = useState<OBSConnectionState>(
    initialOBSConnectionState
  );
  const [obsRecording, setObsRecording] = useState<OBSRecordingState>(
    initialOBSRecordingState
  );
  const [totalTimeSeconds, setTotalTimeSeconds] = useState<number>(0);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isCurrentTimeFocused, setIsCurrentTimeFocused] = useState(true);
  const [connectionTestResult, setConnectionTestResult] = useState<
    string | null
  >(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isDimmed, setIsDimmed] = useState(false);
  const [currentMode, setCurrentMode] = useState<AppMode>("obs");
  const [stopwatch, setStopwatch] = useState<StopwatchState>(
    initialStopwatchState
  );
  const [timer, setTimer] = useState<TimerState>(initialTimerState);
  const [clock, setClock] = useState<ClockState>(initialClockState);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [selectedTimeSegment, setSelectedTimeSegment] = useState<TimeSegment>(null);

  // Re-add polling interval ref, but only for timecode updates during recording
  const timecodeUpdateInterval = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  // Stopwatch interval ref
  const stopwatchInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer interval ref
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Interval for automatic reconnect attempts
  const autoReconnectInterval = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  // To track previous recording state for saving total time
  const prevOutputActiveRef = useRef<boolean>(false);

  // Load initial settings and total time from localStorage
  useEffect(() => {
    console.log("AppProvider: Initial useEffect (settings load) START");
    const storedSettings = localStorage.getItem("obsTimerAppSettings");
    console.log(
      "AppProvider: storedSettings from localStorage:",
      storedSettings
    );
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        console.log("AppProvider: parsedSettings:", parsedSettings);
        setSettings(parsedSettings);
        // Trigger initial connection attempt with loaded settings
        connectToOBS(parsedSettings);
      } catch (e) {
        console.error("Failed to parse stored settings:", e);
        localStorage.removeItem("obsTimerAppSettings");
      }
    } else {
      console.log(
        "AppProvider: No stored settings, using initialSettings:",
        initialSettings
      );
      // If no stored settings, attempt connection with initial default settings
      connectToOBS(initialSettings);
    }

    const storedTotalTime = localStorage.getItem("obsTimerTotalSeconds");
    if (storedTotalTime) {
      setTotalTimeSeconds(parseInt(storedTotalTime, 10) || 0);
    }

    // Load brightness setting from localStorage
    const storedBrightness = localStorage.getItem("obsTimerIsDimmed");
    if (storedBrightness) {
      setIsDimmed(storedBrightness === "true");
    }

    // Load current mode from localStorage
    const storedMode = localStorage.getItem("obsTimerCurrentMode");
    if (
      storedMode &&
      ["obs", "stopwatch", "timer", "clock"].includes(storedMode)
    ) {
      setCurrentMode(storedMode as AppMode);
    }

    // Load clock settings from localStorage
    const storedClockFormat = localStorage.getItem("obsTimerClockIs24Hour");
    if (storedClockFormat !== null) {
      setClock({is24Hour: storedClockFormat === "true"});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Connect on mount

  const saveSettings = async (newSettings: OBSSettings) => {
    setSettings(newSettings);
    localStorage.setItem("obsTimerAppSettings", JSON.stringify(newSettings));
    if (obsConnection.isConnected || obsConnection.isConnecting) {
      await disconnectFromOBS(); // Disconnect before reconnecting with new settings
    }
    // Automatically try to connect with new settings after a short delay
    // to allow disconnect to complete.
    setTimeout(() => connectToOBS(newSettings), 500);
  };

  const connectToOBS = async (currentSettingsParam?: OBSSettings) => {
    const activeSettings = currentSettingsParam || settings;
    console.log(
      "AppProvider: connectToOBS called with activeSettings:",
      activeSettings
    );

    if (!activeSettings.host || !activeSettings.port) {
      console.error(
        "AppProvider: Host or Port missing in activeSettings. Aborting connection.",
        activeSettings
      );
      setObsConnection({
        isConnected: false,
        isConnecting: false,
        error: "Host or Port missing.",
        obsVersion: undefined,
        hasInitialStatus: false,
      });
      return;
    }
    setObsConnection({
      isConnected: false,
      isConnecting: true,
      error: null,
      obsVersion: undefined,
      hasInitialStatus: false,
    });
    setConnectionTestResult(null); // Clear previous test results
    try {
      const obsConnectOpts: OBSConnectionOptions = {
        address: `ws://${activeSettings.host}:${activeSettings.port}`,
        password: activeSettings.password,
      };
      console.log(
        "AppProvider: Attempting obsService.connect with options:",
        obsConnectOpts
      );
      await obsService.connect(obsConnectOpts);
    } catch (error: unknown) {
       
      if (!obsService.isConnected) {
        setObsConnection((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: (error as Error).message || "Connection failed directly",
          hasInitialStatus: false,
        }));
      }
    }
  };

  const disconnectFromOBS = async () => {
    if (obsService.isConnected) {
      await obsService.disconnect(); // This will trigger onDisconnected callback
    } else {
      // If not connected but trying, ensure state reflects disconnected
      setObsConnection({
        isConnected: false,
        isConnecting: false,
        error: null,
        hasInitialStatus: false,
      });
    }
    setObsRecording(initialOBSRecordingState); // Reset recording state
    // Save any pending session time if was recording
    if (prevOutputActiveRef.current && obsRecording.currentSessionSeconds > 0) {
      setTotalTimeSeconds((prevTotal) => {
        const newTotal = prevTotal + obsRecording.currentSessionSeconds;
        localStorage.setItem("obsTimerTotalSeconds", newTotal.toString());
        return newTotal;
      });
    }
    setObsRecording(initialOBSRecordingState);
    prevOutputActiveRef.current = false;
  };

  const testOBSConnection = async (testSettings: OBSSettings) => {
    // Similar to before, unchanged
    if (!testSettings.host || !testSettings.port) {
      setConnectionTestResult("Error: Host or Port missing.");
      return;
    }
    setIsTestingConnection(true);
    setConnectionTestResult("Testing connection...");
    const testObs = new OBSWebSocket();
    try {
      await testObs.connect(
        `${testSettings.host}:${testSettings.port}`,
        testSettings.password
      );
      const versionInfo = await testObs.call("GetVersion");
      setConnectionTestResult(`✓ Connected to OBS ${versionInfo.obsVersion}`);
      await testObs.disconnect();
    } catch (error: unknown) {
       
      setConnectionTestResult(
        `✗ Connection failed: ${(error as Error).message || "Unknown error"}`
      );
    } finally {
      setIsTestingConnection(false);
    }
  };

  const updateObsRecordingState = (data: Partial<OBSRecordingState>) => {
    setObsRecording((prev) => ({...prev, ...data}));
  };

  // Minimal function to update only timecode during active recording
  const updateTimecodeOnly = async () => {
    if (obsService.isConnected) {
      try {
        const status = await obsService.getRecordStatus();
        if (status && status.outputActive) {
          const currentSessionSeconds = parseTimecodeToSeconds(
            status.outputTimecode
          );
          // Only update timecode and session seconds, don't touch other state
          setObsRecording((prev) => ({
            ...prev,
            recordTimecode: status.outputTimecode.split(".")[0],
            currentSessionSeconds: currentSessionSeconds,
          }));
        }
      } catch (e) {
        console.error("Error updating timecode:", e);
      }
    }
  };

  useEffect(() => {
    console.log("AppProvider: Callback registration useEffect START");
    const serviceCallbacks: OBSServiceCallbacks = {
      onConnected: async () => {
        console.log(
          "AppProvider: obsService.onConnected callback triggered (Identified)"
        );
        // Temporarily simplified - only basic connection state
        setObsConnection({
          isConnected: true,
          isConnecting: false,
          error: null,
          hasInitialStatus: true, // Set to true to avoid any issues with the derived state
          obsVersion: undefined,
        });

        // Add back version fetching first
        try {
          const version = await obsService.getVersion();
          setObsConnection((prev) => ({
            ...prev,
            obsVersion: version?.obsVersion,
          }));
          console.log(
            "AppProvider: Version fetched successfully:",
            version?.obsVersion
          );
        } catch (e: unknown) {
           
          console.error("Error fetching OBS version:", e);
        }

        // Add back record status fetching (without polling setup)
        try {
          if (obsService.isConnected) {
            const status = await obsService.getRecordStatus();
            if (status) {
              console.log(
                "AppProvider: Initial GetRecordStatus after connection:",
                status
              );
              const currentSessionSeconds = parseTimecodeToSeconds(
                status.outputTimecode
              );
              updateObsRecordingState({
                recordTimecode: status.outputTimecode.split(".")[0],
                currentSessionSeconds: currentSessionSeconds,
                outputActive: status.outputActive,
                outputPaused: status.outputPaused,
                isRecording: status.outputActive && !status.outputPaused,
                isPaused: status.outputActive && status.outputPaused,
              });
              prevOutputActiveRef.current = status.outputActive;
              console.log("AppProvider: Record state updated successfully");
            } else {
              console.warn(
                "AppProvider: Initial GetRecordStatus returned null."
              );
              prevOutputActiveRef.current = false;
            }
          }
        } catch (e: unknown) {
           
          console.error("Error fetching initial OBS record status:", e);
          prevOutputActiveRef.current = false;
        }
      },
      onDisconnected: () => {
        console.log(
          "AppProvider: obsService.onDisconnected callback triggered"
        );
        setObsConnection({
          isConnected: false,
          isConnecting: false,
          error: "Disconnected from OBS.",
          hasInitialStatus: false, // Reset on disconnect
          obsVersion: undefined,
        });
        // Save any pending session time if was recording
        if (
          prevOutputActiveRef.current &&
          obsRecording.currentSessionSeconds > 0
        ) {
          setTotalTimeSeconds((prevTotal) => {
            const newTotal = prevTotal + obsRecording.currentSessionSeconds;
            localStorage.setItem("obsTimerTotalSeconds", newTotal.toString());
            return newTotal;
          });
        }
        setObsRecording(initialOBSRecordingState);
        prevOutputActiveRef.current = false;
      },
      onConnectionError: (error: Error) => {
        console.error(
          "AppProvider: obsService.onConnectionError callback triggered",
          error
        );
        setObsConnection({
          isConnected: false,
          isConnecting: false,
          error: error.message || "Connection Error",
          hasInitialStatus: false, // Reset on error
          obsVersion: undefined,
        });
        setObsRecording(initialOBSRecordingState);
        prevOutputActiveRef.current = false;
      },
      onRecordStateChanged: (data: OBSEventTypes["RecordStateChanged"]) => {
        console.log(
          "AppProvider: obsService.onRecordStateChanged event:",
          data.outputState
        );
        const {outputState} = data;

        // Get current state from a reliable source (the state itself)
        // to avoid issues with closure over stale state in the callback.
        setObsRecording((prevObsRecording) => {
          let newIsRecording = prevObsRecording.isRecording;
          let newIsPaused = prevObsRecording.isPaused;
          let newOutputActive = prevObsRecording.outputActive;

          if (
            outputState === "OBS_WEBSOCKET_OUTPUT_STARTED" ||
            outputState === "OBS_WEBSOCKET_OUTPUT_RESUMED"
          ) {
            newIsRecording = true;
            newIsPaused = false;
            newOutputActive = true;
          } else if (outputState === "OBS_WEBSOCKET_OUTPUT_PAUSED") {
            newIsRecording = false;
            newIsPaused = true;
            newOutputActive = true; // Session is active, but paused
          } else if (outputState === "OBS_WEBSOCKET_OUTPUT_STOPPED") {
            newIsRecording = false;
            newIsPaused = false;
            newOutputActive = false;
          }

          // Update prevOutputActiveRef for state tracking
          prevOutputActiveRef.current = newOutputActive;

          return {
            ...prevObsRecording,
            isRecording: newIsRecording,
            isPaused: newIsPaused,
            outputActive: newOutputActive,
          };
        });

        // Handle timecode polling based on new state
        if (
          outputState === "OBS_WEBSOCKET_OUTPUT_STARTED" ||
          outputState === "OBS_WEBSOCKET_OUTPUT_RESUMED"
        ) {
          // Start timecode updates when recording begins or resumes
          if (!timecodeUpdateInterval.current) {
            console.log("AppProvider: Starting timecode updates for recording");
            timecodeUpdateInterval.current = setInterval(
              updateTimecodeOnly,
              250
            );
          }
        } else if (outputState === "OBS_WEBSOCKET_OUTPUT_PAUSED") {
          // Stop timecode updates when paused (timecode shouldn't change)
          if (timecodeUpdateInterval.current) {
            console.log("AppProvider: Pausing timecode updates");
            clearInterval(timecodeUpdateInterval.current);
            timecodeUpdateInterval.current = null;
          }
        } else if (outputState === "OBS_WEBSOCKET_OUTPUT_STOPPED") {
          // Stop timecode updates and do final save when recording stops
          if (timecodeUpdateInterval.current) {
            console.log("AppProvider: Stopping timecode updates");
            clearInterval(timecodeUpdateInterval.current);
            timecodeUpdateInterval.current = null;
          }
          // Final timecode update and save session time
          updateTimecodeOnly().then(() => {
            // Save the final session time to total
            setObsRecording((prev) => {
              if (prev.currentSessionSeconds > 0) {
                setTotalTimeSeconds((prevTotal) => {
                  const newTotal = prevTotal + prev.currentSessionSeconds;
                  localStorage.setItem(
                    "obsTimerTotalSeconds",
                    newTotal.toString()
                  );
                  return newTotal;
                });
              }
              return {...prev, currentSessionSeconds: 0}; // Reset for next session
            });
          });
        }
      },
    };
    obsService.registerCallbacks(serviceCallbacks);
    console.log("AppProvider: obsService.registerCallbacks called");

    return () => {
      // Cleanup on provider unmount (app close)
      console.log(
        "AppProvider: Unmounting, disconnecting from OBS if connected."
      );
      if (obsService.isConnected) obsService.disconnect();
      if (timecodeUpdateInterval.current) {
        clearInterval(timecodeUpdateInterval.current);
      }
      if (stopwatchInterval.current) {
        clearInterval(stopwatchInterval.current);
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      if (autoReconnectInterval.current) {
        clearInterval(autoReconnectInterval.current);
        autoReconnectInterval.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Changed dependency array to empty

  // Automatically attempt reconnection while disconnected
  useEffect(() => {
    if (!obsConnection.isConnected && !obsConnection.isConnecting) {
      if (!autoReconnectInterval.current) {
        autoReconnectInterval.current = setInterval(() => {
          console.log("AppProvider: auto reconnect attempt");
          connectToOBS();
        }, 10000);
      }
    } else if (autoReconnectInterval.current) {
      clearInterval(autoReconnectInterval.current);
      autoReconnectInterval.current = null;
    }
    return () => {
      if (autoReconnectInterval.current) {
        clearInterval(autoReconnectInterval.current);
        autoReconnectInterval.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obsConnection.isConnected, obsConnection.isConnecting]);

  // Derived state for status icon
  let currentStatusIcon = "■";
  let currentStatusIconClass = "stopped";

  if (obsConnection.isConnecting) {
    currentStatusIcon = "…";
    currentStatusIconClass = "connecting";
  } else if (!obsConnection.isConnected) {
    currentStatusIcon = "✕";
    currentStatusIconClass = "disconnected";
  } else {
    // Connected
    if (obsConnection.error && !obsRecording.outputActive) {
      currentStatusIcon = "✕";
      currentStatusIconClass = "error";
    } else if (obsRecording.isRecording) {
      currentStatusIcon = "●";
      currentStatusIconClass = "recording";
    } else if (obsRecording.isPaused) {
      currentStatusIcon = "❚❚";
      currentStatusIconClass = "paused";
    } else {
      currentStatusIcon = "■";
      currentStatusIconClass = "stopped";
    }
  }

  const resetTotalTime = () => {
    if (
      window.confirm(
        "Reset total time to 00:00:00? This will clear your project time."
      )
    ) {
      setTotalTimeSeconds(0);
      updateObsRecordingState({currentSessionSeconds: 0}); // Also reset current session if any
      localStorage.setItem("obsTimerTotalSeconds", "0");
    }
  };

  const toggleBrightness = () => {
    setIsDimmed((prev) => {
      const newValue = !prev;
      localStorage.setItem("obsTimerIsDimmed", newValue.toString());
      return newValue;
    });
  };

  const setMode = (mode: AppMode) => {
    setCurrentMode(mode);
    localStorage.setItem("obsTimerCurrentMode", mode);
  };

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  const toggleClockFormat = () => {
    setClock((prev) => {
      const newIs24Hour = !prev.is24Hour;
      localStorage.setItem("obsTimerClockIs24Hour", newIs24Hour.toString());
      return {is24Hour: newIs24Hour};
    });
  };

  const toggleStopwatch = () => {
    setStopwatch((prev) => {
      if (prev.isRunning) {
        // Stop the stopwatch
        if (stopwatchInterval.current) {
          clearInterval(stopwatchInterval.current);
          stopwatchInterval.current = null;
        }
        const now = Date.now();
        const elapsed = prev.startTime
          ? Math.floor((now - prev.startTime) / 1000)
          : 0;
        const newSeconds = prev.seconds + elapsed;
        return {
          isRunning: false,
          seconds: newSeconds,
          startTime: null,
        };
      } else {
        // Start the stopwatch
        const now = Date.now();
        stopwatchInterval.current = setInterval(() => {
          // Force a re-render to update the displayed time
          setStopwatch((current) => ({...current}));
        }, 100);
        return {
          ...prev,
          isRunning: true,
          startTime: now,
        };
      }
    });
  };

  const resetStopwatch = () => {
    if (stopwatchInterval.current) {
      clearInterval(stopwatchInterval.current);
      stopwatchInterval.current = null;
    }
    setStopwatch(initialStopwatchState);
  };

  const setupTimer = (hours: number, minutes: number, seconds: number) => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    setTimer({
      isRunning: false,
      isSetupMode: false,
      totalSeconds,
      remainingSeconds: totalSeconds,
      startTime: null,
      isOvertime: false,
    });
  };

  const toggleTimer = () => {
    setTimer((prev) => {
      if (prev.isSetupMode) return prev; // Can't toggle in setup mode

      if (prev.isRunning) {
        // Stop the timer
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
        }
        const now = Date.now();
        const elapsed = prev.startTime
          ? Math.floor((now - prev.startTime) / 1000)
          : 0;
        const newRemaining = prev.remainingSeconds - elapsed;

        return {
          ...prev,
          isRunning: false,
          remainingSeconds: newRemaining,
          startTime: null,
          isOvertime: newRemaining < 0,
        };
      } else {
        // Start the timer
        const now = Date.now();
        timerInterval.current = setInterval(() => {
          // Force a re-render to update the displayed time
          setTimer((current) => ({...current}));
        }, 100);
        return {
          ...prev,
          isRunning: true,
          startTime: now,
        };
      }
    });
  };

  const resetTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setTimer((prev) => ({
      ...prev,
      isRunning: false,
      remainingSeconds: prev.totalSeconds,
      startTime: null,
      isOvertime: false,
    }));
  };

  const enterTimerSetup = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setTimer({
      isRunning: false,
      isSetupMode: true,
      totalSeconds: 0,
      remainingSeconds: 0,
      startTime: null,
      isOvertime: false,
    });
    setShowSettings(false); // Close settings when entering timer setup
  };

  const getCurrentTimerSeconds = () => {
    if (!timer.isRunning || !timer.startTime) return timer.remainingSeconds;
    const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
    const remaining = timer.remainingSeconds - elapsed;

    // Update overtime state if we've gone negative
    if (remaining < 0 && !timer.isOvertime) {
      setTimer((prev) => ({...prev, isOvertime: true}));
    }

    return remaining;
  };

  const selectTimeSegment = (segment: TimeSegment) => {
    setSelectedTimeSegment(segment);
  };

  const adjustTotalTime = (amount: number) => {
    setTotalTimeSeconds((prevTotal) => {
      const newTotal = Math.max(0, prevTotal + amount);
      localStorage.setItem("obsTimerTotalSeconds", newTotal.toString());
      return newTotal;
    });
  };

  const contextValue: AppContextValue = {
    settings,
    obsConnection,
    obsRecording,
    totalTimeSeconds,
    isSettingsModalOpen,
    isCurrentTimeFocused,
    connectionTestResult,
    isTestingConnection,
    isDimmed,
    currentMode,
    stopwatch,
    timer,
    clock,
    showSettings,
    selectedTimeSegment,
    formattedTotalTime: formatHMS(
      totalTimeSeconds +
        (obsRecording.outputActive ? obsRecording.currentSessionSeconds : 0)
    ),
    formattedCurrentTime: formatHMS(obsRecording.currentSessionSeconds),
    formattedStopwatchTime: formatHMS(
      stopwatch.isRunning && stopwatch.startTime
        ? stopwatch.seconds +
            Math.floor((Date.now() - stopwatch.startTime) / 1000)
        : stopwatch.seconds
    ),
    formattedTimerTime: (() => {
      const currentSeconds = getCurrentTimerSeconds();
      const isNegative = currentSeconds < 0;
      const absSeconds = Math.abs(currentSeconds);
      const formatted = formatHMS(absSeconds);
      return isNegative ? `-${formatted}` : formatted;
    })(),
    saveSettings,
    connectToOBS,
    disconnectFromOBS,
    testOBSConnection,
    openSettingsModal: () => setSettingsModalOpen(true),
    closeSettingsModal: () => {
      setSettingsModalOpen(false);
      setConnectionTestResult(null);
    },
    toggleTimerFocus: () => setIsCurrentTimeFocused((prev) => !prev),
    resetTotalTime,
    toggleBrightness,
    setMode,
    toggleStopwatch,
    resetStopwatch,
    setupTimer,
    toggleTimer,
    resetTimer,
    enterTimerSetup,
    toggleClockFormat,
    toggleSettings,
    selectTimeSegment,
    adjustTotalTime,
    currentStatusIcon,
    currentStatusIconClass,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
