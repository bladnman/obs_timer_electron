import { useEffect, useState } from "react";

/**
 * Hook that returns the current time formatted for the footer clock display.
 * Updates every 30 seconds since only hours and minutes are shown.
 */
export function useFooterClock(): string {
  const formatTime = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const [clockTime, setClockTime] = useState(formatTime);

  useEffect(() => {
    // Update immediately and then every 30 seconds
    const updateClock = () => setClockTime(formatTime());

    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  return clockTime;
}
