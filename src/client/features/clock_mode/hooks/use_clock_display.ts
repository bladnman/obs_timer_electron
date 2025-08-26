import { useEffect, useState } from "react";

interface UseClockDisplayReturn {
  currentTime: string;
  ampm: string;
}

export const useClockDisplay = (is24Hour: boolean): UseClockDisplayReturn => {
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

  return { currentTime, ampm };
};