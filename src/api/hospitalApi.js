import api from './axiosInstance';

export const hospitalApi = {
  // Get all hospitals
  getHospitals: async (params = {}) => {
    const response = await api.get('/hospitals', { params });
    return response.data;
  },
  // Get hospital by ID
  getHospitalById: async (id) => {
    const response = await api.get(`/hospitals/${id}`);
    return response.data;
  },
  // Create a new hospital
  createHospital: async (data) => {
    const response = await api.post('/hospitals', data);
    return response.data;
  },
  // Update an existing hospital
  updateHospital: async (id, data) => {
    const response = await api.put(`/hospitals/${id}`, data);
    return response.data;
  },
  // Delete a hospital
  deleteHospital: async (id) => {
    const response = await api.delete(`/hospitals/${id}`);
    return response.data;
  }
};

export default hospitalApi;
