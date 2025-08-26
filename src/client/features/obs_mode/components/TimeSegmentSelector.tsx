import React from "react";
import { TimeSegment } from "../../../contexts/AppContext";

interface TimeSegmentSelectorProps {
  formattedTotalTime: string;
  selectedTimeSegment: TimeSegment;
  onSelectTimeSegment: (segment: TimeSegment) => void;
}

const TimeSegmentSelector: React.FC<TimeSegmentSelectorProps> = ({
  formattedTotalTime,
  selectedTimeSegment,
  onSelectTimeSegment,
}) => {
  const [hours, minutes, seconds] = formattedTotalTime.split(":");

  const handleSegmentClick = (segment: TimeSegment) => {
    if (selectedTimeSegment === segment) {
      onSelectTimeSegment(null);
    } else {
      onSelectTimeSegment(segment);
    }
  };

  return (
    <div className="manual-time-display">
      <span
        className={`time-segment ${selectedTimeSegment === "hours" ? "selected" : ""}`}
        onClick={() => handleSegmentClick("hours")}
      >
        {hours}
      </span>
      <span className="time-separator">:</span>
      <span
        className={`time-segment ${selectedTimeSegment === "minutes" ? "selected" : ""}`}
        onClick={() => handleSegmentClick("minutes")}
      >
        {minutes}
      </span>
      <span className="time-separator">:</span>
      <span
        className={`time-segment ${selectedTimeSegment === "seconds" ? "selected" : ""}`}
        onClick={() => handleSegmentClick("seconds")}
      >
        {seconds}
      </span>
    </div>
  );
};

export default TimeSegmentSelector;