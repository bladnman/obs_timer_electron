import React, { useEffect, useState } from "react";
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

function App() {
  const [useV2Layout] = useState(true); // Toggle this to switch between v1 and v2
  
  // Helper to format clock time without hooks (avoid conditional hook calls)
  const getClockTimeFormatted = () => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };
  
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
      if (!useV2Layout) return;
      if (isSettingsModalOpen || showSettings) return;
      const isArrow = e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "ArrowDown";
      if (!isArrow) return;

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

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
    };
  }, [useV2Layout, isSettingsModalOpen, showSettings, currentMode, selectedTimeSegment, timer.isSetupMode, setMode]);

  // Determine connection status for OBS mode
  let statusMessage = "";
  let statusType:
    | "connecting"
    | "connected"
    | "disconnected"
    | "error"
    | "hidden" = "hidden";
  let onRetry: (() => void) | undefined;

  if (obsConnection.isConnecting) {
    statusMessage = "Connecting to OBS...";
    statusType = "connecting";
  } else if (obsConnection.error) {
    statusMessage = obsConnection.error;
    statusType = "error";
    onRetry = connectToOBS;
  } else if (!obsConnection.isConnected) {
    statusMessage = "OBS unavailable";
    statusType = "disconnected";
    onRetry = connectToOBS;
  } else if (obsConnection.isConnected && !obsConnection.error) {
    statusMessage = "";
    statusType = "hidden";
  }

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
  if (useV2Layout && (currentMode === "obs" || currentMode === "timer" || currentMode === "stopwatch" || currentMode === "clock")) {
    // Determine recording state
    let recordingState: "recording" | "paused" | "stopped" | "error" = "stopped";
    let errorMsg: string | undefined;
    
    if (obsConnection.error || !obsConnection.isConnected) {
      recordingState = "error";
      errorMsg = "OBS NOT FOUND";
    } else if (currentStatusIconClass === "recording") {
      recordingState = "recording";
    } else if (currentStatusIconClass === "paused") {
      recordingState = "paused";
    } else {
      recordingState = "stopped";
    }
    
    // Format current time for display (without hooks inside conditional path)
    const clockTimeFormatted = getClockTimeFormatted();
    
    return (
      <AspectRatioContainer>
        <div className="AppV2">
          {currentMode === "obs" ? (
            <RecordingTimerMode
              state={recordingState}
              currentTime={formattedCurrentTime}
              totalTime={formattedTotalTime}
              clockTime={clockTimeFormatted}
              errorMessage={errorMsg}
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
          
          {isSettingsModalOpen && (
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
          )}
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

          {isSettingsModalOpen && (
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
          )}
        </div>
      </ModeNavigator>
    </AspectRatioContainer>
  );
}

export default App;
