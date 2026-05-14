import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { FiX, FiMail, FiLock, FiUser, FiPhone, FiMapPin } from 'react-icons/fi';
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
                onClose();
            } else {
                await register(
                    formData.username,
                    formData.email,
                    formData.password,
                    formData.phoneNumber,
                    formData.address
                );
                setIsLogin(true);
                setError('Đăng ký thành công. Hãy đăng nhập.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8082/oauth2/authorization/google';
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <FiX size={24} />
                </button>

                <div className="modal-header">
                    <h2>{isLogin ? 'Chào mừng quay trở lại' : 'Tạo tài khoản mới'}</h2>
                    <p>{isLogin ? 'Đăng nhập để truy cập bảng điều khiển của bạn' : 'Tham gia cùng chúng tôi để bắt đầu đầu tư'}</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">Họ và tên</label>
                            <div className="input-with-icon">
                                <FiUser className="input-icon" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Nguyễn Văn A"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Địa chỉ Email</label>
                        <div className="input-with-icon">
                            <FiMail className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="vi-du@gmail.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <div className="input-with-icon">
                            <FiLock className="input-icon" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="********"
                                required
                                minLength={8}
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Số điện thoại (Tùy chọn)</label>
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
                                <label className="form-label">Địa chỉ (Tùy chọn)</label>
                                <div className="input-with-icon">
                                    <FiMapPin className="input-icon" />
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="Hà Nội, Việt Nam"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
                    </button>
                </form>

                <div className="divider">
                    <span>hoặc tiếp tục với</span>
                </div>

                <div className="social-auth">
                    <button type="button" onClick={handleGoogleLogin} className="btn-social google">
                        <FcGoogle size={20} /> Google
                    </button>
                </div>

                <div className="auth-footer">
                    {isLogin ? "Chưa có tài khoản? " : 'Đã có tài khoản? '}
                    <span
                        className="toggle-auth"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                    >
                        {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                    </span>
                </div>

            </div>
        </div>
    );
};

export default AuthModal;
