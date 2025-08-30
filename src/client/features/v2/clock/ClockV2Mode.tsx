import React, { useEffect, useState } from "react";
import AppLayout from "../layout/AppLayout";
import TimeDisplay from "../shared/components/TimeDisplay";
import { BsGearFill } from "react-icons/bs";

interface ClockV2ModeProps {
  is24Hour: boolean;
  onToggleFormat: () => void;
  onSettingsClick: () => void;
  isDimmed?: boolean;
}

function formatClock(is24: boolean) {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  if (is24) {
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    return `${hh}:${mm}`;
  }
  const hh12 = h % 12 || 12; // no leading zero in 12h
  const mm = m.toString().padStart(2, "0");
  return `${hh12}:${mm}`;
}

const ClockV2Mode: React.FC<ClockV2ModeProps> = ({
  is24Hour,
  onToggleFormat,
  onSettingsClick,
  isDimmed = false,
}) => {
  const [, setTick] = useState(0);
  // Periodic tick to keep minutes fresh; 1s to align with separator blink
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 60), 1000);
    return () => clearInterval(id);
  }, []);
  // Always compute time on render; external ticks are okay (we animate separator)
  const time = formatClock(is24Hour);

  // AM/PM appears only in 12-hour mode; place it as sub-display text
  const ampm = !is24Hour ? (new Date().getHours() >= 12 ? "PM" : "AM") : "";

  const displayComponent = (
    <div className="v2-display-container">
      <div
        className="v2-clock-container"
        onClick={onToggleFormat}
        role="button"
        aria-label="Toggle 12/24 hour"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggleFormat(); }
        }}
      >
        <TimeDisplay
          time={time}
          state={"recording"}
          isDimmed={isDimmed}
          className="v2-clock-display"
        />
      </div>
    </div>
  );

  // Only the gear is present in the status bar for clock mode
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

  return (
    <div className={`v2-recording-timer-mode ${isDimmed ? "dimmed" : ""}`}>
      <AppLayout
        className={"app-layout-compact-when-empty"}
        title={null}
        display={displayComponent}
        settings={settingsComponent}
        extraInfo={undefined}
        clock={<div />}
        action={
          ampm ? (
            <div className="v2-action-wrapper">
              <div className="v2-clock-ampm-action">{ampm}</div>
            </div>
          ) : undefined
        }
      />
    </div>
  );
};

export default ClockV2Mode;
