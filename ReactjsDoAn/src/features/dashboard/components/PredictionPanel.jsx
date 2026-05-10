import React, { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {
    FiActivity,
    FiBarChart2,
    FiRefreshCw,
    FiSearch,
    FiTrendingDown,
    FiTrendingUp
} from 'react-icons/fi';
import marketService from '../services/market.service';
import './DashboardViews.css';
import TradingViewChart from './TradingViewChart';

const SIGNAL_OPTIONS = ['ALL', 'MUA_MANH', 'MUA', 'TRUNG_TINH', 'BAN', 'BAN_MANH'];
const SIGNAL_COLORS = {
    MUA_MANH: '#047857',
    MUA: '#0f766e',
    TRUNG_TINH: '#b45309',
    BAN: '#dc2626',
    BAN_MANH: '#991b1b'
};

const safeArray = (value) => Array.isArray(value) ? value : [];

const formatDate = (value, pattern = 'dd/MM/yyyy') => {
    if (!value) return '-';
    try {
        return format(parseISO(value), pattern);
    } catch {
        return value;
    }
};

const formatNumber = (value, digits = 2) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
    return Number(value).toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits
    });
};

const formatPercent = (value, digits = 2) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
    return `${Number(value).toFixed(digits)}%`;
};

const PredictionPanel = ({ symbol, onSymbolChange }) => {
    const [screening, setScreening] = useState({ predict_date: null, total: 0, items: [] });
    const [overview, setOverview] = useState({
        predict_date: null,
        market_breadth: {},
        signal_distribution: [],
        top_industries: [],
        bottom_industries: []
    });
    const [history, setHistory] = useState({ days: 30, daily_win_rate: [] });
    const [detail, setDetail] = useState(null);
    const [filters, setFilters] = useState({
        signal: 'ALL',
        exchange: '',
        industry: ''
    });
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [predicting, setPredicting] = useState(false);
    const [error, setError] = useState('');

    const screeningItems = safeArray(screening.items);
    const selectedSymbol = (symbol || screeningItems[0]?.symbol || '').toUpperCase();

    const exchangeOptions = useMemo(
        () => [...new Set(screeningItems.map((item) => item.exchange).filter(Boolean))].sort(),
        [screeningItems]
    );
    const industryOptions = useMemo(
        () => [...new Set(screeningItems.map((item) => item.industry).filter(Boolean))].sort(),
        [screeningItems]
    );

    useEffect(() => {
        let active = true;

        const fetchOverview = async () => {
            setLoading(true);
            setError('');
            try {
                const [todayRes, overviewRes, historyRes] = await Promise.all([
                    marketService.getAiScreeningToday({
                        signal: filters.signal,
                        exchange: filters.exchange || undefined,
                        industry: filters.industry || undefined
                    }),
                    marketService.getAiMarketOverview(),
                    marketService.getAiScreeningHistory(30)
                ]);

                if (!active) return;
                setScreening(todayRes || { items: [] });
                setOverview(overviewRes || {});
                setHistory(historyRes || {});

                if (!symbol && todayRes?.items?.length) {
                    onSymbolChange(todayRes.items[0].symbol);
                }
            } catch (fetchError) {
                if (!active) return;
                console.error('Error fetching AI dashboard:', fetchError);
                setError('Khong the tai du lieu AI screening.');
                setScreening({ predict_date: null, total: 0, items: [] });
                setOverview({ predict_date: null, market_breadth: {}, signal_distribution: [], top_industries: [], bottom_industries: [] });
                setHistory({ days: 30, daily_win_rate: [] });
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchOverview();
        return () => {
            active = false;
        };
    }, [filters.signal, filters.exchange, filters.industry, symbol, onSymbolChange]);

    useEffect(() => {
        if (!selectedSymbol) {
            setDetail(null);
            return;
        }

        let active = true;
        const fetchDetail = async () => {
            setDetailLoading(true);
            try {
                const result = await marketService.getAiStockDetail(selectedSymbol);
                if (active) {
                    setDetail(result);
                }
            } catch (fetchError) {
                console.error('Error fetching AI stock detail:', fetchError);
                if (active) setDetail(null);
            } finally {
                if (active) setDetailLoading(false);
            }
        };

        fetchDetail();
        return () => {
            active = false;
        };
    }, [selectedSymbol]);

    const handleTriggerPrediction = async () => {
        setPredicting(true);
        try {
            await marketService.triggerPrediction();
            setTimeout(async () => {
                try {
                    const [todayRes, overviewRes] = await Promise.all([
                        marketService.getAiScreeningToday({
                            signal: filters.signal,
                            exchange: filters.exchange || undefined,
                            industry: filters.industry || undefined
                        }),
                        marketService.getAiMarketOverview()
                    ]);
                    setScreening(todayRes || { items: [] });
                    setOverview(overviewRes || {});
                } catch (refreshError) {
                    console.error('Error refreshing AI dashboard:', refreshError);
                }
            }, 5000);
        } catch (triggerError) {
            console.error('Error triggering AI prediction:', triggerError);
            setError('Khong the kich hoat daily AI prediction.');
        } finally {
            setPredicting(false);
        }
    };

    const selectedRow = screeningItems.find((item) => item.symbol === selectedSymbol) || screeningItems[0];
    const signalDistribution = safeArray(overview.signal_distribution);
    const topIndustries = safeArray(overview.top_industries).slice(0, 5);
    const bottomIndustries = safeArray(overview.bottom_industries).slice(0, 5);
    const dailyWinRate = safeArray(history.daily_win_rate).slice().reverse();
    const aiScoreHistory = safeArray(detail?.ai_score_history);
    const priceHistory = safeArray(detail?.price_history);
    const moneyFlow = safeArray(detail?.money_flow_30d);

    const priceChartData = useMemo(() => (
        priceHistory.map((item) => ({
            tradingDate: item.trading_date,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume,
            sma20: item.sma_20,
            sma50: item.sma_50
        }))
    ), [priceHistory]);

    const flowChartData = useMemo(() => (
        moneyFlow.map((item) => ({
            tradingDate: item.trading_date,
            foreignNet: Number(item.fr_buy_value || 0) - Number(item.fr_sell_value || 0),
            propNet: Number(item.prop_buy_value || 0) - Number(item.prop_sell_value || 0)
        }))
    ), [moneyFlow]);

    return (
        <div className="view-container animate-fade-in data-view-stack">
            <div className="view-header dashboard-hero ai-hero">
                <div>
                    <p className="section-eyebrow">AI Screening Center</p>
                    <h2>Bo loc co phieu theo xac suat tang gia</h2>
                    <p className="ai-subtitle">
                        Screening ngay {formatDate(screening.predict_date || overview.predict_date)} voi score, signal, breadth va drill-down tung ma.
                    </p>
                </div>
                <div className="view-controls ai-controls">
                    <button
                        className={`btn-primary ${predicting ? 'loading' : ''}`}
                        onClick={handleTriggerPrediction}
                        disabled={predicting}
                    >
                        <FiRefreshCw /> {predicting ? 'Dang chay model...' : 'Run daily predict'}
                    </button>
                    <div className="search-box ai-search-box">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Nhap ma de xem detail"
                            value={symbol}
                            onChange={(event) => onSymbolChange(event.target.value.toUpperCase())}
                        />
                    </div>
                </div>
            </div>

            <div className="ai-filter-row glass-panel">
                <div className="ai-filter-group">
                    <label>Signal</label>
                    <select value={filters.signal} onChange={(event) => setFilters((prev) => ({ ...prev, signal: event.target.value }))}>
                        {SIGNAL_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <div className="ai-filter-group">
                    <label>Exchange</label>
                    <select value={filters.exchange} onChange={(event) => setFilters((prev) => ({ ...prev, exchange: event.target.value }))}>
                        <option value="">ALL</option>
                        {exchangeOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <div className="ai-filter-group">
                    <label>Industry</label>
                    <select value={filters.industry} onChange={(event) => setFilters((prev) => ({ ...prev, industry: event.target.value }))}>
                        <option value="">ALL</option>
                        {industryOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <div className="ai-filter-note">
                    <FiActivity />
                    <span>{screening.total || 0} ma sau loc</span>
                </div>
            </div>

            {error && <div className="ai-error-banner">{error}</div>}

            <div className="metric-grid">
                <div className="metric-card glass-panel">
                    <span>So ma screening</span>
                    <strong>{formatNumber(screening.total, 0)}</strong>
                    <small>Ngay predict: {formatDate(screening.predict_date || overview.predict_date)}</small>
                </div>
                <div className="metric-card glass-panel positive">
                    <span>Thi truong tang</span>
                    <strong>{formatNumber(overview.market_breadth?.up_count, 0)}</strong>
                    <small>Market breadth current session</small>
                </div>
                <div className="metric-card glass-panel negative">
                    <span>Thi truong giam</span>
                    <strong>{formatNumber(overview.market_breadth?.down_count, 0)}</strong>
                    <small>So ma dong cua duoi tham chieu</small>
                </div>
                <div className={`metric-card glass-panel ${selectedRow?.ai_signal?.includes('MUA') ? 'positive' : selectedRow?.ai_signal?.includes('BAN') ? 'negative' : ''}`}>
                    <span>Ma dang xem</span>
                    <strong>{selectedRow?.symbol || selectedSymbol || '-'}</strong>
                    <small>{selectedRow?.ai_signal || detail?.latest_indicators?.signal || 'Chua chon ma'}</small>
                </div>
            </div>

            <div className="prediction-layout ai-overview-layout">
                <div className="chart-panel glass-panel">
                    <div className="panel-heading">
                        <div>
                            <h3 className="chart-title">Phan bo AI signal</h3>
                            <p>So luong ma theo tung muc khuyen nghi cua model.</p>
                        </div>
                        <span className="pill-accent"><FiBarChart2 /> Live distribution</span>
                    </div>
                    {loading ? (
                        <div className="loading-spinner">Dang tai overview AI...</div>
                    ) : (
                        <div style={{ width: '100%', height: 310 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={signalDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="ai_signal" stroke="#475569" fontSize={12} />
                                    <YAxis stroke="#475569" fontSize={12} />
                                    <Tooltip />
                                    <Bar dataKey="total" radius={[10, 10, 0, 0]}>
                                        {signalDistribution.map((entry) => (
                                            <Cell key={entry.ai_signal} fill={SIGNAL_COLORS[entry.ai_signal] || '#1d4ed8'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="prediction-feed glass-panel">
                    <div className="panel-heading">
                        <div>
                            <h3 className="chart-title">Nhom nganh manh / yeu</h3>
                            <p>Xep hang theo `avg_ai_score` trong ngay predict.</p>
                        </div>
                    </div>
                    <div className="industry-rank-list custom-scrollbar">
                        {topIndustries.map((item) => (
                            <div key={`top-${item.industry}`} className="industry-rank-card positive">
                                <strong>{item.industry}</strong>
                                <span>Top score {formatNumber(item.avg_ai_score, 4)}</span>
                            </div>
                        ))}
                        {bottomIndustries.map((item) => (
                            <div key={`bottom-${item.industry}`} className="industry-rank-card negative">
                                <strong>{item.industry}</strong>
                                <span>Bottom score {formatNumber(item.avg_ai_score, 4)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="prediction-layout ai-detail-layout">
                <div className="data-table-view glass-panel">
                    <div className="view-header">
                        <div>
                            <h2>Screening hom nay</h2>
                            <p className="ai-subtitle">Click vao mot ma de mo panel detail ben phai.</p>
                        </div>
                    </div>
                    <div className="table-wrapper custom-scrollbar ai-table-wrapper">
                        <table className="financial-table ai-screening-table">
                            <thead>
                                <tr>
                                    <th>Symbol</th>
                                    <th>AI Score</th>
                                    <th>Signal</th>
                                    <th>RSI 14</th>
                                    <th>MACD</th>
                                    <th>Vol Ratio</th>
                                    <th>Foreign Buy</th>
                                    <th>Foreign Sell</th>
                                    <th>TD Buy</th>
                                    <th>TD Sell</th>
                                    <th>Exchange</th>
                                    <th>Industry</th>
                                </tr>
                            </thead>
                            <tbody>
                                {screeningItems.map((item) => (
                                    <tr
                                        key={`${item.symbol}-${item.predict_date}`}
                                        className={item.symbol === selectedSymbol ? 'ai-row-active' : ''}
                                        onClick={() => onSymbolChange(item.symbol)}
                                    >
                                        <td className="font-bold">{item.symbol}</td>
                                        <td className="text-right">{formatNumber(item.ai_score, 4)}</td>
                                        <td>
                                            <span className={`signal-chip ${item.ai_signal?.toLowerCase()}`}>{item.ai_signal}</span>
                                        </td>
                                        <td className="text-right">{formatNumber(item.rsi_14, 2)}</td>
                                        <td className="text-right">{formatNumber(item.macd, 3)}</td>
                                        <td className="text-right">{formatNumber(item.volume_ratio, 2)}</td>
                                        <td className="text-right">{formatNumber(item.fr_buy_value, 2)}</td>
                                        <td className="text-right">{formatNumber(item.fr_sell_value, 2)}</td>
                                        <td className="text-right">{formatNumber(item.td_buy_value, 2)}</td>
                                        <td className="text-right">{formatNumber(item.td_sell_value, 2)}</td>
                                        <td>{item.exchange || '-'}</td>
                                        <td>{item.industry || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="prediction-feed glass-panel ai-side-panel">
                    <div className="panel-heading">
                        <div>
                            <h3 className="chart-title">Detail {selectedSymbol || '-'}</h3>
                            <p>Price, indicators, AI history va dong tien 30 ngay.</p>
                        </div>
                    </div>

                    {detailLoading ? (
                        <div className="loading-spinner">Dang tai chi tiet ma...</div>
                    ) : detail ? (
                        <div className="ai-detail-stack custom-scrollbar">
                            <div className="ai-symbol-header">
                                <div>
                                    <strong>{detail.profile?.symbol}</strong>
                                    <span>{detail.profile?.organ_name || 'No company name'}</span>
                                </div>
                                <div className={`signal-chip ${(selectedRow?.ai_signal || '').toLowerCase()}`}>
                                    {selectedRow?.ai_signal || 'DETAIL'}
                                </div>
                            </div>

                            <div className="ai-mini-metrics">
                                <div>
                                    <span>Latest price</span>
                                    <strong>{formatNumber(detail.latest_price, 2)}</strong>
                                </div>
                                <div>
                                    <span>Pct change</span>
                                    <strong className={Number(detail.pct_change) >= 0 ? 'text-green' : 'text-red'}>
                                        {formatPercent(detail.pct_change, 2)}
                                    </strong>
                                </div>
                                <div>
                                    <span>RSI / MACD</span>
                                    <strong>{formatNumber(detail.latest_indicators?.rsi_14, 1)} / {formatNumber(detail.latest_indicators?.macd, 2)}</strong>
                                </div>
                            </div>

                            <div className="mini-chart-card">
                                <h4>Price + trend lines</h4>
                                <div style={{ width: '100%', height: 220 }}>
                                    <TradingViewChart data={priceChartData} />
                                </div>
                            </div>

                            <div className="mini-chart-card">
                                <h4>AI score history</h4>
                                <div style={{ width: '100%', height: 220 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={aiScoreHistory}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="predict_date" tickFormatter={(value) => formatDate(value, 'dd/MM')} stroke="#475569" fontSize={11} />
                                            <YAxis stroke="#475569" fontSize={11} domain={[0, 1]} />
                                            <Tooltip
                                                formatter={(value) => [formatNumber(value, 4), 'AI Score']}
                                                labelFormatter={(label) => formatDate(label)}
                                            />
                                            <Area type="monotone" dataKey="ai_score" stroke="#7c3aed" fill="rgba(124, 58, 237, 0.18)" strokeWidth={2.5} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="mini-chart-card">
                                <h4>Money flow 30d</h4>
                                <div style={{ width: '100%', height: 220 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={flowChartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="tradingDate" tickFormatter={(value) => formatDate(value, 'dd/MM')} stroke="#475569" fontSize={11} />
                                            <YAxis stroke="#475569" fontSize={11} />
                                            <Tooltip
                                                formatter={(value, name) => [formatNumber(value, 2), name === 'foreignNet' ? 'Foreign Net' : 'Prop Net']}
                                                labelFormatter={(label) => formatDate(label)}
                                            />
                                            <Legend />
                                            <Bar dataKey="foreignNet" fill="#2563eb" radius={[6, 6, 0, 0]} name="Foreign Net" />
                                            <Bar dataKey="propNet" fill="#f97316" radius={[6, 6, 0, 0]} name="Prop Net" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="loading-spinner">Khong co du lieu detail.</div>
                    )}
                </div>
            </div>

            <div className="chart-panel glass-panel">
                <div className="panel-heading">
                    <div>
                        <h3 className="chart-title">Daily win-rate history</h3>
                        <p>Ty le dung cua model theo tung ngay prediction trong {history.days || 30} ngay gan nhat.</p>
                    </div>
                </div>
                <div style={{ width: '100%', height: 280 }}>
                    {dailyWinRate.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyWinRate}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="predict_date" tickFormatter={(value) => formatDate(value, 'dd/MM')} stroke="#475569" fontSize={12} />
                                <YAxis yAxisId="left" stroke="#475569" fontSize={12} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} domain={[0, 1]} />
                                <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={12} />
                                <Tooltip
                                    formatter={(value, name) => [
                                        name === 'win_rate' ? formatPercent(value * 100, 2) : formatNumber(value, 0),
                                        name === 'win_rate' ? 'Win Rate' : 'Total Predictions'
                                    ]}
                                    labelFormatter={(label) => formatDate(label)}
                                />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="win_rate" stroke="#1d4ed8" strokeWidth={3} dot={{ r: 3 }} name="win_rate" />
                                <Line yAxisId="right" type="monotone" dataKey="total_predictions" stroke="#0f766e" strokeWidth={2} dot={false} name="total_predictions" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="modern-loader" style={{ padding: '4rem 0', height: '100%' }}>
                            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Chưa có dữ liệu win-rate (chưa đủ 5 ngày để đối chiếu target).</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PredictionPanel;
