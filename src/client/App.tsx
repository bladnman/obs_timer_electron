import "./App.css";
import MenuBar from "./components/MenuBar";
import ModeSelector from "./components/ModeSelector";
import OBSMode from "./components/OBSMode";
import SettingsModal from "./components/SettingsModal";
import StopwatchMode from "./components/StopwatchMode";
import TimerMode from "./components/TimerMode";
import {useAppContext} from "./contexts/AppContext";

function App() {
  const {
    // State
    settings,
    obsConnection,
    isSettingsModalOpen,
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
    // Actions
    openSettingsModal,
    closeSettingsModal,
    saveSettings,
    testOBSConnection,
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
  } = useAppContext();

  let statusMessage = "";
  let statusType:
    | "connecting"
    | "connected"
    | "disconnected"
    | "error"
    | "hidden" = "hidden";

  if (obsConnection.isConnecting) {
    statusMessage = "Connecting to OBS...";
    statusType = "connecting";
  } else if (obsConnection.error) {
    statusMessage = obsConnection.error;
    statusType = "error";
  } else if (obsConnection.isConnected && !obsConnection.error) {
    statusMessage = "";
    statusType = "hidden";
  }

  const renderCurrentMode = () => {
    switch (currentMode) {
      case 'obs':
        return (
          <OBSMode
            currentStatusIcon={currentStatusIcon}
            currentStatusIconClass={currentStatusIconClass}
            formattedCurrentTime={formattedCurrentTime}
            formattedTotalTime={formattedTotalTime}
            isCurrentTimeFocused={isCurrentTimeFocused}
            onToggleTimerFocus={toggleTimerFocus}
            statusMessage={statusMessage}
            statusType={statusType}
            isDimmed={isDimmed}
          />
        );
      case 'stopwatch':
        return (
          <StopwatchMode
            formattedTime={formattedStopwatchTime}
            isRunning={stopwatch.isRunning}
            onToggle={toggleStopwatch}
            onReset={resetStopwatch}
            isDimmed={isDimmed}
          />
        );
      case 'timer':
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
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <MenuBar
        onSettingsClick={openSettingsModal}
        onResetClick={currentMode === 'obs' ? resetTotalTime : undefined}
        onBrightnessToggle={toggleBrightness}
        isDimmed={isDimmed}
      />

      <ModeSelector
        currentMode={currentMode}
        onModeChange={setMode}
      />

      {renderCurrentMode()}

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
        onSave={saveSettings}
        onTestConnection={() => testOBSConnection(settings)}
        initialHost={settings.host}
        initialPort={settings.port}
        initialPassword={settings.password}
        connectionResult={connectionTestResult}
        isTestingConnection={isTestingConnection}
      />
    </div>
  );
}
export default App;
