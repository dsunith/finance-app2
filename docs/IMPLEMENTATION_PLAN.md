# Finance Analytics Lab — Architecture & Implementation Plan

This document outlines the architecture, component hierarchy, data abstractions, testing strategy, and GitHub SDLC alignment for the React-based Finance Analytics Lab.

---

## 1. Executive Summary & Lab Scope

The application is a modular React-based financial market dashboard designed to demonstrate AI-assisted development and GitHub-driven feature lifecycle management with IBM Bob.

### Core Requirements
- **Tracked Assets**: Primary focus on **IBM** (`IBM`) alongside up to four enterprise peers:
  - Microsoft (`MSFT`)
  - Oracle (`ORCL`)
  - SAP (`SAP`)
  - Salesforce (`CRM`)
- **Time-Window Perspectives**:
  1. **Current Day (`1D`)**: Real-time quote snapshot, daily net change ($ / %), volume, and intraday trajectory.
  2. **Last 7 Days (`7D`)**: Short-term performance comparison normalized to percentage change ($% \Delta$).
  3. **Last Quarter (`1Q` / ~90 days)**: Medium-term trend analysis, 90-day moving ranges, and quarterly high/low metrics.
- **SDLC & GitHub Integration**: Structured to support autonomous issue resolution, automated test suites in CI, and pull request reviews.

---

## 2. System Architecture

```mermaid
graph TD
    subgraph UI Layer [React Presentation Layer]
        App[App Shell & Header]
        TimeSelector[Time Window Selector: 1D | 7D | 1Q]
        SummaryGrid[Metric Summary Cards Grid]
        ChartPanel[Market Chart Panel: Recharts / Multi-Series]
        CustomSearch[Custom Ticker Drawer / Search]
        ErrorBound[ErrorBoundary & Fallback Banner]
    end

    subgraph State Layer [React Context & Custom Hooks]
        MarketCtx[MarketDataContext]
        useMarket[useMarketData Hook]
        useHist[useHistoricalData Hook]
        useCustom[useCustomTicker Hook]
    end

    subgraph Service Layer [Data Abstraction & Normalization]
        DataService[Market Data Service Interface]
        YahooAdapter[Yahoo Finance API Client / Proxy]
        MockAdapter[Fallback / Offline Mock Fixture Provider]
        Normalizer[Data Normalization & Calculation Engine]
    end

    App --> MarketCtx
    MarketCtx --> useMarket
    MarketCtx --> useHist
    MarketCtx --> useCustom
    useMarket --> DataService
    useHist --> DataService
    useCustom --> DataService
    DataService --> YahooAdapter
    DataService --> MockAdapter
    YahooAdapter --> Normalizer
    MockAdapter --> Normalizer
```

---

## 3. Source Folder Structure (`finance-app/`)

```text
finance-app/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── public/
│   └── favicon.ico
└── src/
    ├── __tests__/
    │   ├── components/
    │   │   ├── MetricCard.test.tsx
    │   │   ├── TimeframeSelector.test.tsx
    │   │   └── MarketChart.test.tsx
    │   ├── services/
    │   │   ├── dataNormalizer.test.ts
    │   │   └── financeService.test.ts
    │   └── hooks/
    │       └── useMarketData.test.tsx
    ├── types/
    │   ├── market.ts          # Quote, HistoricalPoint, TimeWindow, TickerInfo
    │   └── api.ts             # Raw Yahoo response schemas & error shapes
    ├── services/
    │   ├── api/
    │   │   ├── yahooFinance.ts# Yahoo Finance fetcher / proxy client
    │   │   └── mockData.ts    # Deterministic fallback data for offline/test mode
    │   ├── normalizer.ts      # Math, % changes, date alignment & cleanup
    │   └── financeService.ts  # Unified facade (getQuotes, getHistory, searchTicker)
    ├── context/
    │   └── MarketDataContext.tsx # Global state: active timeframe, tracked tickers, cache
    ├── hooks/
    │   ├── useMarketData.ts   # Retrieves current quotes & triggers polling
    │   ├── useHistoricalData.ts # Fetches historical series for 1D/7D/1Q
    │   └── useCustomTicker.ts # Handles adding user-selected tickers (Part 2 ready)
    ├── components/
    │   ├── common/
    │   │   ├── Header.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   ├── ErrorBanner.tsx
    │   │   └── ErrorBoundary.tsx
    │   ├── dashboard/
    │   │   ├── TimeframeSelector.tsx
    │   │   ├── MetricCardGrid.tsx
    │   │   ├── MetricCard.tsx
    │   │   ├── ComparisonTable.tsx
    │   │   └── CustomTickerPanel.tsx
    │   └── charts/
    │       ├── MarketChartContainer.tsx
    │       ├── IntradayChart.tsx
    │       ├── MultiLineHistoryChart.tsx
    │       └── ChartTooltip.tsx
    ├── utils/
    │   ├── formatters.ts      # Currency, percentage, timestamp helpers
    │   └── constants.ts       # Tracked tickers: ['IBM', 'MSFT', 'ORCL', 'SAP', 'CRM']
    ├── App.tsx
    ├── main.tsx
    └── index.css
```

---

## 4. Component Boundaries & Responsibilities

| Component | Responsibility | Props / Inputs |
| :--- | :--- | :--- |
| `App.tsx` | Root shell and provider boundary wrapping dashboard views. | None |
| `ErrorBoundary.tsx` | Prevents rendering crashes in chart/data subtrees from breaking the app. | `fallback?: ReactNode`, `children` |
| `TimeframeSelector.tsx` | Interactive selector for switching between `1D`, `7D`, and `1Q`. | `selected: TimeWindow`, `onChange: (w: TimeWindow) => void` |
| `MetricCardGrid.tsx` | Responsive grid organizing metric summary cards for all active companies. | `quotes: MarketQuote[]`, `isLoading: boolean` |
| `MetricCard.tsx` | Individual card rendering price, daily delta ($ and %), high/low, and volume. | `quote: MarketQuote`, `isPrimary?: boolean` |
| `MarketChartContainer.tsx` | Multi-series chart container rendering time-series comparison data. | `timeWindow: TimeWindow`, `historyData: Record<string, HistoricalPoint[]>`, `tickers: string[]` |
| `CustomTickerPanel.tsx` | Input interface and chip list for dynamically adding user-selected tickers. | `onAddTicker: (sym: string) => Promise<void>`, `activeTickers: string[]` |

---

## 5. Data Service Abstractions & Resilience

### Domain Types
```typescript
export type TimeWindow = '1D' | '7D' | '1Q';

export interface MarketQuote {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  currency: string;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
}

export interface HistoricalPoint {
  timestamp: number;
  date: string;
  close: number;
  normalizedPercentChange?: number; // (% change relative to start of window)
  volume: number;
}
```

### Data Layer Principles
1. **Adapter Pattern**: The UI interacts exclusively with `financeService.ts`, never directly calling raw HTTP or third-party SDKs.
2. **Offline / Fallback Resilience**: If network requests to Yahoo Finance fail (CORS, rate limiting, or offline development), the service automatically falls back to deterministic fixtures in `mockData.ts` and sets an indicator banner.
3. **Data Normalization**: Historical prices are baseline-indexed ($% \Delta = \frac{Price_t - Price_0}{Price_0} \times 100$) so companies with disparate share prices ($150 vs $400) can be meaningfully compared on a single multi-series chart.

---

## 6. Charting & Visualization Strategy

- **Charting Engine**: `Recharts` (composable React SVG charts) or `@carbon/charts-react`.
- **View Specifications**:
  - **1D (Current Day)**: Intraday step/line chart with current day high/low reference markers and volume bar overlay.
  - **7D (Last 7 Days)**: Multi-series percentage trend line comparing relative performance across all tracked companies.
  - **1Q (Last Quarter / 90 Days)**: Smooth multi-line or area chart illustrating medium-term performance and volatility bands.

---

## 7. State Management & Error Handling

- **React Context (`MarketDataContext`)**: Manages active timeframe (`1D` | `7D` | `1Q`), list of tracked tickers, cached historical responses, and loading/error states.
- **Custom Hooks**:
  - `useMarketData`: Handles polling and quote updates.
  - `useHistoricalData`: Fetches and caches historical time series per timeframe.
  - `useCustomTicker`: Validates and appends user-selected tickers.
- **Error Handling**:
  - Client-side ticker validation (1–5 uppercase alphanumeric characters).
  - Graceful per-ticker failure (a single bad ticker does not block remaining quotes).
  - Non-blocking warning banners for offline/demo modes.

---

## 8. Test Strategy & Local Validation

### Automated Test Matrix
1. **Unit Tests**:
   - `dataNormalizer.test.ts`: Verify math formulas for percentage change, baseline indexing, and missing data interpolation.
   - `tickerValidator.test.ts`: Test ticker sanitization and validation logic.
2. **Component Tests**:
   - `MetricCard.test.tsx`: Verify positive/negative delta styling, currency formatting, and loading skeletons.
   - `TimeframeSelector.test.tsx`: Verify tab selection callbacks.
3. **Integration Tests**:
   - `MarketChart.test.tsx`: Test rendering of multi-series data with mocked fixtures.

### Validation Commands
Aligned with [`.github/workflows/finance-app-ci.yml`](../.github/workflows/finance-app-ci.yml):

```bash
# Navigate to application directory
cd finance-app

# 1. Install dependencies
npm install

# 2. Run static analysis / linting
npm run lint

# 3. Run test suite
npm test -- --runInBand

# 4. Validate production bundle build
npm run build
```

---

## 9. GitHub-Driven SDLC Evolution Support

The project is structured to directly support the autonomous feature workflows detailed in `WORKSHOP-part2-GITHUB-AUTOMATION.md`:

1. **Feature Request Alignment**: When an issue (e.g., *"Add a graph for a user-selected company"*) is opened, changes are isolated to `CustomTickerPanel` and `useCustomTicker` without refactoring core chart containers.
2. **Pull Request Automation**: Standardized PR documentation following `.github/PULL_REQUEST_TEMPLATE.md`.
3. **CI Pipeline Integration**: Automated validation on push/PR via `.github/workflows/finance-app-ci.yml` verifying linting, test passing, and clean build artifact generation.
