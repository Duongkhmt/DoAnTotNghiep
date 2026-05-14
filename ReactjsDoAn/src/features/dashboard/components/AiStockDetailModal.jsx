import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
  formatCurrencyBillions,
  formatDate,
  formatNumber,
  formatPercent,
  getNetFlow
} from '../services/aiDashboard.utils';

const AiStockDetailModal = ({ open, symbol, detail, loading, error, onClose }) => {
  if (!open) return null;

  const priceHistory = Array.isArray(detail?.price_history) ? detail.price_history : [];
  const aiScoreHistory = Array.isArray(detail?.ai_score_history) ? detail.ai_score_history : [];
  const moneyFlow = Array.isArray(detail?.money_flow_30d) ? detail.money_flow_30d : [];

  const moneyFlowChart = moneyFlow.map((entry) => ({
    trading_date: entry.trading_date,
    foreignNet: getNetFlow(entry.fr_buy_value, entry.fr_sell_value),
    proprietaryNet: getNetFlow(entry.td_buy_value, entry.td_sell_value)
  }));

  return (
    <div className="ai-modal-backdrop" onClick={onClose}>
      <div className="ai-modal-shell" onClick={(event) => event.stopPropagation()}>
        <header className="ai-modal-header">
          <div>
            <span className="ai-section-label">Stock detail</span>
            <h2>{symbol}</h2>
            <p>{detail?.profile?.companyName || detail?.profile?.organName || detail?.profile?.industry || 'AI stock detail panel'}</p>
          </div>
          <button type="button" className="ai-close-btn" onClick={onClose}>Close</button>
        </header>

        {loading ? (
          <div className="ai-state-card compact">Loading stock detail...</div>
        ) : error ? (
          <div className="ai-state-card compact error">{error}</div>
        ) : !detail ? (
          <div className="ai-state-card compact">No detail data available.</div>
        ) : (
          <div className="ai-modal-content">
            <section className="ai-detail-topline">
              <div className="ai-detail-stat">
                <span>Latest price</span>
                <strong>{formatNumber(detail.latest_price, 2)}</strong>
              </div>
              <div className="ai-detail-stat">
                <span>Pct change</span>
                <strong className={Number(detail.pct_change || 0) >= 0 ? 'positive-text' : 'negative-text'}>
                  {formatPercent(detail.pct_change, 2)}
                </strong>
              </div>
              <div className="ai-detail-stat">
                <span>RSI / MACD</span>
                <strong>{formatNumber(detail?.latest_indicators?.rsi_14, 2)} / {formatNumber(detail?.latest_indicators?.macd, 3)}</strong>
              </div>
              <div className="ai-detail-stat">
                <span>Volume ratio</span>
                <strong>{formatNumber(detail?.latest_indicators?.volume_ratio, 2)}</strong>
              </div>
            </section>

            <section className="ai-modal-grid">
              <article className="ai-chart-card">
                <header className="ai-card-header">
                  <div>
                    <span className="ai-section-label">Price history</span>
                    <h3>Close with trend lines</h3>
                  </div>
                </header>
                <div className="ai-chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe4f0" />
                      <XAxis dataKey="trading_date" tickFormatter={(value) => formatDate(value, { day: '2-digit', month: '2-digit' })} />
                      <YAxis />
                      <Tooltip labelFormatter={(value) => formatDate(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="close" stroke="#2563eb" dot={false} strokeWidth={2.5} name="Close" />
                      <Line type="monotone" dataKey="sma_20" stroke="#0f9f6e" dot={false} name="SMA20" />
                      <Line type="monotone" dataKey="sma_50" stroke="#f59e0b" dot={false} name="SMA50" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="ai-chart-card">
                <header className="ai-card-header">
                  <div>
                    <span className="ai-section-label">AI trend</span>
                    <h3>AI score history</h3>
                  </div>
                </header>
                <div className="ai-chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aiScoreHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe4f0" />
                      <XAxis dataKey="predict_date" tickFormatter={(value) => formatDate(value, { day: '2-digit', month: '2-digit' })} />
                      <YAxis domain={[0, 1]} />
                      <Tooltip labelFormatter={(value) => formatDate(value)} />
                      <Area type="monotone" dataKey="ai_score" stroke="#0f172a" fill="rgba(37, 99, 235, 0.18)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="ai-chart-card full">
                <header className="ai-card-header">
                  <div>
                    <span className="ai-section-label">Money flow</span>
                    <h3>Foreign and proprietary flow 30D</h3>
                  </div>
                </header>
                <div className="ai-chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moneyFlowChart}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe4f0" />
                      <XAxis dataKey="trading_date" tickFormatter={(value) => formatDate(value, { day: '2-digit', month: '2-digit' })} />
                      <YAxis tickFormatter={(value) => `${formatNumber(value, 0)}B`} />
                      <Tooltip
                        labelFormatter={(value) => formatDate(value)}
                        formatter={(value, name) => [formatCurrencyBillions(value, 2), name === 'foreignNet' ? 'Foreign net' : 'Prop net']}
                      />
                      <Legend />
                      <Bar dataKey="foreignNet" fill="#2563eb" radius={[6, 6, 0, 0]} name="foreignNet" />
                      <Bar dataKey="proprietaryNet" fill="#f97316" radius={[6, 6, 0, 0]} name="proprietaryNet" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiStockDetailModal;
