import React from 'react';

interface HeaderProps {
  lastUpdated?: number;
  isOfflineMode?: boolean;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ lastUpdated, isOfflineMode, onRefresh }) => {
  return (
    <header className="header-container">
      <div className="header-brand">
        <div className="header-logo">
          <span className="logo-text">IBM</span>
        </div>
        <div className="header-titles">
          <h1>Enterprise Market Analytics</h1>
          <p className="subtitle">Real-time competitive tracking against key enterprise peers</p>
        </div>
      </div>

      <div className="header-actions">
        {isOfflineMode && (
          <span className="badge badge-warning" title="Operating with synthetic demo market data">
            ● Demo Mode
          </span>
        )}
        {lastUpdated && (
          <span className="last-updated">
            Updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
        {onRefresh && (
          <button className="btn-refresh" onClick={onRefresh} title="Refresh market data">
            ↻ Refresh
          </button>
        )}
      </div>
    </header>
  );
};
