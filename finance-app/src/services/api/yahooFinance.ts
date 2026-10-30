import { HistoricalPoint, MarketQuote, TimeWindow } from '../../types/market';
import { getMockHistoricalPoints, getMockQuotes } from './mockData';
import { normalizeHistoricalSeries, sanitizeQuote } from '../normalizer';

const PROXY_BASE_URL = 'http://127.0.0.1:5001';

/**
 * Yahoo Finance API service adapter.
 * Connects to the local lightweight Express proxy (127.0.0.1:5001) for live Yahoo Finance data,
 * with deterministic fallback to local mock fixtures for resilience in offline/test environments.
 */
class YahooFinanceService {
  private timeoutMs = 2500;

  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      return response;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  async fetchQuotes(tickers: string[]): Promise<{ quotes: Record<string, MarketQuote>; isOffline: boolean }> {
    if (!tickers || tickers.length === 0) {
      return { quotes: {}, isOffline: false };
    }

    try {
      const symbolsParam = encodeURIComponent(tickers.join(','));
      const res = await this.fetchWithTimeout(`${PROXY_BASE_URL}/api/quotes?symbols=${symbolsParam}`);
      if (!res.ok) throw new Error(`Proxy error: ${res.statusText}`);

      const data = await res.json();
      const rawQuotes = data.quotes || {};

      const sanitized: Record<string, MarketQuote> = {};
      tickers.forEach((sym) => {
        if (rawQuotes[sym]) {
          sanitized[sym] = sanitizeQuote(rawQuotes[sym]);
        }
      });

      // If proxy returned quotes for requested tickers, return live data
      if (Object.keys(sanitized).length > 0) {
        return { quotes: sanitized, isOffline: false };
      }

      // Otherwise fall back to mock
      return { quotes: getMockQuotes(tickers), isOffline: true };
    } catch {
      // Offline fallback
      return { quotes: getMockQuotes(tickers), isOffline: true };
    }
  }

  async fetchHistorical(symbol: string, timeWindow: TimeWindow): Promise<HistoricalPoint[]> {
    const sym = symbol.trim().toUpperCase();

    try {
      const res = await this.fetchWithTimeout(
        `${PROXY_BASE_URL}/api/history?symbol=${encodeURIComponent(sym)}&window=${timeWindow}`
      );
      if (!res.ok) throw new Error(`Proxy error: ${res.statusText}`);

      const data = await res.json();
      const points: HistoricalPoint[] = data.points || [];

      if (points.length > 0) {
        return normalizeHistoricalSeries(points);
      }

      const rawPoints = getMockHistoricalPoints(sym, timeWindow);
      return normalizeHistoricalSeries(rawPoints);
    } catch {
      const rawPoints = getMockHistoricalPoints(sym, timeWindow);
      return normalizeHistoricalSeries(rawPoints);
    }
  }

  async fetchHistoricalForMany(tickers: string[], timeWindow: TimeWindow): Promise<Record<string, HistoricalPoint[]>> {
    const results: Record<string, HistoricalPoint[]> = {};
    await Promise.all(
      tickers.map(async (ticker) => {
        results[ticker] = await this.fetchHistorical(ticker, timeWindow);
      })
    );
    return results;
  }
}

export const yahooFinanceService = new YahooFinanceService();
