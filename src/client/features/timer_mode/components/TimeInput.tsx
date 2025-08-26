import React from "react";

interface TimeInputProps {
  value: number;
  label: string;
  type: "hours" | "minutes" | "seconds";
  onChange: (value: string) => void;
  onAdjust: (delta: number) => void;
  min?: number;
  max?: number;
}

const TimeInput: React.FC<TimeInputProps> = ({
  value,
  label,
  type,
  onChange,
  onAdjust,
  min = 0,
  max = type === "hours" ? 23 : 59,
}) => {
  return (
    <div className="time-input-group">
      <div className="time-input-with-steps">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="time-input"
        />
        <div className="time-stepper">
          <button
            type="button"
            className="time-stepper-button"
            aria-label={`Increase ${type}`}
            onClick={() => onAdjust(1)}
          >
            ▲
          </button>
          <button
            type="button"
            className="time-stepper-button"
            aria-label={`Decrease ${type}`}
            onClick={() => onAdjust(-1)}
          >
            ▼
          </button>
        </div>
      </div>
      <label>{label}</label>
    </div>
  );
};

export default TimeInput;