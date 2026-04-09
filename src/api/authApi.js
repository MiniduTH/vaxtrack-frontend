import api from './axiosInstance';

// POST /api/users/login → { _id, name, email, role, token }
export const loginUser = (credentials) => api.post('/users/login', credentials);

// POST /api/users → { _id, name, email, role, token }
export const registerUser = (userData) => api.post('/users', userData);

// GET /api/users/profile → user object (protected)
export const getProfile = () => api.get('/users/profile');
