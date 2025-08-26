import React, { useEffect, useRef } from "react";
import { BiReset } from "react-icons/bi";
import { TimeSegment } from "../../contexts/AppContext";
import ConnectionStatus from "../../shared/components/ConnectionStatus";
import ThreeColumnLayout from "../layout/ThreeColumnLayout";
import RecordingIndicator from "./components/RecordingIndicator";
import TimeSegmentSelector from "./components/TimeSegmentSelector";
import { useTimeAdjustment } from "./hooks/use_time_adjustment";

interface OBSModeProps {
  currentStatusIcon: string;
  currentStatusIconClass: string;
  formattedCurrentTime: string;
  formattedTotalTime: string;
  statusMessage: string;
  statusType: "connecting" | "connected" | "disconnected" | "error" | "hidden";
  isDimmed: boolean;
  onResetTotal: () => void;
  onRetry?: () => void;
  selectedTimeSegment: TimeSegment;
  onSelectTimeSegment: (segment: TimeSegment) => void;
  onAdjustTotalTime: (amount: number) => void;
}

const OBSMode: React.FC<OBSModeProps> = ({
  currentStatusIcon,
  currentStatusIconClass,
  formattedCurrentTime,
  formattedTotalTime,
  statusMessage,
  statusType,
  isDimmed,
  onResetTotal,
  onRetry,
  selectedTimeSegment,
  onSelectTimeSegment,
  onAdjustTotalTime,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { startKeyHold, stopKeyHold } = useTimeAdjustment();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedTimeSegment) return;

      const multipliers = {
        hours: 3600,
        minutes: 60,
        seconds: 1,
      };
      const multiplier = multipliers[selectedTimeSegment];

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (e.repeat) return;
        startKeyHold(1, (amount) => onAdjustTotalTime(amount * multiplier));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (e.repeat) return;
        startKeyHold(-1, (amount) => onAdjustTotalTime(amount * multiplier));
      } else if (e.key === "Escape") {
        e.preventDefault();
        onSelectTimeSegment(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
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

    if (selectedTimeSegment) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        document.removeEventListener("mousedown", handleClickOutside);
        stopKeyHold();
      };
    }
  }, [selectedTimeSegment, onAdjustTotalTime, onSelectTimeSegment, startKeyHold, stopKeyHold]);

  return (
    <div
      className={`timer-container ${isDimmed ? "dimmed" : ""}`}
      ref={containerRef}
    >
      {statusType !== 'hidden' && (
        <ConnectionStatus
          statusText={statusMessage}
          statusType={statusType}
          onRetry={onRetry}
        />
      )}
      <ThreeColumnLayout
        label="Recording Timer"
        left={
          <RecordingIndicator
            statusIcon={currentStatusIcon}
            statusIconClass={currentStatusIconClass}
          />
        }
        center={
          <div className="obs-center-display">
            <div className="time-text recording">{formattedCurrentTime}</div>
            <div className="total-time-container">
              <span className="total-time-label">Total:</span>
              <TimeSegmentSelector
                formattedTotalTime={formattedTotalTime}
                selectedTimeSegment={selectedTimeSegment}
                onSelectTimeSegment={onSelectTimeSegment}
              />
            </div>
            {selectedTimeSegment && (
              <div className="adjustment-hint">Use ↑↓ to adjust</div>
            )}
          </div>
        }
        right={
          <button
            onClick={onResetTotal}
            className="primary-action-button"
            title="Reset Total"
          >
            <BiReset />
          </button>
        }
      />
    </div>
  );
};

export default OBSMode;