import React from "react";

interface TimerDisplayProps {
  time: string;
  isFocused: boolean;
  label?: string; // Optional label like 'Σ' for total timer
  onClick?: () => void;
  className?: string; // Allow passing custom class
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  time,
  isFocused,
  label,
  onClick,
  className,
}) => {
  // Split time string (e.g., "01:23:45") into parts for separate styling
  const renderTimeWithStyledColons = (timeString: string) => {
    const parts = timeString.split(":");
    if (parts.length !== 3) {
      // Fallback if time format is unexpected
      return <span className="time-numbers">{timeString}</span>;
    }

    return (
      <>
        <span className="time-numbers">{parts[0]}</span>
        <span className="time-colon">:</span>
        <span className="time-numbers">{parts[1]}</span>
        <span className="time-colon">:</span>
        <span className="time-numbers">{parts[2]}</span>
      </>
    );
  };

  return (
    <div
      className={`timer-display ${className || ""} ${
        isFocused ? "focused" : "unfocused"
      }`}
      onClick={onClick}
    >
      {label && <span className="timer-label">{label}</span>}
      <span className="time-text">{renderTimeWithStyledColons(time)}</span>
    </div>
  );
};

export default TimerDisplay;
