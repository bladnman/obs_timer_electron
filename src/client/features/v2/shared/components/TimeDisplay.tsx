import React, { Fragment } from "react";

interface TimeDisplayProps {
  time: string;
  state: "recording" | "paused" | "stopped" | "error";
  isDimmed?: boolean;
  className?: string;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  time,
  state,
  isDimmed = false,
  className = "",
}) => {
  const getStateClass = () => {
    switch (state) {
      case "recording":
        return "v2-time-recording";
      case "paused":
        return "v2-time-paused";
      case "stopped":
        return "v2-time-stopped";
      case "error":
        return "v2-time-error";
      default:
        return "";
    }
  };

  const formatTime = (timeString: string) => {
    const parts = timeString.split(":");
    return parts.map((part, index) => (
      <Fragment key={index}>
        <span className="v2-time-segment">{part}</span>
        {index < parts.length - 1 && (
          <span className="v2-time-separator">:</span>
        )}
      </Fragment>
    ));
  };

  return (
    <div 
      className={`v2-time-display ${getStateClass()} ${isDimmed ? "dimmed" : ""} ${className}`}
    >
      {formatTime(time)}
    </div>
  );
};

export default TimeDisplay;