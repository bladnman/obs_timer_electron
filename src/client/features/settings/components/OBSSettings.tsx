import React from "react";

interface OBSSettingsProps {
  isDimmed: boolean;
  onOpenModal: () => void;
  onToggleBrightness: () => void;
  onResetTotal: () => void;
}

const OBSSettings: React.FC<OBSSettingsProps> = ({
  isDimmed,
  onOpenModal,
  onToggleBrightness,
  onResetTotal,
}) => {
  return (
    <div className="settings-panel">
      <h3>OBS Settings</h3>
      <button onClick={onOpenModal} className="settings-button">
        Connection
      </button>
      <button onClick={onToggleBrightness} className="settings-button">
        {isDimmed ? "Brighten" : "Dim"}
      </button>
      <button onClick={onResetTotal} className="settings-button">
        Reset Total
      </button>
    </div>
  );
};

export default OBSSettings;