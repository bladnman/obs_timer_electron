import React from "react";
import {BiReset} from "react-icons/bi";
import ThreeColumnLayout from "./ThreeColumnLayout";

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
  const timerClassName = `time-text ${
    isRunning ? "stopwatch-running" : "stopwatch-stopped"
  }`;

  return (
    <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
      <ThreeColumnLayout
        label="Stopwatch"
        left={
          <span
            className={`status-icon ${
              isRunning ? "stopwatch-running" : "stopwatch-stopped"
            }`}
          >
            {isRunning ? "▶" : "⏸"}
          </span>
        }
        center={
          <div onClick={onToggle} className={timerClassName}>
            {formattedTime}
          </div>
        }
        right={
          <button
            onClick={onReset}
            className="primary-action-button"
            title="Reset"
          >
            <BiReset />
          </button>
        }
      />
    </div>
  );
};

export default StopwatchMode;
