import api from './axiosInstance';

// Book a new appointment
// Body: { clinicId, dependentId? }
export const bookAppointment = (data) => api.post('/appointments', data);

// Get appointments for the logged-in user
export const getMyAppointments = () => api.get('/appointments/my');

// Get a single appointment by ID
export const getAppointmentById = (id) => api.get(`/appointments/${id}`);

// Cancel a pending appointment (decrements clinic.bookedCount)
export const cancelAppointment = (id) => api.patch(`/appointments/${id}/cancel`);

// Staff: update status → 'Completed' | 'No-Show'
export const updateAppointmentStatus = (id, status) =>
  api.patch(`/appointments/${id}/status`, { status });

// Staff/Admin: full update (status to any valid value)
export const updateAppointment = (id, data) => api.put(`/appointments/${id}`, data);

// Admin: get all appointments with optional filters
// params: { status, clinicId, userId }
export const getAllAppointments = (params) =>
  api.get('/appointments', { params });

// Staff: get queue for a specific clinic (sorted by queueNumber)
export const getClinicQueue = (clinicId) =>
  api.get(`/appointments/clinic/${clinicId}`);

// Admin: delete an appointment
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);
