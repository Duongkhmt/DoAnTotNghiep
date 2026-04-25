import React, { useEffect, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { FiCalendar, FiSearch } from 'react-icons/fi';
import marketService from '../services/market.service';
import './DashboardViews.css';

const ForeignTradingTable = ({ symbol, date, onSymbolChange, onDateChange }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showChart, setShowChart] = useState(false);

    useEffect(() => {
        if (!symbol) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const endDate = date || new Date().toISOString().split('T')[0];
                const startDate = '2000-01-01';

                const result = await marketService.getForeignTrading(symbol, startDate, endDate);
                const sortedResult = [...(result || [])].sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime());
                setData(sortedResult);
            } catch (error) {
                console.error('Error fetching foreign trading data:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, date]);

    const latest = data[0];

    const summaryCards = useMemo(() => {
        if (!latest) return [];
        return [
            {
                label: 'Khối ngoại ròng',
                value: latest.foreignNetTong ?? latest.foreignNet,
                tone: (latest.foreignNetTong ?? latest.foreignNet) >= 0 ? 'positive' : 'negative'
            },
            {
                label: 'Tự doanh ròng',
                value: latest.tdRongTong ?? latest.tdRong,
                tone: (latest.tdRongTong ?? latest.tdRong) >= 0 ? 'positive' : 'negative'
            }
        ];
    }, [latest]);

    const fmtNum = (num) => {
        if (num === null || num === undefined) return '-';
        return Number(num).toLocaleString('vi-VN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const getNetClass = (val) => {
        if (val === null || val === undefined || Number(val) === 0) return '';
        return Number(val) > 0 ? 'bg-green-net' : 'bg-red-net';
    };

    const formatXAxis = (tickItem) => {
        try {
            return format(parseISO(tickItem), 'dd/MM');
        } catch {
            return tickItem;
        }
    };

    return (
        <div className="view-container animate-fade-in data-view-stack">
            <div className="view-header dashboard-hero">
                <div>
                    <p className="section-eyebrow">Capital Flow</p>
                    <h2>Mua/Bán các khối: {symbol}</h2>
                </div>
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
                        <input type="date" value={date} onChange={(event) => onDateChange(event.target.value)} />
                    </div>
                    <button
                        className={`btn-secondary ${showChart ? 'active-filter' : ''}`}
                        onClick={() => setShowChart((prev) => !prev)}
                    >
                        {showChart ? 'Xem bảng chi tiết' : 'Xem biểu đồ ròng'}
                    </button>
                </div>
            </div>

            {!loading && summaryCards.length > 0 && (
                <div className="metric-grid">
                    {summaryCards.map((card) => (
                        <div key={card.label} className={`metric-card glass-panel ${card.tone}`}>
                            <span>{card.label}</span>
                            <strong>{fmtNum(card.value)}</strong>
                            <small>{latest.tradeDate ? format(parseISO(latest.tradeDate), 'dd/MM/yyyy') : ''}</small>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="loading-spinner">Đang tải dữ liệu...</div>
            ) : showChart ? (
                <div className="chart-panel glass-panel" style={{ height: '500px' }}>
                    <h3 className="chart-title">Biểu đồ Giao Dịch Các Khối Lũy Kế - {symbol}</h3>
                    <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                        <ComposedChart
                            data={(() => {
                                const reversed = [...data].reverse();
                                let cumForeign = 0;
                                let cumTd = 0;
                                return reversed.map(item => {
                                    cumForeign += (item.foreignNetTong ?? item.foreignNet ?? 0);
                                    cumTd += (item.tdRongTong ?? item.tdRong ?? 0);
                                    return {
                                        ...item,
                                        cumForeign,
                                        cumTd,
                                        dailyForeign: (item.foreignNetTong ?? item.foreignNet ?? 0),
                                        dailyTd: (item.tdRongTong ?? item.tdRong ?? 0)
                                    };
                                });
                            })()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#d7dee7" vertical={false} />
                            <XAxis 
                                dataKey="tradeDate" 
                                stroke="#4b5563" 
                                tickFormatter={formatXAxis} 
                                minTickGap={30}
                            />
                            <YAxis 
                                yAxisId="left"
                                stroke="#1d4ed8" 
                                label={{ value: 'Lũy kế (tỷ)', angle: -90, position: 'insideLeft', fill: '#1d4ed8' }}
                            />
                            <YAxis 
                                yAxisId="right"
                                orientation="right"
                                stroke="#ea580c"
                                label={{ value: 'Hàng ngày (tỷ)', angle: 90, position: 'insideRight', fill: '#ea580c' }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
                                contentStyle={{ backgroundColor: '#fffdf8', borderColor: '#d7dee7', color: '#14213d', borderRadius: '12px' }}
                                labelFormatter={(label) => format(parseISO(label), 'dd/MM/yyyy')}
                            />
                            <Legend verticalAlign="top" height={36}/>
                            <ReferenceLine yAxisId="left" y={0} stroke="#94a3b8" />
                            
                            {/* Daily values as Bars */}
                            <Bar yAxisId="right" dataKey="dailyForeign" name="NN ròng (ngày)" fill="#93c5fd" opacity={0.4} barSize={10} />
                            <Bar yAxisId="right" dataKey="dailyTd" name="TD ròng (ngày)" fill="#fdba74" opacity={0.4} barSize={10} />
                            
                            {/* Cumulative values as Lines */}
                            <Line 
                                yAxisId="left"
                                type="monotone" 
                                dataKey="cumForeign" 
                                name="NN lũy kế" 
                                stroke="#1d4ed8" 
                                strokeWidth={3} 
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                            <Line 
                                yAxisId="left"
                                type="monotone" 
                                dataKey="cumTd" 
                                name="TD lũy kế" 
                                stroke="#ea580c" 
                                strokeWidth={3} 
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="table-shell glass-panel">
                    <div className="table-wrapper custom-scrollbar">
                        <table className="financial-table grouped-header-table">
                            <thead>
                                <tr className="super-header">
                                    <th colSpan="2" rowSpan="2">Chung</th>
                                    <th colSpan="3" className="header-foreign">Khối ngoại</th>
                                    <th colSpan="3" className="header-matched">Khớp lệnh</th>
                                    <th colSpan="6" className="header-total">Tổng hợp</th>
                                </tr>
                                <tr>
                                    <th className="header-buy">Mua</th>
                                    <th className="header-sell">Bán</th>
                                    <th className="header-net">Ròng</th>
                                    <th className="header-buy">TD mua</th>
                                    <th className="header-sell">TD bán</th>
                                    <th className="header-net">TD ròng</th>
                                    <th className="header-buy">TD mua tổng</th>
                                    <th className="header-sell">TD bán tổng</th>
                                    <th className="header-net">TD ròng tổng</th>
                                    <th className="header-buy">NN mua tổng</th>
                                    <th className="header-sell">NN bán tổng</th>
                                    <th className="header-net">NN ròng tổng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, idx) => (
                                    <tr key={`${row.tradeDate}-${idx}`}>
                                        <td className="font-bold">{row.symbol || symbol}</td>
                                        <td>{row.tradeDate ? format(parseISO(row.tradeDate), 'yyyy-MM-dd') : '-'}</td>
                                        <td className="text-right text-green">{fmtNum(row.foreignBuy)}</td>
                                        <td className="text-right text-red">{fmtNum(row.foreignSell)}</td>
                                        <td className={`text-right font-bold ${getNetClass(row.foreignNet)}`}>{fmtNum(row.foreignNet)}</td>
                                        <td className="text-right text-green border-l">{fmtNum(row.tdMua)}</td>
                                        <td className="text-right text-red">{fmtNum(row.tdBan)}</td>
                                        <td className={`text-right font-bold ${getNetClass(row.tdRong)}`}>{fmtNum(row.tdRong)}</td>
                                        <td className="text-right text-green border-l">{fmtNum(row.tdMuaTong ?? row.tdMua)}</td>
                                        <td className="text-right text-red">{fmtNum(row.tdBanTong ?? row.tdBan)}</td>
                                        <td className={`text-right font-bold ${getNetClass(row.tdRongTong ?? row.tdRong)}`}>{fmtNum(row.tdRongTong ?? row.tdRong)}</td>
                                        <td className="text-right text-green border-l">{fmtNum(row.foreignBuyTong ?? row.foreignBuy)}</td>
                                        <td className="text-right text-red">{fmtNum(row.foreignSellTong ?? row.foreignSell)}</td>
                                        <td className={`text-right font-bold ${getNetClass(row.foreignNetTong ?? row.foreignNet)}`}>{fmtNum(row.foreignNetTong ?? row.foreignNet)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForeignTradingTable;
