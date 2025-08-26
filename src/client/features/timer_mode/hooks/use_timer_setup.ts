import { useState } from "react";

interface TimerSetupState {
  hours: number;
  minutes: number;
  seconds: number;
}

interface UseTimerSetupReturn extends TimerSetupState {
  setHours: (hours: number) => void;
  setMinutes: (minutes: number) => void;
  setSeconds: (seconds: number) => void;
  adjustValue: (type: "hours" | "minutes" | "seconds", delta: number) => void;
  handleInputChange: (type: "hours" | "minutes" | "seconds", value: string) => void;
  reset: () => void;
}

export const useTimerSetup = (
  initialHours = 0,
  initialMinutes = 5,
  initialSeconds = 0
): UseTimerSetupReturn => {
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);

  const adjustValue = (
    type: "hours" | "minutes" | "seconds",
    delta: number
  ) => {
    if (type === "hours") {
      setHours((prev) => Math.max(0, Math.min(23, prev + delta)));
    } else if (type === "minutes") {
      setMinutes((prev) => Math.max(0, Math.min(59, prev + delta)));
    } else if (type === "seconds") {
      setSeconds((prev) => Math.max(0, Math.min(59, prev + delta)));
    }
  };

  const handleInputChange = (
    type: "hours" | "minutes" | "seconds",
    value: string
  ) => {
    const numValue = Math.max(0, parseInt(value) || 0);

    switch (type) {
      case "hours":
        setHours(Math.min(23, numValue));
        break;
      case "minutes":
        setMinutes(Math.min(59, numValue));
        break;
      case "seconds":
        setSeconds(Math.min(59, numValue));
        break;
    }
  };

  const reset = () => {
    setHours(initialHours);
    setMinutes(initialMinutes);
    setSeconds(initialSeconds);
  };

  return {
    hours,
    minutes,
    seconds,
    setHours,
    setMinutes,
    setSeconds,
    adjustValue,
    handleInputChange,
    reset,
  };
};