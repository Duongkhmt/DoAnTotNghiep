import React, { useEffect, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { FiCalendar, FiSearch } from 'react-icons/fi';
import marketService from '../services/market.service';
import './DashboardViews.css';

const ValuationChart = ({ symbol, date, onSymbolChange, onDateChange }) => {
    const [historyData, setHistoryData] = useState([]);
    const [valuationData, setValuationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [endDate, setEndDate] = useState(date || new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(date || new Date().toISOString().split('T')[0]);
        d.setMonth(d.getMonth() - 3);
        return d.toISOString().split('T')[0];
    });

    useEffect(() => {
        if (!date) return;
        setEndDate(date);
    }, [date]);

    useEffect(() => {
        if (!symbol || !startDate || !endDate) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [history, valuation] = await Promise.all([
                    marketService.getStockHistoryByDateRange(symbol, startDate, endDate),
                    marketService.getValuation(symbol, endDate)
                ]);

                const sortedHistory = [...history].sort(
                    (a, b) => new Date(a.tradeDate) - new Date(b.tradeDate)
                );

                setHistoryData(sortedHistory);
                setValuationData(valuation);
            } catch (error) {
                console.error('Error fetching valuation:', error);
                setHistoryData([]);
                setValuationData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, startDate, endDate]);

    const formatXAxis = (tickItem) => {
        try {
            return format(parseISO(tickItem), 'dd/MM/yyyy');
        } catch {
            return tickItem;
        }
    };

    const formatDecimal = (value) => {
        if (value === null || value === undefined) return '-';
        return Number(value).toFixed(2);
    };

    const formatPrice = (value) => {
        if (value === null || value === undefined) return '-';
        return Number(value).toLocaleString('vi-VN');
    };

    return (
        <div className="view-container animate-fade-in">
            <div className="view-header">
                <h2>Biểu đồ định giá: {symbol}</h2>
                <div className="view-controls">
                    <div className="search-box">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Tìm mã cổ phiếu..."
                            value={symbol}
                            onChange={(event) => onSymbolChange(event.target.value.toUpperCase())}
                        />
                    </div>
                    <div className="date-picker-box">
                        <FiCalendar />
                        <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                    </div>
                    <span> - </span>
                    <div className="date-picker-box">
                        <FiCalendar />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(event) => {
                                setEndDate(event.target.value);
                                onDateChange(event.target.value);
                            }}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : (
                <>
                    <div className="chart-panel glass-panel">
                        <h3 className="chart-title">Định giá P/E và P/B: {symbol}</h3>
                        <div style={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                <AreaChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPE" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPB" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="tradeDate" tickFormatter={formatXAxis} stroke="#52525b" />
                                    <YAxis
                                        yAxisId="left"
                                        stroke="#3b82f6"
                                        domain={['auto', 'auto']}
                                        tickFormatter={(value) => Number(value).toFixed(2)}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#f97316"
                                        domain={['auto', 'auto']}
                                        tickFormatter={(value) => Number(value).toFixed(2)}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }}
                                        labelFormatter={(label) => formatXAxis(label)}
                                    />
                                    <Legend />
                                    <Area yAxisId="left" type="monotone" dataKey="pe" name="P/E" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPE)" />
                                    <Area yAxisId="right" type="monotone" dataKey="pb" name="P/B" stroke="#f97316" fillOpacity={1} fill="url(#colorPB)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {valuationData && (
                        <div className="stats-panels-grid">
                            <div className="stat-panel glass-panel">
                                <h4>Thống kê P/E</h4>
                                <div className="stat-row"><span>Thấp nhất:</span><strong>{formatDecimal(valuationData.peMin)}</strong></div>
                                <div className="stat-row"><span>Cao nhất:</span><strong>{formatDecimal(valuationData.peMax)}</strong></div>
                                <div className="stat-row"><span>Trung bình:</span><strong>{formatDecimal(valuationData.peAvg)}</strong></div>
                            </div>
                            <div className="stat-panel glass-panel">
                                <h4>Thống kê P/B</h4>
                                <div className="stat-row"><span>Thấp nhất:</span><strong>{formatDecimal(valuationData.pbMin)}</strong></div>
                                <div className="stat-row"><span>Cao nhất:</span><strong>{formatDecimal(valuationData.pbMax)}</strong></div>
                                <div className="stat-row"><span>Trung bình:</span><strong>{formatDecimal(valuationData.pbAvg)}</strong></div>
                            </div>
                            <div className="stat-panel glass-panel">
                                <h4>Định giá ngày {formatXAxis(valuationData.tradeDate)}</h4>
                                <div className="stat-row"><span>Giá:</span><strong>{formatPrice(valuationData.price)}</strong></div>
                                <div className="stat-row"><span>P/E:</span><strong>{formatDecimal(valuationData.pe)}</strong></div>
                                <div className="stat-row"><span>P/B:</span><strong>{formatDecimal(valuationData.pb)}</strong></div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ValuationChart;
