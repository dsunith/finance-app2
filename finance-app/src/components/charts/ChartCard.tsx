import React from 'react';
import { HistoricalPoint, TimeWindow } from '../../types/market';
import { TIME_WINDOW_LABELS } from '../../utils/constants';
import { MarketChart } from './MarketChart';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ChartCardProps {
  title: string;
  timeWindow: TimeWindow;
  data: Record<string, HistoricalPoint[]>;
  tickers: string[];
  isLoading: boolean;
  onTimeWindowChange?: (timeWindow: TimeWindow) => void;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  timeWindow,
  data,
  tickers,
  isLoading,
}) => {
  const windowMeta = TIME_WINDOW_LABELS[timeWindow];

  return (
    <div className="chart-card-container" data-testid="chart-card">
      <div className="chart-card-header">
        <div className="chart-title-group">
          <h3>{title}</h3>
          <p className="chart-subtitle">
            {windowMeta?.label} — {windowMeta?.description} (Normalized to % Δ from base)
          </p>
        </div>
      </div>

      <div className="chart-card-body">
        {isLoading ? (
          <div className="chart-loading-overlay">
            <LoadingSpinner message="Calculating normalized trend metrics..." />
          </div>
        ) : (
          <MarketChart data={data} tickers={tickers} timeWindow={timeWindow} />
        )}
      </div>
    </div>
  );
};
