import React, { useEffect, useRef, useState } from 'react';
import { ASPECT_RATIO, calculateHeight } from '../utils/dimensions';
import { ScalingProvider } from '../contexts/ScalingContext';
import '../AspectRatioContainer.css';

interface AspectRatioContainerProps {
  children: React.ReactNode;
}

/**
 * Container that enforces the application's aspect ratio
 * Only applies constraints when not running in Electron
 */
export function AspectRatioContainer({ children }: AspectRatioContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>(() => ({
    width: ASPECT_RATIO.DEFAULT_WIDTH,
    height: calculateHeight(ASPECT_RATIO.DEFAULT_WIDTH),
  }));
  
  useEffect(() => {
    // Check if we're in Electron (Electron handles its own window sizing)
    const isElectron = window.navigator.userAgent.toLowerCase().includes('electron');
    
    // Add class to body to indicate environment
    if (isElectron) {
      document.body.classList.add('electron-app');
    } else {
      document.body.classList.remove('electron-app');
    }
    
    if (isElectron) {
      return;
    }
    
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      const parent = containerRef.current.parentElement;
      if (!parent) return;
      
      const availableWidth = parent.clientWidth;
      const availableHeight = parent.clientHeight;
      
      // Calculate dimensions that fit within available space while maintaining aspect ratio
      const widthBasedHeight = calculateHeight(availableWidth);
      
      let finalWidth = availableWidth;
      let finalHeight = widthBasedHeight;
      
      // If calculated height exceeds available height, scale down based on height
      if (widthBasedHeight > availableHeight) {
        finalHeight = availableHeight;
        finalWidth = Math.round(availableHeight / ASPECT_RATIO.HEIGHT_RATIO);
      }
      
      // Apply minimum width constraint
      if (finalWidth < ASPECT_RATIO.MIN_WIDTH) {
        finalWidth = ASPECT_RATIO.MIN_WIDTH;
        finalHeight = calculateHeight(ASPECT_RATIO.MIN_WIDTH);
      }
      
      setDimensions({ width: finalWidth, height: finalHeight });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // In Electron, don't apply any constraints but still provide scaling
  const isElectron = window.navigator.userAgent.toLowerCase().includes('electron');
  if (isElectron) {
    return <ScalingProvider>{children}</ScalingProvider>;
  }
  
  return (
    <div
      ref={containerRef}
      className="aspect-ratio-container"
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}
    >
      <ScalingProvider>{children}</ScalingProvider>
    </div>
  );
}
