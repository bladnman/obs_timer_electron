import React from 'react';

interface TimerDisplayProps {
  time: string;
  isFocused: boolean;
  label?: string; // Optional label like 'Σ' for total timer
  onClick?: () => void;
  className?: string; // Allow passing custom class
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ time, isFocused, label, onClick, className }) => {
  return (
    <div className={`timer-display ${className || ''} ${isFocused ? 'focused' : 'unfocused'}`} onClick={onClick}>
      {label && <span className="timer-label">{label}</span>}
      <span className="time-text">{time}</span>
    </div>
  );
};

export default TimerDisplay;
