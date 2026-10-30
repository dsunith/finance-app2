import React from 'react';
import { HistoricalPoint, MarketQuote, TimeWindow } from '../../types/market';
import { TRACKED_COMPANIES } from '../../utils/constants';
import { formatCurrency, formatLargeNumber, formatPercent } from '../../utils/formatters';
import { computeSeriesStats } from '../../services/normalizer';

interface MetricCardProps {
  quote?: MarketQuote;
  historyPoints?: HistoricalPoint[];
  timeWindow?: TimeWindow;
  isLoading?: boolean;
  isPrimary?: boolean;
  onRemove?: (symbol: string) => void;
  canRemove?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  quote,
  historyPoints,
  timeWindow = '1D',
  isLoading = false,
  isPrimary = false,
  onRemove,
  canRemove = false,
}) => {
  if (isLoading || !quote) {
    return (
      <div className={`metric-card skeleton ${isPrimary ? 'primary-card' : ''}`}>
        <div className="skeleton-line skeleton-header" />
        <div className="skeleton-line skeleton-price" />
        <div className="skeleton-line skeleton-stats" />
      </div>
    );
  }

  const companyInfo = TRACKED_COMPANIES[quote.symbol];
  const companyName = companyInfo?.name || quote.name || quote.symbol;

  // Window-specific metrics
  const stats = historyPoints && historyPoints.length > 0 ? computeSeriesStats(historyPoints) : null;
  const isWindowActive = timeWindow !== '1D' && stats !== null;

  const displayChangePercent = isWindowActive ? stats.totalChangePercent : quote.changePercent;
  const displayLow = isWindowActive ? stats.low : quote.low;
  const displayHigh = isWindowActive ? stats.high : quote.high;
  const isPositive = displayChangePercent >= 0;

  const windowLabel = timeWindow === '1D' ? 'Day' : timeWindow === '7D' ? '7-Day' : 'Quarter';

  return (
    <div
      className={`metric-card ${isPrimary ? 'primary-card' : ''}`}
      style={{ borderTopColor: companyInfo?.color || '#0f62fe' }}
      data-testid={`metric-card-${quote.symbol}`}
    >
      <div className="card-header">
        <div className="card-identity">
          <div className="ticker-badge" style={{ backgroundColor: companyInfo?.color || '#0f62fe' }}>
            {quote.symbol}
          </div>
          <div className="card-titles">
            <span className="card-name" title={companyName}>
              {companyName}
            </span>
            {isPrimary && <span className="primary-pill">Primary Track</span>}
          </div>
        </div>
        {canRemove && onRemove && (
          <button
            className="btn-remove-ticker"
            onClick={() => onRemove(quote.symbol)}
            title={`Remove ${quote.symbol}`}
            aria-label={`Remove ${quote.symbol}`}
          >
            ×
          </button>
        )}
      </div>

      <div className="card-price-row">
        <div className="current-price">{formatCurrency(quote.currentPrice)}</div>
        <div className={`price-delta ${isPositive ? 'positive' : 'negative'}`}>
          <span className="delta-arrow">{isPositive ? '▲' : '▼'}</span>
          {timeWindow === '1D' && (
            <span className="delta-amount">{formatCurrency(Math.abs(quote.change))}</span>
          )}
          <span className="delta-percent">({formatPercent(displayChangePercent)})</span>
        </div>
      </div>

      <div className="card-details-grid">
        <div className="detail-item">
          <span className="detail-label">{windowLabel} Range</span>
          <span className="detail-val">
            {formatCurrency(displayLow)} - {formatCurrency(displayHigh)}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Volume</span>
          <span className="detail-val">{formatLargeNumber(quote.volume)}</span>
        </div>
        {quote.peRatio && (
          <div className="detail-item">
            <span className="detail-label">P/E</span>
            <span className="detail-val">{quote.peRatio.toFixed(1)}</span>
          </div>
        )}
        {quote.marketCap && (
          <div className="detail-item">
            <span className="detail-label">Mkt Cap</span>
            <span className="detail-val">${formatLargeNumber(quote.marketCap)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
