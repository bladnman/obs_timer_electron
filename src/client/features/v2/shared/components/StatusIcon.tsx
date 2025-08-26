import React from "react";

export type IconState = "recording" | "paused" | "stopped" | "error";

interface StatusIconProps {
  state: IconState;
  className?: string;
}

const StatusIcon: React.FC<StatusIconProps> = ({ state, className = "" }) => {
  const getIcon = () => {
    switch (state) {
      case "recording":
        return <span className="v2-status-icon recording">●</span>;
      case "paused":
        return <span className="v2-status-icon paused">॥</span>;
      case "stopped":
        return <span className="v2-status-icon stopped">■</span>;
      case "error":
        return <span className="v2-status-icon error">×</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`v2-status-icon-container ${className}`}>
      {getIcon()}
    </div>
  );
};

export default StatusIcon;