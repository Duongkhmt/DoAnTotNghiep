import React, { useEffect, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FiCalendar, FiCheckSquare, FiSearch, FiSettings, FiSquare } from 'react-icons/fi';
import marketService from '../services/market.service';
import './DashboardViews.css';

const ALL_COLUMNS = [
    { id: 'symbol', label: 'Mã cổ phiếu', defaultVisible: true },
    { id: 'tradeDate', label: 'Ngày giao dịch', defaultVisible: true },
    { id: 'totalVolume', label: 'Khối lượng khớp', defaultVisible: true },
    { id: 'buyOrderVolume', label: 'KL đặt mua', defaultVisible: true },
    { id: 'sellOrderVolume', label: 'KL đặt bán', defaultVisible: true },
    { id: 'avgBuyOrderVolume', label: 'KLTB đặt mua', defaultVisible: true },
    { id: 'avgSellOrderVolume', label: 'KLTB đặt bán', defaultVisible: true },
    { id: 'orderRatio', label: 'Hệ số TB đặt bán/mua', defaultVisible: true },
    { id: 'activeBuyVolume', label: 'KL khớp mua', defaultVisible: true },
    { id: 'activeSellVolume', label: 'KL khớp bán', defaultVisible: true },
    { id: 'avgMatchedBuy', label: 'KLTB khớp mua', defaultVisible: true },
    { id: 'avgMatchedSell', label: 'KLTB khớp bán', defaultVisible: true },
    { id: 'matchedRatio', label: 'Hệ số khớp bán/mua', defaultVisible: true },
    { id: 'foreignBuyVolume', label: 'KL NN mua', defaultVisible: true },
    { id: 'foreignSellVolume', label: 'KL NN bán', defaultVisible: true },
    { id: 'cancelBuyVolume', label: 'KL hủy mua', defaultVisible: true },
    { id: 'cancelSellVolume', label: 'KL hủy bán', defaultVisible: true },
    { id: 'avgCancelBuy', label: 'KLTB hủy mua', defaultVisible: true },
    { id: 'avgCancelSell', label: 'KLTB hủy bán', defaultVisible: true }
];

const StockHistoryTable = ({ symbol, date, onSymbolChange, onDateChange }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef(null);
    const [visibleColumns, setVisibleColumns] = useState(() => {
        const initialState = {};
        ALL_COLUMNS.forEach((col) => {
            initialState[col.id] = col.defaultVisible;
        });
        return initialState;
    });

    useEffect(() => {
        if (!symbol) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const result = date
                    ? await marketService.getStockHistoryByDateRange(symbol, '2000-01-01', date)
                    : await marketService.getStockHistory(symbol);
                setData(result);
            } catch (error) {
                console.error('Error fetching stock history:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, date]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setIsSettingsOpen(false);
            }
        };

        if (isSettingsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSettingsOpen]);

    const fmtNum = (num) => {
        if (num === null || num === undefined) return '-';
        return Number(num).toLocaleString('vi-VN');
    };

    const getRatioColor = (val) => {
        if (val === null || val === undefined) return '';
        if (Number(val) > 2) return 'bg-red-ratio';
        if (Number(val) < 0.8) return 'bg-green-ratio';
        return '';
    };

    const toggleColumn = (colId) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [colId]: !prev[colId]
        }));
    };

    return (
        <div className="view-container animate-fade-in data-table-view">
            <div className="view-header">
                <h2>Thống kê hệ số: {symbol}</h2>
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

                    <div className="settings-dropdown-wrapper" ref={settingsRef}>
                        <button
                            className="btn-secondary settings-btn"
                            onClick={() => setIsSettingsOpen((prev) => !prev)}
                        >
                            <FiSettings /> Cài đặt cột
                        </button>

                        {isSettingsOpen && (
                            <div className="settings-menu custom-scrollbar">
                                {ALL_COLUMNS.map((col) => (
                                    <label key={col.id} className="settings-menu-item">
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns[col.id]}
                                            onChange={() => toggleColumn(col.id)}
                                        />
                                        <span className="checkbox-custom">
                                            {visibleColumns[col.id] ? <FiCheckSquare className="text-blue" /> : <FiSquare className="text-muted" />}
                                        </span>
                                        <span>{col.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : (
                <div className="table-wrapper custom-scrollbar">
                    <table className="financial-table">
                        <thead>
                            <tr>
                                {visibleColumns.symbol && <th className="bg-col-white">Mã CP</th>}
                                {visibleColumns.tradeDate && <th className="bg-col-white">Ngày GD</th>}
                                {visibleColumns.totalVolume && <th className="bg-col-group1">Khối lượng khớp</th>}
                                {visibleColumns.buyOrderVolume && <th className="bg-col-group2">KL đặt mua</th>}
                                {visibleColumns.sellOrderVolume && <th className="bg-col-group2">KL đặt bán</th>}
                                {visibleColumns.avgBuyOrderVolume && <th className="bg-col-group2">KLTB đặt mua</th>}
                                {visibleColumns.avgSellOrderVolume && <th className="bg-col-group2">KLTB đặt bán</th>}
                                {visibleColumns.orderRatio && <th className="bg-col-group2 highlight-col">Hệ số TB đặt bán/mua</th>}
                                {visibleColumns.activeBuyVolume && <th className="bg-col-group2">KL khớp mua</th>}
                                {visibleColumns.activeSellVolume && <th className="bg-col-group1">KL khớp bán</th>}
                                {visibleColumns.avgMatchedBuy && <th className="bg-col-group1">KLTB khớp mua</th>}
                                {visibleColumns.avgMatchedSell && <th className="bg-col-group1">KLTB khớp bán</th>}
                                {visibleColumns.matchedRatio && <th className="bg-col-group2 highlight-col">Hệ số khớp bán/mua</th>}
                                {visibleColumns.foreignBuyVolume && <th className="bg-col-group1">KL NN mua</th>}
                                {visibleColumns.foreignSellVolume && <th className="bg-col-group2">KL NN bán</th>}
                                {visibleColumns.cancelBuyVolume && <th className="bg-col-group2">KL hủy mua</th>}
                                {visibleColumns.cancelSellVolume && <th className="bg-col-group2">KL hủy bán</th>}
                                {visibleColumns.avgCancelBuy && <th className="bg-col-group2">KLTB hủy mua</th>}
                                {visibleColumns.avgCancelSell && <th className="bg-col-group2">KLTB hủy bán</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={`${row.symbol}-${row.tradeDate}-${idx}`}>
                                    {visibleColumns.symbol && <td className="font-bold bg-col-white">{row.symbol}</td>}
                                    {visibleColumns.tradeDate && (
                                        <td className="bg-col-white">
                                            {row.tradeDate ? format(parseISO(row.tradeDate), 'yyyy-MM-dd') : '-'}
                                        </td>
                                    )}
                                    {visibleColumns.totalVolume && <td className="text-right font-bold bg-col-group1">{fmtNum(row.totalVolume)}</td>}
                                    {visibleColumns.buyOrderVolume && <td className="text-right bg-col-group2">{fmtNum(row.buyOrderVolume)}</td>}
                                    {visibleColumns.sellOrderVolume && <td className="text-right bg-col-group2">{fmtNum(row.sellOrderVolume)}</td>}
                                    {visibleColumns.avgBuyOrderVolume && <td className="text-right bg-col-group2">{fmtNum(row.avgBuyOrderVolume)}</td>}
                                    {visibleColumns.avgSellOrderVolume && <td className="text-right bg-col-group2">{fmtNum(row.avgSellOrderVolume)}</td>}
                                    {visibleColumns.orderRatio && (
                                        <td className={`text-center font-bold bg-col-group2 ${getRatioColor(row.orderRatio)}`}>
                                            {row.orderRatio !== null && row.orderRatio !== undefined ? Number(row.orderRatio).toFixed(2) : '-'}
                                        </td>
                                    )}
                                    {visibleColumns.activeBuyVolume && <td className="text-right bg-col-group2">{fmtNum(row.activeBuyVolume)}</td>}
                                    {visibleColumns.activeSellVolume && <td className="text-right bg-col-group1">{fmtNum(row.activeSellVolume)}</td>}
                                    {visibleColumns.avgMatchedBuy && <td className="text-right bg-col-group1">{fmtNum(row.avgMatchedBuy)}</td>}
                                    {visibleColumns.avgMatchedSell && <td className="text-right bg-col-group1">{fmtNum(row.avgMatchedSell)}</td>}
                                    {visibleColumns.matchedRatio && (
                                        <td className={`text-center font-bold bg-col-group2 ${getRatioColor(row.matchedRatio)}`}>
                                            {row.matchedRatio !== null && row.matchedRatio !== undefined ? Number(row.matchedRatio).toFixed(2) : '-'}
                                        </td>
                                    )}
                                    {visibleColumns.foreignBuyVolume && <td className="text-right bg-col-group1">{fmtNum(row.foreignBuyVolume)}</td>}
                                    {visibleColumns.foreignSellVolume && <td className="text-right bg-col-group2">{fmtNum(row.foreignSellVolume)}</td>}
                                    {visibleColumns.cancelBuyVolume && <td className="text-right bg-col-group2">{fmtNum(row.cancelBuyVolume)}</td>}
                                    {visibleColumns.cancelSellVolume && <td className="text-right bg-col-group2">{fmtNum(row.cancelSellVolume)}</td>}
                                    {visibleColumns.avgCancelBuy && <td className="text-right bg-col-group2">{fmtNum(row.avgCancelBuy)}</td>}
                                    {visibleColumns.avgCancelSell && <td className="text-right bg-col-group2">{fmtNum(row.avgCancelSell)}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StockHistoryTable;
