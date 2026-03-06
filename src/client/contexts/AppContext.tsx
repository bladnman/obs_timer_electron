import React, {createContext, ReactNode, useContext} from "react";
import {useAppUiState} from "./hooks/use_app_ui_state";
import {useObsRuntime} from "./hooks/use_obs_runtime";
import {useStopwatchRuntime} from "./hooks/use_stopwatch_runtime";
import {useTimerRuntime} from "./hooks/use_timer_runtime";
import {AppState, OBSSettings, TimeSegment, initialState} from "./app_context_types";

export type {
  AppMode,
  AppState,
  ClockState,
  OBSConnectionState,
  OBSRecordingState,
  OBSSettings,
  StopwatchState,
  TimeSegment,
  TimerState,
} from "./app_context_types";

interface AppContextValue extends AppState {
  saveSettings: (settings: OBSSettings) => Promise<void>;
  connectToOBS: (settings?: OBSSettings) => Promise<void>;
  disconnectFromOBS: () => Promise<void>;
  testOBSConnection: (settings: OBSSettings) => Promise<void>;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  toggleTimerFocus: () => void;
  resetTotalTime: () => void;
  toggleBrightness: () => void;
  setMode: (mode: AppContextValue["currentMode"]) => void;
  toggleStopwatch: () => void;
  resetStopwatch: () => void;
  setupTimer: (hours: number, minutes: number, seconds: number) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  enterTimerSetup: () => void;
  adjustTimerBy: (amountSeconds: number) => void;
  toggleClockFormat: () => void;
  toggleSettings: () => void;
  selectTimeSegment: (segment: TimeSegment) => void;
  adjustTotalTime: (amount: number) => void;
  currentStatusIcon: string;
  currentStatusIconClass: string;
  formattedTotalTime: string;
  formattedCurrentTime: string;
  formattedStopwatchTime: string;
  formattedTimerTime: string;
}

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
  adjustTimerBy: () => {},
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

  const uiState = useAppUiState();
  const obsRuntime = useObsRuntime();
  const stopwatchRuntime = useStopwatchRuntime();
  const timerRuntime = useTimerRuntime();

  const contextValue: AppContextValue = {
    settings: obsRuntime.settings,
    obsConnection: obsRuntime.obsConnection,
    obsRecording: obsRuntime.obsRecording,
    totalTimeSeconds: obsRuntime.totalTimeSeconds,
    isSettingsModalOpen: uiState.isSettingsModalOpen,
    isCurrentTimeFocused: uiState.isCurrentTimeFocused,
    connectionTestResult: obsRuntime.connectionTestResult,
    isTestingConnection: obsRuntime.isTestingConnection,
    isDimmed: uiState.isDimmed,
    currentMode: uiState.currentMode,
    stopwatch: stopwatchRuntime.stopwatch,
    timer: timerRuntime.timer,
    clock: uiState.clock,
    showSettings: uiState.showSettings,
    selectedTimeSegment: uiState.selectedTimeSegment,
    formattedTotalTime: obsRuntime.formattedTotalTime,
    formattedCurrentTime: obsRuntime.formattedCurrentTime,
    formattedStopwatchTime: stopwatchRuntime.formattedStopwatchTime,
    formattedTimerTime: timerRuntime.formattedTimerTime,
    saveSettings: obsRuntime.saveSettings,
    connectToOBS: obsRuntime.connectToOBS,
    disconnectFromOBS: obsRuntime.disconnectFromOBS,
    testOBSConnection: obsRuntime.testOBSConnection,
    openSettingsModal: uiState.openSettingsModal,
    closeSettingsModal: () => {
      uiState.closeSettingsModal();
      obsRuntime.clearConnectionTestResult();
    },
    toggleTimerFocus: uiState.toggleTimerFocus,
    resetTotalTime: obsRuntime.resetTotalTime,
    toggleBrightness: uiState.toggleBrightness,
    setMode: uiState.setMode,
    toggleStopwatch: stopwatchRuntime.toggleStopwatch,
    resetStopwatch: stopwatchRuntime.resetStopwatch,
    setupTimer: timerRuntime.setupTimer,
    toggleTimer: timerRuntime.toggleTimer,
    resetTimer: timerRuntime.resetTimer,
    enterTimerSetup: () => {
      timerRuntime.enterTimerSetup();
      uiState.hideSettingsPanel();
    },
    adjustTimerBy: timerRuntime.adjustTimerBy,
    toggleClockFormat: uiState.toggleClockFormat,
    toggleSettings: uiState.toggleSettings,
    selectTimeSegment: uiState.selectTimeSegment,
    adjustTotalTime: obsRuntime.adjustTotalTime,
    currentStatusIcon: obsRuntime.currentStatusIcon,
    currentStatusIconClass: obsRuntime.currentStatusIconClass,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
