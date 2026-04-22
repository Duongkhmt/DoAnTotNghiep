import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiCalendar, FiEdit2, FiShield, FiArrowLeft } from 'react-icons/fi';
import userService from '../services/user.service';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getMyInfo();
                setProfileData(data);
            } catch (err) {
                console.error("Lỗi khi tải thông tin hồ sơ:", err);
                setError("Không thể tải thông tin lúc này. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải hồ sơ...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-error">
                <FiShield size={48} className="error-icon" />
                <h3>Đã có lỗi xảy ra</h3>
                <p>{error}</p>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        try {
            return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="profile-container animate-fade-in">
            <div className="profile-header glass-panel">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary"
                    style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', color: 'var(--text-color)' }}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="profile-cover"></div>
                <div className="profile-avatar-wrapper">
                    <div className="profile-avatar">
                        <FiUser size={64} />
                    </div>
                </div>

                <div className="profile-title-section">
                    <h1>{profileData?.username || currentUser?.username || 'Người dùng FinanceAI'}</h1>
                    <p className="profile-role">Thành viên Tiêu chuẩn</p>
                    <button className="btn-secondary edit-btn">
                        <FiEdit2 /> Cập nhật hồ sơ
                    </button>
                </div>
            </div>

            <div className="profile-details-grid">
                <div className="profile-card glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <h3>Thông tin tài khoản</h3>
                    <ul className="info-list">
                        <li>
                            <div className="info-icon"><label>ID</label></div>
                            <div className="info-value font-bold">#{profileData?.id || '---'}</div>
                        </li>
                        <li>
                            <div className="info-icon"><FiUser /> <label>Họ và Tên</label></div>
                            <div className="info-value">{profileData?.username || 'Chưa cập nhật'}</div>
                        </li>
                        <li>
                            <div className="info-icon"><FiMail /> <label>Email liên hệ</label></div>
                            <div className="info-value">{profileData?.email || 'Chưa cập nhật'}</div>
                        </li>
                        <li>
                            <div className="info-icon"><FiCalendar /> <label>Ngày tham gia</label></div>
                            <div className="info-value">{formatDate(profileData?.createdAt)}</div>
                        </li>
                    </ul>
                </div>

                <div className="profile-card glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <h3>Hoạt động gần đây</h3>
                    <div className="empty-state">
                        <p className="text-muted">Chưa có hoạt động nổi bật nào gần đây.</p>
                        <button className="btn-primary mt-3" onClick={() => navigate('/dashboard')}>Đến Bảng Điều Khiển</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
