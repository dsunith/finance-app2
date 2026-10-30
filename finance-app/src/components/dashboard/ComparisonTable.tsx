import React from 'react';
import { MarketQuote } from '../../types/market';
import { TRACKED_COMPANIES } from '../../utils/constants';
import { formatCurrency, formatLargeNumber, formatPercent } from '../../utils/formatters';

interface ComparisonTableProps {
  quotes: Record<string, MarketQuote>;
  tickers: string[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ quotes, tickers }) => {
  const quoteList = tickers
    .map((t) => quotes[t])
    .filter(Boolean)
    .sort((a, b) => b.changePercent - a.changePercent); // Sort by highest daily gain

  return (
    <div className="comparison-table-wrapper" data-testid="comparison-table">
      <div className="table-header-title">
        <h3>Competitive Benchmark Standings</h3>
        <span className="table-subtitle">Sorted by intraday percentage performance</span>
      </div>
      <div className="table-responsive">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Company</th>
              <th>Current Price</th>
              <th>Day Change ($)</th>
              <th>Day Change (%)</th>
              <th>Day Range</th>
              <th>Volume</th>
              <th>Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {quoteList.map((q, index) => {
              const isPositive = q.change >= 0;
              const company = TRACKED_COMPANIES[q.symbol];
              const isIBM = q.symbol === 'IBM';

              return (
                <tr key={q.symbol} className={isIBM ? 'row-ibm' : ''}>
                  <td className="col-rank">#{index + 1}</td>
                  <td className="col-company">
                    <span
                      className="ticker-dot"
                      style={{ backgroundColor: company?.color || '#0f62fe' }}
                    />
                    <strong>{q.symbol}</strong>
                    <span className="company-sub">{company?.name || q.name}</span>
                  </td>
                  <td className="col-price">{formatCurrency(q.currentPrice)}</td>
                  <td className={`col-change ${isPositive ? 'pos' : 'neg'}`}>
                    {isPositive ? '+' : ''}
                    {formatCurrency(q.change)}
                  </td>
                  <td className={`col-percent ${isPositive ? 'pos' : 'neg'}`}>
                    <span className="pill-badge">
                      {isPositive ? '▲' : '▼'} {formatPercent(q.changePercent)}
                    </span>
                  </td>
                  <td className="col-range">
                    {formatCurrency(q.low)} - {formatCurrency(q.high)}
                  </td>
                  <td className="col-volume">{formatLargeNumber(q.volume)}</td>
                  <td className="col-mcap">
                    {q.marketCap ? `$${formatLargeNumber(q.marketCap)}` : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
