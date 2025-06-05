import React, { useState, useEffect } from "react";
import { BiTime } from "react-icons/bi";
import TimerDisplay from "./TimerDisplay";

interface ClockModeProps {
  isDimmed: boolean;
  is24Hour: boolean;
  onToggleFormat: () => void;
}

const ClockMode: React.FC<ClockModeProps> = ({ isDimmed, is24Hour, onToggleFormat }) => {
  const [currentTime, setCurrentTime] = useState("");
  const [ampm, setAmpm] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      if (is24Hour) {
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        setCurrentTime(`${hours}:${minutes}`);
        setAmpm("");
      } else {
        const hours12 = now.getHours() % 12 || 12;
        const ampmValue = now.getHours() >= 12 ? "PM" : "AM";
        const minutes = now.getMinutes().toString().padStart(2, "0");
        setCurrentTime(`${hours12.toString().padStart(2, "0")}:${minutes}`);
        setAmpm(ampmValue);
      }
    };

    // Update time immediately
    updateTime();

    // Set up interval to update every 30 seconds (no seconds displayed)
    const interval = setInterval(updateTime, 30000);

    return () => clearInterval(interval);
  }, [is24Hour]);

  return (
    <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
      <div className="timer-main-area">
        {/* Clock has no label */}
        <div className="timer-display-row">
          <div className="timer-display-part icon">
            <span className="status-icon recording">
              <BiTime />
            </span>
          </div>
          <div className="timer-display-part display">
            <div className="clock-time-container" onClick={onToggleFormat}>
              <TimerDisplay
                time={currentTime}
                isFocused={true}
                onClick={() => {}} // Handled by parent container
                className="main-timer-display recording"
              />
              {ampm && <span className="clock-ampm">{ampm}</span>}
            </div>
          </div>
          <div className="timer-display-part action">
            <div className="obs-action-placeholder">
              {/* No action button needed for clock mode */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClockMode;