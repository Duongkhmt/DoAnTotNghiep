import React, { useState, useEffect, useRef } from 'react';
import marketService from '../services/market.service';
import { format, parseISO } from 'date-fns';
import { FiSettings, FiCheckSquare, FiSquare } from 'react-icons/fi';
import './DashboardViews.css';

const ALL_COLUMNS = [
    { id: 'tradeDate', label: 'Ngày GD', defaultVisible: true },
    { id: 'total', label: 'Tổng', defaultVisible: true },
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
    { id: 'tiLeVIN', label: 'Tỉ lệ VIN (%)', defaultVisible: true },
];

const IndustryFlowTable = ({ date }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Column Settings State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef(null);
    const [visibleColumns, setVisibleColumns] = useState(() => {
        const initialState = {};
        ALL_COLUMNS.forEach(col => {
            initialState[col.id] = col.defaultVisible;
        });
        return initialState;
    });

    // Handle closing settings dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setIsSettingsOpen(false);
            }
        };

        if (isSettingsOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSettingsOpen]);

    // Toggle column visibility
    const toggleColumn = (colId) => {
        setVisibleColumns(prev => ({
            ...prev,
            [colId]: !prev[colId]
        }));
    };


    useEffect(() => {
        if (!date) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await marketService.getIndustryFlow(date);
                setData(result);
            } catch (err) {
                console.error("Error fetching industry flow:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [date]);

    const fmtNum = (num, decimals = 3) => {
        if (num === null || num === undefined) return '0';
        return Number(num).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    return (
        <div className="view-container animate-fade-in data-table-view">
            <div className="view-header">
                <h2>Theo Dõi Dòng Tiền Ngành</h2>
                <div className="view-controls">
                    {/* Settings Dropdown Component */}
                    <div className="settings-dropdown-wrapper" ref={settingsRef}>
                        <button
                            className="btn-secondary settings-btn"
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        >
                            <FiSettings /> Cài đặt cột
                        </button>

                        {isSettingsOpen && (
                            <div className="settings-menu custom-scrollbar">
                                {ALL_COLUMNS.map(col => (
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
                                {visibleColumns['tradeDate'] && <th>Ngày GD</th>}
                                {visibleColumns['total'] && <th>Tổng</th>}
                                {visibleColumns['totalNH'] && <th className="highlight-col group-start">Tổng NH</th>}
                                {visibleColumns['muaNH'] && <th>Mua NH</th>}
                                {visibleColumns['banNH'] && <th>Bán NH</th>}
                                {visibleColumns['totalCK'] && <th className="highlight-col group-start">Tổng CK</th>}
                                {visibleColumns['muaCK'] && <th>Mua CK</th>}
                                {visibleColumns['banCK'] && <th>Bán CK</th>}
                                {visibleColumns['totalBDS'] && <th className="highlight-col group-start">Tổng BĐS</th>}
                                {visibleColumns['muaBDS'] && <th>Mua BĐS</th>}
                                {visibleColumns['banBDS'] && <th>Bán BĐS</th>}
                                {visibleColumns['totalThep'] && <th className="highlight-col group-start">Tổng Thép</th>}
                                {visibleColumns['muaThep'] && <th>Mua Thép</th>}
                                {visibleColumns['banThep'] && <th>Bán Thép</th>}
                                {visibleColumns['totalVIN'] && <th className="highlight-col group-start">Tổng VIN</th>}
                                {visibleColumns['muaVIN'] && <th>Mua VIN</th>}
                                {visibleColumns['banVIN'] && <th>Bán VIN</th>}
                                {visibleColumns['tiLeNH'] && <th className="group-start text-purple">Tỉ lệ NH (%)</th>}
                                {visibleColumns['tiLeCK'] && <th className="text-purple">Tỉ lệ CK (%)</th>}
                                {visibleColumns['tiLeBDS'] && <th className="text-purple">Tỉ lệ BĐS (%)</th>}
                                {visibleColumns['tiLeThep'] && <th className="text-purple">Tỉ lệ Thép (%)</th>}
                                {visibleColumns['tiLeVIN'] && <th className="text-purple">Tỉ lệ VIN (%)</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx}>
                                    {visibleColumns['tradeDate'] && <td className="font-bold">{row.tradeDate ? format(parseISO(row.tradeDate), 'yyyy-MM-dd') : '-'}</td>}
                                    {visibleColumns['total'] && <td className="text-right font-bold text-blue">{fmtNum(row.totalValue)}</td>}

                                    {/* Ngân Hàng */}
                                    {visibleColumns['totalNH'] && <td className="text-right group-start font-bold text-yellow">{fmtNum(row.totalNH)}</td>}
                                    {visibleColumns['muaNH'] && <td className="text-right text-green">{fmtNum(row.muaNH, 0)}</td>}
                                    {visibleColumns['banNH'] && <td className="text-right text-red">{fmtNum(row.banNH, 0)}</td>}

                                    {/* Chứng Khoán */}
                                    {visibleColumns['totalCK'] && <td className="text-right group-start font-bold text-yellow">{fmtNum(row.totalCK)}</td>}
                                    {visibleColumns['muaCK'] && <td className="text-right text-green">{fmtNum(row.muaCK, 0)}</td>}
                                    {visibleColumns['banCK'] && <td className="text-right text-red">{fmtNum(row.banCK, 0)}</td>}

                                    {/* Bất Động Sản */}
                                    {visibleColumns['totalBDS'] && <td className="text-right group-start font-bold text-yellow">{fmtNum(row.totalBDS)}</td>}
                                    {visibleColumns['muaBDS'] && <td className="text-right text-green">{fmtNum(row.muaBDS, 0)}</td>}
                                    {visibleColumns['banBDS'] && <td className="text-right text-red">{fmtNum(row.banBDS, 0)}</td>}

                                    {/* Thép */}
                                    {visibleColumns['totalThep'] && <td className="text-right group-start font-bold text-yellow">{fmtNum(row.totalThep)}</td>}
                                    {visibleColumns['muaThep'] && <td className="text-right text-green">{fmtNum(row.muaThep, 0)}</td>}
                                    {visibleColumns['banThep'] && <td className="text-right text-red">{fmtNum(row.banThep, 0)}</td>}

                                    {/* VIN */}
                                    {visibleColumns['totalVIN'] && <td className="text-right group-start font-bold text-yellow">{fmtNum(row.totalVIN)}</td>}
                                    {visibleColumns['muaVIN'] && <td className="text-right text-green">{fmtNum(row.muaVIN, 0)}</td>}
                                    {visibleColumns['banVIN'] && <td className="text-right text-red">{fmtNum(row.banVIN, 0)}</td>}

                                    {/* Tỉ lệ */}
                                    {visibleColumns['tiLeNH'] && <td className={`text-right font-bold group-start ${row.tiLeNH > 15 ? 'bg-purple-dark text-white' : ''}`}>{fmtNum(row.tiLeNH, 2)}</td>}
                                    {visibleColumns['tiLeCK'] && <td className={`text-right font-bold ${row.tiLeCK > 15 ? 'bg-purple-dark text-white' : ''}`}>{fmtNum(row.tiLeCK, 2)}</td>}
                                    {visibleColumns['tiLeBDS'] && <td className={`text-right font-bold ${row.tiLeBDS > 15 ? 'bg-purple-dark text-white' : ''}`}>{fmtNum(row.tiLeBDS, 2)}</td>}
                                    {visibleColumns['tiLeThep'] && <td className={`text-right font-bold ${row.tiLeThep > 15 ? 'bg-purple-dark text-white' : ''}`}>{fmtNum(row.tiLeThep, 2)}</td>}
                                    {visibleColumns['tiLeVIN'] && <td className={`text-right font-bold ${row.tiLeVIN > 15 ? 'bg-purple-dark text-white' : ''}`}>{fmtNum(row.tiLeVIN, 2)}</td>}
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
