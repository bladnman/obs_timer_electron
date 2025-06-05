import React from "react";
import { BiPlay, BiPause, BiReset } from "react-icons/bi";
import TimerDisplay from "./TimerDisplay";

interface StopwatchModeProps {
  formattedTime: string;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  isDimmed: boolean;
}

const StopwatchMode: React.FC<StopwatchModeProps> = ({
  formattedTime,
  isRunning,
  onToggle,
  onReset,
  isDimmed,
}) => {
  return (
    <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
      <div className="mode-label">Stopwatch</div>
      <div className="timer-display-row">
        <div className="timer-icon">
          <span
            className={`status-icon ${isRunning ? "stopwatch-running" : "stopwatch-stopped"}`}
          >
            {isRunning ? "▶" : "⏸"}
          </span>
        </div>
        <div className="timer-display">
          <TimerDisplay
            time={formattedTime}
            isFocused={true}
            onClick={onToggle}
            className={`main-timer-display ${isRunning ? "stopwatch-running" : "stopwatch-stopped"}`}
          />
        </div>
        <div className="timer-action">
          <button
            onClick={onReset}
            className="primary-action-button"
            title="Reset"
          >
            <BiReset />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StopwatchMode;