import React from "react";
import "./AppLayout.css";

interface AppLayoutProps {
  // Optional regions - components passed as props
  icon?: React.ReactNode;
  title?: React.ReactNode;
  display: React.ReactNode;
  subDisplay?: React.ReactNode;
  action?: React.ReactNode;
  
  // Status bar components - always present
  settings: React.ReactNode;
  extraInfo?: React.ReactNode;
  clock: React.ReactNode;
  
  // Optional className for additional styling
  className?: string;
  
  // Optional content override - replaces entire content area
  contentOverride?: React.ReactNode;
  
  // Optional body overlay - renders on top of body content
  bodyOverlay?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  icon,
  title,
  display,
  subDisplay,
  action,
  settings,
  extraInfo,
  clock,
  className = "",
  contentOverride,
  bodyOverlay,
}) => {
  return (
    <div className={`app-layout-window ${className}`}>
      <div className="app-layout-body">
        {/* Always render icon rail for proper spacing */}
        <div className="app-layout-icon">
          {icon}
        </div>
        
        <div className="app-layout-content">
          {contentOverride ? (
            // If contentOverride is provided, use it instead of normal structure
            contentOverride
          ) : (
            // Normal structure with title, display, sub-display
            <>
              <div className={`app-layout-title ${!title ? 'app-layout-title-empty' : ''}`}>
                {title}
              </div>
              
              <div className="app-layout-display">
                {display}
              </div>
              
              <div className={`app-layout-sub-display ${!subDisplay ? 'app-layout-sub-display-empty' : ''}`}>
                {subDisplay}
              </div>
            </>
          )}
        </div>
        
        {/* Always render action rail for proper spacing */}
        <div className="app-layout-action">
          {action}
        </div>
        
        {/* Body overlay - renders on top of everything in body */}
        {bodyOverlay && (
          <div className="app-layout-body-overlay">
            {bodyOverlay}
          </div>
        )}
      </div>
      
      <div className="app-layout-status-bar">
        <div className="app-layout-settings">
          {settings}
        </div>
        
        {extraInfo && (
          <div className="app-layout-extra-info">
            {extraInfo}
          </div>
        )}
        
        <div className="app-layout-clock">
          {clock}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;