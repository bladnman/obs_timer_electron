import React, { useEffect } from "react";
import "./App.css";
import "./AppV2.css";
import { useAppContext } from "./contexts/AppContext";
import { AspectRatioContainer } from "./components/AspectRatioContainer";
import ClockMode from "./features/clock_mode/ClockMode";
import MenuBar from "./features/layout/MenuBar";
import ModeSelector from "./features/layout/ModeSelector";
import ModeNavigator from "./features/mode_navigation/ModeNavigator";
import OBSMode from "./features/obs_mode/OBSMode";
import SettingsPanel from "./features/settings/SettingsPanel";
import StopwatchMode from "./features/stopwatch_mode/StopwatchMode";
import TimerMode from "./features/timer_mode/TimerMode";
import SettingsModal from "./shared/components/SettingsModal";
import RecordingTimerMode from "./features/v2/recording_timer/RecordingTimerMode";
import TimerV2Mode from "./features/v2/timer/TimerV2Mode";
import StopwatchV2Mode from "./features/v2/stopwatch/StopwatchV2Mode";
import ClockV2Mode from "./features/v2/clock/ClockV2Mode";
import { modeOrder } from "./constants/modes";
import { CAPTURE_EVENT_OPTIONS } from "./utils/keyboard";

const USE_V2_LAYOUT = true;

const isArrowNavigationKey = (key: string) =>
  key === "ArrowRight" ||
  key === "ArrowLeft" ||
  key === "ArrowUp" ||
  key === "ArrowDown";

const getObsDisplayStatus = (
  obsConnection: ReturnType<typeof useAppContext>["obsConnection"]
) => {
  if (obsConnection.isConnecting) {
    return {statusMessage: "Connecting to OBS...", statusType: "connecting" as const};
  }
  if (obsConnection.error) {
    return {statusMessage: obsConnection.error, statusType: "error" as const};
  }
  if (!obsConnection.isConnected) {
    return {statusMessage: "OBS unavailable", statusType: "disconnected" as const};
  }
  return {statusMessage: "", statusType: "hidden" as const};
};

const getRecordingState = (
  obsConnection: ReturnType<typeof useAppContext>["obsConnection"],
  currentStatusIconClass: string
) => {
  if (obsConnection.error || !obsConnection.isConnected) {
    return {recordingState: "error" as const, errorMessage: "OBS NOT FOUND"};
  }
  if (currentStatusIconClass === "recording") {
    return {recordingState: "recording" as const, errorMessage: undefined};
  }
  if (currentStatusIconClass === "paused") {
    return {recordingState: "paused" as const, errorMessage: undefined};
  }
  return {recordingState: "stopped" as const, errorMessage: undefined};
};

function App() {
  const {
    // State
    settings,
    obsConnection,
    isSettingsModalOpen,
    connectionTestResult,
    isTestingConnection,
    currentStatusIcon,
    currentStatusIconClass,
    formattedCurrentTime,
    formattedTotalTime,
    formattedStopwatchTime,
    formattedTimerTime,
    isDimmed,
    currentMode,
    stopwatch,
    timer,
    clock,
    showSettings,
    selectedTimeSegment,
    // Actions
    openSettingsModal,
    closeSettingsModal,
    saveSettings,
    testOBSConnection,
    resetTotalTime,
    toggleBrightness,
    setMode,
    toggleStopwatch,
    resetStopwatch,
    setupTimer,
    toggleTimer,
    resetTimer,
    enterTimerSetup,
    adjustTimerBy,
    toggleClockFormat,
    toggleSettings,
    connectToOBS,
    selectTimeSegment,
    adjustTotalTime,
  } = useAppContext();

  // Global keyboard navigation for V2 modes with edit gating
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!USE_V2_LAYOUT) return;
      if (isSettingsModalOpen || showSettings) return;
      if (!isArrowNavigationKey(e.key)) return;

      // Edit gating: if editing a time segment (OBS or Timer) or timer setup, do not navigate
      const isObsEditing = currentMode === "obs" && selectedTimeSegment !== null;
      const isTimerEditing = currentMode === "timer" && (timer.isSetupMode || selectedTimeSegment !== null);
      if (isObsEditing || isTimerEditing) return;

      // Determine direction: Right/Down => next, Left/Up => prev
      const dir: "next" | "prev" = (e.key === "ArrowRight" || e.key === "ArrowDown") ? "next" : "prev";
      const currentIndex = modeOrder.indexOf(currentMode);
      if (currentIndex === -1) return;
      let newIndex = currentIndex;
      if (dir === "next") {
        newIndex = currentIndex === modeOrder.length - 1 ? 0 : currentIndex + 1;
      } else {
        newIndex = currentIndex === 0 ? modeOrder.length - 1 : currentIndex - 1;
      }
      e.preventDefault();
      setMode(modeOrder[newIndex]);
    };

    window.addEventListener("keydown", handleKeyDown, CAPTURE_EVENT_OPTIONS);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, CAPTURE_EVENT_OPTIONS);
    };
  }, [isSettingsModalOpen, showSettings, currentMode, selectedTimeSegment, timer.isSetupMode, setMode]);

  // Determine connection status for OBS mode
  const {statusMessage, statusType} = getObsDisplayStatus(obsConnection);
  let onRetry: (() => void) | undefined;

  if (statusType === "error" || statusType === "disconnected") {
    onRetry = connectToOBS;
  }

  const settingsModal = isSettingsModalOpen ? (
    <SettingsModal
      isOpen={isSettingsModalOpen}
      onClose={closeSettingsModal}
      onSave={saveSettings}
      onTestConnection={testOBSConnection}
      initialHost={settings.host}
      initialPort={settings.port}
      initialPassword={settings.password}
      connectionResult={connectionTestResult}
      isTestingConnection={isTestingConnection}
    />
  ) : null;

  const renderCurrentMode = () => {
    if (showSettings) {
      return (
        <SettingsPanel
          currentMode={currentMode}
          isDimmed={isDimmed}
          clock={clock}
          onOpenModal={openSettingsModal}
          onToggleBrightness={toggleBrightness}
          onResetTotal={resetTotalTime}
          onEnterTimerSetup={enterTimerSetup}
          onToggleClockFormat={toggleClockFormat}
        />
      );
    }

    switch (currentMode) {
      case "obs":
        return (
          <OBSMode
            currentStatusIcon={currentStatusIcon}
            currentStatusIconClass={currentStatusIconClass}
            formattedCurrentTime={formattedCurrentTime}
            formattedTotalTime={formattedTotalTime}
            statusMessage={statusMessage}
            statusType={statusType}
            isDimmed={isDimmed}
            onResetTotal={resetTotalTime}
            onRetry={onRetry}
            selectedTimeSegment={selectedTimeSegment}
            onSelectTimeSegment={selectTimeSegment}
            onAdjustTotalTime={adjustTotalTime}
          />
        );
      case "stopwatch":
        return (
          <StopwatchMode
            formattedTime={formattedStopwatchTime}
            isRunning={stopwatch.isRunning}
            onToggle={toggleStopwatch}
            onReset={resetStopwatch}
            isDimmed={isDimmed}
          />
        );
      case "timer":
        return (
          <TimerMode
            formattedTime={formattedTimerTime}
            isRunning={timer.isRunning}
            isSetupMode={timer.isSetupMode}
            isOvertime={timer.isOvertime}
            onToggle={toggleTimer}
            onReset={resetTimer}
            onSetupComplete={setupTimer}
            onEnterSetup={enterTimerSetup}
            isDimmed={isDimmed}
          />
        );
      case "clock":
        return (
          <ClockMode
            isDimmed={isDimmed}
            is24Hour={clock.is24Hour}
            onToggleFormat={toggleClockFormat}
          />
        );
      default:
        return null;
    }
  };

  // V2 Layout - New design system
  if (USE_V2_LAYOUT && (currentMode === "obs" || currentMode === "timer" || currentMode === "stopwatch" || currentMode === "clock")) {
    const {recordingState, errorMessage} = getRecordingState(
      obsConnection,
      currentStatusIconClass
    );

    return (
      <AspectRatioContainer>
        <div className="AppV2">
          {currentMode === "obs" ? (
            <RecordingTimerMode
              state={recordingState}
              currentTime={formattedCurrentTime}
              totalTime={formattedTotalTime}
              errorMessage={errorMessage}
              onReset={resetTotalTime}
              onSettingsClick={openSettingsModal}
              isDimmed={isDimmed}
              selectedTimeSegment={selectedTimeSegment}
              onSelectTimeSegment={selectTimeSegment}
              onAdjustTotalTime={adjustTotalTime}
            />
          ) : currentMode === "timer" ? (
            <TimerV2Mode
              formattedTime={formattedTimerTime}
              isRunning={timer.isRunning}
              isSetupMode={timer.isSetupMode}
              isOvertime={timer.isOvertime}
              onToggle={toggleTimer}
              onReset={resetTimer}
              onSetupComplete={setupTimer}
              onEnterSetup={enterTimerSetup}
              selectedTimeSegment={selectedTimeSegment}
              onSelectTimeSegment={selectTimeSegment}
              onAdjustTimerBy={adjustTimerBy}
              isDimmed={isDimmed}
            />
          ) : currentMode === "stopwatch" ? (
            <StopwatchV2Mode
              formattedTime={formattedStopwatchTime}
              isRunning={stopwatch.isRunning}
              onToggle={toggleStopwatch}
              onReset={resetStopwatch}
              onSettingsClick={openSettingsModal}
              isDimmed={isDimmed}
            />
          ) : (
            <ClockV2Mode
              is24Hour={clock.is24Hour}
              onToggleFormat={toggleClockFormat}
              onSettingsClick={openSettingsModal}
              isDimmed={isDimmed}
            />
          )}

          {settingsModal}
        </div>
      </AspectRatioContainer>
    );
  }
  
  // V1 Layout - Original design
  return (
    <AspectRatioContainer>
      <ModeNavigator
        currentMode={currentMode}
        showSettings={showSettings}
        onModeChange={setMode}
      >
        <div className="App">
          <div className="left-sidebar">
            <MenuBar
              onSettingsClick={openSettingsModal}
              onResetClick={currentMode === "obs" ? resetTotalTime : undefined}
              onBrightnessToggle={toggleBrightness}
              onSettingsToggle={toggleSettings}
              isDimmed={isDimmed}
              showSettings={showSettings}
            />
            <ModeSelector currentMode={currentMode} onModeChange={setMode} />
          </div>

          <div className="timer-container-wrapper">{renderCurrentMode()}</div>

          {settingsModal}
        </div>
      </ModeNavigator>
    </AspectRatioContainer>
  );
}

export default App;
