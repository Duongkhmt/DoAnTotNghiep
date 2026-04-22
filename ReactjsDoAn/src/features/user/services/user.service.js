import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to attach the token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to catch 401s
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const oldToken = localStorage.getItem('accessToken');
                if (oldToken) {
                    // Call refresh API
                    const refreshRes = await axios.post('/auth/refresh', { token: oldToken });
                    if (refreshRes.data && refreshRes.data.token) {
                        const newToken = refreshRes.data.token;
                        localStorage.setItem('accessToken', newToken);
                        // Update original request headers and retry
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshErr) {
                console.error("401 Refresh failed. Redirecting to login...");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/login?expired=true';
                return Promise.reject(refreshErr);
            }
        }

        // If not 401 or refresh already tried/failed, logout
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login?expired=true';
        }
        return Promise.reject(error);
    }
);

class UserService {
    /**
     * Lấy thông tin cá nhân của User đang đăng nhập hiện tại
     * API: GET /api/users/my-info
     */
    getMyInfo() {
        return api.get('/users/my-info').then(res => res.data);
    }
}

export default new UserService();
