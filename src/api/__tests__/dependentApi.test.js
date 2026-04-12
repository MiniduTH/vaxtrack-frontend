import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as dependentApiModule from '../dependentApi';

vi.mock('../axiosInstance', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../axiosInstance';

describe('dependentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: [] });
    api.post.mockResolvedValue({ data: {} });
    api.put.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({ data: {} });
  });

  it('getDependents — GETs /users/dependents', () => {
    dependentApiModule.dependentApi.getDependents();
    expect(api.get).toHaveBeenCalledWith('/users/dependents');
  });

  it('addDependent — POSTs to /users/dependents with payload', () => {
    const payload = { name: 'Alice', relationship: 'Child', dateOfBirth: '2018-01-01', gender: 'Female' };
    dependentApiModule.dependentApi.addDependent(payload);
    expect(api.post).toHaveBeenCalledWith('/users/dependents', payload);
  });

  it('updateDependent — PUTs to /users/dependents/:id with payload', () => {
    const id = 'dep-123';
    const payload = { name: 'Alice Updated', relationship: 'Child' };
    dependentApiModule.dependentApi.updateDependent(id, payload);
    expect(api.put).toHaveBeenCalledWith('/users/dependents/dep-123', payload);
  });

  it('deleteDependent — DELETEs /users/dependents/:id', () => {
    dependentApiModule.dependentApi.deleteDependent('dep-456');
    expect(api.delete).toHaveBeenCalledWith('/users/dependents/dep-456');
  });

  it('getDependents — returns response data', async () => {
    const mockData = [{ _id: 'd1', name: 'Alice' }];
    api.get.mockResolvedValue({ data: mockData });
    const result = await dependentApiModule.dependentApi.getDependents();
    expect(result).toEqual(mockData);
  });

  it('addDependent — returns response data', async () => {
    const mockData = { _id: 'd2', name: 'Bob' };
    api.post.mockResolvedValue({ data: mockData });
    const result = await dependentApiModule.dependentApi.addDependent({ name: 'Bob' });
    expect(result).toEqual(mockData);
  });

  it('updateDependent — returns response data', async () => {
    const mockData = { _id: 'd1', name: 'Alice Updated' };
    api.put.mockResolvedValue({ data: mockData });
    const result = await dependentApiModule.dependentApi.updateDependent('d1', { name: 'Alice Updated' });
    expect(result).toEqual(mockData);
  });

  it('deleteDependent — returns response data', async () => {
    const mockData = { message: 'Deleted' };
    api.delete.mockResolvedValue({ data: mockData });
    const result = await dependentApiModule.dependentApi.deleteDependent('d1');
    expect(result).toEqual(mockData);
  });
});
