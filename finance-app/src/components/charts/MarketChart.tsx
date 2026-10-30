import React, { useState } from 'react';
import { HistoricalPoint, TimeWindow } from '../../types/market';
import { TRACKED_COMPANIES } from '../../utils/constants';

interface MarketChartProps {
  data: Record<string, HistoricalPoint[]>;
  tickers: string[];
  timeWindow: TimeWindow;
  height?: number;
}

export const MarketChart: React.FC<MarketChartProps> = ({
  data,
  tickers,
  timeWindow,
  height = 360,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Filter tickers that have valid points
  const activeTickers = tickers.filter((t) => data[t] && data[t].length > 0);

  if (activeTickers.length === 0) {
    return (
      <div className="chart-empty-state" style={{ height }}>
        <p>No historical data available for selected window.</p>
      </div>
    );
  }

  // Base primary series (IBM or first active)
  const primaryTicker = activeTickers.includes('IBM') ? 'IBM' : activeTickers[0];
  const referenceSeries = data[primaryTicker] || [];
  const pointCount = referenceSeries.length;

  if (pointCount === 0) {
    return (
      <div className="chart-empty-state" style={{ height }}>
        <p>Awaiting historical series points...</p>
      </div>
    );
  }

  // Determine min and max percentage across all series
  let minPct = 0;
  let maxPct = 0;

  activeTickers.forEach((t) => {
    const series = data[t] || [];
    series.forEach((pt) => {
      const val = pt.normalizedPercentChange ?? 0;
      if (val < minPct) minPct = val;
      if (val > maxPct) maxPct = val;
    });
  });

  // Add 10% padding to bounds
  const range = maxPct - minPct || 1;
  const yMin = Math.floor(minPct - range * 0.1);
  const yMax = Math.ceil(maxPct + range * 0.1);
  const totalYRange = yMax - yMin || 1;

  // SVG coordinate dimensions
  const svgWidth = 800;
  const svgHeight = height;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };

  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Coordinate conversion helpers
  const getX = (index: number) => {
    if (pointCount <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (pointCount - 1)) * chartWidth;
  };

  const getY = (pct: number) => {
    const fraction = (pct - yMin) / totalYRange;
    return padding.top + chartHeight - fraction * chartHeight;
  };

  const zeroY = getY(0);

  // Y-axis grid ticks (4-5 horizontal ticks)
  const yTicks = [
    yMin,
    yMin + totalYRange * 0.25,
    0,
    yMin + totalYRange * 0.75,
    yMax,
  ].filter((v, idx, arr) => arr.indexOf(v) === idx);

  // X-axis label ticks
  const xTickIndices = [
    0,
    Math.floor((pointCount - 1) * 0.33),
    Math.floor((pointCount - 1) * 0.66),
    pointCount - 1,
  ].filter((v, idx, arr) => arr.indexOf(v) === idx);

  return (
    <div className="market-chart-wrapper" data-testid="market-chart">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="market-chart-svg"
        preserveAspectRatio="none"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="ibmGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f62fe" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0f62fe" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines and Y labels */}
        {yTicks.map((tickVal, i) => {
          const yPos = getY(tickVal);
          return (
            <g key={`y-tick-${i}`} className="grid-group">
              <line
                x1={padding.left}
                y1={yPos}
                x2={svgWidth - padding.right}
                y2={yPos}
                stroke={tickVal === 0 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)'}
                strokeDasharray={tickVal === 0 ? undefined : '4 4'}
              />
              <text
                x={padding.left - 10}
                y={yPos + 4}
                textAnchor="end"
                className="axis-label"
                fill="#8d99ae"
                fontSize="11"
              >
                {tickVal > 0 ? `+${tickVal.toFixed(1)}%` : `${tickVal.toFixed(1)}%`}
              </text>
            </g>
          );
        })}

        {/* X-axis tick labels */}
        {xTickIndices.map((idx) => {
          const pt = referenceSeries[idx];
          if (!pt) return null;
          const xPos = getX(idx);
          return (
            <text
              key={`x-tick-${idx}`}
              x={xPos}
              y={svgHeight - 12}
              textAnchor="middle"
              className="axis-label"
              fill="#8d99ae"
              fontSize="11"
            >
              {pt.date}
            </text>
          );
        })}

        {/* Area fill for IBM */}
        {data['IBM'] && data['IBM'].length > 0 && (
          <path
            d={`
              M ${getX(0)} ${zeroY}
              ${data['IBM'].map((pt, i) => `L ${getX(i)} ${getY(pt.normalizedPercentChange ?? 0)}`).join(' ')}
              L ${getX(data['IBM'].length - 1)} ${zeroY}
              Z
            `}
            fill="url(#ibmGradient)"
          />
        )}

        {/* Multi-series Lines */}
        {activeTickers.map((ticker) => {
          const series = data[ticker] || [];
          if (series.length === 0) return null;

          const color = TRACKED_COMPANIES[ticker]?.color || '#a0aec0';
          const isPrimary = ticker === 'IBM';
          const pathD = series
            .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(pt.normalizedPercentChange ?? 0)}`)
            .join(' ');

          return (
            <g key={`line-group-${ticker}`}>
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={isPrimary ? 3 : 1.75}
                strokeOpacity={isPrimary ? 1 : 0.85}
              />
              {/* Endpoint marker */}
              {series.length > 0 && (
                <circle
                  cx={getX(series.length - 1)}
                  cy={getY(series[series.length - 1].normalizedPercentChange ?? 0)}
                  r={isPrimary ? 4.5 : 3}
                  fill={color}
                />
              )}
            </g>
          );
        })}

        {/* Hover Crosshair and Markers */}
        {hoverIndex !== null && hoverIndex >= 0 && hoverIndex < pointCount && (
          <g className="hover-indicator">
            <line
              x1={getX(hoverIndex)}
              y1={padding.top}
              x2={getX(hoverIndex)}
              y2={svgHeight - padding.bottom}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeDasharray="3 3"
            />
            {activeTickers.map((ticker) => {
              const pt = data[ticker]?.[hoverIndex];
              if (!pt) return null;
              const color = TRACKED_COMPANIES[ticker]?.color || '#fff';
              return (
                <circle
                  key={`hover-dot-${ticker}`}
                  cx={getX(hoverIndex)}
                  cy={getY(pt.normalizedPercentChange ?? 0)}
                  r={5}
                  fill={color}
                  stroke="#12161f"
                  strokeWidth={2}
                />
              );
            })}
          </g>
        )}

        {/* Invisible mouse capture zones */}
        {referenceSeries.map((_, i) => (
          <rect
            key={`capture-${i}`}
            x={getX(i) - (chartWidth / pointCount) / 2}
            y={padding.top}
            width={chartWidth / pointCount}
            height={chartHeight}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
          />
        ))}
      </svg>

      {/* Tooltip Card overlay on hover */}
      {hoverIndex !== null && referenceSeries[hoverIndex] && (
        <div className="chart-hover-tooltip">
          <div className="tooltip-header">
            <strong>{referenceSeries[hoverIndex].date}</strong>
            <span className="tooltip-window">{timeWindow} View</span>
          </div>
          <div className="tooltip-rows">
            {activeTickers.map((t) => {
              const pt = data[t]?.[hoverIndex];
              if (!pt) return null;
              const pct = pt.normalizedPercentChange ?? 0;
              const color = TRACKED_COMPANIES[t]?.color || '#fff';
              return (
                <div key={`tip-${t}`} className="tooltip-row">
                  <span className="tooltip-ticker" style={{ color }}>
                    ● {t}
                  </span>
                  <span className="tooltip-price">${pt.close.toFixed(2)}</span>
                  <span className={`tooltip-pct ${pct >= 0 ? 'pos' : 'neg'}`}>
                    {pct >= 0 ? `+${pct.toFixed(2)}%` : `${pct.toFixed(2)}%`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Interactive Legend */}
      <div className="chart-legend">
        {activeTickers.map((ticker) => {
          const color = TRACKED_COMPANIES[ticker]?.color || '#8d99ae';
          const name = TRACKED_COMPANIES[ticker]?.name || ticker;
          const latestPt = data[ticker]?.[data[ticker].length - 1];
          const latestPct = latestPt?.normalizedPercentChange ?? 0;

          return (
            <div key={`legend-${ticker}`} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: color }} />
              <span className="legend-sym">{ticker}</span>
              <span className="legend-name">({name})</span>
              <span className={`legend-pct ${latestPct >= 0 ? 'pos' : 'neg'}`}>
                {latestPct >= 0 ? `+${latestPct.toFixed(2)}%` : `${latestPct.toFixed(2)}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
