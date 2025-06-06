import React from "react";
import ConnectionStatus from "./ConnectionStatus";
import ThreeColumnLayout from "./ThreeColumnLayout";

interface OBSModeProps {
  currentStatusIcon: string;
  currentStatusIconClass: string;
  formattedCurrentTime: string;
  formattedTotalTime: string;
  statusMessage: string;
  statusType: "connecting" | "connected" | "disconnected" | "error" | "hidden";
  isDimmed: boolean;
}

const OBSMode: React.FC<OBSModeProps> = ({
  currentStatusIcon,
  currentStatusIconClass,
  formattedCurrentTime,
  formattedTotalTime,
  statusMessage,
  statusType,
  isDimmed,
}) => {
  return (
    <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
      <ThreeColumnLayout
        label="OBS Recording"
        left={
          <span
            id="status-icon"
            className={`status-icon ${currentStatusIconClass}`}
          >
            {currentStatusIcon}
          </span>
        }
        center={
          <>
            <div className={`time-text ${currentStatusIconClass}`}>
              {formattedCurrentTime}
            </div>
            <div className="time-text total-time">{formattedTotalTime}</div>
          </>
        }
        right={null /* No action button for this mode */}
      />
      <ConnectionStatus statusText={statusMessage} statusType={statusType} />
    </div>
  );
};

export default OBSMode;
