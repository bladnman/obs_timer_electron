import React from "react";
import TimerDisplay from "./TimerDisplay";
import ConnectionStatus from "./ConnectionStatus";

interface OBSModeProps {
  currentStatusIcon: string;
  currentStatusIconClass: string;
  formattedCurrentTime: string;
  formattedTotalTime: string;
  isCurrentTimeFocused: boolean;
  onToggleTimerFocus: () => void;
  statusMessage: string;
  statusType: "connecting" | "connected" | "disconnected" | "error" | "hidden";
  isDimmed: boolean;
}

const OBSMode: React.FC<OBSModeProps> = ({
  currentStatusIcon,
  currentStatusIconClass,
  formattedCurrentTime,
  formattedTotalTime,
  isCurrentTimeFocused,
  onToggleTimerFocus,
  statusMessage,
  statusType,
  isDimmed,
}) => {
  return (
    <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
      <div className="timer-main-area">
        <div className="mode-label">OBS Recording</div>
        <div className="timer-display-row">
          <div className="timer-display-part icon">
            <span
              id="status-icon"
              className={`status-icon ${currentStatusIconClass}`}
            >
              {currentStatusIcon}
            </span>
          </div>
          <div className="timer-display-part display">
            <TimerDisplay
              time={formattedCurrentTime}
              isFocused={isCurrentTimeFocused}
              onClick={onToggleTimerFocus}
              className={`main-timer-display ${currentStatusIconClass}`}
            />
          </div>
          <div className="timer-display-part action">
            <div className="obs-action-placeholder">
              {/* No primary action for OBS mode */}
            </div>
          </div>
        </div>
      </div>

      <div className="total-container">
        <TimerDisplay
          label="∞"
          time={formattedTotalTime}
          isFocused={!isCurrentTimeFocused}
          onClick={onToggleTimerFocus}
          className="total-timer-display"
        />
        <button
          id="toggle-display"
          className="toggle-button"
          title="Toggle Focus"
          onClick={onToggleTimerFocus}
        >
          ⇅
        </button>
      </div>

      <ConnectionStatus statusText={statusMessage} statusType={statusType} />
    </div>
  );
};

export default OBSMode;