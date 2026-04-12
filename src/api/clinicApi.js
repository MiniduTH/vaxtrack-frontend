import api from './axiosInstance';

export const clinicApi = {
  // Get all clinics
  getClinics: async (params = {}) => {
    const response = await api.get('/clinics', { params });
    return response.data;
  },
  // Get clinics by hospital ID
  getClinicsByHospital: async (hospitalId) => {
    const response = await api.get(`/clinics/hospital/${hospitalId}`);
    return response.data;
  },
  // Get clinic by ID
  getClinicById: async (id) => {
    const response = await api.get(`/clinics/${id}`);
    return response.data;
  },
  // Create a new clinic
  createClinic: async (data) => {
    const response = await api.post('/clinics', data);
    return response.data;
  },
  // Update an existing clinic
  updateClinic: async (id, data) => {
    const response = await api.put(`/clinics/${id}`, data);
    return response.data;
  },
  // Update clinic capacity
  updateClinicCapacity: async (id, capacity) => {
    const response = await api.patch(`/clinics/${id}/capacity`, { capacity });
    return response.data;
  },
  // Delete a clinic
  deleteClinic: async (id) => {
    const response = await api.delete(`/clinics/${id}`);
    return response.data;
  }
};

export default clinicApi;
