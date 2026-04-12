import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppointmentsPage from '../../../pages/appointments/AppointmentsPage';
import * as appointmentApi from '../../../api/appointmentApi';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../../../api/appointmentApi');
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../../../utils/formatters', () => ({
  formatDate: (d) => d ?? '—',
}));

// Zustand store is not needed since AppointmentsPage doesn't read from it directly.

const MOCK_APPOINTMENTS = [
  {
    _id: 'a1',
    status: 'Pending',
    queueNumber: 1,
    clinicId: { vaccineType: 'BCG Vaccine', date: '2026-04-10', startTime: '09:00', endTime: '12:00' },
    dependentId: null,
  },
  {
    _id: 'a2',
    status: 'Completed',
    queueNumber: 2,
    clinicId: { vaccineType: 'MMR Vaccine', date: '2026-03-01', startTime: '09:00', endTime: '12:00' },
    dependentId: null,
  },
  {
    _id: 'a3',
    status: 'Cancelled',
    queueNumber: 3,
    clinicId: { vaccineType: 'OPV Vaccine', date: '2026-02-01', startTime: '09:00', endTime: '12:00' },
    dependentId: null,
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <AppointmentsPage />
    </MemoryRouter>
  );

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('AppointmentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appointmentApi.getMyAppointments.mockResolvedValue({
      data: { data: MOCK_APPOINTMENTS },
    });
    appointmentApi.cancelAppointment.mockResolvedValue({});
  });

  it('shows a spinner while loading', () => {
    // Never resolves during this test
    appointmentApi.getMyAppointments.mockReturnValue(new Promise(() => {}));
    renderPage();
    // The spinner SVG or role="status" should be present
    expect(document.querySelector('svg')).toBeTruthy();
  });

  it('renders all appointments after load', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('BCG Vaccine')).toBeInTheDocument();
      expect(screen.getByText('MMR Vaccine')).toBeInTheDocument();
      expect(screen.getByText('OPV Vaccine')).toBeInTheDocument();
    });
  });

  it('shows "My Appointments" heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('My Appointments')).toBeInTheDocument();
    });
  });

  it('filters to only Pending appointments when Pending tab clicked', async () => {
    renderPage();
    await waitFor(() => screen.getByText('BCG Vaccine'));

    fireEvent.click(screen.getByRole('button', { name: 'Pending' }));

    expect(screen.getByText('BCG Vaccine')).toBeInTheDocument();
    expect(screen.queryByText('MMR Vaccine')).not.toBeInTheDocument();
    expect(screen.queryByText('OPV Vaccine')).not.toBeInTheDocument();
  });

  it('filters to only Completed appointments when Completed tab clicked', async () => {
    renderPage();
    await waitFor(() => screen.getByText('MMR Vaccine'));

    fireEvent.click(screen.getByRole('button', { name: 'Completed' }));

    expect(screen.queryByText('BCG Vaccine')).not.toBeInTheDocument();
    expect(screen.getByText('MMR Vaccine')).toBeInTheDocument();
  });

  it('shows empty state when no appointments match filter', async () => {
    renderPage();
    await waitFor(() => screen.getByText('BCG Vaccine'));

    fireEvent.click(screen.getByRole('button', { name: 'No-Show' }));

    // EmptyState renders the title prop as an <h3>
    await waitFor(() => {
      expect(screen.getByText('No No-Show appointments')).toBeInTheDocument();
    });
  });

  it('shows Cancel button only for Pending appointments', async () => {
    renderPage();
    await waitFor(() => screen.getByText('BCG Vaccine'));

    // Button text is "Cancel Appointment" — only shown for Pending rows
    const cancelBtns = screen.getAllByText('Cancel Appointment');
    expect(cancelBtns).toHaveLength(1);
  });

  it('opens cancel confirmation modal on Cancel click', async () => {
    renderPage();
    await waitFor(() => screen.getByText('BCG Vaccine'));

    // The card has a button with text "Cancel Appointment"
    const [cancelBtn] = screen.getAllByText('Cancel Appointment');
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      // Modal confirm button
      expect(screen.getByText('Yes, Cancel')).toBeInTheDocument();
    });
  });

  it('calls cancelAppointment API and refreshes on confirm', async () => {
    renderPage();
    await waitFor(() => screen.getByText('BCG Vaccine'));

    const [cancelBtn] = screen.getAllByText('Cancel Appointment');
    fireEvent.click(cancelBtn);
    await waitFor(() => screen.getByText('Yes, Cancel'));

    fireEvent.click(screen.getByText('Yes, Cancel'));

    await waitFor(() => {
      expect(appointmentApi.cancelAppointment).toHaveBeenCalledWith('a1');
      expect(appointmentApi.getMyAppointments).toHaveBeenCalledTimes(2);
    });
  });

  it('shows error toast when API fails', async () => {
    const toast = await import('react-hot-toast');
    appointmentApi.getMyAppointments.mockRejectedValue(
      { response: { data: { message: 'Server error' } } }
    );
    renderPage();

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith('Server error');
    });
  });
});
