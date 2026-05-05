import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiCpu, FiLogOut, FiUser } from 'react-icons/fi';
import './Navbar.css';

const Navbar = ({ onOpenAuth }) => {
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
        <nav className="navbar glass-panel">
            <div className="navbar-brand">
                <Link to="/">
                    <span className="logo-text">FinanceAI</span>
                </Link>
            </div>

            <div className="navbar-actions">
                {currentUser ? (
                    <div className="user-menu">
                        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            Dashboard
                        </NavLink>
                        <NavLink to="/ai-screening" className={({ isActive }) => `nav-link nav-link-pill ${isActive ? 'active' : ''}`}>
                            <FiCpu /> AI Screening
                        </NavLink>
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
