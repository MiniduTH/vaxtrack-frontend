import api from './axiosInstance';

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
};

export default authApi;
