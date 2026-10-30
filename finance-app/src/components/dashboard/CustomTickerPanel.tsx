import React, { useState } from 'react';
import { isValidTickerSymbol } from '../../services/normalizer';

interface CustomTickerPanelProps {
  onAddTicker: (ticker: string) => Promise<void>;
  isLoading?: boolean;
  activeTickers: string[];
}

export const CustomTickerPanel: React.FC<CustomTickerPanelProps> = ({
  onAddTicker,
  isLoading = false,
  activeTickers,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSym = inputVal.trim().toUpperCase();

    if (!cleanSym) {
      setError('Please enter a stock ticker symbol (e.g. GOOG, NVDA, AAPL).');
      return;
    }

    if (!isValidTickerSymbol(cleanSym)) {
      setError('Invalid format. Tickers must be 1 to 6 alphanumeric characters.');
      return;
    }

    if (activeTickers.includes(cleanSym)) {
      setError(`"${cleanSym}" is already active on the dashboard.`);
      return;
    }

    setError(null);
    try {
      await onAddTicker(cleanSym);
      setInputVal('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add ticker.';
      setError(msg);
    }
  };

  return (
    <div className="custom-ticker-panel" data-testid="custom-ticker-panel">
      <div className="panel-info">
        <h4>Track Additional Competitor</h4>
        <p>Enter any public stock ticker to load its market quote and trend lines.</p>
      </div>

      <form className="ticker-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            className={`ticker-input ${error ? 'input-error' : ''}`}
            placeholder="e.g. GOOG, NVDA, AAPL"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            maxLength={6}
            disabled={isLoading}
            aria-label="Stock ticker symbol"
          />
          <button type="submit" className="btn-add-ticker" disabled={isLoading || !inputVal.trim()}>
            {isLoading ? 'Adding...' : '+ Add Ticker'}
          </button>
        </div>
        {error && <p className="form-error-msg">{error}</p>}
      </form>
    </div>
  );
};
