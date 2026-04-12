import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookAppointmentPage from '../../../pages/appointments/BookAppointmentPage';
import clinicApi from '../../../api/clinicApi';
import dependentApi from '../../../api/dependentApi';
import * as appointmentApi from '../../../api/appointmentApi';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../../../api/clinicApi', () => ({
  default: { getClinics: vi.fn() },
}));
vi.mock('../../../api/dependentApi', () => ({
  default: { getDependents: vi.fn() },
}));
vi.mock('../../../api/appointmentApi');
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../../../utils/formatters', () => ({
  formatDate: (d) => d ?? '—',
}));

const TODAY = new Date();
const FUTURE = new Date(TODAY);
FUTURE.setDate(TODAY.getDate() + 7);

const MOCK_CLINICS = [
  {
    _id: 'clinic-1',
    vaccineType: 'BCG Vaccine',
    date: FUTURE.toISOString(),
    startTime: '09:00',
    endTime: '12:00',
    capacity: 20,
    bookedCount: 5,
    hospital: { name: 'City Hospital' },
  },
  {
    _id: 'clinic-2',
    vaccineType: 'MMR Vaccine',
    date: FUTURE.toISOString(),
    startTime: '13:00',
    endTime: '16:00',
    capacity: 10,
    bookedCount: 10, // FULL
    hospital: { name: 'General Hospital' },
  },
];

const MOCK_DEPENDENTS = [
  { _id: 'dep-1', name: 'Child One', relationship: 'Child' },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <BookAppointmentPage />
    </MemoryRouter>
  );

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('BookAppointmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clinicApi.getClinics.mockResolvedValue({ data: MOCK_CLINICS });
    dependentApi.getDependents.mockResolvedValue({ data: MOCK_DEPENDENTS });
    appointmentApi.bookAppointment.mockResolvedValue({
      data: { data: { _id: 'new-appt', queueNumber: 5, qrCodeUrl: null } },
    });
  });

  it('renders the step 1 heading and step indicator', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Book an Appointment')).toBeInTheDocument();
    });
    // Step 1 label
    expect(screen.getByText('Choose Clinic')).toBeInTheDocument();
  });

  it('renders available clinic cards after load', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('BCG Vaccine')).toBeInTheDocument();
      expect(screen.getByText('MMR Vaccine')).toBeInTheDocument();
    });
  });

  it('Next button is disabled before a clinic is selected', async () => {
    renderPage();
    await waitFor(() => screen.getByText('BCG Vaccine'));

    const nextBtn = screen.getByRole('button', { name: /next/i });
    expect(nextBtn).toBeDisabled();
  });

  it('Next button enables after selecting an available clinic', async () => {
    renderPage();
    await waitFor(() => screen.getByText('BCG Vaccine'));

    // Click BCG Vaccine card (not full)
    fireEvent.click(screen.getByText('BCG Vaccine').closest('button'));

    const nextBtn = screen.getByRole('button', { name: /next/i });
    expect(nextBtn).not.toBeDisabled();
  });

  it('full clinic card is disabled and cannot be selected', async () => {
    renderPage();
    await waitFor(() => screen.getByText('MMR Vaccine'));

    const mmrCard = screen.getByText('MMR Vaccine').closest('button');
    expect(mmrCard).toBeDisabled();
  });

  it('advances to step 2 (Select Patient) after clicking Next', async () => {
    renderPage();
    await waitFor(() => screen.getByText('BCG Vaccine'));

    fireEvent.click(screen.getByText('BCG Vaccine').closest('button'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText('Select Patient')).toBeInTheDocument();
      expect(screen.getByText('Myself')).toBeInTheDocument();
    });
  });

  it('renders dependents alongside Myself option in step 2', async () => {
    renderPage();
    await waitFor(() => screen.getByText('BCG Vaccine'));

    fireEvent.click(screen.getByText('BCG Vaccine').closest('button'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText('Child One')).toBeInTheDocument();
    });
  });

  it('Next is disabled in step 2 until a patient is selected', async () => {
    renderPage();
    await waitFor(() => screen.getByText('BCG Vaccine'));

    fireEvent.click(screen.getByText('BCG Vaccine').closest('button'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => screen.getByText('Myself'));

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('advances to step 3 (Confirm) with booking summary', async () => {
    renderPage();
    await waitFor(() => screen.getByText('BCG Vaccine'));

    // Step 1: select clinic
    fireEvent.click(screen.getByText('BCG Vaccine').closest('button'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: select patient
    await waitFor(() => screen.getByText('Myself'));
    fireEvent.click(screen.getByText('Myself').closest('button'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 3: confirm summary visible
    await waitFor(() => {
      expect(screen.getByText('Booking Summary')).toBeInTheDocument();
      expect(screen.getByText('BCG Vaccine')).toBeInTheDocument();
      expect(screen.getByText('Myself')).toBeInTheDocument();
    });
  });

  it('calls bookAppointment API on Confirm Booking and shows success step', async () => {
    renderPage();
    await waitFor(() => screen.getByText('BCG Vaccine'));

    fireEvent.click(screen.getByText('BCG Vaccine').closest('button'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => screen.getByText('Myself'));
    fireEvent.click(screen.getByText('Myself').closest('button'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => screen.getByText('Confirm Booking'));
    fireEvent.click(screen.getByRole('button', { name: /confirm booking/i }));

    await waitFor(() => {
      expect(appointmentApi.bookAppointment).toHaveBeenCalledWith({ clinicId: 'clinic-1' });
      expect(screen.getByText('Appointment Booked!')).toBeInTheDocument();
      expect(screen.getByText(/#5/i)).toBeInTheDocument(); // queue number
    });
  });

  it('shows error toast when booking API fails', async () => {
    const toast = await import('react-hot-toast');
    appointmentApi.bookAppointment.mockRejectedValue({
      response: { data: { message: 'Slot no longer available' } },
    });

    renderPage();
    await waitFor(() => screen.getByText('BCG Vaccine'));

    fireEvent.click(screen.getByText('BCG Vaccine').closest('button'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => screen.getByText('Myself'));
    fireEvent.click(screen.getByText('Myself').closest('button'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => screen.getByText('Confirm Booking'));
    fireEvent.click(screen.getByRole('button', { name: /confirm booking/i }));

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith('Slot no longer available');
    });
  });

  it('Back button returns to previous step', async () => {
    renderPage();
    await waitFor(() => screen.getByText('BCG Vaccine'));

    fireEvent.click(screen.getByText('BCG Vaccine').closest('button'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => screen.getByText('Myself'));

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    await waitFor(() => {
      expect(screen.getByText('BCG Vaccine')).toBeInTheDocument();
    });
  });
});
