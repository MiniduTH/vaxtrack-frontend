import api from './axiosInstance';

// POST /api/users/login → { _id, name, email, role, token }
export const loginUser = (credentials) => api.post('/users/login', credentials);

// POST /api/users → { _id, name, email, role, token }
export const registerUser = (userData) => api.post('/users', userData);

// GET /api/users/profile → user object (protected)
export const getProfile = () => api.get('/users/profile');

// PUT /api/users/profile → updated user object (protected)
export const updateProfile = (data) => api.put('/users/profile', data);

/**
 * Search patients by NIC, name, or ObjectId (Staff/Admin only)
 * GET /api/users/search?q=<query>
 * Returns { success, count, data: [{ _id, name, email, nic, role, phone }] }
 */
export const searchPatients = (query) =>
  api.get('/users/search', { params: { q: query } });
