import axios from 'axios';

// Vite proxy handles the base URL '/auth'
const API_URL = '/auth';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

class AuthService {
    login(email, password) {
        return api
            .post('/login', { email, password })
            .then(response => {
                if (response.data.token) {
                    localStorage.setItem('accessToken', response.data.token);
                    // Usually we'd also store user info 
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                return response.data;
            });
    }

    register(username, email, password, phoneNumber = '', address = '') {
        return api.post('/register', {
            username,
            email,
            password,
            phoneNumber,
            address
        });
    }

    logout() {
        return api.post('/logout').then(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        }).catch(() => {
            // Clear anyway
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        });
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    }

    getToken() {
        return localStorage.getItem('accessToken');
    }

    // Refresh functionality can be added here
}

export default new AuthService();
