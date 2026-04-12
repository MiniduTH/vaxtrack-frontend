import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as batchApiModule from '../batchApi';

vi.mock('../axiosInstance', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../axiosInstance';

describe('batchApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: [] });
    api.post.mockResolvedValue({ data: {} });
    api.put.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({ data: {} });
  });

  it('getBatches — GETs /batches with empty params by default', () => {
    batchApiModule.batchApi.getBatches();
    expect(api.get).toHaveBeenCalledWith('/batches', { params: {} });
  });

  it('getBatches — GETs /batches with provided filter params', () => {
    const params = { status: 'Available', vaccineId: 'v1' };
    batchApiModule.batchApi.getBatches(params);
    expect(api.get).toHaveBeenCalledWith('/batches', { params });
  });

  it('getBatches — returns response data', async () => {
    const mockData = [{ _id: 'b1', batchNumber: 'BATCH-001' }];
    api.get.mockResolvedValue({ data: mockData });
    const result = await batchApiModule.batchApi.getBatches();
    expect(result).toEqual(mockData);
  });

  it('addBatch — POSTs to /batches with payload', () => {
    const payload = {
      batchNumber: 'BATCH-NEW',
      vaccineId: 'v1',
      hospitalId: 'h1',
      quantity: 500,
      status: 'Available',
      arrivalDate: '2026-01-01',
      expiryDate: '2027-01-01',
    };
    batchApiModule.batchApi.addBatch(payload);
    expect(api.post).toHaveBeenCalledWith('/batches', payload);
  });

  it('addBatch — returns response data', async () => {
    const mockData = { _id: 'b2', batchNumber: 'BATCH-NEW' };
    api.post.mockResolvedValue({ data: mockData });
    const result = await batchApiModule.batchApi.addBatch({ batchNumber: 'BATCH-NEW' });
    expect(result).toEqual(mockData);
  });

  it('updateBatch — PUTs to /batches/:id with payload', () => {
    const id = 'batch-123';
    const payload = { quantity: 300, status: 'Depleted' };
    batchApiModule.batchApi.updateBatch(id, payload);
    expect(api.put).toHaveBeenCalledWith('/batches/batch-123', payload);
  });

  it('updateBatch — returns response data', async () => {
    const mockData = { _id: 'b1', quantity: 300 };
    api.put.mockResolvedValue({ data: mockData });
    const result = await batchApiModule.batchApi.updateBatch('b1', { quantity: 300 });
    expect(result).toEqual(mockData);
  });

  it('deleteBatch — DELETEs /batches/:id', () => {
    batchApiModule.batchApi.deleteBatch('batch-456');
    expect(api.delete).toHaveBeenCalledWith('/batches/batch-456');
  });

  it('deleteBatch — returns response data', async () => {
    const mockData = { message: 'Batch deleted' };
    api.delete.mockResolvedValue({ data: mockData });
    const result = await batchApiModule.batchApi.deleteBatch('b1');
    expect(result).toEqual(mockData);
  });
});
