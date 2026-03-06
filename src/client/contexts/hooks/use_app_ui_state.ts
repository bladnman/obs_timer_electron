import {useEffect, useState} from "react";
import {
  AppMode,
  ClockState,
  LOCAL_STORAGE_KEYS,
  TimeSegment,
  initialClockState,
} from "../app_context_types";

const isAppMode = (value: string | null): value is AppMode =>
  value === "obs" ||
  value === "obs-clock" ||
  value === "stopwatch" ||
  value === "timer" ||
  value === "clock";

export function useAppUiState() {
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isCurrentTimeFocused, setIsCurrentTimeFocused] = useState(true);
  const [isDimmed, setIsDimmed] = useState(false);
  const [currentMode, setCurrentMode] = useState<AppMode>("obs");
  const [clock, setClock] = useState<ClockState>(initialClockState);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTimeSegment, setSelectedTimeSegment] =
    useState<TimeSegment>(null);

  useEffect(() => {
    const storedBrightness = localStorage.getItem(LOCAL_STORAGE_KEYS.isDimmed);
    if (storedBrightness) {
      setIsDimmed(storedBrightness === "true");
    }

    const storedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.currentMode);
    if (isAppMode(storedMode)) {
      setCurrentMode(storedMode);
    }

    const storedClockFormat = localStorage.getItem(
      LOCAL_STORAGE_KEYS.clockIs24Hour
    );
    if (storedClockFormat !== null) {
      setClock({is24Hour: storedClockFormat === "true"});
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get("mode");
      if (isAppMode(modeParam)) {
        setCurrentMode(modeParam);
      }
    } catch (error) {
      void error;
    }
  }, []);

  const toggleBrightness = () => {
    setIsDimmed((prev) => {
      const next = !prev;
      localStorage.setItem(LOCAL_STORAGE_KEYS.isDimmed, next.toString());
      return next;
    });
  };

  const setMode = (mode: AppMode) => {
    setCurrentMode(mode);
    localStorage.setItem(LOCAL_STORAGE_KEYS.currentMode, mode);
  };

  const toggleClockFormat = () => {
    setClock((prev) => {
      const next = !prev.is24Hour;
      localStorage.setItem(LOCAL_STORAGE_KEYS.clockIs24Hour, next.toString());
      return {is24Hour: next};
    });
  };

  return {
    isSettingsModalOpen,
    isCurrentTimeFocused,
    isDimmed,
    currentMode,
    clock,
    showSettings,
    selectedTimeSegment,
    openSettingsModal: () => setSettingsModalOpen(true),
    closeSettingsModal: () => setSettingsModalOpen(false),
    toggleTimerFocus: () => setIsCurrentTimeFocused((prev) => !prev),
    toggleBrightness,
    setMode,
    toggleClockFormat,
    toggleSettings: () => setShowSettings((prev) => !prev),
    hideSettingsPanel: () => setShowSettings(false),
    selectTimeSegment: (segment: TimeSegment) => setSelectedTimeSegment(segment),
  };
}
