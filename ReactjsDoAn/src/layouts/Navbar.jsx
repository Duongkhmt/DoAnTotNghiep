import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';
import './Navbar.css';

const Navbar = ({ onOpenAuth }) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async (e) => {
        // Ngăn chặn các sự kiện mặc định của trình duyệt gây lag
        e?.preventDefault();

        // 1. DỌN SẠCH FRONTEND NGAY LẬP TỨC (Không cần đợi Backend phản hồi)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        try {
            // 2. Gửi lệnh báo Backend vô hiệu hóa Token
            await logout();
        } catch (error) {
            console.log("Bỏ qua lỗi từ Backend");
        } finally {
            // 3. Force F5 toàn bộ trang đích để xóa hẳn bộ nhớ đệm React
            window.location.href = '/';
        }
    };


    return (
        <nav className="navbar glass-panel">
            <div className="navbar-brand">
                <Link to="/">
                    <span className="logo-text">FinanceAI</span>
                </Link>
            </div>

            <div className="navbar-actions">
                {currentUser ? (
                    <div className="user-menu">
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        <Link to="/profile" className="user-profile" style={{ textDecoration: 'none' }}>
                            <div className="avatar">
                                {currentUser.avatarUrl ? (
                                    <img src={currentUser.avatarUrl} alt="avatar" />
                                ) : (
                                    <FiUser />
                                )}
                            </div>
                            <span className="username">{currentUser.username}</span>
                        </Link>
                        <button onClick={handleLogout} className="btn-logout">
                            <FiLogOut /> Logout
                        </button>
                    </div>
                ) : (
                    <div className="auth-buttons" style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => onOpenAuth && onOpenAuth('login')} className="btn-secondary animate-fade-in">
                            Sign In
                        </button>
                        <button onClick={() => onOpenAuth && onOpenAuth('register')} className="btn-primary animate-fade-in">
                            Sign Up
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
