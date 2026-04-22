import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../features/auth/services/auth.service';
import userService from '../features/user/services/user.service';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const user = AuthService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await AuthService.login(email, password);
        setCurrentUser(data.user);
        return data;
    };

    const register = async (username, email, password, phoneNumber, address) => {
        return await AuthService.register(username, email, password, phoneNumber, address);
    };

    const logout = async () => {
        await AuthService.logout();
        setCurrentUser(null);
    };

    // Custom method to manually set user from Google redirect
    const handleGoogleLoginCallback = async (token) => {
        localStorage.setItem('accessToken', token);
        try {
            // Lấy thông tin chính xác từ Server
            const realUser = await userService.getMyInfo();
            localStorage.setItem('user', JSON.stringify(realUser));
            setCurrentUser(realUser);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin Google User từ token:", error);
            // Fallback tạm thời nếu API my-info bị lỗi
            const mockUser = { username: "Google User", email: "..." };
            localStorage.setItem('user', JSON.stringify(mockUser));
            setCurrentUser(mockUser);
        }
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        handleGoogleLoginCallback
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
