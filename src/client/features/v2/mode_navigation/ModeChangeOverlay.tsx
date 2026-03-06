import React from "react";

interface ModeChangeOverlayProps {
  label: string;
  detail?: string;
  isVisible: boolean;
}

const ModeChangeOverlay: React.FC<ModeChangeOverlayProps> = ({
  label,
  detail,
  isVisible,
}) => {
  return (
    <div
      className={`v2-mode-change-overlay ${isVisible ? "visible" : ""}`}
      aria-hidden={!isVisible}
    >
      <div className="v2-mode-change-overlay-label">{label}</div>
      {detail ? (
        <div className="v2-mode-change-overlay-detail">{detail}</div>
      ) : null}
    </div>
  );
};

export default ModeChangeOverlay;
