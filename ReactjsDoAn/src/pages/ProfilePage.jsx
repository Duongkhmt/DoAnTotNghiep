import React from 'react';
import Navbar from '../layouts/Navbar';
import Profile from '../features/user/components/Profile';

const ProfilePage = () => {
    return (
        <div className="dashboard-container">
            <Navbar />
            <main style={{ flex: 1, backgroundColor: 'var(--bg-color)', overflowY: 'auto' }}>
                <Profile />
            </main>
        </div>
    );
};

export default ProfilePage;
