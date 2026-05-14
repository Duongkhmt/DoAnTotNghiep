import React, { useMemo, useState } from 'react';
import AiFilterBar from './AiFilterBar';
import AiHistoryPanel from './AiHistoryPanel';
import AiIndustryPanel from './AiIndustryPanel';
import AiOverviewStrip from './AiOverviewStrip';
import AiRankingTable from './AiRankingTable';
import AiStockDetailModal from './AiStockDetailModal';
import { useAiDashboard } from '../services/useAiDashboard';
import { useAiStockDetail } from '../services/useAiStockDetail';
import { sortRows } from '../services/aiDashboard.utils';
import './AiDashboard.css';

const initialFilters = {
  signal: 'ALL',
  exchange: '',
  industry: ''
};

const AiDashboard = () => {
  const [activeTab, setActiveTab] = useState('screening');
  const [filters, setFilters] = useState(initialFilters);
  const [sortConfig, setSortConfig] = useState({ key: 'ai_score', direction: 'desc' });
  const [selectedSymbol, setSelectedSymbol] = useState('');

  const {
    screening,
    overview,
    history,
    latest,
    loading,
    historyLoading,
    error
  } = useAiDashboard(filters, 30);

  const exchangeOptions = useMemo(() => {
    const values = (screening?.items || []).map((item) => item.exchange).filter(Boolean);
    return [...new Set(values)].sort((left, right) => left.localeCompare(right));
  }, [screening]);

  const industryOptions = useMemo(() => {
    const values = (screening?.items || []).map((item) => item.industry).filter(Boolean);
    return [...new Set(values)].sort((left, right) => left.localeCompare(right));
  }, [screening]);

  const sortedRows = useMemo(() => sortRows(screening?.items || [], sortConfig), [screening, sortConfig]);
  const highlightedSymbol = selectedSymbol || sortedRows[0]?.symbol || '';
  const detailState = useAiStockDetail(selectedSymbol, Boolean(selectedSymbol));

  const handleFilterChange = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
  };

  const handleSort = (key) => {
    setSortConfig((previous) => ({
      key,
      direction: previous.key === key && previous.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <div className="ai-dashboard-shell">
      <div className="ai-tabbar">
        <button type="button" className={activeTab === 'screening' ? 'active' : ''} onClick={() => setActiveTab('screening')}>
          Live Screening
        </button>
        <button type="button" className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
          History Analytics
        </button>
      </div>

      <AiOverviewStrip overview={overview} screening={screening} loading={loading} />

      {error ? <div className="ai-state-card error">{error}</div> : null}

      {activeTab === 'screening' ? (
        <>
          <AiFilterBar
            filters={filters}
            exchangeOptions={exchangeOptions}
            industryOptions={industryOptions}
            onFilterChange={handleFilterChange}
            onReset={() => setFilters(initialFilters)}
          />

          <section className="ai-main-grid">
            {loading ? (
              <div className="ai-state-card">Loading AI ranking board...</div>
            ) : (
              <AiRankingTable
                rows={sortedRows}
                sortConfig={sortConfig}
                onSort={handleSort}
                onSelectRow={setSelectedSymbol}
                selectedSymbol={highlightedSymbol}
              />
            )}

            <AiIndustryPanel overview={overview} latest={latest} />
          </section>

          <AiStockDetailModal
            open={Boolean(selectedSymbol)}
            symbol={selectedSymbol}
            detail={detailState.detail}
            loading={detailState.loading}
            error={detailState.error}
            onClose={() => setSelectedSymbol('')}
          />
        </>
      ) : (
        <AiHistoryPanel history={history} loading={historyLoading} />
      )}
    </div>
  );
};

export default AiDashboard;
