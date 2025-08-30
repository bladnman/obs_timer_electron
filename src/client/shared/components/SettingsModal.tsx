import React, {useEffect, useState} from "react";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";

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
}) => {
  const [host, setHost] = useState(initialHost);
  const [port, setPort] = useState(initialPort);
  const [password, setPassword] = useState(initialPassword || "");
  const { width, height } = useWindowDimensions();
  const MIN_HEIGHT = 300; // threshold for showing full settings
  const MIN_WIDTH = 340;
  const isTooSmall = height < MIN_HEIGHT || width < MIN_WIDTH;

  useEffect(() => {
    setHost(initialHost);
    setPort(initialPort);
    setPassword(initialPassword || "");
  }, [initialHost, initialPort, initialPassword, isOpen]); // Update when modal opens or initial values change

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true } as any);
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

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>OBS Connection Settings</h3>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>
        <div className="modal-body">
          {isTooSmall ? (
            <div className="modal-too-small">
              <div className="modal-too-small-title">Window Too Small</div>
              <div className="modal-too-small-desc">
                Increase the window size to view Settings.
              </div>
              <div className="modal-too-small-hint">Press Esc to close.</div>
            </div>
          ) : (
            <div className="modal-grid">
              <div className="form-group grid-span-all">
                <label htmlFor="obs-host">OBS Host:</label>
                <input
                  type="text"
                  id="obs-host"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="localhost"
                />
              </div>
              <div className="form-group">
                <label htmlFor="obs-port">Port:</label>
                <input
                  type="number"
                  id="obs-port"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="4455"
                />
              </div>
              <div className="form-group">
                <label htmlFor="obs-password">Password:</label>
                <input
                  type="password"
                  id="obs-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter OBS WebSocket password"
                />
              </div>
              <div className="form-actions grid-span-all">
                <button onClick={handleSave} className="save-button">
                  Save & Connect
                </button>
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
    </div>
  );
};

export default SettingsModal;
