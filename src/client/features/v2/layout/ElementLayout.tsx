import React from "react";

interface ElementLayoutProps {
  topLabel?: React.ReactNode;
  leftIcon?: React.ReactNode;
  centerDisplay: React.ReactNode;
  rightAction?: React.ReactNode;
  className?: string;
}

const ElementLayout: React.FC<ElementLayoutProps> = ({
  topLabel,
  leftIcon,
  centerDisplay,
  rightAction,
  className = "",
}) => {
  return (
    <div className={`element-layout ${className}`}>
      {topLabel && <div className="element-top-label">{topLabel}</div>}
      <div className="element-main-row">
        {leftIcon && <div className="element-left-icon">{leftIcon}</div>}
        <div className="element-center-display">{centerDisplay}</div>
        {rightAction && <div className="element-right-action">{rightAction}</div>}
      </div>
    </div>
  );
};

export default ElementLayout;