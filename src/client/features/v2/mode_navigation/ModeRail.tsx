import React from "react";
import {BiStopwatch, BiTime, BiTimer, BiVideo} from "react-icons/bi";
import {modeLabels, modeOrder} from "../../../constants/modes";
import {AppMode} from "../../../contexts/AppContext";

type ObsAvailabilityState =
  | "recording"
  | "paused"
  | "ready"
  | "connecting"
  | "unavailable";

interface ModeRailProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  obsAvailabilityState: ObsAvailabilityState;
  compact?: boolean;
}

const ComboModeIcon: React.FC = () => (
  <span className="v2-mode-rail-combo-icon" aria-hidden="true">
    <BiVideo />
    <BiTime />
  </span>
);

const modeIcons: Record<AppMode, React.ReactNode> = {
  obs: <BiVideo />,
  clock: <BiTime />,
  "obs-clock": <ComboModeIcon />,
  timer: <BiTimer />,
  stopwatch: <BiStopwatch />,
};

const ModeRail: React.FC<ModeRailProps> = ({
  currentMode,
  onModeChange,
  obsAvailabilityState,
  compact = false,
}) => {
  const activeShowsObsStatus =
    currentMode === "obs" || currentMode === "obs-clock";

  if (compact) {
    return (
      <nav className="v2-mode-rail compact" aria-label="Mode navigation">
        <button
          type="button"
          className="v2-mode-rail-button active compact"
          onClick={() => onModeChange(currentMode)}
          title={modeLabels[currentMode]}
          aria-label={modeLabels[currentMode]}
          aria-pressed="true"
        >
          <span className="v2-mode-rail-icon">{modeIcons[currentMode]}</span>
          {activeShowsObsStatus ? (
            <span
              className={`v2-mode-rail-obs-dot ${obsAvailabilityState}`}
              aria-hidden="true"
            />
          ) : null}
        </button>
        <div className="v2-mode-rail-pips" aria-hidden="true">
          {modeOrder.map((mode) => (
            <span
              key={mode}
              className={`v2-mode-rail-pip ${mode === currentMode ? "active" : ""}`}
            />
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="v2-mode-rail" aria-label="Mode navigation">
      {modeOrder.map((mode) => {
        const isActive = mode === currentMode;
        const showsObsStatus = mode === "obs" || mode === "obs-clock";

        return (
          <button
            key={mode}
            type="button"
            className={`v2-mode-rail-button ${isActive ? "active" : ""}`}
            onClick={() => onModeChange(mode)}
            title={modeLabels[mode]}
            aria-label={modeLabels[mode]}
            aria-pressed={isActive}
          >
            <span className="v2-mode-rail-icon">{modeIcons[mode]}</span>
            {showsObsStatus ? (
              <span
                className={`v2-mode-rail-obs-dot ${obsAvailabilityState}`}
                aria-hidden="true"
              />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
};

export default ModeRail;
