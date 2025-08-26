import React from "react";

interface StatusBarProps {
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({
  leftContent,
  centerContent,
  rightContent,
  className = "",
}) => {
  return (
    <div className={`v2-status-bar ${className}`}>
      <div className="v2-status-bar-left">
        {leftContent}
      </div>
      <div className="v2-status-bar-center">
        {centerContent}
      </div>
      <div className="v2-status-bar-right">
        {rightContent}
      </div>
    </div>
  );
};

export default StatusBar;