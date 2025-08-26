import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { useWindowDimensions } from '../hooks/useWindowDimensions';

// Import from JS file instead of TS since this is what's used by the build
const ASPECT_RATIO = {
  HEIGHT_RATIO: 0.244,
  DEFAULT_WIDTH: 422,
  MIN_WIDTH: 211,
};

interface ScalingContextValue {
  baseFontSize: number;
  scaleFactor: number;
  windowWidth: number;
  windowHeight: number;
}

const ScalingContext = createContext<ScalingContextValue | undefined>(undefined);

interface ScalingProviderProps {
  children: React.ReactNode;
}

export function ScalingProvider({ children }: ScalingProviderProps) {
  const { width, height } = useWindowDimensions();
  
  const scalingValues = useMemo(() => {
    // Calculate base font size based on window dimensions
    // Using the default dimensions (422x103) as our baseline where font-size = 16px
    const DEFAULT_WIDTH = ASPECT_RATIO.DEFAULT_WIDTH;
    const DEFAULT_FONT_SIZE = 16; // Base font size at default dimensions
    
    // Calculate scale factor based on width (since we maintain aspect ratio)
    const scaleFactor = width / DEFAULT_WIDTH;
    
    // Calculate base font size that will make all em units scale proportionally
    // We use width-based scaling since the aspect ratio is maintained
    const baseFontSize = DEFAULT_FONT_SIZE * scaleFactor;
    
    return {
      baseFontSize,
      scaleFactor,
      windowWidth: width,
      windowHeight: height,
    };
  }, [width, height]);
  
  // Apply base font size to root element for EM scaling
  useEffect(() => {
    const root = document.querySelector('.AppV2') as HTMLElement;
    if (root) {
      root.style.fontSize = `${scalingValues.baseFontSize}px`;
    }
  }, [scalingValues.baseFontSize]);
  
  return (
    <ScalingContext.Provider value={scalingValues}>
      {children}
    </ScalingContext.Provider>
  );
}

export function useScaling(): ScalingContextValue {
  const context = useContext(ScalingContext);
  if (!context) {
    throw new Error('useScaling must be used within a ScalingProvider');
  }
  return context;
}