import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const oldToken = localStorage.getItem('accessToken');
                if (oldToken) {
                    const refreshRes = await axios.post('/auth/refresh', { token: oldToken });
                    if (refreshRes.data && refreshRes.data.token) {
                        const newToken = refreshRes.data.token;
                        localStorage.setItem('accessToken', newToken);
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshErr) {
                console.error('401 refresh failed. Redirecting to home...');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/?expired=true';
                return Promise.reject(refreshErr);
            }
        }

        if (error.response && error.response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/?expired=true';
        }
        return Promise.reject(error);
    }
);

class UserService {
    getMyInfo() {
        return api.get('/users/my-info').then((res) => res.data);
    }
}

export default new UserService();
