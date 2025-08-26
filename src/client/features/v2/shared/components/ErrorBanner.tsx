import React from "react";

interface ErrorBannerProps {
  message: string;
  className?: string;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  className = "",
}) => {
  return (
    <div className={`v2-error-banner ${className}`}>
      <span className="v2-error-banner-text">{message}</span>
    </div>
  );
};

export default ErrorBanner;