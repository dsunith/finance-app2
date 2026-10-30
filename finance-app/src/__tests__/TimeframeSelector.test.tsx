import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TimeframeSelector } from '../components/dashboard/TimeframeSelector';

describe('TimeframeSelector Component', () => {
  it('renders all three timeframe options: 1D, 7D, and 1Q', () => {
    const handleChange = vi.fn();
    render(<TimeframeSelector selected="1D" onChange={handleChange} />);

    expect(screen.getByText('Current Day')).toBeInTheDocument();
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
    expect(screen.getByText('Last Quarter')).toBeInTheDocument();
  });

  it('calls onChange callback with selected window', () => {
    const handleChange = vi.fn();
    render(<TimeframeSelector selected="1D" onChange={handleChange} />);

    const btn7D = screen.getByText('Last 7 Days').closest('button');
    expect(btn7D).toBeInTheDocument();
    if (btn7D) fireEvent.click(btn7D);

    expect(handleChange).toHaveBeenCalledWith('7D');
  });
});
