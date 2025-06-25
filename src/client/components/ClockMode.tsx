import React, {useEffect, useState} from "react";
import {BiTime} from "react-icons/bi";
import ThreeColumnLayout from "./ThreeColumnLayout";

interface ClockModeProps {
  isDimmed: boolean;
  is24Hour: boolean;
  onToggleFormat: () => void;
}

const ClockMode: React.FC<ClockModeProps> = ({
  isDimmed,
  is24Hour,
  onToggleFormat,
}) => {
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
        setCurrentTime(`${hours12}:${minutes}`);
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
      <ThreeColumnLayout
        left={
          <span className="status-icon recording">
            <BiTime />
          </span>
        }
        center={
          <div className="clock-time-container" onClick={onToggleFormat}>
            <div className="time-text recording">{currentTime}</div>
            {ampm && <span className="clock-ampm">{ampm}</span>}
          </div>
        }
        right={
          <div /> // Placeholder for consistent layout
        }
      />
    </div>
  );
};

export default ClockMode;
