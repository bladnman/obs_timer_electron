import {useEffect, useRef, useState} from "react";
import {formatHMS} from "../../utils/timeUtils";
import {StopwatchState, initialStopwatchState} from "../app_context_types";

export function useStopwatchRuntime() {
  const [stopwatch, setStopwatch] =
    useState<StopwatchState>(initialStopwatchState);
  const stopwatchInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (stopwatchInterval.current) {
        clearInterval(stopwatchInterval.current);
      }
    };
  }, []);

  const toggleStopwatch = () => {
    setStopwatch((prev) => {
      if (prev.isRunning) {
        if (stopwatchInterval.current) {
          clearInterval(stopwatchInterval.current);
          stopwatchInterval.current = null;
        }
        const now = Date.now();
        const elapsed = prev.startTime
          ? Math.floor((now - prev.startTime) / 1000)
          : 0;
        return {
          isRunning: false,
          seconds: prev.seconds + elapsed,
          startTime: null,
        };
      }

      const now = Date.now();
      stopwatchInterval.current = setInterval(() => {
        setStopwatch((current) => ({...current}));
      }, 100);

      return {
        ...prev,
        isRunning: true,
        startTime: now,
      };
    });
  };

  const resetStopwatch = () => {
    if (stopwatchInterval.current) {
      clearInterval(stopwatchInterval.current);
      stopwatchInterval.current = null;
    }
    setStopwatch(initialStopwatchState);
  };

  const formattedStopwatchTime = formatHMS(
    stopwatch.isRunning && stopwatch.startTime
      ? stopwatch.seconds + Math.floor((Date.now() - stopwatch.startTime) / 1000)
      : stopwatch.seconds
  );

  return {
    stopwatch,
    formattedStopwatchTime,
    toggleStopwatch,
    resetStopwatch,
  };
}
