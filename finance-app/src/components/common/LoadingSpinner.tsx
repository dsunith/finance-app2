import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading market data...',
  size = 'medium',
}) => {
  return (
    <div className={`spinner-container spinner-${size}`} role="status">
      <div className="spinner-circle" />
      {message && <p className="spinner-text">{message}</p>}
    </div>
  );
};
