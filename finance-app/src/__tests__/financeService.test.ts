import { describe, it, expect } from 'vitest';
import { financeService } from '../services/financeService';

describe('Finance Service Layer', () => {
  it('retrieves quotes for default tracked companies', async () => {
    const { quotes } = await financeService.getQuotes(['IBM', 'MSFT', 'ORCL', 'SAP', 'CRM']);

    expect(quotes['IBM']).toBeDefined();
    expect(quotes['IBM'].symbol).toBe('IBM');
    expect(quotes['IBM'].currentPrice).toBeGreaterThan(0);
    expect(quotes['MSFT']).toBeDefined();
  });

  it('fetches historical series for 1D, 7D, and 1Q timeframes', async () => {
    const history1D = await financeService.getHistoricalData(['IBM'], '1D');
    expect(history1D['IBM']).toBeDefined();
    expect(history1D['IBM'].length).toBeGreaterThan(0);

    const history7D = await financeService.getHistoricalData(['IBM'], '7D');
    expect(history7D['IBM']).toBeDefined();
    expect(history7D['IBM'].length).toBe(7);

    const history1Q = await financeService.getHistoricalData(['IBM'], '1Q');
    expect(history1Q['IBM']).toBeDefined();
    expect(history1Q['IBM'].length).toBeGreaterThan(20);
  });

  it('validates user lookup of single ticker', async () => {
    const quote = await financeService.lookupTicker('GOOG');
    expect(quote).toBeDefined();
    expect(quote?.symbol).toBe('GOOG');
  });

  it('throws an error for invalid ticker symbol lookups', async () => {
    await expect(financeService.lookupTicker('INVALID$$$')).rejects.toThrow();
  });
});
