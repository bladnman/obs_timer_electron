import React from "react";
import { BiTime } from "react-icons/bi";
import ThreeColumnLayout from "../layout/ThreeColumnLayout";
import ClockDisplay from "./components/ClockDisplay";
import { useClockDisplay } from "./hooks/use_clock_display";

interface ClockModeProps {
  isDimmed: boolean;
  is24Hour: boolean;
  onToggleFormat: () => void;
}

const ClockMode: React.FC<ClockModeProps> = ({
  isDimmed,
  is24Hour,
  onToggleFormat,
}) => {
  const { currentTime, ampm } = useClockDisplay(is24Hour);

  return (
    <div className={`timer-container ${isDimmed ? "dimmed" : ""}`}>
      <ThreeColumnLayout
        left={
          <span className="status-icon recording">
            <BiTime />
          </span>
        }
        center={
          <ClockDisplay
            currentTime={currentTime}
            ampm={ampm}
            onToggleFormat={onToggleFormat}
          />
        }
        right={<div />}
      />
    </div>
  );
};

export default ClockMode;