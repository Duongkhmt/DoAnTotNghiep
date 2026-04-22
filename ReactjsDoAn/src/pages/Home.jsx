import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import AuthModal from '../features/auth/components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { FiTrendingUp, FiShield, FiPieChart, FiArrowRight } from 'react-icons/fi';
import './Home.css';

const Home = () => {
    const [authConfig, setAuthConfig] = useState({ isOpen: false, mode: 'login' });
    const { currentUser } = useAuth();

    const openAuth = (mode) => setAuthConfig({ isOpen: true, mode });
    const closeAuth = () => setAuthConfig(prev => ({ ...prev, isOpen: false }));

    // If already logged in, redirect to dashboard
    if (currentUser) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="home-container">
            <Navbar onOpenAuth={openAuth} />

            <main className="hero-section">
                <div className="hero-content animate-fade-in">
                    <div className="badge">AI-Powered Financial Insights</div>
                    <h1 className="hero-title">
                        Master your wealth with <span className="gradient-text">intelligent accuracy</span>
                    </h1>
                    <p className="hero-subtitle">
                        Experience the next generation of financial tracking. Our advanced algorithms analyze market trends to provide personalized, real-time insights for your portfolio.
                    </p>
                    <div className="hero-actions">
                        <button
                            className="btn-primary btn-large"
                            onClick={() => openAuth('register')}
                        >
                            Get Started <FiArrowRight />
                        </button>
                        <button className="btn-secondary btn-large">
                            View Demo
                        </button>
                    </div>
                </div>

                <div className="features-grid">
                    <div className="feature-card glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="feature-icon icon-blue">
                            <FiTrendingUp size={24} />
                        </div>
                        <h3>Smart Tracking</h3>
                        <p>Monitor your entire portfolio in real-time with predictive market analysis and comprehensive charts.</p>
                    </div>

                    <div className="feature-card glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="feature-icon icon-purple">
                            <FiPieChart size={24} />
                        </div>
                        <h3>Deep Insights</h3>
                        <p>Uncover hidden patterns in your spending and investments with our AI-driven analytical engine.</p>
                    </div>

                    <div className="feature-card glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="feature-icon icon-green">
                            <FiShield size={24} />
                        </div>
                        <h3>Bank-grade Security</h3>
                        <p>Your financial data is protected with enterprise-level encryption and advanced security protocols.</p>
                    </div>
                </div>
            </main>

            <AuthModal
                isOpen={authConfig.isOpen}
                initialMode={authConfig.mode}
                onClose={closeAuth}
            />

            {/* Decorative background elements */}
            <div className="blur-circle circle-1"></div>
            <div className="blur-circle circle-2"></div>
        </div>
    );
};

export default Home;
