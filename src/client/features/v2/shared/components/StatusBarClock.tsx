import React, { useEffect, useState } from "react";

/**
 * Status bar clock component with animated colon separator.
 * Displays time in 12-hour format with blinking colon like the main clock display.
 */
const StatusBarClock: React.FC = () => {
  const getTimeParts = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 || 12;
    return {
      hours: displayH.toString(),
      minutes: m.toString().padStart(2, "0"),
      period,
    };
  };

  const [timeParts, setTimeParts] = useState(getTimeParts);

  useEffect(() => {
    // Update every second to keep time fresh
    const interval = setInterval(() => setTimeParts(getTimeParts()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="v2-status-bar-clock">
      <span className="v2-status-bar-clock-time">
        {timeParts.hours}
      </span>
      <span className="v2-status-bar-clock-separator">:</span>
      <span className="v2-status-bar-clock-time">
        {timeParts.minutes}
      </span>
      <span className="v2-status-bar-clock-period">
        {timeParts.period}
      </span>
    </span>
  );
};

export default StatusBarClock;
