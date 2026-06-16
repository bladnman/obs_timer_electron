import OBSWebSocket, {OBSEventTypes} from "obs-websocket-js";
import {useCallback, useEffect, useRef, useState} from "react";
import obsService, {
  OBSConnectionOptions,
  OBSServiceCallbacks,
} from "../../services/obsService";
import {formatHMS, parseTimecodeToSeconds} from "../../utils/timeUtils";
import {
  LOCAL_STORAGE_KEYS,
  OBSConnectionState,
  OBSRecordingState,
  OBSSettings,
  initialOBSConnectionState,
  initialOBSRecordingState,
  initialSettings,
  normalizeOBSSettings,
} from "../app_context_types";

const persistTotalTime = (value: number) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.totalSeconds, value.toString());
};

const didConnectionSettingsChange = (
  currentSettings: OBSSettings,
  nextSettings: OBSSettings
) =>
  currentSettings.host !== nextSettings.host ||
  currentSettings.port !== nextSettings.port ||
  (currentSettings.password ?? "") !== (nextSettings.password ?? "");

const isSettingsWindowView = () => {
  try {
    return new URLSearchParams(window.location.search).get("view") === "settings";
  } catch (error) {
    void error;
    return false;
  }
};

export function useObsRuntime(autoConnect = true) {
  const [settings, setSettings] = useState<OBSSettings>(initialSettings);
  const [obsConnection, setObsConnection] = useState<OBSConnectionState>(
    initialOBSConnectionState
  );
  const [obsRecording, setObsRecording] = useState<OBSRecordingState>(
    initialOBSRecordingState
  );
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
  const [connectionTestResult, setConnectionTestResult] = useState<string | null>(
    null
  );
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const timecodeUpdateInterval = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const autoReconnectInterval = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const prevOutputActiveRef = useRef(false);
  const currentSessionSecondsRef = useRef(0);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    currentSessionSecondsRef.current = obsRecording.currentSessionSeconds;
  }, [obsRecording.currentSessionSeconds]);

  const addSessionTimeToTotal = useCallback((sessionSeconds: number) => {
    if (sessionSeconds <= 0) return;
    setTotalTimeSeconds((prevTotal) => {
      const next = prevTotal + sessionSeconds;
      persistTotalTime(next);
      return next;
    });
  }, []);

  const updateObsRecordingState = (data: Partial<OBSRecordingState>) => {
    setObsRecording((prev) => ({...prev, ...data}));
  };

  const updateTimecodeOnly = async () => {
    if (!obsService.isConnected) return;
    try {
      const status = await obsService.getRecordStatus();
      if (status && status.outputActive) {
        const currentSessionSeconds = parseTimecodeToSeconds(status.outputTimecode);
        setObsRecording((prev) => ({
          ...prev,
          recordTimecode: status.outputTimecode.split(".")[0],
          currentSessionSeconds,
        }));
      }
    } catch (error) {
      console.error("Error updating timecode:", error);
    }
  };

  const connectToOBS = useCallback(async (currentSettingsParam?: OBSSettings) => {
    const activeSettings = currentSettingsParam || settingsRef.current;
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
    setConnectionTestResult(null);

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
  }, []);

  const disconnectFromOBS = useCallback(async () => {
    if (obsService.isConnected) {
      await obsService.disconnect();
    } else {
      setObsConnection({
        isConnected: false,
        isConnecting: false,
        error: null,
        hasInitialStatus: false,
      });
    }

    if (prevOutputActiveRef.current) {
      addSessionTimeToTotal(currentSessionSecondsRef.current);
    }
    setObsRecording(initialOBSRecordingState);
    prevOutputActiveRef.current = false;
  }, [addSessionTimeToTotal]);

  const saveSettings = async (newSettings: OBSSettings) => {
    const normalizedSettings = normalizeOBSSettings(newSettings);
    const shouldReconnect = didConnectionSettingsChange(
      settingsRef.current,
      normalizedSettings
    );

    setSettings(normalizedSettings);
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.settings,
      JSON.stringify(normalizedSettings)
    );
    if (!autoConnect) {
      return;
    }
    if (!shouldReconnect) {
      return;
    }
    if (obsConnection.isConnected || obsConnection.isConnecting) {
      await disconnectFromOBS();
    }
    setTimeout(() => connectToOBS(normalizedSettings), 500);
  };

  const testOBSConnection = async (testSettings: OBSSettings) => {
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

  useEffect(() => {
    const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEYS.settings);
    let launchSettings = initialSettings;

    if (storedSettings) {
      try {
        const parsedSettings = normalizeOBSSettings(JSON.parse(storedSettings));
        launchSettings = parsedSettings;
        setSettings(parsedSettings);
        if (autoConnect) {
          connectToOBS(parsedSettings);
        }
      } catch (error) {
        console.error("Failed to parse stored settings:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.settings);
      }
    } else if (autoConnect) {
      console.log(
        "AppProvider: No stored settings, using initialSettings:",
        initialSettings
      );
      connectToOBS(initialSettings);
    }

    if (!isSettingsWindowView() && launchSettings.resetTimeOnLaunch) {
      setTotalTimeSeconds(0);
      persistTotalTime(0);
      return;
    }

    const storedTotalTime = localStorage.getItem(LOCAL_STORAGE_KEYS.totalSeconds);
    if (storedTotalTime) {
      setTotalTimeSeconds(parseInt(storedTotalTime, 10) || 0);
    }
  }, [autoConnect, connectToOBS]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorage = async (event: StorageEvent) => {
      if (event.key !== LOCAL_STORAGE_KEYS.settings || event.newValue === null) {
        return;
      }
      try {
        const parsedSettings = normalizeOBSSettings(JSON.parse(event.newValue));
        const shouldReconnect = didConnectionSettingsChange(
          settingsRef.current,
          parsedSettings
        );
        setSettings(parsedSettings);
        if (!autoConnect) return;
        if (!shouldReconnect) return;
        if (obsConnection.isConnected || obsConnection.isConnecting) {
          await disconnectFromOBS();
        }
        setTimeout(() => connectToOBS(parsedSettings), 100);
      } catch (error) {
        console.error("Failed to sync stored settings:", error);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [
    autoConnect,
    connectToOBS,
    disconnectFromOBS,
    obsConnection.isConnected,
    obsConnection.isConnecting,
  ]);

  useEffect(() => {
    console.log("AppProvider: Callback registration useEffect START");
    const serviceCallbacks: OBSServiceCallbacks = {
      onConnected: async () => {
        console.log(
          "AppProvider: obsService.onConnected callback triggered (Identified)"
        );
        setObsConnection({
          isConnected: true,
          isConnecting: false,
          error: null,
          hasInitialStatus: true,
          obsVersion: undefined,
        });

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
        } catch (error: unknown) {
          console.error("Error fetching OBS version:", error);
        }

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
                currentSessionSeconds,
                outputActive: status.outputActive,
                outputPaused: status.outputPaused,
                isRecording: status.outputActive && !status.outputPaused,
                isPaused: status.outputActive && status.outputPaused,
              });
              prevOutputActiveRef.current = status.outputActive;
            } else {
              prevOutputActiveRef.current = false;
            }
          }
        } catch (error: unknown) {
          console.error("Error fetching initial OBS record status:", error);
          prevOutputActiveRef.current = false;
        }
      },
      onDisconnected: () => {
        console.log("AppProvider: obsService.onDisconnected callback triggered");
        setObsConnection({
          isConnected: false,
          isConnecting: false,
          error: "Disconnected from OBS.",
          hasInitialStatus: false,
          obsVersion: undefined,
        });
        if (prevOutputActiveRef.current) {
          addSessionTimeToTotal(currentSessionSecondsRef.current);
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
          hasInitialStatus: false,
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

        setObsRecording((prevObsRecording) => {
          let isRecording = prevObsRecording.isRecording;
          let isPaused = prevObsRecording.isPaused;
          let outputActive = prevObsRecording.outputActive;

          if (
            outputState === "OBS_WEBSOCKET_OUTPUT_STARTED" ||
            outputState === "OBS_WEBSOCKET_OUTPUT_RESUMED"
          ) {
            isRecording = true;
            isPaused = false;
            outputActive = true;
          } else if (outputState === "OBS_WEBSOCKET_OUTPUT_PAUSED") {
            isRecording = false;
            isPaused = true;
            outputActive = true;
          } else if (outputState === "OBS_WEBSOCKET_OUTPUT_STOPPED") {
            isRecording = false;
            isPaused = false;
            outputActive = false;
          }

          prevOutputActiveRef.current = outputActive;

          return {
            ...prevObsRecording,
            isRecording,
            isPaused,
            outputActive,
          };
        });

        if (
          outputState === "OBS_WEBSOCKET_OUTPUT_STARTED" ||
          outputState === "OBS_WEBSOCKET_OUTPUT_RESUMED"
        ) {
          if (!timecodeUpdateInterval.current) {
            console.log("AppProvider: Starting timecode updates for recording");
            timecodeUpdateInterval.current = setInterval(updateTimecodeOnly, 250);
          }
        } else if (outputState === "OBS_WEBSOCKET_OUTPUT_PAUSED") {
          if (timecodeUpdateInterval.current) {
            console.log("AppProvider: Pausing timecode updates");
            clearInterval(timecodeUpdateInterval.current);
            timecodeUpdateInterval.current = null;
          }
        } else if (outputState === "OBS_WEBSOCKET_OUTPUT_STOPPED") {
          if (timecodeUpdateInterval.current) {
            console.log("AppProvider: Stopping timecode updates");
            clearInterval(timecodeUpdateInterval.current);
            timecodeUpdateInterval.current = null;
          }
          updateTimecodeOnly().then(() => {
            setObsRecording((prev) => {
              if (prev.currentSessionSeconds > 0) {
                addSessionTimeToTotal(prev.currentSessionSeconds);
              }
              return {...prev, currentSessionSeconds: 0};
            });
          });
        }
      },
    };

    obsService.registerCallbacks(serviceCallbacks);
    console.log("AppProvider: obsService.registerCallbacks called");

    return () => {
      console.log("AppProvider: Unmounting, disconnecting from OBS if connected.");
      if (obsService.isConnected) {
        void obsService.disconnect();
      }
      if (timecodeUpdateInterval.current) {
        clearInterval(timecodeUpdateInterval.current);
      }
      if (autoReconnectInterval.current) {
        clearInterval(autoReconnectInterval.current);
        autoReconnectInterval.current = null;
      }
    };
  }, [addSessionTimeToTotal]);

  useEffect(() => {
    if (!autoConnect) {
      if (autoReconnectInterval.current) {
        clearInterval(autoReconnectInterval.current);
        autoReconnectInterval.current = null;
      }
      return undefined;
    }

    if (!obsConnection.isConnected && !obsConnection.isConnecting) {
      if (!autoReconnectInterval.current) {
        autoReconnectInterval.current = setInterval(() => {
          console.log("AppProvider: auto reconnect attempt");
          void connectToOBS();
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
  }, [
    autoConnect,
    connectToOBS,
    obsConnection.isConnected,
    obsConnection.isConnecting,
  ]);

  let currentStatusIcon = "■";
  let currentStatusIconClass = "stopped";

  if (obsConnection.isConnecting) {
    currentStatusIcon = "…";
    currentStatusIconClass = "connecting";
  } else if (!obsConnection.isConnected) {
    currentStatusIcon = "✕";
    currentStatusIconClass = "disconnected";
  } else if (obsConnection.error && !obsRecording.outputActive) {
    currentStatusIcon = "✕";
    currentStatusIconClass = "error";
  } else if (obsRecording.isRecording) {
    currentStatusIcon = "●";
    currentStatusIconClass = "recording";
  } else if (obsRecording.isPaused) {
    currentStatusIcon = "❚❚";
    currentStatusIconClass = "paused";
  }

  return {
    settings,
    obsConnection,
    obsRecording,
    totalTimeSeconds,
    connectionTestResult,
    isTestingConnection,
    formattedTotalTime: formatHMS(
      totalTimeSeconds +
        (obsRecording.outputActive ? obsRecording.currentSessionSeconds : 0)
    ),
    formattedCurrentTime: formatHMS(obsRecording.currentSessionSeconds),
    currentStatusIcon,
    currentStatusIconClass,
    saveSettings,
    connectToOBS,
    disconnectFromOBS,
    testOBSConnection,
    clearConnectionTestResult: () => setConnectionTestResult(null),
    resetTotalTime: () => {
      if (
        window.confirm(
          "Reset total time to 00:00:00? This will clear your project time."
        )
      ) {
        setTotalTimeSeconds(0);
        updateObsRecordingState({currentSessionSeconds: 0});
        persistTotalTime(0);
      }
    },
    adjustTotalTime: (amount: number) => {
      setTotalTimeSeconds((prevTotal) => {
        const next = Math.max(0, prevTotal + amount);
        persistTotalTime(next);
        return next;
      });
    },
  };
}
