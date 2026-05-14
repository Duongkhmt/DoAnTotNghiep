import { useCallback, useEffect, useMemo, useState } from 'react';
import aiDashboardService from './aiDashboard.service';
import {
  DEFAULT_HISTORY,
  DEFAULT_OVERVIEW,
  DEFAULT_SCREENING
} from './aiDashboard.constants';
import { getErrorMessage } from './aiDashboard.utils';

export const useAiDashboard = (filters, historyDays = 30) => {
  const [screening, setScreening] = useState(DEFAULT_SCREENING);
  const [overview, setOverview] = useState(DEFAULT_OVERVIEW);
  const [history, setHistory] = useState(DEFAULT_HISTORY);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [screeningResponse, overviewResponse, latestResponse] = await Promise.all([
        aiDashboardService.getToday(filters),
        aiDashboardService.getOverview(),
        aiDashboardService.getLatest(12)
      ]);

      setScreening(screeningResponse || DEFAULT_SCREENING);
      setOverview(overviewResponse || DEFAULT_OVERVIEW);
      setLatest(Array.isArray(latestResponse) ? latestResponse : []);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, 'AI screening service is currently unavailable.'));
      setScreening(DEFAULT_SCREENING);
      setOverview(DEFAULT_OVERVIEW);
      setLatest([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const historyResponse = await aiDashboardService.getHistory(historyDays);
      setHistory(historyResponse || DEFAULT_HISTORY);
    } catch (fetchError) {
      setHistory(DEFAULT_HISTORY);
      setError((previous) => previous || getErrorMessage(fetchError, 'Cannot load screening history.'));
    } finally {
      setHistoryLoading(false);
    }
  }, [historyDays]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return useMemo(() => ({
    screening,
    overview,
    history,
    latest,
    loading,
    historyLoading,
    error,
    refresh: fetchDashboard
  }), [screening, overview, history, latest, loading, historyLoading, error, fetchDashboard]);
};
