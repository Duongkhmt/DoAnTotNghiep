import React from 'react';
import {
  formatNumber
} from '../services/aiDashboard.utils';

const AiIndustryList = ({ title, subtitle, items, tone }) => (
  <article className="ai-side-card">
    <header className="ai-card-header">
      <div>
        <span className="ai-section-label">{subtitle}</span>
        <h3>{title}</h3>
      </div>
    </header>

    <div className="ai-industry-list">
      {items.length ? items.map((item, index) => (
        <div key={`${title}-${item.industry}-${index}`} className={`ai-industry-row ${tone}`}>
          <div>
            <strong>{item.industry || 'Unknown industry'}</strong>
            <span>{formatNumber(item.total, 0)} symbols</span>
          </div>
          <strong>{formatNumber(item.avg_ai_score, 3)}</strong>
        </div>
      )) : (
        <div className="ai-empty-inline">No industry data.</div>
      )}
    </div>
  </article>
);

const AiIndustryPanel = ({ overview, latest }) => (
  <aside className="ai-side-stack">
    <AiIndustryList
      title="Top industries"
      subtitle="Positive rotation"
      items={overview?.top_industries || []}
      tone="positive"
    />
    <AiIndustryList
      title="Bottom industries"
      subtitle="Weak rotation"
      items={overview?.bottom_industries || []}
      tone="negative"
    />

    <article className="ai-side-card">
      <header className="ai-card-header">
        <div>
          <span className="ai-section-label">Latest tape</span>
          <h3>Recent model outputs</h3>
        </div>
      </header>

      <div className="ai-latest-list">
        {latest.length ? latest.map((item) => (
          <div key={`${item.symbol}-${item.predict_date}`} className="ai-latest-row">
            <div>
              <strong>{item.symbol}</strong>
              <span>{item.industry || item.exchange || 'Coverage'}</span>
            </div>
            <div className="ai-latest-score">
              <span>{item.ai_signal}</span>
              <strong>{formatNumber(item.ai_score, 3)}</strong>
            </div>
          </div>
        )) : (
          <div className="ai-empty-inline">No recent predictions.</div>
        )}
      </div>
    </article>
  </aside>
);

export default AiIndustryPanel;
