import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import { useAuth } from '../contexts/AuthContext';
import ValuationChart from '../features/dashboard/components/ValuationChart';
import StockHistoryTable from '../features/dashboard/components/StockHistoryTable';
import ForeignTradingTable from '../features/dashboard/components/ForeignTradingTable';
import IndustryFlowTable from '../features/dashboard/components/IndustryFlowTable';
import NewsSection from '../features/dashboard/components/NewsSection';
import PredictionPanel from '../features/dashboard/components/PredictionPanel';
import StockSidebar from '../features/dashboard/components/StockSidebar';
import WyckoffChart from '../features/dashboard/components/WyckoffChart';
import './Dashboard.css';

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser, handleGoogleLoginCallback } = useAuth();

    const [activeTab, setActiveTab] = useState('DINH_GIA');
    const [symbol, setSymbol] = useState('');
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        if (accessToken) {
            handleGoogleLoginCallback(accessToken);
            navigate('/dashboard', { replace: true });
        }
    }, [searchParams, navigate, handleGoogleLoginCallback]);

    if (!currentUser && !searchParams.get('accessToken')) {
        return <Navigate to="/" />;
    }

    return (
        <div className="dashboard-container">
            <Navbar />

            <main
                className="dashboard-content"
                style={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
            >
                <nav className="dashboard-nav-tabs">
                    <button className="tab-btn">Dashboard</button>
                    <button
                        className={`tab-btn ${activeTab === 'HE_SO' ? 'active' : ''}`}
                        onClick={() => setActiveTab('HE_SO')}
                    >
                        Hệ số
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'DINH_GIA' ? 'active' : ''}`}
                        onClick={() => setActiveTab('DINH_GIA')}
                    >
                        Định giá
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'DU_BAO' ? 'active' : ''}`}
                        onClick={() => setActiveTab('DU_BAO')}
                    >
                        Dự báo AI
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'TIN_TUC' ? 'active' : ''}`}
                        onClick={() => setActiveTab('TIN_TUC')}
                    >
                        Tin tức
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'DONG_TIEN' ? 'active' : ''}`}
                        onClick={() => setActiveTab('DONG_TIEN')}
                    >
                        Dòng tiền ngành
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'KHOI_NGOAI' ? 'active' : ''}`}
                        onClick={() => setActiveTab('KHOI_NGOAI')}
                    >
                        Mua/Bán các khối
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'WYCKOFF' ? 'active' : ''}`}
                        onClick={() => setActiveTab('WYCKOFF')}
                    >
                        Wyckoff + VSA
                    </button>
                </nav>

                <div className="dashboard-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <StockSidebar selectedSymbol={symbol} onSelectSymbol={setSymbol} />

                    <div className="tab-content custom-scrollbar" style={{ flex: 1, padding: '1rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {activeTab === 'DINH_GIA' && (
                            <ValuationChart symbol={symbol} date={date} onSymbolChange={setSymbol} onDateChange={setDate} />
                        )}

                        {activeTab === 'HE_SO' && (
                            <StockHistoryTable symbol={symbol} date={date} onSymbolChange={setSymbol} onDateChange={setDate} />
                        )}

                        {activeTab === 'KHOI_NGOAI' && (
                            <ForeignTradingTable symbol={symbol} date={date} onSymbolChange={setSymbol} onDateChange={setDate} />
                        )}

                        {activeTab === 'DU_BAO' && (
                            <PredictionPanel symbol={symbol} onSymbolChange={setSymbol} />
                        )}

                        {activeTab === 'DONG_TIEN' && (
                            <IndustryFlowTable date={date} onDateChange={setDate} />
                        )}

                        {activeTab === 'WYCKOFF' && (
                            <WyckoffChart symbol={symbol} date={date} onSymbolChange={setSymbol} onDateChange={setDate} />
                        )}

                        {activeTab === 'TIN_TUC' && <NewsSection />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
