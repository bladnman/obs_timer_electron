import React from "react";

interface ClockDisplayProps {
  currentTime: string;
  ampm: string;
  onToggleFormat: () => void;
}

const ClockDisplay: React.FC<ClockDisplayProps> = ({
  currentTime,
  ampm,
  onToggleFormat,
}) => {
  return (
    <div className="clock-time-container" onClick={onToggleFormat}>
      <div className="clock-time-value">
        <div className="time-text recording">{currentTime}</div>
      </div>
      {ampm && <span className="clock-ampm clock-ampm-floating">{ampm}</span>}
    </div>
  );
};

export default ClockDisplay;
