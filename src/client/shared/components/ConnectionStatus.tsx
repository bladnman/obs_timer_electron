import React from 'react';

interface ConnectionStatusProps {
  statusText: string;
  statusType: 'connecting' | 'connected' | 'disconnected' | 'error' | 'hidden';
  onRetry?: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  statusText,
  statusType,
  onRetry,
}) => {
  if (statusType === 'hidden') {
    return null;
  }
  return (
    <div id="connection-status" className={`connection-status ${statusType}`}>
      <span id="connection-text">{statusText}</span>
      {onRetry && (
        <button
          className="retry-button"
          onClick={onRetry}
          title="Retry Connection"
        >
          ⟳
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;
