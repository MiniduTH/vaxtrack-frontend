import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InventoryDashboard from '../../../pages/inventory/InventoryDashboard';
import inventoryApi from '../../../api/inventoryApi';
import batchApi from '../../../api/batchApi';

vi.mock('../../../api/inventoryApi', () => ({
  default: {
    getLowStock:     vi.fn(),
    getExpiringSoon: vi.fn(),
    getSummary:      vi.fn(),
  },
}));
vi.mock('../../../api/batchApi', () => ({
  default: { getBatches: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

// Expiry date within next 30 days from 2026-04-26
const EXPIRING_DATE = '2026-05-10T00:00:00.000Z';

const MOCK_LOW_STOCK = [
  {
    _id: 'ls1',
    batchNumber: 'LOW-001',
    vaccineId: { _id: 'v1', name: 'COVID-19 Vaccine' },
    hospitalId: { _id: 'h1', name: 'City General Hospital' },
    quantity: 45,
    status: 'Available',
    expiryDate: '2027-01-01T00:00:00.000Z',
  },
];

const MOCK_EXPIRING = [
  {
    _id: 'exp1',
    batchNumber: 'EXP-001',
    vaccineId: { _id: 'v2', name: 'Influenza Vaccine' },
    hospitalId: { _id: 'h2', name: "St. Mary's Hospital" },
    quantity: 200,
    status: 'Available',
    expiryDate: EXPIRING_DATE,
  },
];

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <InventoryDashboard />
    </MemoryRouter>
  );

describe('InventoryDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inventoryApi.getLowStock.mockResolvedValue(MOCK_LOW_STOCK);
    inventoryApi.getExpiringSoon.mockResolvedValue(MOCK_EXPIRING);
    inventoryApi.getSummary.mockResolvedValue({ totalBatches: 12 });
  });

  it('shows a loading spinner while fetching data', () => {
    inventoryApi.getLowStock.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(document.querySelector('svg')).toBeTruthy();
  });

  it('renders the Inventory Dashboard heading', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Inventory Dashboard')).toBeInTheDocument();
    });
  });

  it('renders the three KPI card headings', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Critical Stock Levels')).toBeInTheDocument();
      expect(screen.getByText('Expiring in 30 Days')).toBeInTheDocument();
      expect(screen.getByText('Total Tracked Batches')).toBeInTheDocument();
    });
  });

  it('displays correct critical stock count from API', async () => {
    renderDashboard();
    await waitFor(() => {
      // lowStockItems.length = 1 → KPI card shows "1"
      const criticalCount = screen.getAllByText('1');
      expect(criticalCount.length).toBeGreaterThan(0);
    });
  });

  it('displays correct total batches count from summary API', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  it('renders low stock item vaccine name and batch number', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('COVID-19 Vaccine')).toBeInTheDocument();
      expect(screen.getByText('Batch #LOW-001')).toBeInTheDocument();
    });
  });

  it('renders low stock item quantity', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('45 left')).toBeInTheDocument();
    });
  });

  it('renders low stock item hospital name', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/City General Hospital/)).toBeInTheDocument();
    });
  });

  it('renders expiring soon item vaccine name and batch number', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Influenza Vaccine')).toBeInTheDocument();
      expect(screen.getByText(/EXP-001/)).toBeInTheDocument();
    });
  });

  it('renders expiring soon item days remaining', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/days left/)).toBeInTheDocument();
    });
  });

  it('shows healthy stock message when no low stock items', async () => {
    inventoryApi.getLowStock.mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => {
      expect(
        screen.getByText('Stock levels are healthy across all hospitals.')
      ).toBeInTheDocument();
    });
  });

  it('shows no-expiry message when no batches are expiring soon', async () => {
    inventoryApi.getExpiringSoon.mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => {
      expect(
        screen.getByText('No batches mapped to expire in the next month.')
      ).toBeInTheDocument();
    });
  });

  it('falls back to batchApi when inventory analytics API fails', async () => {
    const fallbackBatch = {
      _id: 'fb1',
      batchNumber: 'FALL-001',
      vaccineId: { _id: 'v1', name: 'Fallback Vaccine' },
      hospitalId: { _id: 'h1', name: 'Fallback Hospital' },
      quantity: 30,
      status: 'Available',
      // Far future expiry so this batch only appears in low-stock, not expiring-soon
      expiryDate: '2028-06-01T00:00:00.000Z',
    };

    inventoryApi.getLowStock.mockRejectedValue(new Error('404 Not Found'));
    inventoryApi.getExpiringSoon.mockRejectedValue(new Error('404 Not Found'));
    inventoryApi.getSummary.mockRejectedValue(new Error('404 Not Found'));
    batchApi.getBatches.mockResolvedValue([fallbackBatch]);

    renderDashboard();

    await waitFor(() => {
      expect(batchApi.getBatches).toHaveBeenCalled();
    });
    await waitFor(() => {
      // Batch quantity < 100 and Available → appears as low stock
      expect(screen.getByText('Fallback Vaccine')).toBeInTheDocument();
    });
  });

  it('calls inventoryApi.getLowStock with threshold 100', async () => {
    renderDashboard();
    await waitFor(() => screen.getByText('Inventory Dashboard'));
    expect(inventoryApi.getLowStock).toHaveBeenCalledWith(100);
  });

  it('calls inventoryApi.getExpiringSoon with 30 days', async () => {
    renderDashboard();
    await waitFor(() => screen.getByText('Inventory Dashboard'));
    expect(inventoryApi.getExpiringSoon).toHaveBeenCalledWith(30);
  });

  it('shows error toast when all API calls fail', async () => {
    const toast = await import('react-hot-toast');
    inventoryApi.getLowStock.mockRejectedValue(new Error('API Error'));
    batchApi.getBatches.mockRejectedValue(new Error('Fallback Error'));

    renderDashboard();

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith('Failed to load inventory dashboard.');
    });
  });

  it('renders a link to the full inventory (batches) page', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('View full inventory →')).toBeInTheDocument();
    });
  });
});
