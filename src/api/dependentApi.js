import api from './axiosInstance';

export const dependentApi = {
  // Get all dependents for the logged-in user
  getDependents: async () => {
    const response = await api.get('/users/dependents');
    return response.data;
  },

  // Add a new dependent
  addDependent: async (data) => {
    const response = await api.post('/users/dependents', data);
    return response.data;
  },

  // Update existing dependent
  updateDependent: async (id, data) => {
    const response = await api.put(`/users/dependents/${id}`, data);
    return response.data;
  },

  // Delete dependent
  deleteDependent: async (id) => {
    const response = await api.delete(`/users/dependents/${id}`);
    return response.data;
  }
};

export default dependentApi;
