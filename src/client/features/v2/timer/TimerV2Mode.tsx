import React, { useEffect, useMemo, useRef, useState } from "react";
import { BsGearFill } from "react-icons/bs";
import { IoReloadOutline } from "react-icons/io5";
import AppLayout from "../layout/AppLayout";
import TimeDisplay from "../shared/components/TimeDisplay";
import TimerSetup from "../../timer_mode/components/TimerSetup";
import { useTimeAdjustment } from "../../obs_mode/hooks/use_time_adjustment";
import { TimeSegment } from "../../../contexts/AppContext";

interface TimerV2ModeProps {
  formattedTime: string;
  isRunning: boolean;
  isSetupMode: boolean;
  isOvertime: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSetupComplete: (hours: number, minutes: number, seconds: number) => void;
  onEnterSetup: () => void;
  onAdjustTimerBy: (amountSeconds: number) => void;
  selectedTimeSegment?: TimeSegment;
  onSelectTimeSegment?: (segment: TimeSegment) => void;
  isDimmed?: boolean;
}

// Simple local hook reused from v1 setup behavior
// Duplicates logic of useTimerSetup’s initial state (0h:5m:0s)
function useLocalTimerSetupDefaults() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);

  const adjustValue = (field: "hours" | "minutes" | "seconds", delta: number) => {
    if (field === "hours") setHours((h) => Math.max(0, h + delta));
    if (field === "minutes") setMinutes((m) => Math.max(0, Math.min(59, m + delta)));
    if (field === "seconds") setSeconds((s) => Math.max(0, Math.min(59, s + delta)));
  };

  const handleInputChange = (field: "hours" | "minutes" | "seconds", value: string) => {
    const n = Math.max(0, Math.min(59, parseInt(value || "0", 10) || 0));
    if (field === "hours") setHours(n);
    if (field === "minutes") setMinutes(n);
    if (field === "seconds") setSeconds(n);
  };

  return { hours, minutes, seconds, adjustValue, handleInputChange };
}

const TimerV2Mode: React.FC<TimerV2ModeProps> = ({
  formattedTime,
  isRunning,
  isSetupMode,
  isOvertime,
  onToggle,
  onReset,
  onSetupComplete,
  onEnterSetup,
  onAdjustTimerBy,
  selectedTimeSegment = null,
  onSelectTimeSegment = () => {},
  isDimmed = false,
}) => {
  // Always initialize local setup state to keep hooks order stable
  const { hours, minutes, seconds, adjustValue, handleInputChange } = useLocalTimerSetupDefaults();

  // Local edit segment selection for main time display (selection provided via context)
  type Segment = "hours" | "minutes" | "seconds" | null;
  const containerRef = useRef<HTMLDivElement>(null);
  const { startKeyHold, stopKeyHold } = useTimeAdjustment();

  // Exit edit mode on Escape or click outside; also exit when timer starts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSelectTimeSegment(null);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onSelectTimeSegment(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => { if (isRunning) onSelectTimeSegment(null); }, [isRunning, onSelectTimeSegment]);

  // Keyboard adjustment and navigation when a segment is selected
  useEffect(() => {
    if (!selectedTimeSegment || isRunning) return;
    const multipliers: Record<Exclude<Segment, null>, number> = {
      hours: 3600,
      minutes: 60,
      seconds: 1,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Left/Right move selection across segments
      if (e.key === "ArrowLeft" || e.key === "h" || e.key === "H") {
        e.preventDefault();
        (e as any).stopImmediatePropagation?.();
        const order: Segment[] = ["hours", "minutes", "seconds"];
        const idx = order.indexOf(selectedTimeSegment);
        const next = order[(idx + order.length - 1) % order.length];
        onSelectTimeSegment(next);
        stopKeyHold();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "l" || e.key === "L") {
        e.preventDefault();
        (e as any).stopImmediatePropagation?.();
        const order: Segment[] = ["hours", "minutes", "seconds"];
        const idx = order.indexOf(selectedTimeSegment);
        const next = order[(idx + 1) % order.length];
        onSelectTimeSegment(next);
        stopKeyHold();
        return;
      }

      // Up/Down adjust selected segment (with hold)
      const dir: 1 | -1 | null =
        e.key === "ArrowUp" || e.key === "k" || e.key === "K"
          ? 1
          : e.key === "ArrowDown" || e.key === "j" || e.key === "J"
          ? -1
          : null;
      if (dir === null) return;
      e.preventDefault();
      (e as any).stopImmediatePropagation?.();
      const step = multipliers[selectedTimeSegment];
      startKeyHold(dir, () => onAdjustTimerBy(dir * step));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "j" ||
        e.key === "J" ||
        e.key === "k" ||
        e.key === "K"
      ) {
        stopKeyHold();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
      window.removeEventListener("keyup", handleKeyUp, { capture: true } as any);
      stopKeyHold();
    };
  }, [selectedTimeSegment, isRunning, startKeyHold, stopKeyHold, onAdjustTimerBy, onSelectTimeSegment]);

  // Header and rails
  const titleComponent = <div className="v2-mode-title">TIMER</div>;

  const settingsComponent = (
    <button className="v2-settings-button" onClick={onEnterSetup} title="Set Duration">
      <BsGearFill />
    </button>
  );

  const clockTime = useMemo(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
  }, []);

  const clockComponent = <span className="v2-clock-time">{clockTime}</span>;

  // For setup mode, inject TimerSetup as content override
  if (isSetupMode) {
    const handleSetupSubmit = () => onSetupComplete(hours, minutes, seconds);

    return (
      <div className={`v2-recording-timer-mode ${isDimmed ? "dimmed" : ""}`}>
        <AppLayout
          // Keep rails to reserve layout
          title={titleComponent}
          display={<div />}
          settings={settingsComponent}
          clock={clockComponent}
          contentOverride={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "10em" }}>
              <TimerSetup
                hours={hours}
                minutes={minutes}
                seconds={seconds}
                onHoursChange={(v) => handleInputChange("hours", v)}
                onMinutesChange={(v) => handleInputChange("minutes", v)}
                onSecondsChange={(v) => handleInputChange("seconds", v)}
                onAdjustHours={(d) => adjustValue("hours", d)}
                onAdjustMinutes={(d) => adjustValue("minutes", d)}
                onAdjustSeconds={(d) => adjustValue("seconds", d)}
                onSubmit={handleSetupSubmit}
              />
            </div>
          }
        />
      </div>
    );
  }

  // Normal (countdown) mode
  const displayComponent = (
    <div className="v2-display-container">
      <TimeDisplay
        time={formattedTime}
        state={isOvertime ? "error" : isRunning ? "recording" : "stopped"}
        isDimmed={isDimmed}
        clickable={!isRunning}
        onClick={() => {
          if (isRunning) return;
          // Toggle: if already editing, clicking display exits; otherwise select seconds by default
          if (selectedTimeSegment !== null) onSelectTimeSegment(null);
          else onSelectTimeSegment("seconds");
        }}
        onSegmentClick={(idx) => {
          if (isRunning) return;
          const map: Segment[] = ["hours", "minutes", "seconds"];
          const seg = map[idx] ?? null;
          // Toggle selection if clicking the same segment again
          if (selectedTimeSegment === seg) onSelectTimeSegment(null);
          else onSelectTimeSegment(seg);
        }}
        selectedIndex={selectedTimeSegment === null ? null : { hours: 0, minutes: 1, seconds: 2 }[selectedTimeSegment]}
        focusIndex={selectedTimeSegment === null ? null : { hours: 0, minutes: 1, seconds: 2 }[selectedTimeSegment]}
      />
    </div>
  );

  const actionComponent = (
    <div className="v2-action-wrapper">
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="v2-action-button"
        title={isRunning ? "Pause" : "Start"}
        aria-label={isRunning ? "Pause" : "Start"}
      >
        {isRunning ? "॥" : "▶"}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onReset(); }}
        className="v2-action-button"
        title="Reset"
        aria-label="Reset"
      >
        <IoReloadOutline />
      </button>
    </div>
  );

  return (
    <div className={`v2-recording-timer-mode ${isDimmed ? "dimmed" : ""}`} ref={containerRef}>
      <AppLayout
        title={titleComponent}
        display={displayComponent}
        settings={settingsComponent}
        clock={clockComponent}
        action={actionComponent}
      />
    </div>
  );
};

export default TimerV2Mode;
