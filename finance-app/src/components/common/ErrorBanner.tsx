import React from 'react';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss, onRetry }) => {
  if (!message) return null;

  return (
    <div className="error-banner" role="alert">
      <div className="error-banner-content">
        <span className="error-icon">⚠️</span>
        <span className="error-message">{message}</span>
      </div>
      <div className="error-banner-actions">
        {onRetry && (
          <button className="btn-error-retry" onClick={onRetry}>
            Try Again
          </button>
        )}
        {onDismiss && (
          <button className="btn-error-dismiss" onClick={onDismiss} aria-label="Dismiss error">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
