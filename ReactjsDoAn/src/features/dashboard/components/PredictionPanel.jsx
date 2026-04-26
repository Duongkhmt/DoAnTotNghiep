import React, { useEffect, useMemo, useState } from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { FiActivity, FiSearch, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import marketService from '../services/market.service';
import './DashboardViews.css';

const PredictionPanel = ({ symbol, onSymbolChange }) => {
    const [latestPredictions, setLatestPredictions] = useState([]);
    const [symbolPredictions, setSymbolPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [predicting, setPredicting] = useState(false);

    const fetchPredictions = async () => {
        setLoading(true);
        try {
            const [latest, bySymbol] = await Promise.all([
                marketService.getLatestPredictions(24),
                marketService.getPredictionsBySymbol(symbol, 24)
            ]);
            setLatestPredictions(latest || []);
            setSymbolPredictions(bySymbol || []);
        } catch (error) {
            console.error('Error fetching predictions:', error);
            setLatestPredictions([]);
            setSymbolPredictions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!symbol) return;
        fetchPredictions();
    }, [symbol]);

    const handleTriggerPrediction = async () => {
        setPredicting(true);
        try {
            await marketService.predictNow(symbol ? [symbol] : null);
            alert('Đã bắt đầu tác vụ dự báo AI trong background. Dữ liệu sẽ được cập nhật sau vài giây.');
            // Refresh after a delay
            setTimeout(fetchPredictions, 5000);
        } catch (error) {
            console.error('Error triggering prediction:', error);
            alert('Lỗi khi kích hoạt dự báo AI.');
        } finally {
            setPredicting(false);
        }
    };

    const latestForSymbol = symbolPredictions[0];
    const upCount = latestPredictions.filter((item) => item.trend === 'TANG').length;
    const downCount = latestPredictions.filter((item) => item.trend === 'GIAM').length;
    const chartData = useMemo(() => [...symbolPredictions].reverse(), [symbolPredictions]);

    const fmtPrice = (value) => {
        if (value === null || value === undefined) return '-';
        return Number(value).toLocaleString('vi-VN');
    };

    return (
        <div className="view-container animate-fade-in data-view-stack">
            <div className="view-header dashboard-hero">
                <div>
                    <p className="section-eyebrow">AI Forecast Engine</p>
                    <h2>Dự báo giá cổ phiếu</h2>
                </div>
                <div className="view-controls">
                    <button 
                        className={`btn-primary ${predicting ? 'loading' : ''}`}
                        onClick={handleTriggerPrediction}
                        disabled={predicting}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', padding: '0.75rem 1.25rem' }}
                    >
                        <FiActivity /> {predicting ? 'Đang phân tích...' : 'Chạy dự báo mới'}
                    </button>
                    <div className="search-box">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Nhập mã cổ phiếu..."
                            value={symbol}
                            onChange={(event) => onSymbolChange(event.target.value.toUpperCase())}
                        />
                    </div>
                </div>
            </div>

            <div className="metric-grid">
                <div className="metric-card glass-panel">
                    <span>Giá dự báo (Next Session)</span>
                    <strong>{latestForSymbol ? fmtPrice(latestForSymbol.predictedClose) : '-'}</strong>
                    <small>Mục tiêu: {latestForSymbol?.targetDate || 'Chưa có'}</small>
                </div>
                <div className={`metric-card glass-panel ${latestForSymbol?.trend === 'TANG' ? 'positive' : 'negative'}`}>
                    <span>Xu hướng {symbol}</span>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {latestForSymbol?.trend === 'TANG' ? <FiTrendingUp /> : <FiTrendingDown />}
                        {latestForSymbol?.trend || '-'}
                    </strong>
                    <small>Dùng model: {latestForSymbol?.modelUsed || 'N/A'}</small>
                </div>
                <div className="metric-card glass-panel positive">
                    <span>Thị trường (Tăng)</span>
                    <strong>{upCount}</strong>
                    <small>Mã có xu hướng tăng</small>
                </div>
                <div className="metric-card glass-panel negative">
                    <span>Thị trường (Giảm)</span>
                    <strong>{downCount}</strong>
                    <small>Mã có xu hướng giảm</small>
                </div>
            </div>

            <div className="prediction-layout">
                <div className="chart-panel glass-panel">
                    <div className="panel-heading">
                        <div>
                            <h3 className="chart-title">So sánh Dự báo vs Thực tế ({symbol})</h3>
                            <p>Theo dõi độ lệch giữa giá AI dự báo và giá khớp lệnh thực tế.</p>
                        </div>
                        <span className="pill-accent"><FiActivity /> {symbolPredictions.length} phiên gần nhất</span>
                    </div>

                    {loading ? (
                        <div className="loading-spinner">Đang tải dữ liệu dự báo...</div>
                    ) : (
                        <div style={{ width: '100%', height: 360 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#d7dee7" vertical={false} />
                                    <XAxis
                                        dataKey="targetDate"
                                        tickFormatter={(value) => {
                                            try {
                                                return format(parseISO(value), 'dd/MM');
                                            } catch {
                                                return value;
                                            }
                                        }}
                                        stroke="#4b5563"
                                        fontSize={12}
                                    />
                                    <YAxis 
                                        stroke="#4b5563" 
                                        tickFormatter={(value) => fmtPrice(value)}
                                        fontSize={12}
                                        domain={['auto', 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#d7dee7', color: '#14213d', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                        formatter={(value, name) => [fmtPrice(value), name === 'predictedClose' ? 'Giá Dự Báo' : 'Giá Thực Tế']}
                                        labelFormatter={(label) => {
                                            try {
                                                return `Ngày mục tiêu: ${format(parseISO(label), 'dd/MM/yyyy')}`;
                                            } catch {
                                                return label;
                                            }
                                        }}
                                    />
                                    <Legend verticalAlign="top" height={36}/>
                                    <Line
                                        type="monotone"
                                        dataKey="predictedClose"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#3b82f6' }}
                                        activeDot={{ r: 7 }}
                                        name="Giá Dự Báo"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="actualClose"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#10b981' }}
                                        activeDot={{ r: 7 }}
                                        name="Giá Thực Tế"
                                        connectNulls
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="prediction-feed glass-panel">
                    <div className="panel-heading">
                        <div>
                            <h3 className="chart-title">Nhịp đập AI mới nhất</h3>
                            <p>Các mã được AI phân tích gần đây.</p>
                        </div>
                    </div>
                    <div className="prediction-list custom-scrollbar">
                        {latestPredictions.map((item, index) => (
                            <div key={`${item.symbol}-${item.targetDate}-${index}`} className="prediction-item" onClick={() => onSymbolChange(item.symbol)} style={{ cursor: 'pointer' }}>
                                <div className="prediction-symbol">
                                    <strong>{item.symbol}</strong>
                                    <span>{item.targetDate}</span>
                                </div>
                                <div className="prediction-meta">
                                    <span className={`prediction-trend ${item.trend === 'TANG' ? 'up' : 'down'}`}>
                                        {item.trend === 'TANG' ? <FiTrendingUp /> : <FiTrendingDown />}
                                        {item.trend}
                                    </span>
                                    <strong>{fmtPrice(item.predictedClose)}</strong>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PredictionPanel;
