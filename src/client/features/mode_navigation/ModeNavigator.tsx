import React, { useState } from "react";
import { AppMode } from "../../contexts/AppContext";
import { modeOrder } from "../../constants/modes";
import { useSwipeNavigation } from "./hooks/use_swipe_navigation";
import { useWheelNavigation } from "./hooks/use_wheel_navigation";

interface ModeNavigatorProps {
  currentMode: AppMode;
  showSettings: boolean;
  onModeChange: (mode: AppMode) => void;
  children: React.ReactNode;
}

const ModeNavigator: React.FC<ModeNavigatorProps> = ({
  currentMode,
  showSettings,
  onModeChange,
  children,
}) => {
  const [showModeTransition, setShowModeTransition] = useState(false);
  const modes: AppMode[] = modeOrder;
  
  const swipeNav = useSwipeNavigation();
  const wheelNav = useWheelNavigation();

  const switchMode = (direction: "next" | "prev") => {
    const currentIndex = modes.indexOf(currentMode);
    let newIndex: number;

    if (direction === "next") {
      newIndex = currentIndex === modes.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? modes.length - 1 : currentIndex - 1;
    }

    // Visual feedback
    setShowModeTransition(true);
    setTimeout(() => setShowModeTransition(false), 200);

    // Audio feedback
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCEOY4O/JdiMFl2+z9Zm8awEOb8OM4ZhQOh1Zl6JXElQgZnGaDFZGRGR8QxRJPHBFCF1sWNE0dHk1cHk/"
      );
      audio.volume = 0.1;
      audio.play().catch(() => {});
    } catch {
      if ("vibrate" in navigator) {
        navigator.vibrate(10);
      }
    }

    onModeChange(modes[newIndex]);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    swipeNav.handleTouchMove(e, switchMode, showSettings);
  };

  const handleWheel = (e: React.WheelEvent) => {
    wheelNav.handleWheel(e, switchMode, showSettings);
  };

  return (
    <div
      className={`mode-navigator ${showModeTransition ? "transitioning" : ""}`}
      onWheel={handleWheel}
      onTouchStart={swipeNav.handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={swipeNav.handleTouchEnd}
    >
      {children}
    </div>
  );
};

export default ModeNavigator;
