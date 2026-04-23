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

    useEffect(() => {
        if (!symbol) return;

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

        fetchPredictions();
    }, [symbol]);

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
                    <p className="section-eyebrow">AI Forecast</p>
                    <h2>Dự báo giá cổ phiếu</h2>
                </div>
                <div className="view-controls">
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
                    <span>Dự báo gần nhất</span>
                    <strong>{latestForSymbol ? fmtPrice(latestForSymbol.predictedClose) : '-'}</strong>
                    <small>{latestForSymbol?.targetDate || 'Chưa có dữ liệu'}</small>
                </div>
                <div className={`metric-card glass-panel ${latestForSymbol?.trend === 'TANG' ? 'positive' : 'negative'}`}>
                    <span>Xu hướng mã {symbol}</span>
                    <strong>{latestForSymbol?.trend || '-'}</strong>
                    <small>{latestForSymbol?.modelUsed || 'No model'}</small>
                </div>
                <div className="metric-card glass-panel positive">
                    <span>Số mã tăng</span>
                    <strong>{upCount}</strong>
                    <small>Trong danh sách dự báo mới nhất</small>
                </div>
                <div className="metric-card glass-panel negative">
                    <span>Số mã giảm</span>
                    <strong>{downCount}</strong>
                    <small>Trong danh sách dự báo mới nhất</small>
                </div>
            </div>

            <div className="prediction-layout">
                <div className="chart-panel glass-panel">
                    <div className="panel-heading">
                        <div>
                            <h3 className="chart-title">Chuỗi dự báo cho {symbol}</h3>
                            <p>Lấy từ bảng `ml_predictions` của backend.</p>
                        </div>
                        <span className="pill-accent"><FiActivity /> {symbolPredictions.length} bản ghi</span>
                    </div>

                    {loading ? (
                        <div className="loading-spinner">Đang tải dữ liệu dự báo...</div>
                    ) : (
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#d7dee7" />
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
                                    />
                                    <YAxis stroke="#4b5563" tickFormatter={(value) => fmtPrice(value)} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fffdf8', borderColor: '#d7dee7', color: '#14213d', borderRadius: '12px' }}
                                        formatter={(value) => [fmtPrice(value), 'Giá dự báo']}
                                        labelFormatter={(label) => {
                                            try {
                                                return format(parseISO(label), 'dd/MM/yyyy');
                                            } catch {
                                                return label;
                                            }
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="predictedClose"
                                        stroke="#1d4ed8"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                        name="Giá đóng cửa dự báo"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="prediction-feed glass-panel">
                    <div className="panel-heading">
                        <div>
                            <h3 className="chart-title">Nhịp dự báo mới nhất</h3>
                            <p>Tổng hợp các mã vừa được cập nhật.</p>
                        </div>
                    </div>
                    <div className="prediction-list custom-scrollbar">
                        {latestPredictions.map((item, index) => (
                            <div key={`${item.symbol}-${item.targetDate}-${index}`} className="prediction-item">
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
