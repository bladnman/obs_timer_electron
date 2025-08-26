import React from "react";

interface ClockSettingsProps {
  isDimmed: boolean;
  is24Hour: boolean;
  onToggleFormat: () => void;
  onToggleBrightness: () => void;
}

const ClockSettings: React.FC<ClockSettingsProps> = ({
  isDimmed,
  is24Hour,
  onToggleFormat,
  onToggleBrightness,
}) => {
  return (
    <div className="settings-panel">
      <h3>Clock Settings</h3>
      <button onClick={onToggleFormat} className="settings-button">
        {is24Hour ? "12-Hour" : "24-Hour"}
      </button>
      <button onClick={onToggleBrightness} className="settings-button">
        {isDimmed ? "Brighten" : "Dim"}
      </button>
    </div>
  );
};

export default ClockSettings;