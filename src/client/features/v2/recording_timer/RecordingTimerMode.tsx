import React from "react";
import { IoReloadOutline } from "react-icons/io5";
import { BsGearFill } from "react-icons/bs";
import AppLayout from "../layout/AppLayout";
import StatusIcon from "../shared/components/StatusIcon";
import TimeDisplay from "../shared/components/TimeDisplay";
import ErrorBanner from "../shared/components/ErrorBanner";

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
}) => {
  // Title component - always show
  const titleComponent = (
    <div className="v2-mode-title">RECORDING TIMER</div>
  );
  
  // Icon component (status indicator)
  const iconComponent = (
    <StatusIcon state={state} />
  );
  
  // Main display component - always show time display
  const displayComponent = (
    <div className="v2-display-container">
      <TimeDisplay 
        time={currentTime} 
        state={state}
        isDimmed={isDimmed}
      />
    </div>
  );
  
  // Sub-display component - empty
  const subDisplayComponent = undefined;
  
  // Action component (reset button) - always show to maintain layout
  const actionComponent = (
    <div className="v2-action-wrapper">
      <button
        onClick={onReset}
        className="v2-action-button"
        title="Reset"
        disabled={state === "error"}  
        style={{ opacity: state === "error" ? 0.3 : undefined }}
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
      <span className="v2-total-value">{totalTime}</span>
    </span>
  );
  
  // Clock component
  const clockComponent = (
    <span className="v2-clock-time">
      {clockTime}
    </span>
  );

  // Error overlay - render as part of body
  const bodyOverlay = state === "error" && errorMessage ? (
    <ErrorBanner message={errorMessage} />
  ) : undefined;

  return (
    <div className={`v2-recording-timer-mode ${isDimmed ? "dimmed" : ""}`}>
      <AppLayout
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