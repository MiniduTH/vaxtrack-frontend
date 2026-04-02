import api from './axiosInstance';

export const hospitalApi = {
  // Get all hospitals (needed for populating batch assignment dropdowns)
  getHospitals: async (params = {}) => {
    const response = await api.get('/hospitals', { params });
    return response.data;
  }
};

export default hospitalApi;
