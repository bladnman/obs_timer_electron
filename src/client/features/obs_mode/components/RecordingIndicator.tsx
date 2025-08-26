import React from "react";

interface RecordingIndicatorProps {
  statusIcon: string;
  statusIconClass: string;
}

const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  statusIcon,
  statusIconClass,
}) => {
  return <span className={`status-icon ${statusIconClass}`}>{statusIcon}</span>;
};

export default RecordingIndicator;