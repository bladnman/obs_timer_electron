import React from "react";
import { BiReset } from "react-icons/bi";
import ThreeColumnLayout from "../layout/ThreeColumnLayout";
import TimerSetup from "./components/TimerSetup";
import { useTimerSetup } from "./hooks/use_timer_setup";

interface TimerModeProps {
  formattedTime: string;
  isRunning: boolean;
  isSetupMode: boolean;
  isOvertime: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSetupComplete: (hours: number, minutes: number, seconds: number) => void;
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
  const {
    hours,
    minutes,
    seconds,
    adjustValue,
    handleInputChange,
  } = useTimerSetup(0, 5, 0);

  const handleSetupSubmit = () => {
    onSetupComplete(hours, minutes, seconds);
  };

  if (isSetupMode) {
    return (
      <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
        <ThreeColumnLayout
          label="Timer Setup"
          left={<span className="status-icon timer-stopped">⏱</span>}
          center={
            <TimerSetup
              hours={hours}
              minutes={minutes}
              seconds={seconds}
              onHoursChange={(value) => handleInputChange("hours", value)}
              onMinutesChange={(value) => handleInputChange("minutes", value)}
              onSecondsChange={(value) => handleInputChange("seconds", value)}
              onAdjustHours={(delta) => adjustValue("hours", delta)}
              onAdjustMinutes={(delta) => adjustValue("minutes", delta)}
              onAdjustSeconds={(delta) => adjustValue("seconds", delta)}
              onSubmit={handleSetupSubmit}
            />
          }
          right={<div />}
        />
      </div>
    );
  }

  return (
    <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
      <ThreeColumnLayout
        label={isOvertime ? "Timer (Overtime)" : "Countdown Timer"}
        left={
          <div className="icon-with-edit">
            <span className={isOvertime ? "status-icon timer-overtime" : isRunning ? "status-icon timer-running" : "status-icon timer-stopped"}>
              {isOvertime ? "⚠" : isRunning ? "▶" : "⏸"}
            </span>
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
          <div onClick={onToggle} className={isOvertime ? "time-text timer-overtime" : isRunning ? "time-text timer-running" : "time-text timer-stopped"}>
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