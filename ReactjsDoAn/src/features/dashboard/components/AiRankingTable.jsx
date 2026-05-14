import React from 'react';
import {
  formatCurrencyBillions,
  formatNumber,
  getNetFlow,
  getSignalMeta
} from '../services/aiDashboard.utils';

const columns = [
  { key: 'symbol', label: 'Symbol' },
  { key: 'ai_score', label: 'AI score', numeric: true },
  { key: 'ai_signal', label: 'Signal' },
  { key: 'rsi_14', label: 'RSI', numeric: true },
  { key: 'macd', label: 'MACD', numeric: true },
  { key: 'volume_ratio', label: 'Vol ratio', numeric: true },
  { key: 'price_momentum_5', label: 'Mom 5D', numeric: true },
  { key: 'price_momentum_20', label: 'Mom 20D', numeric: true },
  { key: 'industry', label: 'Industry' },
  { key: 'sector', label: 'Sector' }
];

const AiRankingTable = ({
  rows,
  sortConfig,
  onSort,
  onSelectRow,
  selectedSymbol
}) => (
  <article className="ai-table-card">
    <header className="ai-card-header">
      <div>
        <span className="ai-section-label">Ranking table</span>
        <h3>Today AI ranking</h3>
      </div>
      <p>Sortable table with momentum and money flow context.</p>
    </header>

    <div className="ai-table-wrapper">
      <table className="ai-ranking-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.numeric ? 'numeric' : ''}
                onClick={() => onSort(column.key)}
              >
                <span>
                  {column.label}
                  {sortConfig.key === column.key ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ''}
                </span>
              </th>
            ))}
            <th className="numeric">Foreign net</th>
            <th className="numeric">Prop net</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row) => {
            const signalMeta = getSignalMeta(row.ai_signal);
            return (
              <tr
                key={`${row.symbol}-${row.predict_date}`}
                className={selectedSymbol === row.symbol ? 'active' : ''}
                onClick={() => onSelectRow(row.symbol)}
              >
                <td className="symbol-cell">
                  <strong>{row.symbol}</strong>
                  <span>{row.exchange || '-'}</span>
                </td>
                <td className="numeric">{formatNumber(row.ai_score, 3)}</td>
                <td>
                  <span className={`ai-signal-badge ${signalMeta.tone}`}>{signalMeta.label}</span>
                </td>
                <td className="numeric">{formatNumber(row.rsi_14, 2)}</td>
                <td className="numeric">{formatNumber(row.macd, 3)}</td>
                <td className="numeric">{formatNumber(row.volume_ratio, 2)}</td>
                <td className="numeric">{formatNumber(row.price_momentum_5, 2)}</td>
                <td className="numeric">{formatNumber(row.price_momentum_20, 2)}</td>
                <td>{row.industry || '-'}</td>
                <td>{row.sector || '-'}</td>
                <td className={`numeric ${getNetFlow(row.fr_buy_value, row.fr_sell_value) >= 0 ? 'positive-text' : 'negative-text'}`}>
                  {formatCurrencyBillions(getNetFlow(row.fr_buy_value, row.fr_sell_value), 2)}
                </td>
                <td className={`numeric ${getNetFlow(row.td_buy_value, row.td_sell_value) >= 0 ? 'positive-text' : 'negative-text'}`}>
                  {formatCurrencyBillions(getNetFlow(row.td_buy_value, row.td_sell_value), 2)}
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="12">
                <div className="ai-empty-inline">No screening rows match the current filter.</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </article>
);

export default AiRankingTable;
