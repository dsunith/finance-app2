export type TimeWindow = '1D' | '7D' | '1Q';

export interface CompanyInfo {
  symbol: string;
  name: string;
  sector: string;
  color: string;
  isPrimary?: boolean;
}

export interface MarketQuote {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  currency: string;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  timestamp: number;
}

export interface HistoricalPoint {
  timestamp: number;
  date: string;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  normalizedPercentChange?: number; // Normalized % change relative to window start
}

export type HistoricalSeriesMap = Record<string, HistoricalPoint[]>;

export interface MarketDataState {
  timeWindow: TimeWindow;
  activeTickers: string[];
  quotes: Record<string, MarketQuote>;
  historicalData: Record<string, HistoricalSeriesMap>; // key: timeWindow -> { ticker -> points }
  isLoadingQuotes: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  isOfflineMode: boolean;
}
