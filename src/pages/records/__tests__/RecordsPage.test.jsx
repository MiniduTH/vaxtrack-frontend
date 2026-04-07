import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecordsPage from '../RecordsPage';

// Mock the auth store - default export
vi.mock('../../../store/useAuthStore', () => {
  const store = vi.fn();
  store.getState = vi.fn(() => ({ token: 'test-token' }));
  return { default: store };
});

// Mock the API calls
vi.mock('../../../api/recordApi', () => ({
  getAllRecords: vi.fn().mockResolvedValue({ data: [] }),
  getMyRecords: vi.fn().mockResolvedValue({ data: [] })
}));

// Mock formatters
vi.mock('../../../utils/formatters', () => ({
  formatDate: vi.fn((d) => d || 'N/A')
}));

// Mock constants
vi.mock('../../../utils/constants', () => ({
  USER_ROLES: { ADMIN: 'Admin', STAFF: 'HospitalStaff', USER: 'User' }
}));

// Import the mocked store to control return values
import useAuthStore from '../../../store/useAuthStore';

describe('RecordsPage Component', () => {
  it('renders my records for Standard User', () => {
    useAuthStore.mockReturnValue({ role: 'User' });

    render(<RecordsPage />);
    expect(screen.getByText('My Vaccination Records')).toBeInTheDocument();
  });

  it('renders all records for Admin', () => {
    useAuthStore.mockReturnValue({ role: 'Admin' });

    render(<RecordsPage />);
    expect(screen.getByText('All Vaccination Records')).toBeInTheDocument();
    expect(screen.getByText('Filter Records')).toBeInTheDocument();
  });

  it('shows filter inputs for staff', () => {
    useAuthStore.mockReturnValue({ role: 'HospitalStaff' });

    render(<RecordsPage />);
    expect(screen.getByText('All Vaccination Records')).toBeInTheDocument();
  });
});
