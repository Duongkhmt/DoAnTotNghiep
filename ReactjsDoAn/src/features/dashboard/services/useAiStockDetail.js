import { useEffect, useState } from 'react';
import aiDashboardService from './aiDashboard.service';
import { getErrorMessage } from './aiDashboard.utils';

export const useAiStockDetail = (symbol, enabled) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled || !symbol) {
      setDetail(null);
      setError('');
      return;
    }

    let active = true;

    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await aiDashboardService.getStockDetail(symbol);
        if (active) {
          setDetail(response);
        }
      } catch (fetchError) {
        if (active) {
          setDetail(null);
          setError(getErrorMessage(fetchError, 'Cannot load stock detail.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      active = false;
    };
  }, [symbol, enabled]);

  return { detail, loading, error };
};
