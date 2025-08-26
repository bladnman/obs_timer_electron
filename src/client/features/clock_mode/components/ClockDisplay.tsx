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
      <div className="time-text recording">{currentTime}</div>
      {ampm && <span className="clock-ampm">{ampm}</span>}
    </div>
  );
};

export default ClockDisplay;