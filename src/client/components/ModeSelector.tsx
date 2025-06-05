import React, { useState, useEffect, useRef } from "react";
import { BiVideo, BiStopwatch, BiTimer, BiTime, BiGridAlt } from "react-icons/bi";
import { AppMode } from "../contexts/AppContext";

interface ModeSelectorProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const modes = [
    { id: 'obs' as AppMode, icon: <BiVideo />, title: 'OBS Timer' },
    { id: 'stopwatch' as AppMode, icon: <BiStopwatch />, title: 'Stopwatch' },
    { id: 'timer' as AppMode, icon: <BiTimer />, title: 'Timer' },
    { id: 'clock' as AppMode, icon: <BiTime />, title: 'Clock' },
  ];

  const currentModeData = modes.find(mode => mode.id === currentMode);

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

  const handleModeSelect = (mode: AppMode) => {
    onModeChange(mode);
    setIsMenuOpen(false);
  };

  return (
    <div className="mode-selector">
      <div className="mode-selector-wrapper" ref={menuRef}>
        <button
          onClick={handleMenuToggle}
          className={`mode-button ${isMenuOpen ? 'active' : ''}`}
          title="Select Mode"
        >
          {currentModeData?.icon || <BiGridAlt />}
        </button>
        {isMenuOpen && (
          <div className="mode-dropdown">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className={`mode-dropdown-item ${currentMode === mode.id ? 'active' : ''}`}
                title={mode.title}
              >
                {mode.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeSelector;