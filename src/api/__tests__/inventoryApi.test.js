import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as inventoryApiModule from '../inventoryApi';

vi.mock('../axiosInstance', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from '../axiosInstance';

describe('inventoryApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: {} });
  });

  it('getSummary — GETs /inventory/summary', () => {
    inventoryApiModule.inventoryApi.getSummary();
    expect(api.get).toHaveBeenCalledWith('/inventory/summary');
  });

  it('getSummary — returns response data', async () => {
    const mockData = { totalBatches: 10, criticalItems: 2 };
    api.get.mockResolvedValue({ data: mockData });
    const result = await inventoryApiModule.inventoryApi.getSummary();
    expect(result).toEqual(mockData);
  });

  it('getLowStock — GETs /inventory/low-stock with default threshold 100', () => {
    inventoryApiModule.inventoryApi.getLowStock(100);
    expect(api.get).toHaveBeenCalledWith('/inventory/low-stock', { params: { threshold: 100 } });
  });

  it('getLowStock — GETs /inventory/low-stock with custom threshold', () => {
    inventoryApiModule.inventoryApi.getLowStock(50);
    expect(api.get).toHaveBeenCalledWith('/inventory/low-stock', { params: { threshold: 50 } });
  });

  it('getLowStock — returns response data', async () => {
    const mockData = [{ _id: 'b1', quantity: 45 }];
    api.get.mockResolvedValue({ data: mockData });
    const result = await inventoryApiModule.inventoryApi.getLowStock(100);
    expect(result).toEqual(mockData);
  });

  it('getExpiringSoon — GETs /inventory/expiring with default 30 days', () => {
    inventoryApiModule.inventoryApi.getExpiringSoon(30);
    expect(api.get).toHaveBeenCalledWith('/inventory/expiring', { params: { days: 30 } });
  });

  it('getExpiringSoon — GETs /inventory/expiring with custom days', () => {
    inventoryApiModule.inventoryApi.getExpiringSoon(7);
    expect(api.get).toHaveBeenCalledWith('/inventory/expiring', { params: { days: 7 } });
  });

  it('getExpiringSoon — returns response data', async () => {
    const mockData = [{ _id: 'b2', expiryDate: '2026-05-10' }];
    api.get.mockResolvedValue({ data: mockData });
    const result = await inventoryApiModule.inventoryApi.getExpiringSoon(30);
    expect(result).toEqual(mockData);
  });
});
