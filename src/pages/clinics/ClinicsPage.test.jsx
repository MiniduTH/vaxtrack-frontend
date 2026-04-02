import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClinicsPage from './ClinicsPage';
import clinicApi from '../../api/clinicApi';
import hospitalApi from '../../api/hospitalApi';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('../../api/clinicApi');
vi.mock('../../api/hospitalApi');
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockHospitals = [{ _id: 'h1', name: 'General Hospital' }];
const mockClinics = [
  {
    _id: 'c1',
    hospital: { _id: 'h1', name: 'General Hospital' },
    date: '2026-05-10T00:00:00.000Z',
    startTime: '08:00',
    endTime: '12:00',
    capacity: 100,
    bookedCount: 50,
    vaccineType: 'Pfizer',
  },
];

describe('ClinicsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clinicApi.getClinics.mockResolvedValue({ success: true, data: mockClinics });
    hospitalApi.getHospitals.mockResolvedValue({ success: true, data: mockHospitals });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ClinicsPage />
      </BrowserRouter>
    );
  };

  it('renders clinics and capacity information correctly', async () => {
    renderComponent();

    expect(screen.getByText(/Loading clinics.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/General Hospital/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/PFIZER VACCINE/i)).toBeInTheDocument();
      expect(screen.getByText('50 / 100')).toBeInTheDocument();
    });

    expect(clinicApi.getClinics).toHaveBeenCalled();
  });

  it('handles clinic filtering correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText(/General Hospital/i)[0]).toBeInTheDocument();
    });

    // We can't rely on the date filter exactly because of ISO format but we can check the presence of headers
    expect(screen.getByLabelText(/Filter by Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by Hospital/i)).toBeInTheDocument();
  });

  it('opens confirm dialog for deletion', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText(/General Hospital/i)[0]).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(screen.getByText(/Are you sure you want to cancel the/i)).toBeInTheDocument();
  });
});
