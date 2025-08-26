import React from "react";

interface ThreeColumnLayoutProps {
  label?: string;
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = ({
  label,
  left,
  center,
  right,
}) => {
  return (
    <div className="timer-display-row">
      <div className="timer-icon">{left}</div>
      <div className="timer-display">
        {label && <div className="mode-label">{label}</div>}
        {center}
      </div>
      <div className="timer-action">{right}</div>
    </div>
  );
};

export default ThreeColumnLayout;
