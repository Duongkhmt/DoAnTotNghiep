import React, { useEffect, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FiCalendar, FiCheckSquare, FiSettings, FiSquare } from 'react-icons/fi';
import marketService from '../services/market.service';
import './DashboardViews.css';

const ALL_COLUMNS = [
    { id: 'tradeDate', label: 'Ngày GD', defaultVisible: true },
    { id: 'industryCode', label: 'Mã ngành', defaultVisible: true },
    { id: 'industryName', label: 'Tên ngành', defaultVisible: true },
    { id: 'totalValue', label: 'Tổng giá trị', defaultVisible: true },
    { id: 'buyValue', label: 'Giá trị mua', defaultVisible: true },
    { id: 'sellValue', label: 'Giá trị bán', defaultVisible: true },
    { id: 'netValue', label: 'Giá trị ròng', defaultVisible: true },
    { id: 'marketPercent', label: 'Tỷ trọng thị trường (%)', defaultVisible: true },
    { id: 'changePercent', label: 'Biến động (%)', defaultVisible: true }
];

const IndustryFlowTable = ({ date, onDateChange }) => {
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

    useEffect(() => {
        if (!date) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await marketService.getIndustryFlow(date);
                setData(result || []);
            } catch (error) {
                console.error('Error fetching industry flow:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [date]);

    const toggleColumn = (colId) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [colId]: !prev[colId]
        }));
    };

    const fmtNum = (num, decimals = 2) => {
        if (num === null || num === undefined) return '-';
        return Number(num).toLocaleString('vi-VN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    const getSignedClass = (value) => {
        if (value === null || value === undefined || Number(value) === 0) return '';
        return Number(value) > 0 ? 'text-green font-bold' : 'text-red font-bold';
    };

    return (
        <div className="view-container animate-fade-in data-table-view">
            <div className="view-header">
                <h2>Theo dõi dòng tiền ngành</h2>
                <div className="view-controls">
                    <div className="date-picker-box">
                        <FiCalendar />
                        <input type="date" value={date} onChange={(event) => onDateChange?.(event.target.value)} />
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
                    <table className="financial-table industry-table">
                        <thead>
                            <tr>
                                {visibleColumns.tradeDate && <th>Ngày GD</th>}
                                {visibleColumns.industryCode && <th>Mã ngành</th>}
                                {visibleColumns.industryName && <th>Tên ngành</th>}
                                {visibleColumns.totalValue && <th>Tổng giá trị</th>}
                                {visibleColumns.buyValue && <th>Giá trị mua</th>}
                                {visibleColumns.sellValue && <th>Giá trị bán</th>}
                                {visibleColumns.netValue && <th>Giá trị ròng</th>}
                                {visibleColumns.marketPercent && <th>Tỷ trọng (%)</th>}
                                {visibleColumns.changePercent && <th>Biến động (%)</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={`${row.industryCode || row.industryName || 'industry'}-${idx}`}>
                                    {visibleColumns.tradeDate && (
                                        <td className="font-bold">
                                            {row.tradeDate ? format(parseISO(row.tradeDate), 'yyyy-MM-dd') : '-'}
                                        </td>
                                    )}
                                    {visibleColumns.industryCode && <td>{row.industryCode || '-'}</td>}
                                    {visibleColumns.industryName && <td>{row.industryName || '-'}</td>}
                                    {visibleColumns.totalValue && <td className="text-right font-bold text-blue">{fmtNum(row.totalValue)}</td>}
                                    {visibleColumns.buyValue && <td className="text-right text-green">{fmtNum(row.buyValue)}</td>}
                                    {visibleColumns.sellValue && <td className="text-right text-red">{fmtNum(row.sellValue)}</td>}
                                    {visibleColumns.netValue && <td className={`text-right ${getSignedClass(row.netValue)}`}>{fmtNum(row.netValue)}</td>}
                                    {visibleColumns.marketPercent && <td className="text-right">{fmtNum(row.marketPercent, 2)}</td>}
                                    {visibleColumns.changePercent && <td className={`text-right ${getSignedClass(row.changePercent)}`}>{fmtNum(row.changePercent, 2)}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default IndustryFlowTable;
