import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiCpu, FiLogOut, FiUser, FiLayout } from 'react-icons/fi';
import './Navbar.css';

const Navbar = ({ onOpenAuth, isScrolled }) => {
    const { currentUser, logout } = useAuth();

    const handleLogout = async (e) => {
        e?.preventDefault();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        try {
            await logout();
        } catch (error) {
            console.log('Ignore backend logout error');
        } finally {
            window.location.href = '/';
        }
    };

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">

                <div className="navbar-brand">
                    <Link to="/" className="logo-link">
                        <div className="logo-icon">
                            <FiLayout />
                        </div>
                        <span className="logo-text">Finance<span className="text-primary">AI</span></span>
                    </Link>
                </div>

                <div className="navbar-actions">
                    {currentUser ? (
                        <div className="user-menu">
                            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                Bảng điều khiển
                            </NavLink>
                            <NavLink to="/ai-screening" className={({ isActive }) => `nav-link nav-link-pill ${isActive ? 'active' : ''}`}>
                                <FiCpu /> Lọc AI
                            </NavLink>
                            <Link to="/profile" className="user-profile">
                                <div className="avatar">
                                    {currentUser.avatarUrl ? (
                                        <img src={currentUser.avatarUrl} alt="avatar" />
                                    ) : (
                                        <FiUser />
                                    )}
                                </div>
                                <span className="username">{currentUser.username}</span>
                            </Link>
                            <button onClick={handleLogout} className="btn-logout" title="Đăng xuất">
                                <FiLogOut />
                            </button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <button onClick={() => onOpenAuth && onOpenAuth('login')} className="btn-ghost">
                                Đăng nhập
                            </button>
                            <button onClick={() => onOpenAuth && onOpenAuth('register')} className="btn-primary btn-sm">
                                Đăng ký
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </nav>
    );
};

export default Navbar;

