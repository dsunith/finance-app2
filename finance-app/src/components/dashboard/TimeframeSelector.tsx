import React from 'react';
import { TimeWindow } from '../../types/market';
import { TIME_WINDOW_LABELS } from '../../utils/constants';

interface TimeframeSelectorProps {
  selected: TimeWindow;
  onChange: (timeWindow: TimeWindow) => void;
  disabled?: boolean;
}

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selected,
  onChange,
  disabled = false,
}) => {
  const windows: TimeWindow[] = ['1D', '7D', '1Q'];

  return (
    <div className="timeframe-selector" role="group" aria-label="Select market analysis timeframe">
      <div className="timeframe-buttons">
        {windows.map((w) => {
          const info = TIME_WINDOW_LABELS[w];
          const isActive = selected === w;
          return (
            <button
              key={w}
              type="button"
              className={`timeframe-btn ${isActive ? 'active' : ''}`}
              onClick={() => onChange(w)}
              disabled={disabled}
              aria-pressed={isActive}
            >
              <span className="btn-label">{info.label}</span>
              <span className="btn-sub">{w}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
