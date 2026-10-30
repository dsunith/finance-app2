import React from 'react';
import { MarketDataProvider, useMarketData } from './context/MarketDataContext';
import { Header } from './components/common/Header';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ErrorBanner } from './components/common/ErrorBanner';
import { TimeframeSelector } from './components/dashboard/TimeframeSelector';
import { MetricCardGrid } from './components/dashboard/MetricCardGrid';
import { ChartCard } from './components/charts/ChartCard';
import { ComparisonTable } from './components/dashboard/ComparisonTable';
import { CustomTickerPanel } from './components/dashboard/CustomTickerPanel';

const DashboardContent: React.FC = () => {
  const {
    timeWindow,
    setTimeWindow,
    activeTickers,
    quotes,
    historicalData,
    isLoadingQuotes,
    isLoadingHistory,
    isOfflineMode,
    error,
    lastUpdated,
    refreshAll,
    addCustomTicker,
    removeTicker,
    dismissError,
  } = useMarketData();

  return (
    <div className="app-layout">
      <Header
        lastUpdated={lastUpdated}
        isOfflineMode={isOfflineMode}
        onRefresh={refreshAll}
      />

      <main className="dashboard-container">
        {error && (
          <ErrorBanner
            message={error}
            onDismiss={dismissError}
            onRetry={refreshAll}
          />
        )}

        {/* Top Controls: Time Window Segmented Bar */}
        <section className="section-controls">
          <div className="section-heading">
            <h2>Market Perspectives</h2>
            <p>Select time interval to compare IBM against enterprise technology peers</p>
          </div>
          <TimeframeSelector
            selected={timeWindow}
            onChange={setTimeWindow}
            disabled={isLoadingHistory}
          />
        </section>

        {/* Summary Metric Cards */}
        <section className="section-cards">
          <ErrorBoundary>
            <MetricCardGrid
              quotes={quotes}
              historicalData={historicalData}
              timeWindow={timeWindow}
              tickers={activeTickers}
              isLoading={isLoadingQuotes}
              onRemoveTicker={removeTicker}
            />
          </ErrorBoundary>
        </section>

        {/* Visual Analytics Comparison Chart */}
        <section className="section-chart">
          <ErrorBoundary>
            <ChartCard
              title="Enterprise Performance & Volatility Analysis"
              timeWindow={timeWindow}
              data={historicalData}
              tickers={activeTickers}
              isLoading={isLoadingHistory}
              onTimeWindowChange={setTimeWindow}
            />
          </ErrorBoundary>
        </section>

        {/* Detailed Benchmark Table & Custom Company Search */}
        <section className="section-bottom-grid">
          <div className="bottom-table-col">
            <ErrorBoundary>
              <ComparisonTable quotes={quotes} tickers={activeTickers} />
            </ErrorBoundary>
          </div>
          <div className="bottom-panel-col">
            <ErrorBoundary>
              <CustomTickerPanel
                onAddTicker={addCustomTicker}
                isLoading={isLoadingQuotes}
                activeTickers={activeTickers}
              />
            </ErrorBoundary>
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>IBM Bob GitHub SDLC Automation Lab • React Finance Analytics Dashboard</p>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <MarketDataProvider>
      <DashboardContent />
    </MarketDataProvider>
  );
}

export default App;
