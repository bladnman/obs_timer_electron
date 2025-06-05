import React from "react";
import { BiPlay, BiStop, BiReset } from "react-icons/bi";
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
      <div className="stopwatch-container">
        <div className="status-timer">
          <span
            className={`status-icon ${isRunning ? "recording" : "stopped"}`}
          >
            {isRunning ? <BiPlay /> : <BiStop />}
          </span>
          <TimerDisplay
            time={formattedTime}
            isFocused={true}
            onClick={onToggle}
            className={`main-timer-display ${isRunning ? "recording" : "stopped"}`}
          />
        </div>
        
        <button
          onClick={onReset}
          className="stopwatch-reset-button"
          title="Reset Stopwatch"
        >
          <BiReset />
        </button>
      </div>
    </div>
  );
};

export default StopwatchMode;