import React, {useEffect, useState} from "react";
import {useTimeAdjustment} from "../../obs_mode/hooks/use_time_adjustment";

interface TimerSetupProps {
  hours: number;
  minutes: number;
  seconds: number;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
  onSecondsChange: (value: string) => void;
  onAdjustHours: (delta: number) => void;
  onAdjustMinutes: (delta: number) => void;
  onAdjustSeconds: (delta: number) => void;
  onSubmit: () => void;
}

const TimerSetup: React.FC<TimerSetupProps> = ({
  hours,
  minutes,
  seconds,
  onHoursChange,
  onMinutesChange,
  onSecondsChange,
  onAdjustHours,
  onAdjustMinutes,
  onAdjustSeconds,
  onSubmit,
}) => {
  const [selectedField, setSelectedField] = useState<
    "hours" | "minutes" | "seconds"
  >("minutes");
  const {startKeyHold, stopKeyHold} = useTimeAdjustment();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log("handleKeyDown", e.key);
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const order: Array<"hours" | "minutes" | "seconds"> = [
          "hours",
          "minutes",
          "seconds",
        ];
        const idx = order.indexOf(selectedField);
        if (e.key === "ArrowLeft") {
          setSelectedField(order[Math.max(0, idx - 1)]);
        } else {
          setSelectedField(order[Math.min(order.length - 1, idx + 1)]);
        }
        return;
      }

      if (e.key === "ArrowUp" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        startKeyHold(1, () => {
          if (selectedField === "hours") onAdjustHours(1);
          else if (selectedField === "minutes") onAdjustMinutes(1);
          else onAdjustSeconds(1);
        });
      } else if (e.key === "ArrowDown" || e.key === "j" || e.key === "J") {
        e.preventDefault();
        startKeyHold(-1, () => {
          if (selectedField === "hours") onAdjustHours(-1);
          else if (selectedField === "minutes") onAdjustMinutes(-1);
          else onAdjustSeconds(-1);
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        onSubmit();
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
        stopKeyHold();
      }
    };

    const handleBlur = () => {
      stopKeyHold();
    };

    window.addEventListener("keydown", handleKeyDown, {capture: true});
    window.addEventListener("keyup", handleKeyUp, {capture: true});
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, {
        capture: true,
      } as any);
      window.removeEventListener("keyup", handleKeyUp, {capture: true} as any);
      window.removeEventListener("blur", handleBlur);
      stopKeyHold();
    };
  }, [
    selectedField,
    onAdjustHours,
    onAdjustMinutes,
    onAdjustSeconds,
    startKeyHold,
    stopKeyHold,
    onSubmit,
  ]);

  return (
    <div className="timer-setup-container" aria-label="Timer setup">
      <div
        className="timer-setup-inputs"
        role="group"
        aria-label="Set duration"
      >
        <div className="time-display-field">
          <button
            type="button"
            className={`time-faux ${
              selectedField === "hours" ? "selected" : ""
            }`}
            aria-label="Hours"
            onClick={() => setSelectedField("hours")}
          >
            {String(hours).padStart(2, "0")}
          </button>
          <label className="time-faux-label">H</label>
        </div>
        <span className="time-separator">:</span>
        <div className="time-display-field">
          <button
            type="button"
            className={`time-faux ${
              selectedField === "minutes" ? "selected" : ""
            }`}
            aria-label="Minutes"
            onClick={() => setSelectedField("minutes")}
          >
            {String(minutes).padStart(2, "0")}
          </button>
          <label className="time-faux-label">M</label>
        </div>
        <span className="time-separator">:</span>
        <div className="time-display-field">
          <button
            type="button"
            className={`time-faux ${
              selectedField === "seconds" ? "selected" : ""
            }`}
            aria-label="Seconds"
            onClick={() => setSelectedField("seconds")}
          >
            {String(seconds).padStart(2, "0")}
          </button>
          <label className="time-faux-label">S</label>
        </div>
      </div>

      <div className="timer-setup-actions">
        <button onClick={onSubmit} className="setup-button primary">
          Set
        </button>
      </div>
    </div>
  );
};

export default TimerSetup;
