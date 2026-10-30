import { HistoricalPoint, MarketQuote } from '../types/market';

/**
 * Validates whether a ticker symbol format is acceptable.
 */
export function isValidTickerSymbol(symbol: string): boolean {
  if (!symbol || typeof symbol !== 'string') return false;
  const trimmed = symbol.trim().toUpperCase();
  return /^[A-Z0-9.-]{1,6}$/.test(trimmed);
}

/**
 * Normalizes an array of historical data points by indexing all close prices
 * relative to the initial price in the window (t=0 -> 0.00%).
 */
export function normalizeHistoricalSeries(points: HistoricalPoint[]): HistoricalPoint[] {
  if (!points || points.length === 0) return [];

  // Filter out invalid or zero close points
  const validPoints = points.filter((p) => p && typeof p.close === 'number' && !isNaN(p.close) && p.close > 0);
  if (validPoints.length === 0) return [];

  const basePrice = validPoints[0].close;

  return validPoints.map((point) => {
    const pctChange = ((point.close - basePrice) / basePrice) * 100;
    return {
      ...point,
      normalizedPercentChange: Number(pctChange.toFixed(2)),
    };
  });
}

/**
 * Computes summary statistics (high, low, total % change) for a series.
 */
export function computeSeriesStats(points: HistoricalPoint[]) {
  if (!points || points.length === 0) {
    return { high: 0, low: 0, startPrice: 0, endPrice: 0, totalChangePercent: 0 };
  }

  const prices = points.map((p) => p.close).filter((c) => !isNaN(c) && c > 0);
  if (prices.length === 0) {
    return { high: 0, low: 0, startPrice: 0, endPrice: 0, totalChangePercent: 0 };
  }

  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const totalChangePercent = ((endPrice - startPrice) / startPrice) * 100;

  return {
    high,
    low,
    startPrice,
    endPrice,
    totalChangePercent: Number(totalChangePercent.toFixed(2)),
  };
}

/**
 * Cleanly formats raw quote objects into normalized MarketQuote domain models.
 */
export function sanitizeQuote(raw: Partial<MarketQuote>, defaultName?: string): MarketQuote {
  const symbol = (raw.symbol || 'UNKNOWN').toUpperCase();
  const currentPrice = typeof raw.currentPrice === 'number' && !isNaN(raw.currentPrice) ? raw.currentPrice : 0;
  const previousClose = typeof raw.previousClose === 'number' && !isNaN(raw.previousClose) ? raw.previousClose : currentPrice;
  const change = typeof raw.change === 'number' && !isNaN(raw.change) ? raw.change : currentPrice - previousClose;
  const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

  return {
    symbol,
    name: raw.name || defaultName || symbol,
    currentPrice: Number(currentPrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    currency: raw.currency || 'USD',
    high: typeof raw.high === 'number' ? raw.high : currentPrice,
    low: typeof raw.low === 'number' ? raw.low : currentPrice,
    open: typeof raw.open === 'number' ? raw.open : previousClose,
    previousClose: Number(previousClose.toFixed(2)),
    volume: typeof raw.volume === 'number' ? raw.volume : 0,
    marketCap: raw.marketCap,
    peRatio: raw.peRatio,
    fiftyTwoWeekHigh: raw.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: raw.fiftyTwoWeekLow,
    timestamp: raw.timestamp || Date.now(),
  };
}
