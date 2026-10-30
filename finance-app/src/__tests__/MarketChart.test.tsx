import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MarketChart } from '../components/charts/MarketChart';
import { HistoricalPoint } from '../types/market';

describe('MarketChart Component', () => {
  const mockSeries: HistoricalPoint[] = [
    { timestamp: 1000, date: '10:00 AM', close: 200, normalizedPercentChange: 0 },
    { timestamp: 2000, date: '11:00 AM', close: 204, normalizedPercentChange: 2.0 },
    { timestamp: 3000, date: '12:00 PM', close: 202, normalizedPercentChange: 1.0 },
  ];

  it('renders SVG chart with multi-series data and legend', () => {
    const mockData = {
      IBM: mockSeries,
      MSFT: mockSeries.map((p) => ({ ...p, close: p.close * 2, normalizedPercentChange: 0.5 })),
    };

    render(
      <MarketChart
        data={mockData}
        tickers={['IBM', 'MSFT']}
        timeWindow="1D"
      />
    );

    expect(screen.getByTestId('market-chart')).toBeInTheDocument();
    expect(screen.getByText('IBM')).toBeInTheDocument();
    expect(screen.getByText('MSFT')).toBeInTheDocument();
  });

  it('renders empty fallback when data is unavailable', () => {
    render(
      <MarketChart
        data={{}}
        tickers={['IBM']}
        timeWindow="1D"
      />
    );

    expect(screen.getByText(/No historical data available/i)).toBeInTheDocument();
  });
});
