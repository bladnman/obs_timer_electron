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
  isRecording: boolean;
  isPaused: boolean;
  outputActive: boolean;
  outputPaused: boolean;
  recordTimecode: string;
  currentSessionSeconds: number;
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

export interface AppState {
  settings: OBSSettings;
  obsConnection: OBSConnectionState;
  obsRecording: OBSRecordingState;
  totalTimeSeconds: number;
  isSettingsModalOpen: boolean;
  isCurrentTimeFocused: boolean;
  connectionTestResult: string | null;
  isTestingConnection: boolean;
  isDimmed: boolean;
  currentMode: AppMode;
  stopwatch: StopwatchState;
  timer: TimerState;
  clock: ClockState;
  showSettings: boolean;
  selectedTimeSegment: TimeSegment;
}

export const LOCAL_STORAGE_KEYS = {
  settings: "obsTimerAppSettings",
  totalSeconds: "obsTimerTotalSeconds",
  isDimmed: "obsTimerIsDimmed",
  currentMode: "obsTimerCurrentMode",
  clockIs24Hour: "obsTimerClockIs24Hour",
} as const;

export const initialSettings: OBSSettings = {
  host: "localhost",
  port: "4455",
  password: "",
};

export const initialOBSConnectionState: OBSConnectionState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  hasInitialStatus: false,
};

export const initialOBSRecordingState: OBSRecordingState = {
  isRecording: false,
  isPaused: false,
  outputActive: false,
  outputPaused: false,
  recordTimecode: "00:00:00",
  currentSessionSeconds: 0,
};

export const initialStopwatchState: StopwatchState = {
  isRunning: false,
  seconds: 0,
  startTime: null,
};

export const initialTimerState: TimerState = {
  isRunning: false,
  isSetupMode: false,
  totalSeconds: 5 * 60,
  remainingSeconds: 5 * 60,
  startTime: null,
  isOvertime: false,
};

export const initialClockState: ClockState = {
  is24Hour: true,
};

export const initialState: AppState = {
  settings: initialSettings,
  obsConnection: initialOBSConnectionState,
  obsRecording: initialOBSRecordingState,
  totalTimeSeconds: 0,
  isSettingsModalOpen: false,
  isCurrentTimeFocused: true,
  connectionTestResult: null,
  isTestingConnection: false,
  isDimmed: false,
  currentMode: "obs",
  stopwatch: initialStopwatchState,
  timer: initialTimerState,
  clock: initialClockState,
  showSettings: false,
  selectedTimeSegment: null,
};
