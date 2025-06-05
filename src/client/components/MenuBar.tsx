import React, { useState, useEffect, useRef } from "react";
import { BiCog, BiReset, BiSun, BiMoon, BiMenu } from "react-icons/bi";

interface MenuBarProps {
  onSettingsClick: () => void;
  onResetClick?: () => void;
  onBrightnessToggle: () => void;
  onSettingsToggle: () => void;
  isDimmed: boolean;
}

const MenuBar: React.FC<MenuBarProps> = ({
  onSettingsClick,
  onResetClick,
  onBrightnessToggle,
  onSettingsToggle,
  isDimmed,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const brightnessIcon = isDimmed ? <BiSun /> : <BiMoon />;
  const brightnessTitle = isDimmed ? "Brighten Display" : "Dim Display";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <div className="menu-bar">
      {/* Full icons - shown when there's enough space */}
      <div className="menu-icons-full">
        <button
          onClick={onSettingsClick}
          className="menu-button"
          title="Settings"
        >
          <BiCog />
        </button>
        {onResetClick && (
          <button
            onClick={onResetClick}
            className="menu-button"
            title="Reset Total Time"
          >
            <BiReset />
          </button>
        )}
        <button
          onClick={onBrightnessToggle}
          className="menu-button"
          title={brightnessTitle}
        >
          {brightnessIcon}
        </button>
      </div>

      {/* Collapsed hamburger menu - shown when space is tight */}
      <div className="menu-icons-collapsed" ref={menuRef}>
        <button
          onClick={onSettingsToggle}
          className="menu-button hamburger-button"
          title="Toggle Settings"
        >
          <BiMenu />
        </button>
      </div>
    </div>
  );
};

export default MenuBar;
