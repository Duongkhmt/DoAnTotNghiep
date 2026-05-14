import React, { useEffect, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FiCalendar, FiCheckSquare, FiSettings, FiSquare } from 'react-icons/fi';
import marketService from '../services/market.service';
import './DashboardViews.css';

const ALL_COLUMNS = [
    { id: 'tradeDate', label: 'Ngày GD', defaultVisible: true },
    { id: 'totalValue', label: 'Tổng', defaultVisible: true },

    { id: 'totalNH', label: 'Tổng NH', defaultVisible: true },
    { id: 'muaNH', label: 'Mua NH', defaultVisible: true },
    { id: 'banNH', label: 'Bán NH', defaultVisible: true },

    { id: 'totalCK', label: 'Tổng CK', defaultVisible: true },
    { id: 'muaCK', label: 'Mua CK', defaultVisible: true },
    { id: 'banCK', label: 'Bán CK', defaultVisible: true },

    { id: 'totalBDS', label: 'Tổng BĐS', defaultVisible: true },
    { id: 'muaBDS', label: 'Mua BĐS', defaultVisible: true },
    { id: 'banBDS', label: 'Bán BĐS', defaultVisible: true },

    { id: 'totalThep', label: 'Tổng Thép', defaultVisible: true },
    { id: 'muaThep', label: 'Mua Thép', defaultVisible: true },
    { id: 'banThep', label: 'Bán Thép', defaultVisible: true },

    { id: 'totalVIN', label: 'Tổng VIN', defaultVisible: true },
    { id: 'muaVIN', label: 'Mua VIN', defaultVisible: true },
    { id: 'banVIN', label: 'Bán VIN', defaultVisible: true },

    { id: 'tiLeNH', label: 'Tỉ lệ NH (%)', defaultVisible: true },
    { id: 'tiLeCK', label: 'Tỉ lệ CK (%)', defaultVisible: true },
    { id: 'tiLeBDS', label: 'Tỉ lệ BĐS (%)', defaultVisible: true },
    { id: 'tiLeThep', label: 'Tỉ lệ Thép (%)', defaultVisible: true },
    { id: 'tiLeVIN', label: 'Tỉ lệ VIN (%)', defaultVisible: true }
];

const IndustryFlowTable = ({ date, onDateChange }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);
    const LIMIT = 50;

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

    // Reset data when date changes
    useEffect(() => {
        if (!date) return;
        setData([]);
        setOffset(0);
        setHasMore(true);
    }, [date]);

    const fetchData = async (currentOffset, isInitial = false) => {
        if (!date) return;
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        try {
            const result = await marketService.getIndustryFlow(date, LIMIT, currentOffset);
            if (result && result.length > 0) {
                setData(prev => isInitial ? result : [...prev, ...result]);
                if (result.length < LIMIT) setHasMore(false);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching industry flow:', error);
            if (isInitial) setData([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (date) {
            fetchData(0, true);
        }
    }, [date]);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    const nextOffset = offset + LIMIT;
                    setOffset(nextOffset);
                    fetchData(nextOffset);
                }
            },
            { threshold: 0.1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [hasMore, loading, loadingMore, offset, date]);

    const toggleColumn = (colId) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [colId]: !prev[colId]
        }));
    };

    const fmtNum = (num, decimals = 0) => {
        if (num === null || num === undefined) return '-';
        // Display in billions or millions if needed? Screenshot shows small numbers with dots.
        // Usually these values are already in some unit. 
        // Based on screenshot "34.039", "14.827" - these might be billions with 3 decimal places?
        // Or just formatted integers with dot as thousand separator.
        return Number(num).toLocaleString('vi-VN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    const getSignedClass = (value) => {
        if (value === null || value === undefined || Number(value) === 0) return '';
        return Number(value) > 0 ? 'text-green font-bold' : 'text-red font-bold';
    };

    const renderCell = (value, type = 'total') => {
        let className = 'text-right ';
        if (type === 'total') className += 'font-bold text-blue';
        if (type === 'mua') className += 'text-green';
        if (type === 'ban') className += 'text-red';
        if (type === 'ratio') {
            const val = Number(value);
            if (val > 30) className += 'bg-purple text-white'; // Match screenshot highlight
            className += ' font-bold';
        }
        return <td className={className}>{fmtNum(value, type === 'ratio' ? 2 : 0)}</td>;
    };

    return (
        <div className="view-container animate-fade-in data-table-view">
            <div className="view-header">
                <h2>Theo Dõi Dòng Tiền Ngành</h2>
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
                    <table className="financial-table industry-history-table">
                        <thead>
                            <tr className="main-header">
                                <th rowSpan={2} className="sticky-col">Ngày GD</th>
                                <th rowSpan={2} className="sticky-col">Tổng</th>
                                <th colSpan={3} className="header-group bg-nh">Ngành NH</th>
                                <th colSpan={3} className="header-group bg-ck">Ngành CK</th>
                                <th colSpan={3} className="header-group bg-bds">Ngành BĐS</th>
                                <th colSpan={3} className="header-group bg-thep">Ngành Thép</th>
                                <th colSpan={3} className="header-group bg-vin">Ngành VIN</th>
                                <th colSpan={5} className="header-group bg-ratio">Tỉ lệ (%)</th>
                            </tr>
                            <tr className="sub-header">
                                {/* Placeholders for rowSpan headers are not needed in 2nd row */}
                                <th className="bg-nh">Tổng NH</th><th className="bg-nh">Mua NH</th><th className="bg-nh">Bán NH</th>
                                <th className="bg-ck">Tổng CK</th><th className="bg-ck">Mua CK</th><th className="bg-ck">Bán CK</th>
                                <th className="bg-bds">Tổng BĐS</th><th className="bg-bds">Mua BĐS</th><th className="bg-bds">Bán BĐS</th>
                                <th className="bg-thep">Tổng Thép</th><th className="bg-thep">Mua Thép</th><th className="bg-thep">Bán Thép</th>
                                <th className="bg-vin">Tổng VIN</th><th className="bg-vin">Mua VIN</th><th className="bg-vin">Bán VIN</th>
                                
                                <th className="bg-ratio">NH (%)</th>
                                <th className="bg-ratio">CK (%)</th>
                                <th className="bg-ratio">BĐS (%)</th>
                                <th className="bg-ratio">Thép (%)</th>
                                <th className="bg-ratio">VIN (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                <>
                                    {data.map((row, idx) => (
                                        <tr key={(row.tradeDate || 'date') + idx}>
                                            <td className="font-bold text-center">
                                                {row.tradeDate ? format(parseISO(row.tradeDate), 'yyyy-MM-dd') : '-'}
                                            </td>
                                            {visibleColumns.totalValue && renderCell(row.totalValue, 'total')}
                                            
                                            {visibleColumns.totalNH && renderCell(row.totalNH, 'total')}
                                            {visibleColumns.muaNH && renderCell(row.muaNH, 'mua')}
                                            {visibleColumns.banNH && renderCell(row.banNH, 'ban')}
                                            
                                            {visibleColumns.totalCK && renderCell(row.totalCK, 'total')}
                                            {visibleColumns.muaCK && renderCell(row.muaCK, 'mua')}
                                            {visibleColumns.banCK && renderCell(row.banCK, 'ban')}
                                            
                                            {visibleColumns.totalBDS && renderCell(row.totalBDS, 'total')}
                                            {visibleColumns.muaBDS && renderCell(row.muaBDS, 'mua')}
                                            {visibleColumns.banBDS && renderCell(row.banBDS, 'ban')}
                                            
                                            {visibleColumns.totalThep && renderCell(row.totalThep, 'total')}
                                            {visibleColumns.muaThep && renderCell(row.muaThep, 'mua')}
                                            {visibleColumns.banThep && renderCell(row.banThep, 'ban')}
                                            
                                            {visibleColumns.totalVIN && renderCell(row.totalVIN, 'total')}
                                            {visibleColumns.muaVIN && renderCell(row.muaVIN, 'mua')}
                                            {visibleColumns.banVIN && renderCell(row.banVIN, 'ban')}
                                            
                                            {visibleColumns.tiLeNH && renderCell(row.tiLeNH, 'ratio')}
                                            {visibleColumns.tiLeCK && renderCell(row.tiLeCK, 'ratio')}
                                            {visibleColumns.tiLeBDS && renderCell(row.tiLeBDS, 'ratio')}
                                            {visibleColumns.tiLeThep && renderCell(row.tiLeThep, 'ratio')}
                                            {visibleColumns.tiLeVIN && renderCell(row.tiLeVIN, 'ratio')}
                                        </tr>
                                    ))}
                                    {/* Infinite Scroll Trigger */}
                                    <tr ref={loaderRef} style={{ height: '20px' }}>
                                        <td colSpan={22} className="text-center">
                                            {loadingMore && <div className="loading-more-dots">...</div>}
                                        </td>
                                    </tr>
                                </>
                            ) : (
                                <tr>
                                    <td colSpan={22} className="text-center py-10 text-muted">
                                        Không có dữ liệu cho khoảng thời gian này
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default IndustryFlowTable;
