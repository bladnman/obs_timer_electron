import "./App.css";
import ConnectionStatus from "./components/ConnectionStatus";
import MenuBar from "./components/MenuBar";
import SettingsModal from "./components/SettingsModal";
import TimerDisplay from "./components/TimerDisplay";
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
    isDimmed,
    // Actions
    openSettingsModal,
    closeSettingsModal,
    saveSettings,
    testOBSConnection,
    toggleTimerFocus,
    resetTotalTime,
    toggleBrightness,
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

  return (
    <div className="App">
      <MenuBar
        onSettingsClick={openSettingsModal}
        onResetClick={resetTotalTime}
        onBrightnessToggle={toggleBrightness}
        isDimmed={isDimmed}
      />

      <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
        <div className="status-timer">
          <span
            id="status-icon"
            className={`status-icon ${currentStatusIconClass}`}
          >
            {currentStatusIcon}
          </span>
          <TimerDisplay
            time={formattedCurrentTime}
            isFocused={isCurrentTimeFocused}
            onClick={toggleTimerFocus}
            className={`main-timer-display ${currentStatusIconClass}`}
          />
        </div>

        <div className="total-container">
          <TimerDisplay
            label="Σ"
            time={formattedTotalTime}
            isFocused={!isCurrentTimeFocused}
            onClick={toggleTimerFocus}
            className="total-timer-display"
          />
          <button
            id="toggle-display"
            className="toggle-button"
            title="Toggle Focus"
            onClick={toggleTimerFocus}
          >
            ⇅
          </button>
        </div>

        <ConnectionStatus statusText={statusMessage} statusType={statusType} />
      </div>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
        onSave={saveSettings} // saveSettings now handles disconnect/reconnect
        onTestConnection={() => testOBSConnection(settings)} // Pass current settings from modal form
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
