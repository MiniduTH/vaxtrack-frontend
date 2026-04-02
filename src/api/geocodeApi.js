import api from './axiosInstance';

export const geocodeApi = {
  // Geocode address via backend LocationIQ integration
  geocode: async (address, city) => {
    const response = await api.post('/geocode/test', { address, city });
    return response.data;
  },
  
  // Reverse geocode coordinates
  reverseGeocode: async (latitude, longitude) => {
    const response = await api.post('/geocode/reverse', { latitude, longitude });
    return response.data;
  }
};

export default geocodeApi;
