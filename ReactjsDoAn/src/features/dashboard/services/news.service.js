import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

class NewsService {
    getStockNews() {
        return api.get('/news/stock').then(res => res.data);
    }

    getNewsDetail(url) {
        return api.get(`/news/detail?url=${encodeURIComponent(url)}`).then(res => res.data);
    }

    summarizeNews(url) {
        return api.get(`/news/summarize?url=${encodeURIComponent(url)}`).then(res => res.data);
    }
}

export default new NewsService();
