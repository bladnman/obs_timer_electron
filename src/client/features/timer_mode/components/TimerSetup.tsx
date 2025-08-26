import React from "react";
import TimeInput from "./TimeInput";

interface TimerSetupProps {
  hours: number;
  minutes: number;
  seconds: number;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
  onSecondsChange: (value: string) => void;
  onAdjustHours: (delta: number) => void;
  onAdjustMinutes: (delta: number) => void;
  onAdjustSeconds: (delta: number) => void;
  onSubmit: () => void;
}

const TimerSetup: React.FC<TimerSetupProps> = ({
  hours,
  minutes,
  seconds,
  onHoursChange,
  onMinutesChange,
  onSecondsChange,
  onAdjustHours,
  onAdjustMinutes,
  onAdjustSeconds,
  onSubmit,
}) => {
  return (
    <div className="timer-setup-container">
      <div className="timer-setup-inputs">
        <TimeInput
          value={hours}
          label="H"
          type="hours"
          onChange={onHoursChange}
          onAdjust={onAdjustHours}
        />
        <span className="time-separator">:</span>
        <TimeInput
          value={minutes}
          label="M"
          type="minutes"
          onChange={onMinutesChange}
          onAdjust={onAdjustMinutes}
        />
        <span className="time-separator">:</span>
        <TimeInput
          value={seconds}
          label="S"
          type="seconds"
          onChange={onSecondsChange}
          onAdjust={onAdjustSeconds}
        />
      </div>

      <div className="timer-setup-actions">
        <button onClick={onSubmit} className="setup-button primary">
          Set
        </button>
      </div>
    </div>
  );
};

export default TimerSetup;