import React from "react";

interface TwoPanelLayoutProps {
  body: React.ReactNode;
  statusBar: React.ReactNode;
  className?: string;
}

const TwoPanelLayout: React.FC<TwoPanelLayoutProps> = ({
  body,
  statusBar,
  className = "",
}) => {
  return (
    <div className={`two-panel-layout ${className}`}>
      <div className="panel-body">{body}</div>
      <div className="panel-status-bar">{statusBar}</div>
    </div>
  );
};

export default TwoPanelLayout;