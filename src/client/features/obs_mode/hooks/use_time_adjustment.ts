import { useRef } from "react";

interface UseTimeAdjustmentReturn {
  startKeyHold: (direction: 1 | -1, onAdjust: (amount: number) => void) => void;
  stopKeyHold: () => void;
}

export const useTimeAdjustment = (): UseTimeAdjustmentReturn => {
  const keyHoldInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const keyHoldDelay = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startKeyHold = (direction: 1 | -1, onAdjust: (amount: number) => void) => {
    // Immediate adjustment
    onAdjust(direction);

    // Start holding after delay
    keyHoldDelay.current = setTimeout(() => {
      keyHoldInterval.current = setInterval(() => {
        onAdjust(direction);
      }, 100);
    }, 300);
  };

  const stopKeyHold = () => {
    if (keyHoldInterval.current) {
      clearInterval(keyHoldInterval.current);
      keyHoldInterval.current = null;
    }
    if (keyHoldDelay.current) {
      clearTimeout(keyHoldDelay.current);
      keyHoldDelay.current = null;
    }
  };

  return { startKeyHold, stopKeyHold };
};