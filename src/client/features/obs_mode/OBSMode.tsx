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
    const debug = (...args: unknown[]) => {
      if (typeof window !== 'undefined' && (window as any).__DEBUG_KEYS) {
        // eslint-disable-next-line no-console
        console.log('[OBSMode]', ...args);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeSegment: 'hours' | 'minutes' | 'seconds' | null = selectedTimeSegment ?? null;

      const multipliers = {
        hours: 3600,
        minutes: 60,
        seconds: 1,
      } as const;
      const multiplier = multipliers[activeSegment];

      if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        if (!activeSegment) {
          debug('ArrowUp ignored (no selection)');
          return;
        }
        debug('ArrowUp start', { activeSegment, repeat: (e as any).repeat });
        startKeyHold(1, (amount) => onAdjustTotalTime(amount * multiplier));
      } else if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        if (!activeSegment) {
          debug('ArrowDown ignored (no selection)');
          return;
        }
        debug('ArrowDown start', { activeSegment, repeat: (e as any).repeat });
        // Always apply negative step; adjustTotalTime clamps at 0 so this borrows naturally.
        startKeyHold(-1, (amount) => onAdjustTotalTime(amount * multiplier));
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (!activeSegment) {
          debug('Left/Right ignored (no selection)');
          return;
        }
        const order: Array<'hours' | 'minutes' | 'seconds'> = ['hours', 'minutes', 'seconds'];
        const idx = order.indexOf(activeSegment);
        if (e.key === 'ArrowRight' && idx < order.length - 1) {
          onSelectTimeSegment(order[idx + 1]);
        } else if (e.key === 'ArrowLeft' && idx > 0) {
          onSelectTimeSegment(order[idx - 1]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onSelectTimeSegment(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J' || e.key === 'k' || e.key === 'K') {
        debug('keyUp', e.key);
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

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true } as any);
      window.removeEventListener('keyup', handleKeyUp, { capture: true } as any);
      document.removeEventListener('mousedown', handleClickOutside);
      stopKeyHold();
    };
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
