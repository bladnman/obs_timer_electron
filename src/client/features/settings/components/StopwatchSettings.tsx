import React from "react";

interface StopwatchSettingsProps {
  isDimmed: boolean;
  onToggleBrightness: () => void;
}

const StopwatchSettings: React.FC<StopwatchSettingsProps> = ({
  isDimmed,
  onToggleBrightness,
}) => {
  return (
    <div className="settings-panel">
      <h3>Stopwatch Settings</h3>
      <button onClick={onToggleBrightness} className="settings-button">
        {isDimmed ? "Brighten" : "Dim"}
      </button>
    </div>
  );
};

export default StopwatchSettings;