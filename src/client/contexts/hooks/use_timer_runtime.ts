import {useEffect, useRef, useState} from "react";
import {formatHMS} from "../../utils/timeUtils";
import {TimerState, initialTimerState} from "../app_context_types";

export function useTimerRuntime() {
  const [timer, setTimer] = useState<TimerState>(initialTimerState);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  const setupTimer = (hours: number, minutes: number, seconds: number) => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    setTimer({
      isRunning: false,
      isSetupMode: false,
      totalSeconds,
      remainingSeconds: totalSeconds,
      startTime: null,
      isOvertime: false,
    });
  };

  const toggleTimer = () => {
    setTimer((prev) => {
      if (prev.isSetupMode) return prev;

      if (prev.isRunning) {
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
        }
        const now = Date.now();
        const elapsed = prev.startTime
          ? Math.floor((now - prev.startTime) / 1000)
          : 0;
        const remainingSeconds = prev.remainingSeconds - elapsed;

        return {
          ...prev,
          isRunning: false,
          remainingSeconds,
          startTime: null,
          isOvertime: remainingSeconds < 0,
        };
      }

      const now = Date.now();
      timerInterval.current = setInterval(() => {
        setTimer((current) => ({...current}));
      }, 100);

      return {
        ...prev,
        isRunning: true,
        startTime: now,
      };
    });
  };

  const resetTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setTimer((prev) => ({
      ...prev,
      isRunning: false,
      remainingSeconds: prev.totalSeconds,
      startTime: null,
      isOvertime: false,
    }));
  };

  const enterTimerSetup = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setTimer({
      isRunning: false,
      isSetupMode: true,
      totalSeconds: 0,
      remainingSeconds: 0,
      startTime: null,
      isOvertime: false,
    });
  };

  const adjustTimerBy = (amountSeconds: number) => {
    setTimer((prev) => {
      if (prev.isRunning) return prev;
      const totalSeconds = Math.max(0, prev.totalSeconds + amountSeconds);
      const remainingSeconds = Math.max(
        0,
        Math.min(totalSeconds, prev.remainingSeconds + amountSeconds)
      );
      return {
        ...prev,
        totalSeconds,
        remainingSeconds,
        isOvertime: false,
      };
    });
  };

  const getCurrentTimerSeconds = () => {
    if (!timer.isRunning || !timer.startTime) return timer.remainingSeconds;
    const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
    const remainingSeconds = timer.remainingSeconds - elapsed;

    if (remainingSeconds < 0 && !timer.isOvertime) {
      setTimer((prev) => ({...prev, isOvertime: true}));
    }

    return remainingSeconds;
  };

  const currentSeconds = getCurrentTimerSeconds();
  const formattedTimerTime = `${
    currentSeconds < 0 ? "-" : ""
  }${formatHMS(Math.abs(currentSeconds))}`;

  return {
    timer,
    formattedTimerTime,
    setupTimer,
    toggleTimer,
    resetTimer,
    enterTimerSetup,
    adjustTimerBy,
  };
}
