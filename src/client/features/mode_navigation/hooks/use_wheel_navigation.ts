import React, { useRef, useState } from "react";

interface UseWheelNavigationReturn {
  isScrolling: boolean;
  handleWheel: (e: React.WheelEvent, onSwitch: (direction: "next" | "prev") => void, showSettings: boolean) => void;
}

export const useWheelNavigation = (): UseWheelNavigationReturn => {
  const [isScrolling, setIsScrolling] = useState(false);
  const lastScrollTime = useRef<number>(0);

  const handleWheel = (
    e: React.WheelEvent,
    onSwitch: (direction: "next" | "prev") => void,
    showSettings: boolean
  ) => {
    if (showSettings || isScrolling) return;

    const now = Date.now();
    if (now - lastScrollTime.current < 300) return;

    if (Math.abs(e.deltaY) > 50) {
      e.preventDefault();
      setIsScrolling(true);
      lastScrollTime.current = now;

      if (e.deltaY > 0) {
        onSwitch("next");
      } else {
        onSwitch("prev");
      }

      setTimeout(() => setIsScrolling(false), 400);
    }
  };

  return {
    isScrolling,
    handleWheel,
  };
};