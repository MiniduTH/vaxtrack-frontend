import api from './axiosInstance';

export const batchApi = {
  // Get all batches, allowing optional query parameters for filtering
  // Usage: getBatches({ status: 'Available', vaccineId: '...' })
  getBatches: async (params = {}) => {
    const response = await api.get('/batches', { params });
    return response.data;
  },

  // Add a new batch
  addBatch: async (data) => {
    const response = await api.post('/batches', data);
    return response.data;
  },

  // Update an existing batch
  updateBatch: async (id, data) => {
    const response = await api.put(`/batches/${id}`, data);
    return response.data;
  },

  // Delete a batch
  deleteBatch: async (id) => {
    const response = await api.delete(`/batches/${id}`);
    return response.data;
  }
};

export default batchApi;
