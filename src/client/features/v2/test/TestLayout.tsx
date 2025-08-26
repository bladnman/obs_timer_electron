import React from "react";
import AppLayout from "../layout/AppLayout";

const TestLayout: React.FC = () => {
  // Sample components for each region
  const iconComponent = (
    <div style={{ 
      width: "2em", 
      height: "2em", 
      background: "rgba(255,0,0,0.3)", 
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid red"
    }}>
      ICON
    </div>
  );
  
  const titleComponent = (
    <div style={{ 
      color: "#888", 
      fontSize: "0.8em",
      textTransform: "uppercase",
      letterSpacing: "0.1em"
    }}>
      Title Region
    </div>
  );
  
  const displayComponent = (
    <div style={{ 
      fontSize: "1.5em",
      color: "#00ff00",
      fontFamily: "monospace",
      border: "1px solid green",
      padding: "0.5em"
    }}>
      DISPLAY: 00:00:00
    </div>
  );
  
  const subDisplayComponent = (
    <div style={{ 
      color: "#666", 
      fontSize: "0.7em",
      border: "1px solid blue"
    }}>
      Sub-Display Content
    </div>
  );
  
  const actionComponent = (
    <div style={{ 
      width: "2em", 
      height: "2em", 
      background: "rgba(0,255,0,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid green"
    }}>
      ACT
    </div>
  );
  
  const settingsComponent = (
    <div style={{ color: "#666", fontSize: "0.8em" }}>⚙</div>
  );
  
  const extraInfoComponent = (
    <div style={{ color: "#888", fontSize: "0.7em" }}>Total: 00:00:00</div>
  );
  
  const clockComponent = (
    <div style={{ color: "#666", fontSize: "0.7em" }}>9:13 AM</div>
  );

  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      background: "#2a2a2a",
      position: "absolute",
      top: 0,
      left: 0
    }}>
      <AppLayout
        icon={iconComponent}
        title={titleComponent}
        display={displayComponent}
        subDisplay={subDisplayComponent}
        action={actionComponent}
        settings={settingsComponent}
        extraInfo={extraInfoComponent}
        clock={clockComponent}
      />
    </div>
  );
};

export default TestLayout;