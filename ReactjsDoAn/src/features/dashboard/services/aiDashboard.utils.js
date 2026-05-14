import { AI_SIGNAL_META } from './aiDashboard.constants';

export const formatDate = (value, options = {}) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options
  }).format(date);
};

export const formatNumber = (value, maximumFractionDigits = 2) => {
  if (value === null || value === undefined || value === '') return '-';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '-';

  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits
  }).format(numeric);
};

export const formatPercent = (value, digits = 2) => {
  if (value === null || value === undefined || value === '') return '-';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '-';
  return `${numeric.toFixed(digits)}%`;
};

export const formatRatio = (value, digits = 2) => formatNumber(value, digits);

export const formatCurrencyBillions = (value, digits = 2) => {
  if (value === null || value === undefined || value === '') return '-';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '-';
  return `${formatNumber(numeric, digits)}B`;
};

export const getSignalMeta = (signal) => AI_SIGNAL_META[signal] || {
  label: signal || 'Unknown',
  tone: 'neutral',
  color: '#94a3b8'
};

export const getNetFlow = (buyValue, sellValue) => {
  const buy = Number(buyValue || 0);
  const sell = Number(sellValue || 0);
  return buy - sell;
};

export const getErrorMessage = (error, fallback = 'Cannot load AI data.') => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return fallback;
};

export const sortRows = (rows, sortConfig) => {
  const { key, direction } = sortConfig;
  if (!key) return rows;

  return [...rows].sort((left, right) => {
    const leftValue = left?.[key];
    const rightValue = right?.[key];

    if (leftValue === rightValue) return 0;
    if (leftValue === null || leftValue === undefined || leftValue === '') return 1;
    if (rightValue === null || rightValue === undefined || rightValue === '') return -1;

    if (typeof leftValue === 'number' || !Number.isNaN(Number(leftValue))) {
      return direction === 'asc'
        ? Number(leftValue) - Number(rightValue)
        : Number(rightValue) - Number(leftValue);
    }

    return direction === 'asc'
      ? String(leftValue).localeCompare(String(rightValue))
      : String(rightValue).localeCompare(String(leftValue));
  });
};
