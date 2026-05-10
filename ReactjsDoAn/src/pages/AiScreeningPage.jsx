import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import { useAuth } from '../contexts/AuthContext';
import PredictionPanel from '../features/dashboard/components/PredictionPanel';
import ErrorBoundary from '../components/ErrorBoundary';
import './AiScreeningPage.css';

const AiScreeningPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser, handleGoogleLoginCallback } = useAuth();
    const [symbol, setSymbol] = useState('');

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        if (accessToken) {
            handleGoogleLoginCallback(accessToken);
            navigate('/ai-screening', { replace: true });
        }
    }, [searchParams, navigate, handleGoogleLoginCallback]);

    if (!currentUser && !searchParams.get('accessToken')) {
        return <Navigate to="/" />;
    }

    return (
        <div className="ai-page-shell">
            <Navbar />
            <main className="ai-page-main">
                <section className="ai-page-intro glass-panel">
                    <div>
                        <p className="ai-page-kicker">Dedicated AI Workspace</p>
                        <h1>AI Stock Screening</h1>
                        <p>
                            Khong gian rieng cho bo loc co phieu, overview thi truong, lich su hit-rate va drill-down tung ma
                            tu pipeline XGBoost hien tai.
                        </p>
                    </div>
                    <div className="ai-page-badges">
                        <span>Screening Today</span>
                        <span>Market Breadth</span>
                        <span>Stock Detail</span>
                    </div>
                </section>

                <section className="ai-page-workspace">
                    <ErrorBoundary>
                        <PredictionPanel symbol={symbol} onSymbolChange={setSymbol} />
                    </ErrorBoundary>
                </section>
            </main>
        </div>
    );
};

export default AiScreeningPage;
