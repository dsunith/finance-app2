import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricCard } from '../components/dashboard/MetricCard';
import { MarketQuote } from '../types/market';

describe('MetricCard Component', () => {
  const mockQuote: MarketQuote = {
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
    timestamp: Date.now(),
  };

  it('renders company symbol, name, and formatted price', () => {
    render(<MetricCard quote={mockQuote} isPrimary />);

    expect(screen.getByText('IBM')).toBeInTheDocument();
    expect(screen.getByText('International Business Machines')).toBeInTheDocument();
    expect(screen.getByText('$218.45')).toBeInTheDocument();
    expect(screen.getByText('Primary Track')).toBeInTheDocument();
  });

  it('renders positive delta indicators properly', () => {
    render(<MetricCard quote={mockQuote} />);
    expect(screen.getByText('▲')).toBeInTheDocument();
    expect(screen.getByText('$3.25')).toBeInTheDocument();
    expect(screen.getByText('(+1.51%)')).toBeInTheDocument();
  });

  it('renders skeleton lines in loading mode', () => {
    const { container } = render(<MetricCard isLoading={true} />);
    expect(container.querySelector('.skeleton')).toBeInTheDocument();
  });
});
