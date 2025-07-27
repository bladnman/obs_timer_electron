import React, {useRef, useState} from "react";
import "./App.css";
import ClockMode from "./components/ClockMode";
import MenuBar from "./components/MenuBar";
import ModeSelector from "./components/ModeSelector";
import OBSMode from "./components/OBSMode";
import SettingsModal from "./components/SettingsModal";
import StopwatchMode from "./components/StopwatchMode";
import TimerMode from "./components/TimerMode";
import {AppMode, useAppContext} from "./contexts/AppContext";

function App() {
  const touchStartY = useRef<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showModeTransition, setShowModeTransition] = useState(false);
  const lastScrollTime = useRef<number>(0);

  const {
    // State
    settings,
    obsConnection,
    isSettingsModalOpen,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isCurrentTimeFocused,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toggleTimerFocus,
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
    connectToOBS,
    selectTimeSegment,
    adjustTotalTime,
  } = useAppContext();

  const modes: AppMode[] = ["obs", "stopwatch", "timer", "clock"];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsScrolling(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null || showSettings || isScrolling) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    if (Math.abs(deltaY) > 80) {
      // Higher threshold for more deliberate swipe
      e.preventDefault();
      setIsScrolling(true);

      if (deltaY > 0) {
        // Swiping down - go to previous mode
        switchMode("prev");
      } else {
        // Swiping up - go to next mode
        switchMode("next");
      }

      touchStartY.current = null;
      setTimeout(() => setIsScrolling(false), 400); // Longer debounce
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
    setIsScrolling(false);
  };

  const switchMode = (direction: "next" | "prev") => {
    const currentIndex = modes.indexOf(currentMode);
    let newIndex: number;

    if (direction === "next") {
      newIndex = currentIndex === modes.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? modes.length - 1 : currentIndex - 1;
    }

    // Visual feedback
    setShowModeTransition(true);
    setTimeout(() => setShowModeTransition(false), 200);

    // Audio feedback (subtle click)
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCEOY4O/JdiMFl2+z9Zm8awEOb8OM4ZhQOh1Zl6JXElQgZnGaDFZGRGR8QxRJPHBFCF1sWNE0dHk1cHk/"
      );
      audio.volume = 0.1;
      audio.play().catch(() => {}); // Ignore errors if audio fails
    } catch (e) {
      // Fallback - create subtle vibration on mobile
      if ("vibrate" in navigator) {
        navigator.vibrate(10);
      }
    }

    setMode(modes[newIndex]);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (showSettings || isScrolling) return;

    const now = Date.now();
    if (now - lastScrollTime.current < 300) return; // Better debouncing

    if (Math.abs(e.deltaY) > 50) {
      // Higher threshold for more deliberate scrolling
      e.preventDefault();
      setIsScrolling(true);
      lastScrollTime.current = now;

      if (e.deltaY > 0) {
        switchMode("next");
      } else {
        switchMode("prev");
      }

      setTimeout(() => setIsScrolling(false), 400); // Longer debounce
    }
  };

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
    const modeMap = {
      obs: (
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
      ),
      stopwatch: (
        <StopwatchMode
          formattedTime={formattedStopwatchTime}
          isRunning={stopwatch.isRunning}
          onToggle={toggleStopwatch}
          onReset={resetStopwatch}
          isDimmed={isDimmed}
        />
      ),
      timer: (
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
      ),
      clock: (
        <ClockMode
          isDimmed={isDimmed}
          is24Hour={clock.is24Hour}
          onToggleFormat={toggleClockFormat}
        />
      ),
    };

    if (showSettings) {
      return renderSettingsPanel();
    }

    return modeMap[currentMode] || null;
  };

  const renderSettingsPanel = () => {
    switch (currentMode) {
      case "obs":
        return (
          <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
            <div className="settings-panel">
              <h3>OBS Settings</h3>
              <button onClick={openSettingsModal} className="settings-button">
                Connection
              </button>
              <button onClick={toggleBrightness} className="settings-button">
                {isDimmed ? "Brighten" : "Dim"}
              </button>
              <button onClick={resetTotalTime} className="settings-button">
                Reset Total
              </button>
            </div>
          </div>
        );
      case "stopwatch":
        return (
          <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
            <div className="settings-panel">
              <h3>Stopwatch Settings</h3>
              <button onClick={toggleBrightness} className="settings-button">
                {isDimmed ? "Brighten" : "Dim"}
              </button>
            </div>
          </div>
        );
      case "timer":
        return (
          <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
            <div className="settings-panel">
              <h3>Timer Settings</h3>
              <button onClick={enterTimerSetup} className="settings-button">
                Set Duration
              </button>
              <button onClick={toggleBrightness} className="settings-button">
                {isDimmed ? "Brighten" : "Dim"}
              </button>
            </div>
          </div>
        );
      case "clock":
        return (
          <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
            <div className="settings-panel">
              <h3>Clock Settings</h3>
              <button onClick={toggleClockFormat} className="settings-button">
                {clock.is24Hour ? "12-Hour" : "24-Hour"}
              </button>
              <button onClick={toggleBrightness} className="settings-button">
                {isDimmed ? "Brighten" : "Dim"}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="App"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
  );
}

export default App;
