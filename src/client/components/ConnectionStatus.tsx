import React from 'react';

interface ConnectionStatusProps {
  statusText: string;
  statusType: 'connecting' | 'connected' | 'disconnected' | 'error' | 'hidden';
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ statusText, statusType }) => {
  if (statusType === 'hidden') {
    return null;
  }
  return (
    <div id="connection-status" className={`connection-status ${statusType}`}>
      <span id="connection-text">{statusText}</span>
    </div>
  );
};

export default ConnectionStatus;
