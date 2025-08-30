import React, { Fragment, useEffect, useRef } from "react";

interface TimeDisplayProps {
  time: string;
  state: "recording" | "paused" | "stopped" | "error";
  isDimmed?: boolean;
  className?: string;
  clickable?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onSegmentClick?: (index: number) => void;
  selectedIndex?: number | null;
  focusIndex?: number | null;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  time,
  state,
  isDimmed = false,
  className = "",
  clickable = false,
  onClick,
  onSegmentClick,
  selectedIndex = null,
  focusIndex = null,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const segmentRefs = useRef<Array<HTMLSpanElement | null>>([]);
  // Keep DOM focus aligned with the selected segment and clear on deselect
  useSegmentFocus(containerRef, segmentRefs, focusIndex);
  const getStateClass = () => {
    switch (state) {
      case "recording":
        return "v2-time-recording";
      case "paused":
        return "v2-time-paused";
      case "stopped":
        return "v2-time-stopped";
      case "error":
        return "v2-time-error";
      default:
        return "";
    }
  };

  const formatTime = (timeString: string) => {
    const parts = timeString.split(":");
    return parts.map((part, index) => (
      <Fragment key={index}>
        <span
          className={`v2-time-segment ${selectedIndex === index ? "selected" : ""}`}
          ref={(el) => (segmentRefs.current[index] = el)}
          onClick={(e) => {
            if (onSegmentClick) {
              e.stopPropagation();
              onSegmentClick(index);
            } else if (onClick) {
              onClick(e);
            }
          }}
          role={clickable ? "button" : undefined}
          aria-label={clickable ? "Edit time" : undefined}
          tabIndex={clickable ? 0 : -1}
        >
          {part}
        </span>
        {index < parts.length - 1 && (
          <span className="v2-time-separator">:</span>
        )}
      </Fragment>
    ));
  };

  return (
    <div
      ref={containerRef}
      className={`v2-time-display ${getStateClass()} ${isDimmed ? "dimmed" : ""} ${clickable ? "clickable clickable-timer" : ""} ${className}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!clickable) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // Coerce types to reuse onClick signature for simplicity
          if (onClick) {
            onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
          }
        }
      }}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : -1}
    >
      {formatTime(time)}
    </div>
  );
};

// Hook into focus updates
function useSegmentFocus(
  container: React.RefObject<HTMLDivElement>,
  segments: React.RefObject<Array<HTMLSpanElement | null>>,
  index: number | null
) {
  useEffect(() => {
    if (index === null) {
      const active = document.activeElement as HTMLElement | null;
      if (active && container.current && container.current.contains(active)) {
        active.blur();
      }
      return;
    }
    const el = segments.current[index];
    if (el) {
      el.focus();
    }
  }, [index, container, segments]);
}

// Patch above component to call the hook
// We can't export a second component, so re-open the file context with a side-effect hook call.
// eslint-disable-next-line no-unused-vars
function __useFocusPatch(container: any, segments: any, index: any) {
  // no-op placeholder to satisfy bundlers if needed
}

export default TimeDisplay;
