import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HospitalsPage from './HospitalsPage';
import hospitalApi from '../../api/hospitalApi';
import geocodeApi from '../../api/geocodeApi';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('../../api/hospitalApi');
vi.mock('../../api/geocodeApi');
vi.mock('../../store/useAuthStore', () => ({
  default: vi.fn(() => ({ user: { role: 'Admin' } }))
}));
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockHospitals = [
  {
    _id: '1',
    name: 'General Hospital',
    address: '123 Main St',
    city: 'Kandy',
    district: 'Kandy',
    latitude: 7.2906,
    longitude: 80.6337,
  },
];

describe('HospitalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hospitalApi.getHospitals.mockResolvedValue({ success: true, data: mockHospitals });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <HospitalsPage />
      </BrowserRouter>
    );
  };

  it('renders correctly and fetches hospitals', async () => {
    renderComponent();

    expect(screen.getByText(/Loading hospitals.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('General Hospital')[0]).toBeInTheDocument();
    });

    expect(hospitalApi.getHospitals).toHaveBeenCalled();
  });

  it('opens add hospital modal when clicking add button', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('General Hospital')[0]).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Hospital');
    fireEvent.click(addButton);

    expect(screen.getByText('Add New Hospital')).toBeInTheDocument();
  });

  it('handles geocoding correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('General Hospital')[0]).toBeInTheDocument();
    });

    // Open add modal
    fireEvent.click(screen.getByText('Add Hospital'));

    // Fill address and city
    const addressInput = screen.getByLabelText(/Full Address/i);
    const cityInput = screen.getByLabelText(/City/i);

    fireEvent.change(addressInput, { target: { value: 'Peradeniya Road' } });
    fireEvent.change(cityInput, { target: { value: 'Kandy' } });

    // Mock geocode response
    geocodeApi.geocode.mockResolvedValue({
      success: true,
      data: { latitude: 7.25, longitude: 80.59 }
    });

    const geocodeButton = screen.getByText('Auto-Geocode');
    fireEvent.click(geocodeButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Latitude').value).toBe('7.25');
      expect(screen.getByLabelText('Longitude').value).toBe('80.59');
    });
  });
});
