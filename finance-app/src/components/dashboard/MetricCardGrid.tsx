import React from 'react';
import { HistoricalPoint, MarketQuote, TimeWindow } from '../../types/market';
import { MetricCard } from './MetricCard';

interface MetricCardGridProps {
  quotes: Record<string, MarketQuote>;
  historicalData?: Record<string, HistoricalPoint[]>;
  timeWindow?: TimeWindow;
  tickers: string[];
  isLoading: boolean;
  onRemoveTicker?: (symbol: string) => void;
}

export const MetricCardGrid: React.FC<MetricCardGridProps> = ({
  quotes,
  historicalData = {},
  timeWindow = '1D',
  tickers,
  isLoading,
  onRemoveTicker,
}) => {
  return (
    <div className="metric-cards-grid" data-testid="metric-cards-grid">
      {tickers.map((symbol) => {
        const quote = quotes[symbol];
        const historyPoints = historicalData[symbol];
        const isPrimary = symbol === 'IBM';
        const canRemove = !isPrimary && tickers.length > 2;

        return (
          <MetricCard
            key={symbol}
            quote={quote}
            historyPoints={historyPoints}
            timeWindow={timeWindow}
            isLoading={isLoading && !quote}
            isPrimary={isPrimary}
            canRemove={canRemove}
            onRemove={onRemoveTicker}
          />
        );
      })}
    </div>
  );
};
