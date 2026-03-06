import React from "react";
import {BiChevronLeft, BiChevronRight, BiStopwatch, BiTime, BiTimer, BiVideo} from "react-icons/bi";
import {modeLabels, modeOrder} from "../../../constants/modes";
import {AppMode} from "../../../contexts/AppContext";

type ObsAvailabilityState =
  | "recording"
  | "paused"
  | "ready"
  | "connecting"
  | "unavailable";

interface ModeDockProps {
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

const isObsMode = (mode: AppMode) => mode === "obs" || mode === "obs-clock";

const ModeDock: React.FC<ModeDockProps> = ({
  currentMode,
  onModeChange,
  obsAvailabilityState,
  compact = false,
}) => {
  if (compact) {
    const currentIndex = modeOrder.indexOf(currentMode);
    const prevMode =
      currentIndex <= 0 ? modeOrder[modeOrder.length - 1] : modeOrder[currentIndex - 1];
    const nextMode =
      currentIndex === modeOrder.length - 1 ? modeOrder[0] : modeOrder[currentIndex + 1];

    return (
      <nav className="v2-mode-dock compact" aria-label="Mode navigation">
        <button
          type="button"
          className="v2-mode-dock-step"
          onClick={() => onModeChange(prevMode)}
          title={`Previous: ${modeLabels[prevMode]}`}
          aria-label={`Previous mode: ${modeLabels[prevMode]}`}
        >
          <BiChevronLeft />
        </button>
        <div
          className="v2-mode-dock-current"
          title={modeLabels[currentMode]}
          aria-label={modeLabels[currentMode]}
        >
          <span className="v2-mode-dock-icon">{modeIcons[currentMode]}</span>
          {isObsMode(currentMode) ? (
            <span
              className={`v2-mode-rail-obs-dot ${obsAvailabilityState}`}
              aria-hidden="true"
            />
          ) : null}
        </div>
        <button
          type="button"
          className="v2-mode-dock-step"
          onClick={() => onModeChange(nextMode)}
          title={`Next: ${modeLabels[nextMode]}`}
          aria-label={`Next mode: ${modeLabels[nextMode]}`}
        >
          <BiChevronRight />
        </button>
        <div className="v2-mode-dock-pips" aria-hidden="true">
          {modeOrder.map((mode) => (
            <span
              key={mode}
              className={`v2-mode-dock-pip ${mode === currentMode ? "active" : ""}`}
            />
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="v2-mode-dock" aria-label="Mode navigation">
      {modeOrder.map((mode) => {
        const isActive = mode === currentMode;

        return (
          <button
            key={mode}
            type="button"
            className={`v2-mode-dock-button ${isActive ? "active" : ""}`}
            onClick={() => onModeChange(mode)}
            title={modeLabels[mode]}
            aria-label={modeLabels[mode]}
            aria-pressed={isActive}
          >
            <span className="v2-mode-dock-icon">{modeIcons[mode]}</span>
            {isObsMode(mode) ? (
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

export default ModeDock;
