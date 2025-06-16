import React, {useState} from "react";
import {BiReset} from "react-icons/bi";
import ThreeColumnLayout from "./ThreeColumnLayout";

interface TimerModeProps {
  formattedTime: string;
  isRunning: boolean;
  isSetupMode: boolean;
  isOvertime: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSetupComplete: (hours: number, minutes: number, seconds: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onEnterSetup: () => void;
  isDimmed: boolean;
}

const TimerMode: React.FC<TimerModeProps> = ({
  formattedTime,
  isRunning,
  isSetupMode,
  isOvertime,
  onToggle,
  onReset,
  onSetupComplete,
  onEnterSetup,
  isDimmed,
}) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);

  const handleSetupSubmit = () => {
    onSetupComplete(hours, minutes, seconds);
  };

  const handleInputChange = (
    type: "hours" | "minutes" | "seconds",
    value: string
  ) => {
    const numValue = Math.max(0, parseInt(value) || 0);

    switch (type) {
      case "hours":
        setHours(Math.min(23, numValue));
        break;
      case "minutes":
        setMinutes(Math.min(59, numValue));
        break;
      case "seconds":
        setSeconds(Math.min(59, numValue));
        break;
    }
  };

  if (isSetupMode) {
    return (
      <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
        <ThreeColumnLayout
          label="Timer Setup"
          left={<span className="status-icon timer-stopped">⏱</span>}
          center={
            <div className="timer-setup-container">
              <div className="timer-setup-inputs">
                <div className="time-input-group">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={hours}
                    onChange={(e) => handleInputChange("hours", e.target.value)}
                    className="time-input"
                  />
                  <label>H</label>
                </div>
                <span className="time-separator">:</span>
                <div className="time-input-group">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) =>
                      handleInputChange("minutes", e.target.value)
                    }
                    className="time-input"
                  />
                  <label>M</label>
                </div>
                <span className="time-separator">:</span>
                <div className="time-input-group">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) =>
                      handleInputChange("seconds", e.target.value)
                    }
                    className="time-input"
                  />
                  <label>S</label>
                </div>
              </div>

              <div className="timer-setup-actions">
                <button
                  onClick={handleSetupSubmit}
                  className="setup-button primary"
                >
                  Set
                </button>
              </div>
            </div>
          }
          right={<div />}
        />
      </div>
    );
  }

  const getTimerClassName = () => {
    if (isOvertime) return "time-text timer-overtime";
    if (isRunning) return "time-text timer-running";
    return "time-text timer-stopped";
  };

  const getStatusIcon = () => {
    if (isOvertime) return "⚠";
    if (isRunning) return "⏱";
    return "⏱";
  };

  const getStatusClassName = () => {
    if (isOvertime) return "status-icon timer-overtime";
    if (isRunning) return "status-icon timer-running";
    return "status-icon timer-stopped";
  };

  return (
    <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
      <ThreeColumnLayout
        label={isOvertime ? "Timer (Overtime)" : "Countdown Timer"}
        left={<span className={getStatusClassName()}>{getStatusIcon()}</span>}
        center={
          <div onClick={onToggle} className={getTimerClassName()}>
            {formattedTime}
          </div>
        }
        right={
          <button
            onClick={onReset}
            className="primary-action-button"
            title="Start Over"
          >
            <BiReset />
          </button>
        }
      />
    </div>
  );
};

export default TimerMode;
