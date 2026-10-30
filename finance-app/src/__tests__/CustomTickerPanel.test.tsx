import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CustomTickerPanel } from '../components/dashboard/CustomTickerPanel';

describe('CustomTickerPanel Component', () => {
  it('renders input field and add button', () => {
    const handleAdd = vi.fn().mockResolvedValue(undefined);
    render(<CustomTickerPanel onAddTicker={handleAdd} activeTickers={['IBM']} />);

    expect(screen.getByPlaceholderText(/e\.g\. GOOG, NVDA, AAPL/i)).toBeInTheDocument();
    expect(screen.getByText('+ Add Ticker')).toBeInTheDocument();
  });

  it('validates duplicate active ticker and displays error message', async () => {
    const handleAdd = vi.fn().mockResolvedValue(undefined);
    render(<CustomTickerPanel onAddTicker={handleAdd} activeTickers={['IBM', 'GOOG']} />);

    const input = screen.getByPlaceholderText(/e\.g\. GOOG, NVDA, AAPL/i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'GOOG' } });
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/"GOOG" is already active on the dashboard\./i)).toBeInTheDocument();
    });
    expect(handleAdd).not.toHaveBeenCalled();
  });

  it('calls onAddTicker when valid symbol is submitted', async () => {
    const handleAdd = vi.fn().mockResolvedValue(undefined);
    render(<CustomTickerPanel onAddTicker={handleAdd} activeTickers={['IBM']} />);

    const input = screen.getByPlaceholderText(/e\.g\. GOOG, NVDA, AAPL/i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'NVDA' } });
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(handleAdd).toHaveBeenCalledWith('NVDA');
    });
  });
});
