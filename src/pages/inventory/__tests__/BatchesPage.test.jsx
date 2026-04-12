import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BatchesPage from '../../../pages/inventory/BatchesPage';
import batchApi from '../../../api/batchApi';
import vaccineApi from '../../../api/vaccineApi';
import hospitalApi from '../../../api/hospitalApi';
import useAuthStore from '../../../store/useAuthStore';

vi.mock('../../../api/batchApi', () => ({
  default: {
    getBatches:   vi.fn(),
    addBatch:     vi.fn(),
    updateBatch:  vi.fn(),
    deleteBatch:  vi.fn(),
  },
}));
vi.mock('../../../api/vaccineApi', () => ({
  default: { getVaccines: vi.fn() },
}));
vi.mock('../../../api/hospitalApi', () => ({
  default: { getHospitals: vi.fn() },
}));
vi.mock('../../../store/useAuthStore', () => ({
  default: vi.fn(),
}));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

const MOCK_VACCINES = [
  { _id: 'v1', name: 'COVID-19 Vaccine' },
  { _id: 'v2', name: 'Influenza Vaccine' },
];

const MOCK_HOSPITALS = [
  { _id: 'h1', name: 'City General Hospital' },
  { _id: 'h2', name: "St. Mary's Hospital" },
];

const MOCK_BATCHES = [
  {
    _id: 'b1',
    batchNumber: 'BATCH-001',
    vaccineId: { _id: 'v1', name: 'COVID-19 Vaccine' },
    hospitalId: { _id: 'h1', name: 'City General Hospital' },
    quantity: 500,
    status: 'Available',
    arrivalDate: '2026-01-01T00:00:00.000Z',
    expiryDate: '2027-01-01T00:00:00.000Z',
  },
  {
    _id: 'b2',
    batchNumber: 'BATCH-002',
    vaccineId: { _id: 'v2', name: 'Influenza Vaccine' },
    hospitalId: { _id: 'h2', name: "St. Mary's Hospital" },
    quantity: 50,
    status: 'Depleted',
    arrivalDate: '2026-01-01T00:00:00.000Z',
    expiryDate: '2026-12-01T00:00:00.000Z',
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <BatchesPage />
    </MemoryRouter>
  );

describe('BatchesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vaccineApi.getVaccines.mockResolvedValue(MOCK_VACCINES);
    hospitalApi.getHospitals.mockResolvedValue(MOCK_HOSPITALS);
    batchApi.getBatches.mockResolvedValue(MOCK_BATCHES);
    batchApi.addBatch.mockResolvedValue({ _id: 'b3' });
    batchApi.updateBatch.mockResolvedValue({});
    batchApi.deleteBatch.mockResolvedValue({});
    useAuthStore.mockReturnValue({ user: { role: 'Admin' } });
  });

  it('shows a spinner while loading', () => {
    batchApi.getBatches.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(document.querySelector('svg')).toBeTruthy();
  });

  it('renders the Batch Inventory heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Batch Inventory')).toBeInTheDocument();
    });
  });

  it('renders all batches after load', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('#BATCH-001')).toBeInTheDocument();
      expect(screen.getByText('#BATCH-002')).toBeInTheDocument();
    });
  });

  it('renders vaccine and hospital names in the table', async () => {
    renderPage();
    await waitFor(() => {
      // Vaccine/hospital names appear in both table rows and filter <option> elements
      expect(screen.getAllByText('COVID-19 Vaccine').length).toBeGreaterThan(0);
      expect(screen.getAllByText('City General Hospital').length).toBeGreaterThan(0);
    });
  });

  it('renders quantity in units format', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('500 units')).toBeInTheDocument();
    });
  });

  it('shows Add New Batch button for Admin', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add New Batch/i })).toBeInTheDocument();
    });
  });

  it('shows Add New Batch button for HospitalStaff', async () => {
    useAuthStore.mockReturnValue({ user: { role: 'HospitalStaff' } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add New Batch/i })).toBeInTheDocument();
    });
  });

  it('hides Add New Batch button for non-staff users', async () => {
    useAuthStore.mockReturnValue({ user: { role: 'Public' } });
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-001'));
    expect(screen.queryByRole('button', { name: /Add New Batch/i })).not.toBeInTheDocument();
  });

  it('shows delete buttons only for Admin users', async () => {
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-001'));
    expect(screen.getAllByLabelText('Delete')).toHaveLength(2);
  });

  it('hides delete buttons for HospitalStaff', async () => {
    useAuthStore.mockReturnValue({ user: { role: 'HospitalStaff' } });
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-001'));
    expect(screen.queryByLabelText('Delete')).not.toBeInTheDocument();
  });

  it('opens Register New Batch modal on Add New Batch click', async () => {
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-001'));

    fireEvent.click(screen.getByRole('button', { name: /Add New Batch/i }));

    await waitFor(() => {
      expect(screen.getByText('Register New Batch')).toBeInTheDocument();
    });
  });

  it('opens Edit Batch Record modal on edit button click', async () => {
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-001'));

    fireEvent.click(screen.getAllByLabelText('Edit')[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit Batch Record')).toBeInTheDocument();
    });
  });

  it('shows delete confirmation dialog on delete button click', async () => {
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-001'));

    fireEvent.click(screen.getAllByLabelText('Delete')[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Batch')).toBeInTheDocument();
    });
  });

  it('calls deleteBatch with correct id and refreshes on confirm', async () => {
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-001'));

    fireEvent.click(screen.getAllByLabelText('Delete')[0]);
    await waitFor(() => screen.getByText('Yes, Delete'));
    fireEvent.click(screen.getByText('Yes, Delete'));

    await waitFor(() => {
      expect(batchApi.deleteBatch).toHaveBeenCalledWith('b1');
      expect(batchApi.getBatches).toHaveBeenCalledTimes(2);
    });
  });

  it('filters batches by status — shows only Available batches', async () => {
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-002'));

    fireEvent.change(screen.getByDisplayValue('All Statuses'), {
      target: { value: 'Available' },
    });

    expect(screen.getByText('#BATCH-001')).toBeInTheDocument();
    expect(screen.queryByText('#BATCH-002')).not.toBeInTheDocument();
  });

  it('filters batches by status — shows only Depleted batches', async () => {
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-001'));

    fireEvent.change(screen.getByDisplayValue('All Statuses'), {
      target: { value: 'Depleted' },
    });

    expect(screen.queryByText('#BATCH-001')).not.toBeInTheDocument();
    expect(screen.getByText('#BATCH-002')).toBeInTheDocument();
  });

  it('filters batches by vaccine', async () => {
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-002'));

    fireEvent.change(screen.getByDisplayValue('All Vaccines'), {
      target: { value: 'v1' },
    });

    expect(screen.getByText('#BATCH-001')).toBeInTheDocument();
    expect(screen.queryByText('#BATCH-002')).not.toBeInTheDocument();
  });

  it('filters batches by hospital', async () => {
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-001'));

    fireEvent.change(screen.getByDisplayValue('All Hospitals'), {
      target: { value: 'h2' },
    });

    expect(screen.queryByText('#BATCH-001')).not.toBeInTheDocument();
    expect(screen.getByText('#BATCH-002')).toBeInTheDocument();
  });

  it('shows Clear filters button when a filter is active', async () => {
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-001'));

    fireEvent.change(screen.getByDisplayValue('All Statuses'), {
      target: { value: 'Available' },
    });

    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('clears all filters when Clear filters is clicked', async () => {
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-001'));

    fireEvent.change(screen.getByDisplayValue('All Statuses'), {
      target: { value: 'Available' },
    });
    expect(screen.queryByText('#BATCH-002')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Clear filters'));

    await waitFor(() => {
      expect(screen.getByText('#BATCH-002')).toBeInTheDocument();
    });
  });

  it('shows empty state with filter message when no batches match filters', async () => {
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-001'));

    fireEvent.change(screen.getByDisplayValue('All Statuses'), {
      target: { value: 'Expired' },
    });

    await waitFor(() => {
      expect(screen.getByText('No batches match your filters.')).toBeInTheDocument();
    });
  });

  it('shows empty state when no batches exist at all', async () => {
    batchApi.getBatches.mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Get started by adding your first batch.')).toBeInTheDocument();
    });
  });

  it('calls addBatch and refreshes on form submit', async () => {
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-001'));

    fireEvent.click(screen.getByRole('button', { name: /Add New Batch/i }));
    await waitFor(() => screen.getByPlaceholderText('e.g. BATCH-2026-X1'));

    fireEvent.change(screen.getByPlaceholderText('e.g. BATCH-2026-X1'), {
      target: { value: 'BATCH-003' },
    });
    fireEvent.change(document.querySelector('#batch-vaccineId'), {
      target: { value: 'v1' },
    });
    fireEvent.change(document.querySelector('#batch-hospitalId'), {
      target: { value: 'h1' },
    });
    fireEvent.change(document.querySelector('#batch-quantity'), {
      target: { value: '1000' },
    });
    fireEvent.change(document.querySelector('#batch-arrivalDate'), {
      target: { value: '2026-02-01' },
    });
    fireEvent.change(document.querySelector('#batch-expiryDate'), {
      target: { value: '2027-02-01' },
    });

    fireEvent.submit(document.querySelector('form'));

    await waitFor(() => {
      expect(batchApi.addBatch).toHaveBeenCalledWith(
        expect.objectContaining({ batchNumber: 'BATCH-003', quantity: 1000 })
      );
      expect(batchApi.getBatches).toHaveBeenCalledTimes(2);
    });
  });

  it('calls updateBatch with correct id on edit form submit', async () => {
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-001'));

    fireEvent.click(screen.getAllByLabelText('Edit')[0]);
    await waitFor(() => screen.getByText('Edit Batch Record'));

    fireEvent.submit(document.querySelector('form'));

    await waitFor(() => {
      expect(batchApi.updateBatch).toHaveBeenCalledWith('b1', expect.any(Object));
    });
  });

  it('shows error toast when data load fails', async () => {
    const toast = await import('react-hot-toast');
    batchApi.getBatches.mockRejectedValue(new Error('Server error'));
    renderPage();

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith('Failed to load inventory data');
    });
  });

  it('shows success toast after batch is deleted', async () => {
    const toast = await import('react-hot-toast');
    renderPage();
    await waitFor(() => screen.getByText('#BATCH-001'));

    fireEvent.click(screen.getAllByLabelText('Delete')[0]);
    await waitFor(() => screen.getByText('Yes, Delete'));
    fireEvent.click(screen.getByText('Yes, Delete'));

    await waitFor(() => {
      expect(toast.default.success).toHaveBeenCalledWith('Batch deleted successfully');
    });
  });
});
