import api from './axiosInstance';

export const inventoryApi = {
  // Get aggregated inventory stats (e.g., total stock per vaccine, overall warnings)
  getSummary: async () => {
    const response = await api.get('/inventory/summary');
    return response.data;
  },

  // Get specific low stock warnings
  getLowStock: async (threshold = 100) => {
    const response = await api.get('/inventory/low-stock', { params: { threshold } });
    return response.data;
  },

  // Get batches that are expiring soon (e.g., within next 30 days)
  getExpiringSoon: async (days = 30) => {
    const response = await api.get('/inventory/expiring', { params: { days } });
    return response.data;
  }
};

export default inventoryApi;
