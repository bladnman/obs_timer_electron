import React, { useCallback, useEffect, useRef } from "react";

interface TimeInputProps {
  value: number;
  label: string;
  type: "hours" | "minutes" | "seconds";
  onChange: (value: string) => void;
  onAdjust: (delta: number) => void;
  min?: number;
  max?: number;
  onFocusField?: (type: "hours" | "minutes" | "seconds") => void;
  autoFocus?: boolean;
}

const TimeInput: React.FC<TimeInputProps> = ({
  value,
  label,
  type,
  onChange,
  onAdjust,
  min = 0,
  max = type === "hours" ? 23 : 59,
  onFocusField,
  autoFocus,
}) => {
  const holdTimeoutRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);
  const isHoldingRef = useRef(false);
  const pointerActiveRef = useRef(false);
  const keyHoldTimeoutRef = useRef<number | null>(null);
  const keyHoldIntervalRef = useRef<number | null>(null);
  const keyDirectionRef = useRef<1 | -1 | null>(null);

  const clearTimers = useCallback(() => {
    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current !== null) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    isHoldingRef.current = false;
    pointerActiveRef.current = false;
  }, []);

  const clearKeyTimers = useCallback(() => {
    if (keyHoldTimeoutRef.current !== null) {
      window.clearTimeout(keyHoldTimeoutRef.current);
      keyHoldTimeoutRef.current = null;
    }
    if (keyHoldIntervalRef.current !== null) {
      window.clearInterval(keyHoldIntervalRef.current);
      keyHoldIntervalRef.current = null;
    }
    keyDirectionRef.current = null;
  }, []);

  const startHold = useCallback(
    (delta: number) => {
      // Immediate single adjust for responsive feel
      onAdjust(delta);
      isHoldingRef.current = true;
      // After a short delay, start repeating
      holdTimeoutRef.current = window.setTimeout(() => {
        if (!isHoldingRef.current) return;
        holdIntervalRef.current = window.setInterval(() => {
          onAdjust(delta);
        }, 80);
      }, 250);
    },
    [onAdjust]
  );

  useEffect(() => {
    const handleMouseUp = () => clearTimers();
    const handleTouchEnd = () => clearTimers();
    const handleBlur = () => {
      clearTimers();
      clearKeyTimers();
    };
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("blur", handleBlur);
      clearTimers();
      clearKeyTimers();
    };
  }, [clearTimers, clearKeyTimers]);

  return (
    <div className="time-input-group">
      <div className="time-input-with-steps">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="time-input"
          autoFocus={autoFocus}
          autoComplete="off"
          inputMode="numeric"
          data-1p-ignore
          data-1password-ignore
          onFocus={() => onFocusField?.(type)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              const dir: 1 | -1 = e.key === "ArrowUp" ? 1 : -1;
              // For first keydown (not auto-repeat), trigger and start our own repeat
              if (!e.repeat || keyDirectionRef.current !== dir) {
                clearKeyTimers();
                keyDirectionRef.current = dir;
                onAdjust(dir);
                keyHoldTimeoutRef.current = window.setTimeout(() => {
                  keyHoldIntervalRef.current = window.setInterval(() => {
                    onAdjust(dir);
                  }, 80);
                }, 250);
              }
            } else if (e.key === "PageUp" || e.key === "PageDown") {
              e.preventDefault();
              onAdjust(e.key === "PageUp" ? 10 : -10);
            }
          }}
          onKeyUp={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              clearKeyTimers();
            }
          }}
          onBlur={() => {
            clearKeyTimers();
          }}
        />
        <div className="time-stepper">
          <button
            type="button"
            className="time-stepper-button"
            aria-label={`Increase ${type}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onAdjust(1);
              }
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              pointerActiveRef.current = true;
              const btn = e.currentTarget as HTMLButtonElement;
              const fn: any = (btn as any).setPointerCapture;
              if (typeof fn === "function") {
                fn.call(btn, e.pointerId);
              }
              startHold(1);
            }}
            onPointerUp={clearTimers}
            onPointerCancel={clearTimers}
            onMouseDown={(e) => {
              e.preventDefault();
              if (pointerActiveRef.current) return; // Avoid duplicate with pointer events
              startHold(1);
            }}
            onMouseUp={clearTimers}
            onTouchStart={(e) => {
              e.preventDefault();
              startHold(1);
            }}
            onTouchEnd={clearTimers}
            onContextMenu={(e) => {
              e.preventDefault();
              clearTimers();
            }}
          >
            ▲
          </button>
          <button
            type="button"
            className="time-stepper-button"
            aria-label={`Decrease ${type}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onAdjust(-1);
              }
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              pointerActiveRef.current = true;
              const btn = e.currentTarget as HTMLButtonElement;
              const fn: any = (btn as any).setPointerCapture;
              if (typeof fn === "function") {
                fn.call(btn, e.pointerId);
              }
              startHold(-1);
            }}
            onPointerUp={clearTimers}
            onPointerCancel={clearTimers}
            onMouseDown={(e) => {
              e.preventDefault();
              if (pointerActiveRef.current) return; // Avoid duplicate with pointer events
              startHold(-1);
            }}
            onMouseUp={clearTimers}
            onTouchStart={(e) => {
              e.preventDefault();
              startHold(-1);
            }}
            onTouchEnd={clearTimers}
            onContextMenu={(e) => {
              e.preventDefault();
              clearTimers();
            }}
          >
            ▼
          </button>
        </div>
      </div>
      <label>{label}</label>
    </div>
  );
};

export default TimeInput;
