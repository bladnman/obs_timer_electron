import React, {useEffect, useState} from "react";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import {CAPTURE_EVENT_OPTIONS} from "../../utils/keyboard";

// Note: This component could be simplified if App.tsx passes down more props from context,
// or it can consume context directly if it's deeply nested.
// For this iteration, App.tsx will mediate context access for SettingsModal.
// Let's adjust to directly use context for some parts if it makes sense.
// The props are now mainly for controlling visibility.
// App.tsx will pass settings values and callbacks from context.

const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: {host: string; port: string; password?: string}) => void;
  onTestConnection: (settings: {
    host: string;
    port: string;
    password?: string;
  }) => void; // Modified to pass settings
  initialHost: string;
  initialPort: string;
  initialPassword?: string;
  connectionResult?: string | null;
  isTestingConnection?: boolean;
  embedded?: boolean;
}> = ({
  isOpen,
  onClose,
  onSave,
  onTestConnection,
  initialHost,
  initialPort,
  initialPassword,
  connectionResult,
  isTestingConnection,
  embedded = false,
}) => {
  const [host, setHost] = useState(initialHost);
  const [port, setPort] = useState(initialPort);
  const [password, setPassword] = useState(initialPassword || "");
  const [hasPendingAutoSave, setHasPendingAutoSave] = useState(false);
  const { width, height } = useWindowDimensions();
  const MIN_HEIGHT = 300; // threshold for showing full settings
  const MIN_WIDTH = 340;
  const isTooSmall = height < MIN_HEIGHT || width < MIN_WIDTH;
  const isCompact = height < 120 || width < 260;
  const shouldShowCompactNotice = !embedded && isTooSmall && isCompact;
  const shouldShowSizeWarning = !embedded && isTooSmall;

  useEffect(() => {
    setHost(initialHost);
    setPort(initialPort);
    setPassword(initialPassword || "");
    setHasPendingAutoSave(false);
  }, [initialHost, initialPort, initialPassword, isOpen]); // Update when modal opens or initial values change

  useEffect(() => {
    if (!embedded || !hasPendingAutoSave) {
      return;
    }

    const saveTimer = window.setTimeout(() => {
      onSave({host, port, password});
      setHasPendingAutoSave(false);
    }, 400);

    return () => window.clearTimeout(saveTimer);
  }, [embedded, hasPendingAutoSave, host, onSave, password, port]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, CAPTURE_EVENT_OPTIONS);
    return () => window.removeEventListener("keydown", onKey, CAPTURE_EVENT_OPTIONS);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave({host, port, password});
  };

  const handleTest = () => {
    onTestConnection({host, port, password});
  };

  const updateField =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (value: string) => {
      setter(value);
      if (embedded) {
        setHasPendingAutoSave(true);
      }
    };

  if (shouldShowCompactNotice) {
    const compactNotice = (
      <div
        className="modal-content modal-content-compact modal-content-notice"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-compact-notice">
          <div className="modal-compact-notice-copy">
            <div className="modal-compact-notice-title">Settings</div>
            <div className="modal-compact-notice-text">
              Resize window or press Esc.
            </div>
          </div>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>
      </div>
    );

    if (embedded) {
      return <div className="settings-page-shell">{compactNotice}</div>;
    }

    return <div className="modal-overlay" onMouseDown={onClose}>{compactNotice}</div>;
  }

  const content = (
    <div
      className={`modal-content ${isCompact ? "modal-content-compact" : ""}`}
      data-embedded={embedded ? "true" : "false"}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className={`modal-header ${isCompact ? "modal-header-compact" : ""} ${
          embedded ? "modal-header-embedded" : ""
        }`}
      >
        <h3>{isCompact ? "Settings" : "OBS Connection Settings"}</h3>
        {!embedded ? (
          <button onClick={onClose} className="close-button">
            ×
          </button>
        ) : null}
      </div>
      <div className={`modal-body ${isCompact ? "modal-body-compact" : ""}`}>
        {shouldShowSizeWarning ? (
          <div className={`modal-too-small ${isCompact ? "compact" : ""}`}>
            <div className="modal-too-small-title">
              {isCompact ? "Window too small" : "Window Too Small"}
            </div>
            <div className="modal-too-small-desc">
              {isCompact
                ? "Resize the window or press Esc."
                : "Increase the window size to view Settings."}
            </div>
            {!isCompact ? (
              <div className="modal-too-small-hint">Press Esc to close.</div>
            ) : null}
          </div>
        ) : (
          <div className="modal-grid">
            <div className="form-group grid-span-all">
              <label htmlFor="obs-host">OBS Host:</label>
              <input
                type="text"
                id="obs-host"
                value={host}
                onChange={(e) => updateField(setHost)(e.target.value)}
                placeholder="localhost"
              />
            </div>
            <div className="form-group">
              <label htmlFor="obs-port">Port:</label>
              <input
                type="number"
                id="obs-port"
                value={port}
                onChange={(e) => updateField(setPort)(e.target.value)}
                placeholder="4455"
              />
            </div>
            <div className="form-group">
              <label htmlFor="obs-password">Password:</label>
              <input
                type="password"
                id="obs-password"
                value={password}
                onChange={(e) => updateField(setPassword)(e.target.value)}
                placeholder="Enter OBS WebSocket password"
              />
            </div>
            <div className="form-actions grid-span-all">
              {!embedded ? (
                <button onClick={handleSave} className="save-button">
                  Save & Connect
                </button>
              ) : (
                <div className="settings-inline-status" aria-live="polite">
                  {hasPendingAutoSave ? "Saving..." : "Changes save automatically"}
                </div>
              )}
              <button
                onClick={handleTest}
                className="test-button"
                disabled={isTestingConnection}
              >
                {isTestingConnection ? "Testing..." : "Test Connection"}
              </button>
            </div>
            {connectionResult && (
              <div
                className={`connection-result grid-span-all ${
                  connectionResult.startsWith("✓")
                    ? "success"
                    : connectionResult.startsWith("✗")
                    ? "error"
                    : "testing"
                }`}
              >
                {connectionResult}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return <div className="settings-page-shell">{content}</div>;
  }

  return <div className="modal-overlay" onMouseDown={onClose}>{content}</div>;
};

export default SettingsModal;
