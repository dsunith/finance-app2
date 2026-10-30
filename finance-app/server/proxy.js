import express from 'express';
import YahooFinance from 'yahoo-finance2';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;
const HOST = '127.0.0.1'; // Compliant with IBM security rule: bind only to localhost

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// Middleware for CORS (localhost dev client)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Helper for validating ticker strings
function isValidSymbol(symbol) {
  return typeof symbol === 'string' && /^[A-Z0-9.-]{1,6}$/.test(symbol.trim().toUpperCase());
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'yahoo-finance-proxy', timestamp: Date.now() });
});

// Bulk quotes endpoint
app.get('/api/quotes', async (req, res) => {
  try {
    const rawSymbols = req.query.symbols || '';
    const symbols = rawSymbols
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(isValidSymbol);

    if (symbols.length === 0) {
      return res.status(400).json({ error: 'No valid symbols provided' });
    }

    const quotesMap = {};
    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const q = await yf.quote(symbol);
          if (q) {
            const currentPrice = q.regularMarketPrice || q.currentPrice || 0;
            const previousClose = q.regularMarketPreviousClose || currentPrice;
            const change = q.regularMarketChange || (currentPrice - previousClose);
            const changePercent = q.regularMarketChangePercent || (previousClose > 0 ? (change / previousClose) * 100 : 0);

            quotesMap[symbol] = {
              symbol,
              name: q.shortName || q.longName || symbol,
              currentPrice: Number(currentPrice.toFixed(2)),
              change: Number(change.toFixed(2)),
              changePercent: Number(changePercent.toFixed(2)),
              currency: q.currency || 'USD',
              high: Number((q.regularMarketDayHigh || currentPrice).toFixed(2)),
              low: Number((q.regularMarketDayLow || currentPrice).toFixed(2)),
              open: Number((q.regularMarketOpen || previousClose).toFixed(2)),
              previousClose: Number(previousClose.toFixed(2)),
              volume: q.regularMarketVolume || 0,
              marketCap: q.marketCap,
              peRatio: q.trailingPE,
              fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
              fiftyTwoWeekLow: q.fiftyTwoWeekLow,
              timestamp: Date.now(),
            };
          }
        } catch (err) {
          console.warn(`Failed to fetch quote for ${symbol}:`, err.message);
        }
      })
    );

    res.json({ quotes: quotesMap });
  } catch (error) {
    console.error('Error fetching quotes from Yahoo Finance:', error);
    res.status(500).json({ error: 'Failed to retrieve market quotes' });
  }
});

// Historical series endpoint
app.get('/api/history', async (req, res) => {
  try {
    const symbol = (req.query.symbol || '').trim().toUpperCase();
    const window = (req.query.window || '1D').trim().toUpperCase();

    if (!isValidSymbol(symbol)) {
      return res.status(400).json({ error: 'Invalid or missing symbol parameter' });
    }

    const now = new Date();
    let queryOptions = { interval: '15m' };

    if (window === '1D') {
      // Intraday
      const startOfDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      queryOptions = { period1: startOfDay, interval: '15m' };
    } else if (window === '7D') {
      const start7D = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
      queryOptions = { period1: start7D, interval: '1d' };
    } else if (window === '1Q') {
      const start1Q = new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000);
      queryOptions = { period1: start1Q, interval: '1d' };
    }

    const chartResult = await yf.chart(symbol, queryOptions);
    const quotes = chartResult?.quotes || [];

    const points = quotes
      .filter((q) => q && typeof q.close === 'number' && !isNaN(q.close))
      .map((q) => {
        const d = new Date(q.date);
        return {
          timestamp: d.getTime(),
          date: window === '1D'
            ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          close: Number(q.close.toFixed(2)),
          open: typeof q.open === 'number' ? Number(q.open.toFixed(2)) : undefined,
          high: typeof q.high === 'number' ? Number(q.high.toFixed(2)) : undefined,
          low: typeof q.low === 'number' ? Number(q.low.toFixed(2)) : undefined,
          volume: q.volume || 0,
        };
      });

    res.json({ symbol, window, points });
  } catch (error) {
    console.error('Error fetching historical chart from Yahoo Finance:', error);
    res.status(500).json({ error: 'Failed to retrieve historical market series' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`[Yahoo Finance Proxy] Running at http://${HOST}:${PORT}`);
});
