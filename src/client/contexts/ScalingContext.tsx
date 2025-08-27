import React, {createContext, useContext, useEffect, useMemo} from "react";
import {useWindowDimensions} from "../hooks/useWindowDimensions";

// Import from JS file instead of TS since this is what's used by the build
const ASPECT_RATIO = {
  HEIGHT_RATIO: 0.03,
  // HEIGHT_RATIO: 0.244,
  DEFAULT_WIDTH: 422,
  MIN_WIDTH: 170,
};

interface ScalingContextValue {
  baseFontSize: number;
  scaleFactor: number;
  windowWidth: number;
  windowHeight: number;
}

const ScalingContext = createContext<ScalingContextValue | undefined>(
  undefined
);

interface ScalingProviderProps {
  children: React.ReactNode;
}

export function ScalingProvider({children}: ScalingProviderProps) {
  const {width, height} = useWindowDimensions();

  const scalingValues = useMemo(() => {
    // Calculate base font size based on window dimensions
    // Using viewport-relative scaling
    const DEFAULT_WIDTH = ASPECT_RATIO.DEFAULT_WIDTH;

    // Calculate scale factor based on width (since we maintain aspect ratio)
    const scaleFactor = width / DEFAULT_WIDTH;

    // More aggressive scaling for proper responsiveness
    // At 422px (default) = 16px base, scale linearly from there
    const baseFontSize = 16 * scaleFactor;

    return {
      baseFontSize,
      scaleFactor,
      windowWidth: width,
      windowHeight: height,
    };
  }, [width, height]);

  // Apply base font size to root element for EM scaling
  useEffect(() => {
    const root = document.querySelector(".AppV2") as HTMLElement;
    if (root) {
      // Moderate linear scaling for viewport fit
      // Using percentage for pure relativistic sizing
      // Base: 87.5% (14px) at default width, scales linearly
      const basePercentage = 87.5; // 14px at 16px browser default
      const scalingPercentage = basePercentage * scalingValues.scaleFactor;
      root.style.fontSize = `${scalingPercentage}%`;
    }
  }, [scalingValues.scaleFactor]);

  return (
    <ScalingContext.Provider value={scalingValues}>
      {children}
    </ScalingContext.Provider>
  );
}

export function useScaling(): ScalingContextValue {
  const context = useContext(ScalingContext);
  if (!context) {
    throw new Error("useScaling must be used within a ScalingProvider");
  }
  return context;
}
