import React from "react";
import { AppMode } from "../../contexts/AppContext";
import ClockSettings from "./components/ClockSettings";
import OBSSettings from "./components/OBSSettings";
import StopwatchSettings from "./components/StopwatchSettings";
import TimerSettings from "./components/TimerSettings";

interface SettingsPanelProps {
  currentMode: AppMode;
  isDimmed: boolean;
  clock: { is24Hour: boolean };
  onOpenModal: () => void;
  onToggleBrightness: () => void;
  onResetTotal: () => void;
  onEnterTimerSetup: () => void;
  onToggleClockFormat: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  currentMode,
  isDimmed,
  clock,
  onOpenModal,
  onToggleBrightness,
  onResetTotal,
  onEnterTimerSetup,
  onToggleClockFormat,
}) => {
  const renderSettings = () => {
    switch (currentMode) {
      case "obs":
        return (
          <OBSSettings
            isDimmed={isDimmed}
            onOpenModal={onOpenModal}
            onToggleBrightness={onToggleBrightness}
            onResetTotal={onResetTotal}
          />
        );
      case "stopwatch":
        return (
          <StopwatchSettings
            isDimmed={isDimmed}
            onToggleBrightness={onToggleBrightness}
          />
        );
      case "timer":
        return (
          <TimerSettings
            isDimmed={isDimmed}
            onEnterSetup={onEnterTimerSetup}
            onToggleBrightness={onToggleBrightness}
          />
        );
      case "clock":
        return (
          <ClockSettings
            isDimmed={isDimmed}
            is24Hour={clock.is24Hour}
            onToggleFormat={onToggleClockFormat}
            onToggleBrightness={onToggleBrightness}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
      {renderSettings()}
    </div>
  );
};

export default SettingsPanel;