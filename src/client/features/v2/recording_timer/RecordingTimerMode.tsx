import React from "react";
import { IoReloadOutline } from "react-icons/io5";
import { BsGearFill } from "react-icons/bs";
import TwoPanelLayout from "../layout/TwoPanelLayout";
import ElementLayout from "../layout/ElementLayout";
import StatusIcon from "../shared/components/StatusIcon";
import TimeDisplay from "../shared/components/TimeDisplay";
import StatusBar from "../shared/components/StatusBar";
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
  const bodyContent = (
    <ElementLayout
      topLabel="RECORDING TIMER"
      leftIcon={<StatusIcon state={state} />}
      centerDisplay={
        <TimeDisplay 
          time={currentTime} 
          state={state}
          isDimmed={isDimmed}
        />
      }
      rightAction={
        state !== "error" && (
          <button
            onClick={onReset}
            className="v2-action-button"
            title="Reset"
          >
            <IoReloadOutline />
          </button>
        )
      }
      className="recording-timer-body"
    />
  );

  const statusBarContent = (
    <StatusBar
      leftContent={
        <button
          onClick={onSettingsClick}
          className="v2-settings-button"
          title="Settings"
        >
          <BsGearFill />
        </button>
      }
      centerContent={
        <span className="v2-total-time">
          <span className="v2-total-label">Total:</span>
          <span className="v2-total-value">{totalTime}</span>
        </span>
      }
      rightContent={
        <span className="v2-clock-time">
          {clockTime}
        </span>
      }
    />
  );

  return (
    <div className={`v2-recording-timer-mode ${isDimmed ? "dimmed" : ""}`}>
      <TwoPanelLayout
        body={
          <>
            {bodyContent}
            {state === "error" && errorMessage && (
              <ErrorBanner message={errorMessage} />
            )}
          </>
        }
        statusBar={statusBarContent}
      />
    </div>
  );
};

export default RecordingTimerMode;