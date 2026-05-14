import React from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  formatDate,
  formatNumber,
  formatPercent,
  getSignalMeta
} from '../services/aiDashboard.utils';

const AiHistoryPanel = ({ history, loading }) => {
  const dailyWinRate = Array.isArray(history?.daily_win_rate) ? history.daily_win_rate : [];
  const items = Array.isArray(history?.items) ? history.items : [];

  return (
    <section className="ai-history-stack">
      <div className="ai-history-grid">
        <article className="ai-chart-card wide">
          <header className="ai-card-header">
            <div>
              <span className="ai-section-label">Daily statistics</span>
              <h3>Win rate and relative win rate</h3>
            </div>
          </header>
          <div className="ai-chart-box">
            {loading ? (
              <div className="ai-state-card compact">Loading history analytics...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyWinRate}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe4f0" />
                  <XAxis dataKey="predict_date" tickFormatter={(value) => formatDate(value, { day: '2-digit', month: '2-digit' })} />
                  <YAxis yAxisId="left" tickFormatter={(value) => `${formatNumber(value * 100, 0)}%`} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    labelFormatter={(value) => formatDate(value)}
                    formatter={(value, name) => [
                      name === 'total_predictions' ? formatNumber(value, 0) : `${formatNumber(value * 100, 2)}%`,
                      name
                    ]}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="win_rate" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="relative_win_rate" stroke="#0f9f6e" strokeWidth={2.5} dot={false} />
                  <Bar yAxisId="right" dataKey="total_predictions" fill="#dbeafe" radius={[6, 6, 0, 0]} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="ai-summary-card">
          <header>
            <span>History KPIs</span>
            <strong>30-day view</strong>
          </header>
          <div className="ai-summary-grid">
            <div>
              <span>Rows</span>
              <strong>{formatNumber(items.length, 0)}</strong>
            </div>
            <div>
              <span>Daily points</span>
              <strong>{formatNumber(dailyWinRate.length, 0)}</strong>
            </div>
            <div>
              <span>Avg win rate</span>
              <strong>
                {dailyWinRate.length
                  ? formatPercent(
                    (dailyWinRate.reduce((sum, item) => sum + Number(item.win_rate || 0), 0) / dailyWinRate.length) * 100,
                    1
                  )
                  : '-'}
              </strong>
            </div>
            <div>
              <span>Avg relative win</span>
              <strong>
                {dailyWinRate.length
                  ? formatPercent(
                    (dailyWinRate.reduce((sum, item) => sum + Number(item.relative_win_rate || 0), 0) / dailyWinRate.length) * 100,
                    1
                  )
                  : '-'}
              </strong>
            </div>
          </div>
        </article>
      </div>

      <article className="ai-table-card">
        <header className="ai-card-header">
          <div>
            <span className="ai-section-label">History table</span>
            <h3>Signal outcome log</h3>
          </div>
        </header>

        <div className="ai-table-wrapper">
          <table className="ai-ranking-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Predict date</th>
                <th>Target date</th>
                <th className="numeric">AI score</th>
                <th>Signal</th>
                <th className="numeric">Return 5D</th>
                <th className="numeric">VNIndex 5D</th>
                <th className="numeric">Alpha 5D</th>
                <th className="numeric">Relative win</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? items.map((item) => {
                const signalMeta = getSignalMeta(item.ai_signal);
                return (
                  <tr key={`${item.symbol}-${item.predict_date}`}>
                    <td>{item.symbol}</td>
                    <td>{formatDate(item.predict_date)}</td>
                    <td>{formatDate(item.target_date)}</td>
                    <td className="numeric">{formatNumber(item.ai_score, 3)}</td>
                    <td><span className={`ai-signal-badge ${signalMeta.tone}`}>{signalMeta.label}</span></td>
                    <td className="numeric">{formatPercent(item.return_5d, 2)}</td>
                    <td className="numeric">{formatPercent(item.vnindex_return_5d, 2)}</td>
                    <td className={`numeric ${Number(item.alpha_5d || 0) >= 0 ? 'positive-text' : 'negative-text'}`}>
                      {formatPercent(item.alpha_5d, 2)}
                    </td>
                    <td className="numeric">{item.is_correct_relative ? 'Yes' : 'No'}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="9">
                    <div className="ai-empty-inline">No history records returned.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
};

export default AiHistoryPanel;
