import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { FiX, FiGithub, FiMail, FiLock, FiUser, FiPhone, FiMapPin } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const { login, register } = useAuth();

    React.useEffect(() => {
        if (isOpen) {
            setIsLogin(initialMode === 'login');
            setError('');
        }
    }, [isOpen, initialMode]);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phoneNumber: '',
        address: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                onClose(); // Close modal on success
            } else {
                await register(
                    formData.username,
                    formData.email,
                    formData.password,
                    formData.phoneNumber,
                    formData.address
                );
                // Switch to login after successful register
                setIsLogin(true);
                setError('Registration successful! Please sign in.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Gọi thẳng vào luồng filter chuẩn của Spring Security
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <FiX size={24} />
                </button>

                <div className="modal-header">
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>{isLogin ? 'Sign in to access your dashboard' : 'Join us to get started'}</p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div className="input-with-icon">
                                <FiUser className="input-icon" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-with-icon">
                            <FiMail className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="example@gmail.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-with-icon">
                            <FiLock className="input-icon" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Phone Number (Optional)</label>
                                <div className="input-with-icon">
                                    <FiPhone className="input-icon" />
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="0123456789"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address (Optional)</label>
                                <div className="input-with-icon">
                                    <FiMapPin className="input-icon" />
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="123 Main St"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="divider">
                    <span>or continue with</span>
                </div>

                <div className="social-auth">
                    <button type="button" onClick={handleGoogleLogin} className="btn-social google">
                        <FcGoogle size={20} /> Google
                    </button>
                </div>

                <div className="auth-footer">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span
                        className="toggle-auth"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
