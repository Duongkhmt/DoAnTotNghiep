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
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to catch 401 Token Expiration
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

class MarketService {
    getStockHistory(symbol) {
        return api.get(`/market/history/${symbol}`).then(res => res.data);
    }

    // Lấy dữ liệu theo khoảng thời gian để vẽ Biểu đồ định giá
    getStockHistoryByDateRange(symbol, startDate, endDate) {
        return api.get(`/market/history/${symbol}/range`, {
            params: { startDate, endDate }
        }).then(res => res.data);
    }

    // 2. Định Giá (Valuation - Biểu đồ và thông kê P/E, P/B)
    getValuation(symbol, date) {
        return api.get(`/valuation/${symbol}`, {
            params: { date }
        }).then(res => res.data);
    }

    // 3. Mua/Bán Các Khối (Foreign & Prop Trading)
    getForeignTrading(symbol, startDate, endDate) {
        return api.get(`/foreign-trading/${symbol}`, {
            params: { startDate, endDate }
        }).then(res => res.data);
    }

    // 4. Dòng Tiền Ngành (Industry Cash Flow)
    getIndustryFlow(date) {
        return api.get(`/market/industry-flow`, {
            params: { date }
        }).then(res => res.data);
    }

    // 5. Lấy danh sách tất cả mã cổ phiếu
    getAllStocks() {
        return api.get(`/stocks`).then(res => res.data);
    }

    // 6. Tìm kiếm mã cổ phiếu
    searchStocks(keyword) {
        return api.get(`/stocks/search`, {
            params: { keyword }
        }).then(res => res.data);
    }
}

export default new MarketService();
