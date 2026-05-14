import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { AI_SIGNAL_META } from '../services/aiDashboard.constants';
import {
  formatDate,
  formatNumber,
  formatPercent,
  getSignalMeta
} from '../services/aiDashboard.utils';

const AiOverviewStrip = ({ overview, screening, loading }) => {
  const marketBreadth = overview?.marketBreadth || {};
  const distribution = Array.isArray(overview?.signalDistribution) ? overview.signalDistribution : [];

  return (
    <section className="ai-overview-grid">
      <article className="ai-hero-card">
        <div className="ai-hero-copy">
          <span className="ai-kicker">AI ranking desk</span>
          <h1>AI Stock Ranking Dashboard</h1>
          <p>
            Production-style screening board for signal ranking, market breadth, industry tilt and stock drill-down.
          </p>
        </div>
        <div className="ai-hero-stats">
          <div className="ai-stat-pill">
            <span>Predict date</span>
            <strong>{formatDate(screening?.predict_date || overview?.predict_date)}</strong>
          </div>
          <div className="ai-stat-pill">
            <span>Coverage</span>
            <strong>{formatNumber(screening?.total || 0, 0)} symbols</strong>
          </div>
        </div>
      </article>

      <article className="ai-summary-card">
        <header>
          <span>Market breadth</span>
          <strong>{loading ? 'Loading...' : 'Session structure'}</strong>
        </header>
        <div className="ai-summary-grid">
          <div>
            <span>Advancers</span>
            <strong>{formatNumber(marketBreadth?.upCount, 0)}</strong>
          </div>
          <div>
            <span>Decliners</span>
            <strong>{formatNumber(marketBreadth?.downCount, 0)}</strong>
          </div>
          <div>
            <span>Neutral</span>
            <strong>{formatNumber(marketBreadth?.neutral_count, 0)}</strong>
          </div>
          <div>
            <span>Up ratio</span>
            <strong>{formatPercent(Number(marketBreadth?.up_ratio || 0) * 100, 1)}</strong>
          </div>
        </div>
      </article>

      <article className="ai-summary-card ai-distribution-card">
        <header>
          <span>Signal distribution</span>
          <strong>Model spread</strong>
        </header>
        <div className="ai-distribution-layout">
          <div className="ai-distribution-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  dataKey="total"
                  nameKey="aiSignal"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {distribution.map((entry) => (
                    <Cell key={entry.aiSignal} fill={AI_SIGNAL_META[entry.aiSignal]?.color || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatNumber(value, 0), 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="ai-distribution-legend">
            {distribution.map((entry) => {
              const meta = getSignalMeta(entry.aiSignal);
              return (
                <div key={entry.aiSignal} className="ai-legend-row">
                  <span className="ai-legend-swatch" style={{ backgroundColor: meta.color }} />
                  <span>{meta.label}</span>
                  <strong>{formatNumber(entry.total, 0)}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </article>
    </section>
  );
};

export default AiOverviewStrip;
