import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import AuthModal from '../features/auth/components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { FiTrendingUp, FiShield, FiPieChart, FiArrowRight, FiActivity, FiGlobe, FiZap } from 'react-icons/fi';
import './Home.css';

const Home = () => {
    const [authConfig, setAuthConfig] = useState({ isOpen: false, mode: 'login' });
    const { currentUser } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const openAuth = (mode) => setAuthConfig({ isOpen: true, mode });
    const closeAuth = () => setAuthConfig(prev => ({ ...prev, isOpen: false }));

    if (currentUser) {
        return <Navigate to="/dashboard" />;
    }

    const tickerItems = [
        { name: 'VNINDEX', value: '1,245.6', change: '+1.2%', up: true },
        { name: 'HNX', value: '234.1', change: '-0.4%', up: false },
        { name: 'FPT', value: '112.5', change: '+2.5%', up: true },
        { name: 'VCB', value: '92.1', change: '+0.8%', up: true },
        { name: 'HPG', value: '28.4', change: '-1.2%', up: false },
        { name: 'VIC', value: '45.2', change: '+0.5%', up: true },
    ];

    return (
        <div className="home-wrapper">
            <Navbar onOpenAuth={openAuth} isScrolled={scrolled} />

            {/* Hero Section */}
            <section className="hero-v2">
                <div className="container hero-container-v2">
                    <div className="hero-text-content animate-fade-in">
                        <div className="status-badge">
                            <span className="dot"></span>
                            Đang phân tích thị trường trực tiếp
                        </div>
                        <h1 className="hero-title-v2">
                            Nâng tầm <span className="text-gradient-primary">Tài sản</span> Với AI Chính Xác
                        </h1>
                        <p className="hero-description">
                            Nền tảng tối ưu cho các nhà đầu tư hiện đại. Tận dụng máy học tiên tiến để theo dõi, phân tích và tối ưu hóa danh mục đầu tư của bạn với thông tin chuyên sâu cấp tổ chức.
                        </p>
                        <div className="hero-btns">
                            <button className="btn-primary btn-glow" onClick={() => openAuth('register')}>
                                Bắt đầu đầu tư miễn phí <FiArrowRight />
                            </button>
                            <button className="btn-secondary" onClick={() => openAuth('login')}>
                                Xem bản thử nghiệm
                            </button>
                        </div>
                        <div className="hero-trust">
                            <span>Được tin dùng bởi hơn 10.000 nhà đầu tư</span>
                            <div className="trust-icons">
                                <div className="trust-dot"></div>
                                <div className="trust-dot"></div>
                                <div className="trust-dot"></div>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="dashboard-preview-wrapper">
                            <img
                                src="/dashboard_mockup_1778725603265.png"
                                alt="FinanceAI Dashboard Preview"
                                className="dashboard-img"
                            />
                            <div className="floating-card stat-card-1 glass-panel">
                                <FiActivity className="text-emerald" />
                                <div>
                                    <span className="label">Lợi nhuận trực tiếp</span>
                                    <span className="value">+24.8%</span>
                                </div>
                            </div>
                            <div className="floating-card stat-card-2 glass-panel">
                                <FiZap className="text-amber" />
                                <div>
                                    <span className="label">Điểm AI</span>
                                    <span className="value">98.2</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ticker Bar */}
            <div className="ticker-wrap">
                <div className="ticker">
                    {[...tickerItems, ...tickerItems].map((item, i) => (
                        <div key={i} className="ticker-item">
                            <span className="ticker-name">{item.name}</span>
                            <span className="ticker-value">{item.value}</span>
                            <span className={`ticker-change ${item.up ? 'up' : 'down'}`}>
                                {item.change}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <section className="features-v2 container">
                <div className="section-header">
                    <h2 className="section-title">Xây dựng cho <span className="text-gradient-primary">Tương lai Tài chính</span></h2>
                    <p className="section-subtitle">Mọi thứ bạn cần để vượt trội hơn thị trường, tất cả trong một giao diện liền mạch.</p>
                </div>

                <div className="features-grid-v2">
                    <div className="feature-card-v2 glass-panel animate-fade-in">
                        <div className="icon-box purple">
                            <FiTrendingUp />
                        </div>
                        <h3>Xếp hạng Alpha</h3>
                        <p>AI độc quyền của chúng tôi xếp hạng các cổ phiếu dựa trên hơn 50 chỉ số kỹ thuật và cơ bản để tìm ra những mã tiềm năng tiếp theo.</p>
                    </div>

                    <div className="feature-card-v2 glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="icon-box blue">
                            <FiPieChart />
                        </div>
                        <h3>Sức khỏe Danh mục</h3>
                        <p>Báo cáo trực quan về phân bổ tài sản, rủi ro và hiệu suất lịch sử với tính năng theo dõi thời gian thực.</p>
                    </div>

                    <div className="feature-card-v2 glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="icon-box emerald">
                            <FiShield />
                        </div>
                        <h3>Cảnh báo Thông minh</h3>
                        <p>Nhận thông báo ngay lập tức khi AI phát hiện khối lượng thị trường hoặc mô hình giá bất thường cho các mã bạn đang theo dõi.</p>
                    </div>

                    <div className="feature-card-v2 glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="icon-box amber">
                            <FiGlobe />
                        </div>
                        <h3>Thông tin Thị trường Toàn cầu</h3>
                        <p>Tổng hợp tin tức và phân tích tâm lý từ hàng ngàn nguồn để mang lại cho bạn bức tranh toàn cảnh về thị trường.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section container">
                <div className="cta-card glass-panel">
                    <h2>Sẵn sàng thay đổi cách bạn giao dịch?</h2>
                    <p>Tham gia cùng hàng ngàn nhà đầu tư đang sử dụng FinanceAI để giành lợi thế cạnh tranh.</p>
                    <button className="btn-primary btn-large" onClick={() => openAuth('register')}>
                        Bắt đầu ngay miễn phí
                    </button>
                    <div className="cta-bg-glow"></div>
                </div>
            </section>

            <footer className="home-footer container">
                <div className="footer-content">
                    <div className="footer-brand">FinanceAI</div>
                    <div className="footer-links">
                        <a href="#">Bảo mật</a>
                        <a href="#">Điều khoản</a>
                        <a href="#">Hỗ trợ</a>
                    </div>
                    <div className="footer-copy">© 2026 FinanceAI. Tất cả quyền được bảo lưu.</div>
                </div>
            </footer>


            <AuthModal
                isOpen={authConfig.isOpen}
                initialMode={authConfig.mode}
                onClose={closeAuth}
            />

            {/* Background Decorations */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>
        </div>
    );
};

export default Home;

