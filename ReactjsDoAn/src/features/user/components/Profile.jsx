import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiCalendar, FiEdit2, FiShield, FiArrowLeft, FiMapPin, FiPhone, FiCamera, FiCheck, FiX } from 'react-icons/fi';
import userService from '../services/user.service';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
    const { currentUser, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        address: '',
        phoneNumber: ''
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getMyInfo();
                setProfileData(data);
                setFormData({
                    username: data.username || '',
                    address: data.address || '',
                    phoneNumber: data.phoneNumber || ''
                });
            } catch (err) {
                console.error("Lỗi khi tải thông tin hồ sơ:", err);
                setError("Không thể tải thông tin lúc này. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const updatedUser = await userService.updateMyInfo(formData);
            setProfileData(updatedUser);
            setIsEditing(false);
            await refreshUser();
            alert("Cập nhật thông tin thành công!");
        } catch (err) {
            console.error("Lỗi khi cập nhật hồ sơ:", err);
            alert("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn tệp hình ảnh!');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('Dung lượng ảnh không được vượt quá 2MB!');
            return;
        }

        setUploading(true);
        try {
            const updatedUser = await userService.uploadAvatar(file);
            setProfileData(updatedUser);
            await refreshUser();
            alert("Cập nhật ảnh đại diện thành công!");
        } catch (err) {
            console.error("Lỗi khi tải lên ảnh đại diện:", err);
            alert("Không thể tải lên ảnh đại diện. Vui lòng thử lại.");
        } finally {
            setUploading(false);
        }
    };

    if (loading && !profileData) {
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
                
                <div className="profile-avatar-wrapper" onClick={handleAvatarClick} title="Nhấp để đổi ảnh đại diện">
                    <div className={`profile-avatar ${uploading ? 'uploading' : ''}`}>
                        {profileData?.avatarUrl ? (
                            <img src={profileData.avatarUrl} alt="Avatar" />
                        ) : (
                            <FiUser size={64} />
                        )}
                        <div className="avatar-overlay">
                            <FiCamera size={24} />
                        </div>
                        {uploading && <div className="avatar-spinner"></div>}
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                    />
                </div>

                <div className="profile-title-section">
                    <h1>{profileData?.username || currentUser?.username || 'Người dùng FinanceAI'}</h1>
                    <p className="profile-role">Thành viên Tiêu chuẩn</p>
                    
                    {!isEditing ? (
                        <button className="btn-secondary edit-btn" onClick={() => setIsEditing(true)}>
                            <FiEdit2 /> Cập nhật hồ sơ
                        </button>
                    ) : (
                        <div className="edit-actions">
                            <button className="btn-primary save-btn" onClick={handleSave} disabled={loading}>
                                <FiCheck /> Lưu
                            </button>
                            <button className="btn-secondary cancel-btn" onClick={() => setIsEditing(false)} disabled={loading}>
                                <FiX /> Hủy
                            </button>
                        </div>
                    )}
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
                            <div className="info-value">
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        name="username" 
                                        value={formData.username} 
                                        onChange={handleInputChange}
                                        className="edit-input"
                                    />
                                ) : (
                                    profileData?.username || 'Chưa cập nhật'
                                )}
                            </div>
                        </li>
                        <li>
                            <div className="info-icon"><FiMail /> <label>Email liên hệ</label></div>
                            <div className="info-value">{profileData?.email || 'Chưa cập nhật'}</div>
                        </li>
                        <li>
                            <div className="info-icon"><FiMapPin /> <label>Địa chỉ</label></div>
                            <div className="info-value">
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        name="address" 
                                        value={formData.address} 
                                        onChange={handleInputChange}
                                        className="edit-input"
                                    />
                                ) : (
                                    profileData?.address || 'Chưa cập nhật'
                                )}
                            </div>
                        </li>
                        <li>
                            <div className="info-icon"><FiPhone /> <label>Số điện thoại</label></div>
                            <div className="info-value">
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        name="phoneNumber" 
                                        value={formData.phoneNumber} 
                                        onChange={handleInputChange}
                                        className="edit-input"
                                    />
                                ) : (
                                    profileData?.phoneNumber || 'Chưa cập nhật'
                                )}
                            </div>
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
