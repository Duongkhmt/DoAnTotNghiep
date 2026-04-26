import React, { useEffect, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FiCalendar, FiCheckSquare, FiSearch, FiSettings, FiSquare } from 'react-icons/fi';
import marketService from '../services/market.service';
import './DashboardViews.css';

const ALL_COLUMNS = [
    { id: 'symbol', label: 'Mã cổ phiếu', defaultVisible: true },
    { id: 'tradeDate', label: 'Ngày giao dịch', defaultVisible: true },
    { id: 'totalValue', label: 'Khối lượng khớp', defaultVisible: true },
    { id: 'buyOrderValue', label: 'KL đặt mua', defaultVisible: true },
    { id: 'sellOrderValue', label: 'KL đặt bán', defaultVisible: true },
    { id: 'avgBuyOrderVolume', label: 'KL TB đặt mua', defaultVisible: true },
    { id: 'avgSellOrderVolume', label: 'KL TB đặt bán', defaultVisible: true },
    { id: 'orderRatio', label: 'Hệ số TB đặt bán/mua', defaultVisible: true },
    { id: 'activeBuyValue', label: 'KL khớp mua', defaultVisible: true },
    { id: 'activeSellValue', label: 'KL khớp bán', defaultVisible: true },
    { id: 'avgMatchedBuy', label: 'KL TB khớp mua', defaultVisible: true },
    { id: 'avgMatchedSell', label: 'KL TB khớp bán', defaultVisible: true },
    { id: 'matchedRatio', label: 'Hệ số khớp bán/mua', defaultVisible: true },
    { id: 'foreignBuyVal', label: 'GT NN mua', defaultVisible: true },
    { id: 'foreignSellVal', label: 'GT NN bán', defaultVisible: true },
    { id: 'cancelBuyValue', label: 'KL hủy mua', defaultVisible: true },
    { id: 'cancelSellValue', label: 'KL hủy bán', defaultVisible: true },
    { id: 'avgCancelBuy', label: 'KL TB hủy mua', defaultVisible: true },
    { id: 'avgCancelSell', label: 'KL TB hủy bán', defaultVisible: true }
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
                const sortedResult = [...(result || [])].sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime());
                setData(sortedResult);
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
                                {visibleColumns.totalValue && <th className="bg-col-group1">Khối lượng khớp</th>}
                                {visibleColumns.buyOrderValue && <th className="bg-col-group2">KL đặt mua</th>}
                                {visibleColumns.sellOrderValue && <th className="bg-col-group2">KL đặt bán</th>}
                                {visibleColumns.avgBuyOrderVolume && <th className="bg-col-group2">KL TB đặt mua</th>}
                                {visibleColumns.avgSellOrderVolume && <th className="bg-col-group2">KL TB đặt bán</th>}
                                {visibleColumns.orderRatio && <th className="bg-col-group2 highlight-col">Hệ số TB đặt bán/mua</th>}
                                {visibleColumns.activeBuyValue && <th className="bg-col-group2">KL khớp mua</th>}
                                {visibleColumns.activeSellValue && <th className="bg-col-group1">KL khớp bán</th>}
                                {visibleColumns.avgMatchedBuy && <th className="bg-col-group1">KL TB khớp mua</th>}
                                {visibleColumns.avgMatchedSell && <th className="bg-col-group1">KL TB khớp bán</th>}
                                {visibleColumns.matchedRatio && <th className="bg-col-group2 highlight-col">Hệ số khớp bán/mua</th>}
                                {visibleColumns.foreignBuyVal && <th className="bg-col-group1">GT NN mua</th>}
                                {visibleColumns.foreignSellVal && <th className="bg-col-group2">GT NN bán</th>}
                                {visibleColumns.cancelBuyValue && <th className="bg-col-group2">KL hủy mua</th>}
                                {visibleColumns.cancelSellValue && <th className="bg-col-group2">KL hủy bán</th>}
                                {visibleColumns.avgCancelBuy && <th className="bg-col-group2">KL TB hủy mua</th>}
                                {visibleColumns.avgCancelSell && <th className="bg-col-group2">KL TB hủy bán</th>}
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
                                    {visibleColumns.totalValue && <td className="text-right font-bold bg-col-group1">{fmtNum(row.totalValue)}</td>}
                                    {visibleColumns.buyOrderValue && <td className="text-right bg-col-group2">{fmtNum(row.buyOrderValue)}</td>}
                                    {visibleColumns.sellOrderValue && <td className="text-right bg-col-group2">{fmtNum(row.sellOrderValue)}</td>}
                                    {visibleColumns.avgBuyOrderVolume && <td className="text-right bg-col-group2">{fmtNum(row.avgBuyOrderVolume)}</td>}
                                    {visibleColumns.avgSellOrderVolume && <td className="text-right bg-col-group2">{fmtNum(row.avgSellOrderVolume)}</td>}
                                    {visibleColumns.orderRatio && (
                                        <td className={`text-center font-bold bg-col-group2 ${getRatioColor(row.orderRatio)}`}>
                                            {row.orderRatio !== null && row.orderRatio !== undefined ? Number(row.orderRatio).toFixed(2) : '-'}
                                        </td>
                                    )}
                                    {visibleColumns.activeBuyValue && <td className="text-right bg-col-group2">{fmtNum(row.activeBuyValue)}</td>}
                                    {visibleColumns.activeSellValue && <td className="text-right bg-col-group1">{fmtNum(row.activeSellValue)}</td>}
                                    {visibleColumns.avgMatchedBuy && <td className="text-right bg-col-group1">{fmtNum(row.avgMatchedBuy)}</td>}
                                    {visibleColumns.avgMatchedSell && <td className="text-right bg-col-group1">{fmtNum(row.avgMatchedSell)}</td>}
                                    {visibleColumns.matchedRatio && (
                                        <td className={`text-center font-bold bg-col-group2 ${getRatioColor(row.matchedRatio)}`}>
                                            {row.matchedRatio !== null && row.matchedRatio !== undefined ? Number(row.matchedRatio).toFixed(2) : '-'}
                                        </td>
                                    )}
                                    {visibleColumns.foreignBuyVal && <td className="text-right bg-col-group1">{fmtNum(row.foreignBuyVal)}</td>}
                                    {visibleColumns.foreignSellVal && <td className="text-right bg-col-group2">{fmtNum(row.foreignSellVal)}</td>}
                                    {visibleColumns.cancelBuyValue && <td className="text-right bg-col-group2">{fmtNum(row.cancelBuyValue)}</td>}
                                    {visibleColumns.cancelSellValue && <td className="text-right bg-col-group2">{fmtNum(row.cancelSellValue)}</td>}
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
