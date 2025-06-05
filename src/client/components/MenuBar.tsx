import React from "react";

interface MenuBarProps {
  onSettingsClick: () => void;
  onResetClick: () => void;
  onBrightnessToggle: () => void;
  isDimmed: boolean;
}

const MenuBar: React.FC<MenuBarProps> = ({
  onSettingsClick,
  onResetClick,
  onBrightnessToggle,
  isDimmed,
}) => {
  const brightnessIcon = isDimmed ? "◐" : "●";
  const brightnessTitle = isDimmed ? "Brighten Display" : "Dim Display";

  return (
    <div className="menu-bar">
      <button
        onClick={onSettingsClick}
        className="menu-button"
        title="Settings"
      >
        ⚙
      </button>
      <button
        onClick={onResetClick}
        className="menu-button"
        title="Reset Total Time"
      >
        ↻
      </button>
      <button
        onClick={onBrightnessToggle}
        className="menu-button"
        title={brightnessTitle}
      >
        {brightnessIcon}
      </button>
    </div>
  );
};

export default MenuBar;
