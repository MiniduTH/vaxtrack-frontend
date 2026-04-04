import axiosInstance from './axiosInstance';

const BASE_URL = '/records';

/**
 * Get all vaccination records (Admin/Staff only)
 * Supports query params: patientId, vaccineId, hospitalId
 */
export const getAllRecords = async (params = {}) => {
  const response = await axiosInstance.get(BASE_URL, { params });
  return response.data;
};

/**
 * Get vaccination records for the current authenticated user
 */
export const getMyRecords = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/my`);
  return response.data;
};

/**
 * Get full vaccination history for the authenticated user
 * (returns grouped data: self and dependents)
 */
export const getHistory = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/history`);
  return response.data;
};

/**
 * Get upcoming and overdue vaccinations for the authenticated user and dependents
 */
export const getDueRecords = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/due`);
  return response.data;
};

/**
 * Get a specific vaccination record by ID
 */
export const getRecordById = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Create a new vaccination record (Staff/Admin only)
 */
export const createRecord = async (recordData) => {
  const response = await axiosInstance.post(BASE_URL, recordData);
  return response.data;
};

/**
 * Update an existing vaccination record (Staff/Admin only)
 */
export const updateRecord = async (id, updateData) => {
  const response = await axiosInstance.put(`${BASE_URL}/${id}`, updateData);
  return response.data;
};

/**
 * Delete a vaccination record (Admin only)
 */
export const deleteRecord = async (id) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
  return response.data;
};
