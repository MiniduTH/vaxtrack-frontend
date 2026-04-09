import axiosInstance from './axiosInstance';

const appointmentApi = {
  // Get all appointments (Admin/Staff with query filters)
  getAll: async (params) => {
    const res = await axiosInstance.get('/appointments', { params });
    return res.data.data;
  },

  // Get my appointments (Patient)
  getMy: async () => {
    const res = await axiosInstance.get('/appointments/my');
    return res.data.data;
  },

  // Get clinic queue (Staff)
  getClinicQueue: async (clinicId) => {
    const res = await axiosInstance.get(`/appointments/clinic/${clinicId}`);
    return res.data.data;
  },

  // Book an appointment
  book: async (data) => {
    const res = await axiosInstance.post('/appointments', data);
    return res.data.data;
  },

  // Cancel my appointment
  cancel: async (id) => {
    const res = await axiosInstance.patch(`/appointments/${id}/cancel`);
    return res.data.data;
  },

  // Update status (Staff: Completed, No-Show)
  updateStatus: async (id, status) => {
    const res = await axiosInstance.patch(`/appointments/${id}/status`, { status });
    return res.data.data;
  },

  // Delete appointment (Admin)
  delete: async (id) => {
    const res = await axiosInstance.delete(`/appointments/${id}`);
    return res.data.data;
  }
};

export default appointmentApi;
