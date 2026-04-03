import axiosInstance from './axiosInstance';

const BASE_URL = '/api/side-effects';

/**
 * Report a new side effect (Patient)
 */
export const reportSideEffect = async (data) => {
  const response = await axiosInstance.post(BASE_URL, data);
  return response.data;
};

/**
 * Get side effects reported by the authenticated patient
 */
export const getMySideEffects = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/my`);
  return response.data;
};

/**
 * Get all side effects with optional filters (Admin/Staff only)
 * filters can include: severity, userId
 */
export const getAllSideEffects = async (filters = {}) => {
  const response = await axiosInstance.get(BASE_URL, { params: filters });
  return response.data;
};

/**
 * Get a specific side effect report by ID
 */
export const getSideEffectById = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Update an existing side effect report (symptoms, severity)
 */
export const updateSideEffect = async (id, data) => {
  const response = await axiosInstance.put(`${BASE_URL}/${id}`, data);
  return response.data;
};

/**
 * Delete a side effect report
 */
export const deleteSideEffect = async (id) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
  return response.data;
};
