import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import marketService from '../services/market.service';
import { format, parseISO } from 'date-fns';
import { FiSearch, FiCalendar } from 'react-icons/fi';
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
                // Determine a start date (e.g. 1 month ago) and end date (current date)
                const endDate = date || new Date().toISOString().split('T')[0];
                const startDate = new Date(new Date(endDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                const result = await marketService.getForeignTrading(symbol, startDate, endDate);
                setData(result);
            } catch (err) {
                console.error("Error fetching foreign trading data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, date]);

    const fmtNum = (num) => {
        if (num === null || num === undefined) return '0.00';
        return Number(num).toFixed(2);
    };

    const getNetColor = (val) => {
        if (!val || val === 0) return '';
        return val > 0 ? 'bg-green-net' : 'bg-red-net';
    };

    const formatXAxis = (tickItem) => {
        try {
            return format(parseISO(tickItem), 'dd/MM');
        } catch (e) {
            return tickItem;
        }
    };

    return (
        <div className="view-container animate-fade-in data-table-view">
            <div className="view-header">
                <h2>Thống kê mua bán các khối: {symbol}</h2>
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
                    <div className="date-picker-box">
                        <FiCalendar />
                        <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
                    </div>
                    <button className="btn-primary">View Data</button>
                    <button
                        className={`btn-secondary ${showChart ? 'active-filter' : ''}`}
                        onClick={() => setShowChart(!showChart)}
                    >
                        {showChart ? 'Dữ Liệu Bảng' : 'Biểu đồ Ròng'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : showChart ? (
                <div className="chart-panel glass-panel" style={{ height: '400px' }}>
                    <h3 className="chart-title">Biểu đồ Giá trị Bán/Mua ròng (Tỷ VNĐ)</h3>
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                        <BarChart
                            data={[...data].reverse()} // Reverse so oldest is on left, newest on right
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="tradeDate" stroke="#52525b" tickFormatter={formatXAxis} />
                            <YAxis stroke="#52525b" tickFormatter={(v) => v.toFixed(0)} />
                            <Tooltip
                                cursor={{ fill: '#27272a' }}
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }}
                                labelFormatter={(label) => format(parseISO(label), 'dd/MM/yyyy')}
                            />
                            <Legend />
                            <ReferenceLine y={0} stroke="#52525b" />
                            <Bar dataKey="foreignNet" name="Khối Ngoại Ròng" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="tdRong" name="Tự Doanh Ròng" fill="#eab308" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="cnRong" name="Cá Nhân Ròng" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="tcRong" name="Tổ Chức Ròng" fill="#a855f7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="table-wrapper custom-scrollbar">
                    <table className="financial-table grouped-header-table">
                        <thead>
                            <tr className="super-header">
                                <th colSpan="2" rowSpan="2">Chung</th>
                                <th colSpan="3" className="header-foreign">Khối Ngoại</th>
                                <th colSpan="12" className="header-matched">Dữ Liệu Khớp Lệnh</th>
                                <th colSpan="12" className="header-total" style={{ backgroundColor: '#2563eb', color: 'white' }}>Tổng (Khớp lệnh và thoả thuận)</th>
                            </tr>
                            <tr>
                                <th className="header-buy">Mua</th>
                                <th className="header-sell">Bán</th>
                                <th className="header-net">Ròng</th>
                                <th className="header-buy">TD Mua</th>
                                <th className="header-sell">TD Bán</th>
                                <th className="header-net">TD Ròng</th>
                                <th className="header-buy">CN Mua</th>
                                <th className="header-sell">CN Bán</th>
                                <th className="header-net">CN Ròng</th>
                                <th className="header-buy">TC Mua</th>
                                <th className="header-sell">TC Bán</th>
                                <th className="header-net">TC Ròng</th>

                                {/* Header for Tổng */}
                                <th className="header-buy">CN Mua</th>
                                <th className="header-sell">CN Bán</th>
                                <th className="header-net">CN Ròng</th>
                                <th className="header-buy">TC Mua</th>
                                <th className="header-sell">TC Bán</th>
                                <th className="header-net">TC Ròng</th>
                                <th className="header-buy">TD Mua</th>
                                <th className="header-sell">TD Bán</th>
                                <th className="header-net">TD Ròng</th>
                                <th className="header-buy">Nhà ĐTNN Mua</th>
                                <th className="header-sell">Nhà ĐTNN Bán</th>
                                <th className="header-net">Nhà ĐTNN Ròng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="font-bold">{row.symbol || symbol}</td>
                                    <td>{row.tradeDate ? format(parseISO(row.tradeDate), 'yyyy-MM-dd') : '-'}</td>

                                    {/* Khối Ngoại */}
                                    <td className="text-right text-green">{fmtNum(row.foreignBuy)}</td>
                                    <td className="text-right text-red">{fmtNum(row.foreignSell)}</td>
                                    <td className={`text-right font-bold ${getNetColor(row.foreignNet)}`}>{fmtNum(row.foreignNet)}</td>

                                    {/* Tự Doanh */}
                                    <td className="text-right text-green border-l">{fmtNum(row.tdMua)}</td>
                                    <td className="text-right text-red">{fmtNum(row.tdBan)}</td>
                                    <td className={`text-right font-bold ${getNetColor(row.tdRong)}`}>{fmtNum(row.tdRong)}</td>

                                    {/* Cá Nhân */}
                                    <td className="text-right text-green border-l">{fmtNum(row.cnMua)}</td>
                                    <td className="text-right text-red">{fmtNum(row.cnBan)}</td>
                                    <td className={`text-right font-bold ${getNetColor(row.cnRong)}`}>{fmtNum(row.cnRong)}</td>

                                    {/* Tổ Chức (Khớp lệnh) */}
                                    <td className="text-right text-green border-l">{fmtNum(row.tcMua)}</td>
                                    <td className="text-right text-red">{fmtNum(row.tcBan)}</td>
                                    <td className={`text-right font-bold ${getNetColor(row.tcRong)}`}>{fmtNum(row.tcRong)}</td>

                                    {/* Tổng - Cá Nhân */}
                                    <td className="text-right text-green border-l">{fmtNum(row.cnMuaTong ?? row.cnMua)}</td>
                                    <td className="text-right text-red">{fmtNum(row.cnBanTong ?? row.cnBan)}</td>
                                    <td className={`text-right font-bold ${getNetColor(row.cnRongTong ?? row.cnRong)}`}>{fmtNum(row.cnRongTong ?? row.cnRong)}</td>

                                    {/* Tổng - Tổ Chức */}
                                    <td className="text-right text-green border-l">{fmtNum(row.tcMuaTong ?? row.tcMua)}</td>
                                    <td className="text-right text-red">{fmtNum(row.tcBanTong ?? row.tcBan)}</td>
                                    <td className={`text-right font-bold ${getNetColor(row.tcRongTong ?? row.tcRong)}`}>{fmtNum(row.tcRongTong ?? row.tcRong)}</td>

                                    {/* Tổng - Tự Doanh */}
                                    <td className="text-right text-green border-l">{fmtNum(row.tdMuaTong ?? row.tdMua)}</td>
                                    <td className="text-right text-red">{fmtNum(row.tdBanTong ?? row.tdBan)}</td>
                                    <td className={`text-right font-bold ${getNetColor(row.tdRongTong ?? row.tdRong)}`}>{fmtNum(row.tdRongTong ?? row.tdRong)}</td>

                                    {/* Tổng - Khối Ngoại (Nhà ĐTNN) */}
                                    <td className="text-right text-green border-l">{fmtNum(row.foreignBuyTong ?? row.foreignBuy)}</td>
                                    <td className="text-right text-red">{fmtNum(row.foreignSellTong ?? row.foreignSell)}</td>
                                    <td className={`text-right font-bold ${getNetColor(row.foreignNetTong ?? row.foreignNet)}`}>{fmtNum(row.foreignNetTong ?? row.foreignNet)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ForeignTradingTable;
