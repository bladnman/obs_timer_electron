import { useRef } from "react";

interface UseTimeAdjustmentReturn {
  startKeyHold: (direction: 1 | -1, onAdjust: (amount: number) => void) => void;
  stopKeyHold: () => void;
}

export const useTimeAdjustment = (): UseTimeAdjustmentReturn => {
  const keyHoldInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const keyHoldDelay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickCount = useRef<number>(0);
  const activeRef = useRef<boolean>(false);
  const debug = (...args: unknown[]) => {
    if (typeof window !== 'undefined' && (window as any).__DEBUG_KEYS) {
      // eslint-disable-next-line no-console
      console.log('[KeyHold]', ...args);
    }
  };

  const startKeyHold = (direction: 1 | -1, onAdjust: (amount: number) => void) => {
    // If already holding, don't start another loop
    if (activeRef.current) return;
    activeRef.current = true;
    // Immediate adjustment
    onAdjust(direction);
    tickCount.current = 0;
    debug('start', { direction });

    // Start holding after delay
    keyHoldDelay.current = setTimeout(() => {
      keyHoldInterval.current = setInterval(() => {
        tickCount.current += 1;
        debug('tick', { tick: tickCount.current, direction });
        onAdjust(direction);
      }, 100);
    }, 300);
  };

  const stopKeyHold = () => {
    debug('stop');
    if (keyHoldInterval.current) {
      clearInterval(keyHoldInterval.current);
      keyHoldInterval.current = null;
    }
    if (keyHoldDelay.current) {
      clearTimeout(keyHoldDelay.current);
      keyHoldDelay.current = null;
    }
    activeRef.current = false;
  };

  return { startKeyHold, stopKeyHold };
};
