import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('Finance Dashboard App Integration', () => {
  it('renders application shell, title, and initial tracked companies', async () => {
    render(<App />);

    expect(screen.getByText('Enterprise Market Analytics')).toBeInTheDocument();
    expect(screen.getByText('Current Day')).toBeInTheDocument();
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
    expect(screen.getByText('Last Quarter')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('metric-card-IBM')).toBeInTheDocument();
      expect(screen.getByTestId('metric-card-MSFT')).toBeInTheDocument();
      expect(screen.getByTestId('comparison-table')).toBeInTheDocument();
    });
  });

  it('allows user to dynamically add a custom company ticker and displays its metrics', async () => {
    render(<App />);

    const input = screen.getByPlaceholderText(/e\.g\. GOOG, NVDA, AAPL/i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'NVDA' } });
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId('metric-card-NVDA')).toBeInTheDocument();
      expect(screen.getAllByText('NVDA').length).toBeGreaterThan(0);
    });
  });
});
