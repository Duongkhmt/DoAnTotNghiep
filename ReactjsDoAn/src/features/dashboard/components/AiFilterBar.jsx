import React from 'react';
import { AI_SIGNAL_OPTIONS } from '../services/aiDashboard.constants';

const AiFilterBar = ({
  filters,
  exchangeOptions,
  industryOptions,
  onFilterChange,
  onReset
}) => (
  <section className="ai-filter-card">
    <div className="ai-filter-head">
      <div>
        <span className="ai-section-label">Filters</span>
        <h2>Live screening controls</h2>
      </div>
      <button type="button" className="ai-reset-btn" onClick={onReset}>
        Reset filters
      </button>
    </div>

    <div className="ai-filter-grid">
      <label className="ai-filter-field">
        <span>Signal</span>
        <select value={filters.signal} onChange={(event) => onFilterChange('signal', event.target.value)}>
          {AI_SIGNAL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <label className="ai-filter-field">
        <span>Exchange</span>
        <select value={filters.exchange} onChange={(event) => onFilterChange('exchange', event.target.value)}>
          <option value="">All exchanges</option>
          {exchangeOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>

      <label className="ai-filter-field">
        <span>Industry</span>
        <select value={filters.industry} onChange={(event) => onFilterChange('industry', event.target.value)}>
          <option value="">All industries</option>
          {industryOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
    </div>
  </section>
);

export default AiFilterBar;
