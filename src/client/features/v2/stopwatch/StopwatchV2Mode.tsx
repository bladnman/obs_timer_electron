import React, { useEffect } from "react";
import { BsGearFill } from "react-icons/bs";
import { IoReloadOutline } from "react-icons/io5";
import AppLayout from "../layout/AppLayout";
import TimeDisplay from "../shared/components/TimeDisplay";
import StatusBarClock from "../shared/components/StatusBarClock";

interface StopwatchV2ModeProps {
  formattedTime: string;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSettingsClick: () => void;
  isDimmed?: boolean;
}

const StopwatchV2Mode: React.FC<StopwatchV2ModeProps> = ({
  formattedTime,
  isRunning,
  onToggle,
  onReset,
  onSettingsClick,
  isDimmed = false,
}) => {
  const modeLabel = <div className="v2-mode-title">STOPWATCH</div>;

  const settingsComponent = (
    <button
      onClick={onSettingsClick}
      className="v2-settings-button"
      title="Settings"
      aria-label="Settings"
    >
      <BsGearFill />
    </button>
  );

  const clockComponent = <StatusBarClock />;

  const displayComponent = (
    <div className="v2-display-container">
      <TimeDisplay
        time={formattedTime}
        state={isRunning ? "recording" : "stopped"}
        isDimmed={isDimmed}
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

  // Space bar toggles start/pause for Stopwatch
  useEffect(() => {
    const handleSpaceToggle = (e: KeyboardEvent) => {
      const isSpace = e.code === 'Space' || e.key === ' ' || (e as any).key === 'Spacebar';
      if (!isSpace) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag && ['input','textarea','select','button'].includes(tag)) return;
      e.preventDefault();
      (e as any).stopImmediatePropagation?.();
      onToggle();
    };
    window.addEventListener('keydown', handleSpaceToggle, { capture: true });
    return () => window.removeEventListener('keydown', handleSpaceToggle, { capture: true } as any);
  }, [onToggle]);

  return (
    <div className={`v2-recording-timer-mode ${isDimmed ? "dimmed" : ""}`}>
      <AppLayout
        className={"app-layout-compact-when-empty"}
        title={null}
        display={displayComponent}
        settings={settingsComponent}
        extraInfo={modeLabel}
        clock={clockComponent}
        action={actionComponent}
      />
    </div>
  );
};

export default StopwatchV2Mode;
