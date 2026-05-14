import React, { useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import { useAuth } from '../contexts/AuthContext';
import AiDashboard from '../features/dashboard/components/AiDashboard';
import Navbar from '../layouts/Navbar';
import './AiScreeningPage.css';

const AiScreeningPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, handleGoogleLoginCallback } = useAuth();

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
        <ErrorBoundary>
          <AiDashboard />
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default AiScreeningPage;
