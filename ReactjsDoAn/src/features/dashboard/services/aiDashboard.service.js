import { api } from './market.service';

class AiDashboardService {
  getToday(params = {}) {
    return api.get('/ai/screening/today', { params }).then((response) => response.data);
  }

  getOverview() {
    return api.get('/ai/overview').then((response) => response.data);
  }

  getHistory(days = 30) {
    return api.get('/ai/history', { params: { days } }).then((response) => response.data);
  }

  getLatest(limit = 12) {
    return api.get('/ai/latest', { params: { limit } }).then((response) => response.data);
  }

  getStockDetail(symbol) {
    return api.get(`/ai/stock/${symbol}`).then((response) => response.data);
  }
}

export default new AiDashboardService();
