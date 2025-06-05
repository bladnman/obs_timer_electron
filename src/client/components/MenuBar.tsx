import React, { useState, useEffect, useRef } from "react";
import { BiCog, BiReset, BiSun, BiMoon, BiMenu } from "react-icons/bi";

interface MenuBarProps {
  onSettingsClick: () => void;
  onResetClick?: () => void;
  onBrightnessToggle: () => void;
  isDimmed: boolean;
}

const MenuBar: React.FC<MenuBarProps> = ({
  onSettingsClick,
  onResetClick,
  onBrightnessToggle,
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
          onClick={handleMenuToggle}
          className={`menu-button hamburger-button ${isMenuOpen ? 'active' : ''}`}
          title="Menu"
        >
          <BiMenu />
        </button>
        {isMenuOpen && (
          <div className="menu-dropdown">
            <button
              onClick={() => handleMenuItemClick(onSettingsClick)}
              className="menu-dropdown-item"
              title="Settings"
            >
              <BiCog />
            </button>
            {onResetClick && (
              <button
                onClick={() => handleMenuItemClick(onResetClick)}
                className="menu-dropdown-item"
                title="Reset Total Time"
              >
                <BiReset />
              </button>
            )}
            <button
              onClick={() => handleMenuItemClick(onBrightnessToggle)}
              className="menu-dropdown-item"
              title={brightnessTitle}
            >
              {brightnessIcon}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuBar;
