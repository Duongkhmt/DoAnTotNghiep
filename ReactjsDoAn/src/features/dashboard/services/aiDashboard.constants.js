export const AI_SIGNAL_OPTIONS = [
  { value: 'ALL', label: 'All signals' },
  { value: 'TOP_STRONG', label: 'Top strong' },
  { value: 'TOP', label: 'Top' },
  { value: 'NEUTRAL', label: 'Neutral' },
  { value: 'WEAK', label: 'Weak' },
  { value: 'WEAK_STRONG', label: 'Weak strong' }
];

export const AI_SIGNAL_META = {
  TOP_STRONG: { label: 'Top Strong', tone: 'bull-strong', color: '#059669' },
  TOP: { label: 'Top', tone: 'bull', color: '#10b981' },
  MUA_MANH: { label: 'Strong Buy', tone: 'bull-strong', color: '#059669' },
  MUA: { label: 'Buy', tone: 'bull', color: '#10b981' },
  NEUTRAL: { label: 'Neutral', tone: 'neutral', color: '#f59e0b' },
  TRUNG_TINH: { label: 'Neutral', tone: 'neutral', color: '#f59e0b' },
  WEAK: { label: 'Weak', tone: 'bear', color: '#f97316' },
  WEAK_STRONG: { label: 'Weak Strong', tone: 'bear-strong', color: '#ef4444' },
  BAN: { label: 'Sell', tone: 'bear', color: '#f97316' },
  BAN_MANH: { label: 'Strong Sell', tone: 'bear-strong', color: '#ef4444' }
};

export const DEFAULT_SCREENING = {
  predictDate: '',
  total: 0,
  signalFilter: 'ALL',
  items: []
};

export const DEFAULT_OVERVIEW = {
  predictDate: '',
  marketBreadth: null,
  signalDistribution: [],
  topIndustries: [],
  bottomIndustries: []
};

export const DEFAULT_HISTORY = {
  items: [],
  dailyWinRate: []
};
