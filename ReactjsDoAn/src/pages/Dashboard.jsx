import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { FiActivity, FiDollarSign, FiPercent } from 'react-icons/fi';
import ValuationChart from '../features/dashboard/components/ValuationChart';
import StockHistoryTable from '../features/dashboard/components/StockHistoryTable';
import ForeignTradingTable from '../features/dashboard/components/ForeignTradingTable';
import IndustryFlowTable from '../features/dashboard/components/IndustryFlowTable';
import NewsSection from '../features/dashboard/components/NewsSection';
import StockSidebar from '../features/dashboard/components/StockSidebar';
import './Dashboard.css';

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser, handleGoogleLoginCallback } = useAuth();

    // Dashboard Data View States
    const [activeTab, setActiveTab] = useState('DINH_GIA');
    const [symbol, setSymbol] = useState('PVT');
    const [date, setDate] = useState('2026-02-27');

    // Check for Google OAuth callback token
    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        if (accessToken) {
            handleGoogleLoginCallback(accessToken);
            // Remove token from URL
            navigate('/dashboard', { replace: true });
        }
    }, [searchParams, navigate, handleGoogleLoginCallback]);

    // Protected route logic
    if (!currentUser && !searchParams.get('accessToken')) {
        return <Navigate to="/" />;
    }

    return (
        <div className="dashboard-container">
            <Navbar />

            <main className="dashboard-content" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
                <nav className="dashboard-nav-tabs">
                    <button className="tab-btn">Dashboard</button>
                    <button
                        className={`tab-btn ${activeTab === 'HE_SO' ? 'active' : ''}`}
                        onClick={() => setActiveTab('HE_SO')}
                    >Hệ Số</button>
                    <button
                        className={`tab-btn ${activeTab === 'DINH_GIA' ? 'active' : ''}`}
                        onClick={() => setActiveTab('DINH_GIA')}
                    >Định Giá</button>
                    <button
                        className={`tab-btn ${activeTab === 'TIN_TUC' ? 'active' : ''}`}
                        onClick={() => setActiveTab('TIN_TUC')}
                    >Tin Tức</button>
                    <button
                        className={`tab-btn ${activeTab === 'DONG_TIEN' ? 'active' : ''}`}
                        onClick={() => setActiveTab('DONG_TIEN')}
                    >Dòng Tiền Ngành</button>
                    <button
                        className={`tab-btn ${activeTab === 'KHOI_NGOAI' ? 'active' : ''}`}
                        onClick={() => setActiveTab('KHOI_NGOAI')}
                    >Mua/Bán Các Khối</button>
                </nav>

                <div className="dashboard-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <StockSidebar selectedSymbol={symbol} onSelectSymbol={setSymbol} />

                    <div className="tab-content custom-scrollbar" style={{ flex: 1, padding: '1rem 1.5rem', overflowY: 'auto' }}>
                        {activeTab === 'DINH_GIA' && (
                            <ValuationChart symbol={symbol} date={date} onSymbolChange={setSymbol} onDateChange={setDate} />
                        )}

                        {activeTab === 'HE_SO' && (
                            <StockHistoryTable symbol={symbol} date={date} onSymbolChange={setSymbol} onDateChange={setDate} />
                        )}

                        {activeTab === 'KHOI_NGOAI' && (
                            <ForeignTradingTable symbol={symbol} date={date} onSymbolChange={setSymbol} onDateChange={setDate} />
                        )}

                        {activeTab === 'DONG_TIEN' && (
                            <IndustryFlowTable date={date} />
                        )}

                        {activeTab === 'TIN_TUC' && (
                            <NewsSection />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

// Mock Component for missing import above (for simplicity)
const FiTrendingDown = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
        <polyline points="17 18 23 18 23 12"></polyline>
    </svg>
);
const FiTrendingUp = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);

export default Dashboard;
