import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { HistoricalPoint, MarketQuote, TimeWindow } from '../types/market';
import { DEFAULT_TICKERS } from '../utils/constants';
import { financeService } from '../services/financeService';

interface MarketDataContextValue {
  timeWindow: TimeWindow;
  setTimeWindow: (w: TimeWindow) => void;
  activeTickers: string[];
  quotes: Record<string, MarketQuote>;
  historicalData: Record<string, HistoricalPoint[]>;
  isLoadingQuotes: boolean;
  isLoadingHistory: boolean;
  isOfflineMode: boolean;
  error: string | null;
  lastUpdated: number;
  refreshAll: () => Promise<void>;
  addCustomTicker: (symbol: string) => Promise<void>;
  removeTicker: (symbol: string) => void;
  dismissError: () => void;
}

const MarketDataContext = createContext<MarketDataContextValue | undefined>(undefined);

export const MarketDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('1D');
  const [activeTickers, setActiveTickers] = useState<string[]>(DEFAULT_TICKERS);
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});
  const [historyCache, setHistoryCache] = useState<Record<string, Record<string, HistoricalPoint[]>>>({});
  const [isLoadingQuotes, setIsLoadingQuotes] = useState<boolean>(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // Fetch Quotes
  const fetchQuotes = useCallback(async (tickersToFetch: string[]) => {
    setIsLoadingQuotes(true);
    try {
      const { quotes: fetchedQuotes, isOffline } = await financeService.getQuotes(tickersToFetch);
      setQuotes((prev) => ({ ...prev, ...fetchedQuotes }));
      setIsOfflineMode(isOffline);
      setLastUpdated(Date.now());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve market quotes.';
      setError(msg);
    } finally {
      setIsLoadingQuotes(false);
    }
  }, []);

  // Fetch Historical Series for Current TimeWindow
  const fetchHistory = useCallback(async (tickersToFetch: string[], window: TimeWindow) => {
    setIsLoadingHistory(true);
    try {
      const historyMap = await financeService.getHistoricalData(tickersToFetch, window);
      setHistoryCache((prev) => ({
        ...prev,
        [window]: {
          ...(prev[window] || {}),
          ...historyMap,
        },
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load historical data.';
      setError(msg);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Initial and reactive load
  useEffect(() => {
    fetchQuotes(activeTickers);
  }, [fetchQuotes, activeTickers]);

  useEffect(() => {
    fetchHistory(activeTickers, timeWindow);
  }, [fetchHistory, activeTickers, timeWindow]);

  const refreshAll = useCallback(async () => {
    setError(null);
    await Promise.all([
      fetchQuotes(activeTickers),
      fetchHistory(activeTickers, timeWindow),
    ]);
  }, [fetchQuotes, fetchHistory, activeTickers, timeWindow]);

  const addCustomTicker = useCallback(async (symbol: string) => {
    const sym = symbol.toUpperCase();
    if (activeTickers.includes(sym)) return;

    setError(null);
    setIsLoadingQuotes(true);
    try {
      const newQuote = await financeService.lookupTicker(sym);
      if (!newQuote) {
        throw new Error(`Ticker "${sym}" could not be found.`);
      }

      const newHistory = await financeService.getHistoricalData([sym], timeWindow);

      setQuotes((prev) => ({ ...prev, [sym]: newQuote }));
      setHistoryCache((prev) => ({
        ...prev,
        [timeWindow]: {
          ...(prev[timeWindow] || {}),
          ...newHistory,
        },
      }));
      setActiveTickers((prev) => [...prev, sym]);
    } finally {
      setIsLoadingQuotes(false);
    }
  }, [activeTickers, timeWindow]);

  const removeTicker = useCallback((symbol: string) => {
    if (symbol === 'IBM') return; // Protect primary company
    setActiveTickers((prev) => prev.filter((t) => t !== symbol));
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const currentHistoryData = historyCache[timeWindow] || {};

  return (
    <MarketDataContext.Provider
      value={{
        timeWindow,
        setTimeWindow,
        activeTickers,
        quotes,
        historicalData: currentHistoryData,
        isLoadingQuotes,
        isLoadingHistory,
        isOfflineMode,
        error,
        lastUpdated,
        refreshAll,
        addCustomTicker,
        removeTicker,
        dismissError,
      }}
    >
      {children}
    </MarketDataContext.Provider>
  );
};

export const useMarketData = (): MarketDataContextValue => {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};
