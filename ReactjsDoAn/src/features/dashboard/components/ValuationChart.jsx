import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import marketService from '../services/market.service';
import { format, parseISO } from 'date-fns';
import { FiSearch, FiCalendar } from 'react-icons/fi';
import './DashboardViews.css';

const ValuationChart = ({ symbol, date, onSymbolChange, onDateChange }) => {
    const [historyData, setHistoryData] = useState([]);
    const [valuationData, setValuationData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Manage local start and end date for the chart span
    const [endDate, setEndDate] = useState(date || new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(endDate);
        d.setMonth(d.getMonth() - 3); // Default to 3 months ago like the image "15/11/2025 -> 15/02/2026"
        return d.toISOString().split('T')[0];
    });

    useEffect(() => {
        if (!symbol || !endDate || !startDate) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all historical for the chart and filter locally by date range
                const historyStr = await marketService.getStockHistory(symbol);
                const filteredHistory = historyStr.filter(item => {
                    const d = new Date(item.tradeDate);
                    return d >= new Date(startDate) && d <= new Date(endDate);
                });

                // Sort by date ascending for recharts
                const sortedHistory = [...filteredHistory].sort((a, b) => new Date(a.tradeDate) - new Date(b.tradeDate));
                setHistoryData(sortedHistory);

                // Fetch valuation summary for the table based on the endDate
                const valData = await marketService.getValuation(symbol, endDate);
                setValuationData(valData);
            } catch (err) {
                console.error("Error fetching valuation:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, startDate, endDate]);

    const formatXAxis = (tickItem) => {
        try {
            return format(parseISO(tickItem), 'dd/MM/yyyy');
        } catch (e) {
            return tickItem;
        }
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
                            onChange={(e) => onSymbolChange(e.target.value.toUpperCase())}
                        />
                    </div>
                    {/* Date Pickers for Chart Range */}
                    <div className="date-picker-box">
                        <FiCalendar />
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <span> - </span>
                    <div className="date-picker-box">
                        <FiCalendar />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                onDateChange(e.target.value); // Sync with global date if needed
                            }}
                        />
                    </div>
                    <button className="btn-primary">View Data</button>
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : (
                <>
                    <div className="chart-panel glass-panel">
                        <h3 className="chart-title">Định giá P/E & P/B: {symbol}</h3>
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
                                    <YAxis yAxisId="left" stroke="#3b82f6" domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(2)} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#f97316" domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(2)} />
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
                                <div className="stat-row"><span>Thấp nhất:</span> <strong>{valuationData.peMin?.toFixed(2)}</strong></div>
                                <div className="stat-row"><span>Cao nhất:</span> <strong>{valuationData.peMax?.toFixed(2)}</strong></div>
                                <div className="stat-row"><span>Trung bình:</span> <strong>{valuationData.peAvg?.toFixed(2)}</strong></div>
                            </div>
                            <div className="stat-panel glass-panel">
                                <h4>Thống kê P/B</h4>
                                <div className="stat-row"><span>Thấp nhất:</span> <strong>{valuationData.pbMin?.toFixed(2)}</strong></div>
                                <div className="stat-row"><span>Cao nhất:</span> <strong>{valuationData.pbMax?.toFixed(2)}</strong></div>
                                <div className="stat-row"><span>Trung bình:</span> <strong>{valuationData.pbAvg?.toFixed(2)}</strong></div>
                            </div>
                            <div className="stat-panel glass-panel">
                                <h4>Định giá ngày {formatXAxis(valuationData.tradeDate)}</h4>
                                <div className="stat-row"><span>Giá:</span> <strong>{valuationData.price?.toLocaleString()}</strong></div>
                                <div className="stat-row"><span>P/E:</span> <strong>{valuationData.pe?.toFixed(2)}</strong></div>
                                <div className="stat-row"><span>P/B:</span> <strong>{valuationData.pb?.toFixed(2)}</strong></div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ValuationChart;
