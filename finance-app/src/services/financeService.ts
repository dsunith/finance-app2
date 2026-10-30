import { HistoricalPoint, MarketQuote, TimeWindow } from '../types/market';
import { yahooFinanceService } from './api/yahooFinance';
import { isValidTickerSymbol } from './normalizer';

/**
 * High-level market data facade used by React hooks and components.
 */
export const financeService = {
  /**
   * Retrieves quotes for a list of company ticker symbols.
   */
  async getQuotes(tickers: string[]): Promise<{ quotes: Record<string, MarketQuote>; isOffline: boolean }> {
    const validTickers = tickers.map((t) => t.trim().toUpperCase()).filter(isValidTickerSymbol);
    return yahooFinanceService.fetchQuotes(validTickers);
  },

  /**
   * Retrieves normalized historical data for multiple tickers across a specified time window.
   */
  async getHistoricalData(tickers: string[], timeWindow: TimeWindow): Promise<Record<string, HistoricalPoint[]>> {
    const validTickers = tickers.map((t) => t.trim().toUpperCase()).filter(isValidTickerSymbol);
    return yahooFinanceService.fetchHistoricalForMany(validTickers, timeWindow);
  },

  /**
   * Verifies and fetches single quote data when a user adds a custom ticker.
   */
  async lookupTicker(ticker: string): Promise<MarketQuote | null> {
    const sym = ticker.trim().toUpperCase();
    if (!isValidTickerSymbol(sym)) {
      throw new Error(`Invalid ticker symbol format: "${ticker}". Tickers must be 1-6 alphanumeric characters.`);
    }

    const { quotes } = await yahooFinanceService.fetchQuotes([sym]);
    return quotes[sym] || null;
  },
};
