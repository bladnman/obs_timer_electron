import React, { useRef, useState } from "react";

interface UseSwipeNavigationReturn {
  isScrolling: boolean;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent, onSwitch: (direction: "next" | "prev") => void, showSettings: boolean) => void;
  handleTouchEnd: () => void;
}

export const useSwipeNavigation = (): UseSwipeNavigationReturn => {
  const touchStartY = useRef<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsScrolling(false);
  };

  const handleTouchMove = (
    e: React.TouchEvent,
    onSwitch: (direction: "next" | "prev") => void,
    showSettings: boolean
  ) => {
    if (touchStartY.current === null || showSettings || isScrolling) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    if (Math.abs(deltaY) > 80) {
      e.preventDefault();
      setIsScrolling(true);

      if (deltaY > 0) {
        onSwitch("prev");
      } else {
        onSwitch("next");
      }

      touchStartY.current = null;
      setTimeout(() => setIsScrolling(false), 400);
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
    setIsScrolling(false);
  };

  return {
    isScrolling,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};