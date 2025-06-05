import React, { useState } from "react";
import { BiPlay, BiStop, BiReset, BiEdit } from "react-icons/bi";
import TimerDisplay from "./TimerDisplay";

interface TimerModeProps {
  formattedTime: string;
  isRunning: boolean;
  isSetupMode: boolean;
  isOvertime: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSetupComplete: (hours: number, minutes: number, seconds: number) => void;
  onEnterSetup: () => void;
  isDimmed: boolean;
}

const TimerMode: React.FC<TimerModeProps> = ({
  formattedTime,
  isRunning,
  isSetupMode,
  isOvertime,
  onToggle,
  onReset,
  onSetupComplete,
  onEnterSetup,
  isDimmed,
}) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);

  const handleSetupSubmit = () => {
    onSetupComplete(hours, minutes, seconds);
  };

  const handleInputChange = (type: 'hours' | 'minutes' | 'seconds', value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    
    switch (type) {
      case 'hours':
        setHours(Math.min(23, numValue));
        break;
      case 'minutes':
        setMinutes(Math.min(59, numValue));
        break;
      case 'seconds':
        setSeconds(Math.min(59, numValue));
        break;
    }
  };

  if (isSetupMode) {
    return (
      <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
        <div className="timer-setup-container">
          <div className="timer-setup-header">
            <h3>Set Timer</h3>
          </div>
          
          <div className="timer-setup-inputs">
            <div className="time-input-group">
              <input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => handleInputChange('hours', e.target.value)}
                className="time-input"
              />
              <label>H</label>
            </div>
            <span className="time-separator">:</span>
            <div className="time-input-group">
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => handleInputChange('minutes', e.target.value)}
                className="time-input"
              />
              <label>M</label>
            </div>
            <span className="time-separator">:</span>
            <div className="time-input-group">
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => handleInputChange('seconds', e.target.value)}
                className="time-input"
              />
              <label>S</label>
            </div>
          </div>
          
          <div className="timer-setup-actions">
            <button onClick={handleSetupSubmit} className="setup-button primary">
              Start Timer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getTimerClassName = () => {
    if (isOvertime) return "main-timer-display overtime";
    if (isRunning) return "main-timer-display recording";
    return "main-timer-display stopped";
  };

  const getStatusIcon = () => {
    if (isOvertime) return "⚠";
    if (isRunning) return <BiPlay />;
    return <BiStop />;
  };

  const getStatusClassName = () => {
    if (isOvertime) return "status-icon overtime";
    if (isRunning) return "status-icon recording";
    return "status-icon stopped";
  };

  return (
    <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
      <div className="timer-mode-container">
        <div className="status-timer">
          <span className={getStatusClassName()}>
            {getStatusIcon()}
          </span>
          <TimerDisplay
            time={formattedTime}
            isFocused={true}
            onClick={onToggle}
            className={getTimerClassName()}
          />
        </div>
        
        <div className="timer-controls">
          <button
            onClick={onEnterSetup}
            className="timer-action-button"
            title="Setup Timer"
          >
            <BiEdit />
          </button>
          <button
            onClick={onReset}
            className="timer-action-button"
            title="Reset Timer"
          >
            <BiReset />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimerMode;