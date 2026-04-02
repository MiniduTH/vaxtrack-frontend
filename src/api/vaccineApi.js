import api from './axiosInstance';

export const vaccineApi = {
  // Get all vaccines
  getVaccines: async () => {
    const response = await api.get('/vaccines');
    return response.data;
  },

  // Add a new vaccine (requires FormData for image upload)
  addVaccine: async (formData) => {
    const response = await api.post('/vaccines', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update existing vaccine (requires FormData if image is updated)
  updateVaccine: async (id, formData) => {
    const response = await api.put(`/vaccines/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete a vaccine
  deleteVaccine: async (id) => {
    const response = await api.delete(`/vaccines/${id}`);
    return response.data;
  }
};

export default vaccineApi;
