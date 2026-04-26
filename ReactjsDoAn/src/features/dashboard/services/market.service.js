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

class MarketService {
    getStockHistory(symbol) {
        return api.get(`/market/history/${symbol}`).then((res) => res.data);
    }

    getStockHistoryByDateRange(symbol, startDate, endDate) {
        return api.get(`/market/history/${symbol}/range`, {
            params: { startDate, endDate }
        }).then((res) => res.data);
    }

    getValuation(symbol, date) {
        return api.get(`/valuation/${symbol}`, {
            params: { date }
        }).then((res) => res.data);
    }

    getForeignTrading(symbol, startDate, endDate) {
        return api.get(`/foreign-trading/${symbol}`, {
            params: { startDate, endDate }
        }).then((res) => res.data);
    }

    getIndustryFlow(date) {
        return api.get('/market/industry-flow', {
            params: { date }
        }).then((res) => res.data);
    }

    getAllStocks() {
        return api.get('/stocks').then((res) => res.data);
    }

    searchStocks(keyword) {
        return api.get('/stocks/search', {
            params: { keyword }
        }).then((res) => res.data);
    }

    getLatestPredictions(limit = 20) {
        return api.get('/predictions/latest', {
            params: { limit }
        }).then((res) => res.data);
    }

    getPredictionsBySymbol(symbol, limit = 20) {
        return api.get(`/predictions/${symbol}`, {
            params: { limit }
        }).then((res) => res.data);
    }

    triggerPrediction() {
        return api.post('/ai/trigger-prediction').then((res) => res.data);
    }

    predictNow(symbols) {
        return api.post('/ai/predict-now', symbols).then((res) => res.data);
    }
}

export default new MarketService();
