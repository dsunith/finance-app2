import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ComparisonTable } from '../components/dashboard/ComparisonTable';
import { MarketQuote } from '../types/market';

describe('ComparisonTable Component', () => {
  const mockQuotes: Record<string, MarketQuote> = {
    IBM: {
      symbol: 'IBM',
      name: 'International Business Machines',
      currentPrice: 218.45,
      change: 3.25,
      changePercent: 1.51,
      currency: 'USD',
      high: 220.1,
      low: 216.5,
      open: 215.2,
      previousClose: 215.2,
      volume: 4500000,
      marketCap: 201500000000,
      timestamp: Date.now(),
    },
    MSFT: {
      symbol: 'MSFT',
      name: 'Microsoft Corp',
      currentPrice: 428.15,
      change: -2.1,
      changePercent: -0.49,
      currency: 'USD',
      high: 432.0,
      low: 426.0,
      open: 430.0,
      previousClose: 430.25,
      volume: 18000000,
      marketCap: 3180000000000,
      timestamp: Date.now(),
    },
  };

  it('renders table headers and company rows', () => {
    render(<ComparisonTable quotes={mockQuotes} tickers={['IBM', 'MSFT']} />);

    expect(screen.getByText('Competitive Benchmark Standings')).toBeInTheDocument();
    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Current Price')).toBeInTheDocument();
    expect(screen.getByText('IBM')).toBeInTheDocument();
    expect(screen.getByText('MSFT')).toBeInTheDocument();
    expect(screen.getByText('$218.45')).toBeInTheDocument();
    expect(screen.getByText('$428.15')).toBeInTheDocument();
  });

  it('sorts rows by highest daily gain percent descending', () => {
    render(<ComparisonTable quotes={mockQuotes} tickers={['MSFT', 'IBM']} />);

    const rows = screen.getAllByRole('row');
    // Header is row 0, IBM (+1.51%) should be row 1, MSFT (-0.49%) should be row 2
    expect(rows[1]).toHaveTextContent('IBM');
    expect(rows[2]).toHaveTextContent('MSFT');
  });
});
