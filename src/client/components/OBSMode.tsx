import React, {useEffect, useRef} from "react";
import {BiReset} from "react-icons/bi";
import {TimeSegment} from "../contexts/AppContext";
import ConnectionStatus from "./ConnectionStatus";
import ThreeColumnLayout from "./ThreeColumnLayout";

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
  const keyHoldInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const keyHoldDelay = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Split time into segments for individual selection
  const [hours, minutes, seconds] = formattedTotalTime.split(":");

  const handleSegmentClick = (segment: TimeSegment) => {
    if (selectedTimeSegment === segment) {
      onSelectTimeSegment(null);
    } else {
      onSelectTimeSegment(segment);
    }
  };

  const getAdjustmentAmount = (segment: TimeSegment, shiftKey: boolean) => {
    if (!segment) return 0;
    
    const baseAmounts = {
      hours: 3600,
      minutes: 60,
      seconds: 1,
    };
    
    const shiftMultipliers = {
      hours: 1, // No shift multiplier for hours
      minutes: 5,
      seconds: 10,
    };
    
    const baseAmount = baseAmounts[segment];
    const multiplier = shiftKey ? shiftMultipliers[segment] : 1;
    
    return baseAmount * multiplier;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedTimeSegment) return;
    
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      
      const amount = getAdjustmentAmount(selectedTimeSegment, e.shiftKey);
      const adjustAmount = e.key === "ArrowUp" ? amount : -amount;
      
      // Initial adjustment
      onAdjustTotalTime(adjustAmount);
      
      // Setup hold-to-repeat
      keyHoldDelay.current = setTimeout(() => {
        keyHoldInterval.current = setInterval(() => {
          onAdjustTotalTime(adjustAmount);
        }, 100); // Repeat every 100ms when held
      }, 300); // Start repeating after 300ms
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const segments: TimeSegment[] = ["hours", "minutes", "seconds"];
      const currentIndex = segments.indexOf(selectedTimeSegment);
      if (currentIndex > 0) {
        onSelectTimeSegment(segments[currentIndex - 1]);
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const segments: TimeSegment[] = ["hours", "minutes", "seconds"];
      const currentIndex = segments.indexOf(selectedTimeSegment);
      if (currentIndex < segments.length - 1) {
        onSelectTimeSegment(segments[currentIndex + 1]);
      }
    } else if (e.key === "Escape") {
      onSelectTimeSegment(null);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      // Clear hold-to-repeat
      if (keyHoldDelay.current) {
        clearTimeout(keyHoldDelay.current);
        keyHoldDelay.current = null;
      }
      if (keyHoldInterval.current) {
        clearInterval(keyHoldInterval.current);
        keyHoldInterval.current = null;
      }
    }
  };

  useEffect(() => {
    // Add keyboard event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    // Add click outside handler
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onSelectTimeSegment(null);
      }
    };
    
    if (selectedTimeSegment) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mousedown", handleClickOutside);
      
      // Cleanup intervals on unmount
      if (keyHoldDelay.current) {
        clearTimeout(keyHoldDelay.current);
      }
      if (keyHoldInterval.current) {
        clearInterval(keyHoldInterval.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimeSegment, onAdjustTotalTime, onSelectTimeSegment]);
  return (
    <div ref={containerRef} className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
      <ThreeColumnLayout
        label="OBS Recording"
        left={
          <span
            id="status-icon"
            className={`status-icon ${currentStatusIconClass}`}
          >
            {currentStatusIcon}
          </span>
        }
        center={
          <>
            <div className={`time-text ${currentStatusIconClass}`}>
              {formattedCurrentTime}
            </div>
            <div className="total-time-container">
              <div className="time-text total-time">
                <span
                  className={`time-segment ${selectedTimeSegment === "hours" ? "selected" : ""}`}
                  onClick={() => handleSegmentClick("hours")}
                  style={{cursor: "pointer"}}
                >
                  {hours}
                </span>
                :
                <span
                  className={`time-segment ${selectedTimeSegment === "minutes" ? "selected" : ""}`}
                  onClick={() => handleSegmentClick("minutes")}
                  style={{cursor: "pointer"}}
                >
                  {minutes}
                </span>
                :
                <span
                  className={`time-segment ${selectedTimeSegment === "seconds" ? "selected" : ""}`}
                  onClick={() => handleSegmentClick("seconds")}
                  style={{cursor: "pointer"}}
                >
                  {seconds}
                </span>
              </div>
              <button
                onClick={onResetTotal}
                className="reset-total-button"
                title="Reset Total Time"
              >
                <BiReset />
              </button>
            </div>
          </>
        }
        right={null /* No action button for this mode */}
      />
      <ConnectionStatus
        statusText={statusMessage}
        statusType={statusType}
        onRetry={onRetry}
      />
    </div>
  );
};

export default OBSMode;
