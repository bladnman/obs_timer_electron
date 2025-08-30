import React, {useEffect, useRef} from "react";
import {BsGearFill} from "react-icons/bs";
import {IoReloadOutline} from "react-icons/io5";
import {TimeSegment} from "../../../contexts/AppContext";
import {useTimeAdjustment} from "../../obs_mode/hooks/use_time_adjustment";
import { computeAdjustment } from "../shared/utils/timeAdjustment";
import AppLayout from "../layout/AppLayout";
import ErrorBanner from "../shared/components/ErrorBanner";
import StatusIcon from "../shared/components/StatusIcon";
import TimeDisplay from "../shared/components/TimeDisplay";

interface EditableTotalTimeProps {
  time: string;
  selectedSegment: TimeSegment;
  onSelectSegment: (segment: TimeSegment) => void;
}

const EditableTotalTime: React.FC<EditableTotalTimeProps> = ({
  time,
  selectedSegment,
  onSelectSegment,
}) => {
  const [hours, minutes, seconds] = time.split(":");

  const handleClick = (segment: TimeSegment) => {
    if (selectedSegment === segment) {
      onSelectSegment(null);
    } else {
      onSelectSegment(segment);
    }
  };

  return (
    <span
      className="v2-total-value clickable-timer"
      aria-label="Total time editable"
    >
      <span
        className={`v2-total-segment clickable-timer ${
          selectedSegment === "hours" ? "selected" : ""
        }`}
        onClick={() => handleClick("hours")}
      >
        {hours}
      </span>
      <span className="v2-total-separator">:</span>
      <span
        className={`v2-total-segment clickable-timer ${
          selectedSegment === "minutes" ? "selected" : ""
        }`}
        onClick={() => handleClick("minutes")}
      >
        {minutes}
      </span>
      <span className="v2-total-separator">:</span>
      <span
        className={`v2-total-segment clickable-timer ${
          selectedSegment === "seconds" ? "selected" : ""
        }`}
        onClick={() => handleClick("seconds")}
      >
        {seconds}
      </span>
    </span>
  );
};

export type RecordingState = "recording" | "paused" | "stopped" | "error";

interface RecordingTimerModeProps {
  state: RecordingState;
  currentTime: string;
  totalTime: string;
  clockTime: string;
  errorMessage?: string;
  onReset: () => void;
  onSettingsClick: () => void;
  isDimmed?: boolean;
  selectedTimeSegment?: TimeSegment;
  onSelectTimeSegment?: (segment: TimeSegment) => void;
  onAdjustTotalTime?: (amount: number) => void;
}

const RecordingTimerMode: React.FC<RecordingTimerModeProps> = ({
  state,
  currentTime,
  totalTime,
  clockTime,
  errorMessage,
  onReset,
  onSettingsClick,
  isDimmed = false,
  selectedTimeSegment = null,
  onSelectTimeSegment = () => {},
  onAdjustTotalTime = () => {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {startKeyHold, stopKeyHold} = useTimeAdjustment();
  const totalTimeRef = useRef<string>(totalTime);

  useEffect(() => {
    totalTimeRef.current = totalTime;
  }, [totalTime]);

  // Keyboard handling for adjusting total time
  useEffect(() => {
    const debug = (...args: unknown[]) => {
      if (typeof window !== "undefined" && (window as any).__DEBUG_KEYS) {
        // eslint-disable-next-line no-console
        console.log("[RecordingTimerMode]", ...args);
      }
    };

    // Compute per-tick adjustment with optional Shift x10 factor
    const calcDelta = (
      segment: "hours" | "minutes" | "seconds",
      direction: 1 | -1,
      shiftKey: boolean
    ) => computeAdjustment(segment, direction, { shiftKey });

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeSegment: "hours" | "minutes" | "seconds" | null =
        selectedTimeSegment ?? null;
      if (e.key === "ArrowUp" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        if (!activeSegment) {
          debug("ArrowUp ignored (no selection)");
          return;
        }
        debug("ArrowUp start", {activeSegment, repeat: (e as any).repeat});
        const shift = e.shiftKey === true;
        const seg = activeSegment as "hours" | "minutes" | "seconds";
        startKeyHold(1, () => {
          const delta = calcDelta(seg, 1, shift);
          if (delta !== 0) onAdjustTotalTime(delta);
        });
      } else if (e.key === "ArrowDown" || e.key === "j" || e.key === "J") {
        e.preventDefault();
        if (!activeSegment) {
          debug("ArrowDown ignored (no selection)");
          return;
        }
        debug("ArrowDown start", {activeSegment, repeat: (e as any).repeat});
        const shift = e.shiftKey === true;
        const seg = activeSegment as "hours" | "minutes" | "seconds";
        startKeyHold(-1, () => {
          const delta = calcDelta(seg, -1, shift);
          if (delta !== 0) onAdjustTotalTime(delta);
        });
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (!activeSegment) {
          debug("Left/Right ignored (no selection)");
          return;
        }
        const order: Array<"hours" | "minutes" | "seconds"> = [
          "hours",
          "minutes",
          "seconds",
        ];
        const idx = order.indexOf(activeSegment);
        if (e.key === "ArrowRight" && idx < order.length - 1) {
          onSelectTimeSegment(order[idx + 1]);
        } else if (e.key === "ArrowLeft" && idx > 0) {
          onSelectTimeSegment(order[idx - 1]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onSelectTimeSegment(null);
      }
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
        debug("keyUp", e.key);
        stopKeyHold();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onSelectTimeSegment(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown, {capture: true});
    window.addEventListener("keyup", handleKeyUp, {capture: true});
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, {
        capture: true,
      } as any);
      window.removeEventListener("keyup", handleKeyUp, {capture: true} as any);
      document.removeEventListener("mousedown", handleClickOutside);
      stopKeyHold();
    };
  }, [
    selectedTimeSegment,
    onAdjustTotalTime,
    onSelectTimeSegment,
    startKeyHold,
    stopKeyHold,
  ]);

  // Title component - removed per request to allow compact layout
  const titleComponent = null;

  // Icon component (status indicator)
  const iconComponent = <StatusIcon state={state} />;

  // Main display component - always show time display
  const displayComponent = (
    <div className="v2-display-container">
      <TimeDisplay time={currentTime} state={state} isDimmed={isDimmed} />
    </div>
  );

  // Sub-display component - keep empty to enable compact layout
  const subDisplayComponent = undefined;

  // Action component (reset button) - always show to maintain layout
  const actionComponent = (
    <div className="v2-action-wrapper">
      <button
        onClick={onReset}
        className="v2-action-button"
        title="Reset"
      >
        <IoReloadOutline />
      </button>
    </div>
  );

  // Settings component
  const settingsComponent = (
    <button
      onClick={onSettingsClick}
      className="v2-settings-button"
      title="Settings"
    >
      <BsGearFill />
    </button>
  );

  // Extra info component (total time)
  const extraInfoComponent = (
    <span className="v2-total-time">
      <span className="v2-total-label">Total:</span>
      <EditableTotalTime
        time={totalTime}
        selectedSegment={selectedTimeSegment}
        onSelectSegment={onSelectTimeSegment}
      />
    </span>
  );

  // Clock component
  const clockComponent = <span className="v2-clock-time">{clockTime}</span>;

  // Error overlay - render as part of body
  const bodyOverlay =
    state === "error" && errorMessage ? (
      <ErrorBanner message={errorMessage} />
    ) : undefined;

  return (
    <div
      className={`v2-recording-timer-mode ${isDimmed ? "dimmed" : ""}`}
      ref={containerRef}
    >
      <AppLayout
        className={"app-layout-compact-when-empty"}
        icon={iconComponent}
        title={titleComponent}
        display={displayComponent}
        subDisplay={subDisplayComponent}
        action={actionComponent}
        settings={settingsComponent}
        extraInfo={extraInfoComponent}
        clock={clockComponent}
        bodyOverlay={bodyOverlay}
      />
    </div>
  );
};

export default RecordingTimerMode;
