import React from 'react';

interface MenuBarProps {
  onSettingsClick: () => void;
  onResetClick: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ onSettingsClick, onResetClick }) => {
  return (
    <div className="menu-bar">
      <button onClick={onSettingsClick} className="menu-button" title="Settings">⚙</button>
      <button onClick={onResetClick} className="menu-button" title="Reset Total Time">↻</button>
    </div>
  );
};

export default MenuBar;
