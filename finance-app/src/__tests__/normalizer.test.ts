import { describe, it, expect } from 'vitest';
import {
  isValidTickerSymbol,
  normalizeHistoricalSeries,
  computeSeriesStats,
  sanitizeQuote,
} from '../services/normalizer';
import { HistoricalPoint } from '../types/market';

describe('Data Normalizer & Utility Functions', () => {
  describe('isValidTickerSymbol', () => {
    it('accepts valid ticker symbols', () => {
      expect(isValidTickerSymbol('IBM')).toBe(true);
      expect(isValidTickerSymbol('msft')).toBe(true);
      expect(isValidTickerSymbol('BRK.B')).toBe(true);
      expect(isValidTickerSymbol('CRM')).toBe(true);
    });

    it('rejects invalid ticker symbols', () => {
      expect(isValidTickerSymbol('')).toBe(false);
      expect(isValidTickerSymbol('TOOLONGTICKER')).toBe(false);
      expect(isValidTickerSymbol('IBM$')).toBe(false);
      expect(isValidTickerSymbol('   ')).toBe(false);
    });
  });

  describe('normalizeHistoricalSeries', () => {
    it('indexes historical points relative to initial base price', () => {
      const mockSeries: HistoricalPoint[] = [
        { timestamp: 1000, date: 'Oct 1', close: 100 },
        { timestamp: 2000, date: 'Oct 2', close: 110 },
        { timestamp: 3000, date: 'Oct 3', close: 95 },
      ];

      const normalized = normalizeHistoricalSeries(mockSeries);
      expect(normalized).toHaveLength(3);
      expect(normalized[0].normalizedPercentChange).toBe(0);
      expect(normalized[1].normalizedPercentChange).toBe(10);
      expect(normalized[2].normalizedPercentChange).toBe(-5);
    });

    it('handles empty or invalid series safely', () => {
      expect(normalizeHistoricalSeries([])).toEqual([]);
    });
  });

  describe('computeSeriesStats', () => {
    it('accurately computes high, low, and total % delta', () => {
      const mockSeries: HistoricalPoint[] = [
        { timestamp: 1000, date: 'Oct 1', close: 100 },
        { timestamp: 2000, date: 'Oct 2', close: 150 },
        { timestamp: 3000, date: 'Oct 3', close: 80 },
        { timestamp: 4000, date: 'Oct 4', close: 120 },
      ];

      const stats = computeSeriesStats(mockSeries);
      expect(stats.high).toBe(150);
      expect(stats.low).toBe(80);
      expect(stats.startPrice).toBe(100);
      expect(stats.endPrice).toBe(120);
      expect(stats.totalChangePercent).toBe(20);
    });
  });

  describe('sanitizeQuote', () => {
    it('creates compliant quote structure with valid deltas', () => {
      const quote = sanitizeQuote({
        symbol: 'ibm',
        currentPrice: 200,
        previousClose: 190,
      });

      expect(quote.symbol).toBe('IBM');
      expect(quote.currentPrice).toBe(200);
      expect(quote.change).toBe(10);
      expect(quote.changePercent).toBeCloseTo(5.26, 1);
    });
  });
});
