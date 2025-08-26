import React from "react";

interface TimerSettingsProps {
  isDimmed: boolean;
  onEnterSetup: () => void;
  onToggleBrightness: () => void;
}

const TimerSettings: React.FC<TimerSettingsProps> = ({
  isDimmed,
  onEnterSetup,
  onToggleBrightness,
}) => {
  return (
    <div className="settings-panel">
      <h3>Timer Settings</h3>
      <button onClick={onEnterSetup} className="settings-button">
        Set Duration
      </button>
      <button onClick={onToggleBrightness} className="settings-button">
        {isDimmed ? "Brighten" : "Dim"}
      </button>
    </div>
  );
};

export default TimerSettings;