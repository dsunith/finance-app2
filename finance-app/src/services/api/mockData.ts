import { HistoricalPoint, MarketQuote, TimeWindow } from '../../types/market';
import { TRACKED_COMPANIES } from '../../utils/constants';

// Realistic baseline prices
const BASE_PRICES: Record<string, { price: number; name: string; pe: number; mcap: number }> = {
  IBM: { price: 218.45, name: 'International Business Machines', pe: 22.4, mcap: 201_500_000_000 },
  MSFT: { price: 428.15, name: 'Microsoft Corp', pe: 36.1, mcap: 3_180_000_000_000 },
  ORCL: { price: 174.60, name: 'Oracle Corp', pe: 41.2, mcap: 482_000_000_000 },
  SAP: { price: 232.80, name: 'SAP SE', pe: 34.8, mcap: 270_000_000_000 },
  CRM: { price: 334.90, name: 'Salesforce Inc', pe: 48.5, mcap: 320_000_000_000 },
};

export function getMockQuotes(tickers: string[]): Record<string, MarketQuote> {
  const result: Record<string, MarketQuote> = {};
  const now = Date.now();

  tickers.forEach((symbol) => {
    const sym = symbol.toUpperCase();
    const base = BASE_PRICES[sym] || {
      price: 150.0 + (sym.charCodeAt(0) % 50),
      name: TRACKED_COMPANIES[sym]?.name || `${sym} Corporation`,
      pe: 25.0,
      mcap: 50_000_000_000,
    };

    // Realistic +/- 1.5% variation
    const delta = (Math.sin(sym.charCodeAt(0) + now / 100000) * 0.02) * base.price;
    const currentPrice = Number((base.price + delta).toFixed(2));
    const previousClose = Number(base.price.toFixed(2));
    const change = Number((currentPrice - previousClose).toFixed(2));
    const changePercent = Number(((change / previousClose) * 100).toFixed(2));

    result[sym] = {
      symbol: sym,
      name: base.name,
      currentPrice,
      change,
      changePercent,
      currency: 'USD',
      high: Number((Math.max(currentPrice, previousClose) + 1.25).toFixed(2)),
      low: Number((Math.min(currentPrice, previousClose) - 1.15).toFixed(2)),
      open: Number((previousClose - 0.25).toFixed(2)),
      previousClose,
      volume: 3_500_000 + (sym.charCodeAt(0) * 20000),
      marketCap: base.mcap,
      peRatio: base.pe,
      fiftyTwoWeekHigh: Number((base.price * 1.15).toFixed(2)),
      fiftyTwoWeekLow: Number((base.price * 0.82).toFixed(2)),
      timestamp: now,
    };
  });

  return result;
}

export function getMockHistoricalPoints(symbol: string, timeWindow: TimeWindow): HistoricalPoint[] {
  const sym = symbol.toUpperCase();
  const basePrice = BASE_PRICES[sym]?.price || (100 + (sym.charCodeAt(0) % 80));
  const now = new Date();
  const points: HistoricalPoint[] = [];

  let count = 24; // 1D (24 intraday points)
  let stepMinutes = 15;

  if (timeWindow === '7D') {
    count = 7;
    stepMinutes = 24 * 60;
  } else if (timeWindow === '1Q') {
    count = 65; // ~65 trading days in a quarter
    stepMinutes = 24 * 60;
  }

  // Seeded deterministic pseudorandom walk
  let currentVal = basePrice * 0.96;
  const seed = (sym.charCodeAt(0) * 13) % 100;

  for (let i = 0; i < count; i++) {
    const pointTime = new Date(now.getTime() - (count - 1 - i) * stepMinutes * 60 * 1000);
    const noise = Math.sin((i + seed) * 0.45) * 0.012 + (Math.cos((i * 2 + seed) * 0.3) * 0.008);
    currentVal = currentVal * (1 + noise);

    points.push({
      timestamp: pointTime.getTime(),
      date: timeWindow === '1D'
        ? pointTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : pointTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      close: Number(currentVal.toFixed(2)),
      open: Number((currentVal * 0.998).toFixed(2)),
      high: Number((currentVal * 1.004).toFixed(2)),
      low: Number((currentVal * 0.995).toFixed(2)),
      volume: Math.floor(100_000 + Math.abs(Math.sin(i)) * 500_000),
    });
  }

  return points;
}
