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

  const adjustValue = (
    type: "hours" | "minutes" | "seconds",
    delta: number
  ) => {
    if (type === "hours") {
      setHours((prev) => Math.max(0, Math.min(23, prev + delta)));
    } else if (type === "minutes") {
      setMinutes((prev) => Math.max(0, Math.min(59, prev + delta)));
    } else if (type === "seconds") {
      setSeconds((prev) => Math.max(0, Math.min(59, prev + delta)));
    }
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
                  <div className="time-input-with-steps">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={hours}
                      onChange={(e) =>
                        handleInputChange("hours", e.target.value)
                      }
                      className="time-input"
                    />
                    <div className="time-stepper">
                      <button
                        type="button"
                        className="time-stepper-button"
                        aria-label="Increase hours"
                        onClick={() => adjustValue("hours", 1)}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="time-stepper-button"
                        aria-label="Decrease hours"
                        onClick={() => adjustValue("hours", -1)}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  <label>H</label>
                </div>
                <span className="time-separator">:</span>
                <div className="time-input-group">
                  <div className="time-input-with-steps">
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
                    <div className="time-stepper">
                      <button
                        type="button"
                        className="time-stepper-button"
                        aria-label="Increase minutes"
                        onClick={() => adjustValue("minutes", 1)}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="time-stepper-button"
                        aria-label="Decrease minutes"
                        onClick={() => adjustValue("minutes", -1)}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  <label>M</label>
                </div>
                <span className="time-separator">:</span>
                <div className="time-input-group">
                  <div className="time-input-with-steps">
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
                    <div className="time-stepper">
                      <button
                        type="button"
                        className="time-stepper-button"
                        aria-label="Increase seconds"
                        onClick={() => adjustValue("seconds", 1)}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="time-stepper-button"
                        aria-label="Decrease seconds"
                        onClick={() => adjustValue("seconds", -1)}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
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
    if (isOvertime) return "⚠"; // Warning when below zero
    if (isRunning) return "▶"; // Running
    return "⏸"; // Paused
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
        left={
          <div className="icon-with-edit">
            <span className={getStatusClassName()}>{getStatusIcon()}</span>
            <button
              type="button"
              className="edit-link"
              onClick={onEnterSetup}
              title="Set Duration"
            >
              Edit
            </button>
          </div>
        }
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
