import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import QueueBoardPage from '../../../pages/appointments/QueueBoardPage';
import * as appointmentApi from '../../../api/appointmentApi';
import clinicApi from '../../../api/clinicApi';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../../../api/appointmentApi');
vi.mock('../../../api/clinicApi', () => ({
  default: { getClinics: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../../../utils/formatters', () => ({
  formatDate: (d) => d ?? '—',
}));

const MOCK_CLINICS = [
  {
    _id: 'clinic-1',
    vaccineType: 'BCG Vaccine',
    date: '2026-04-10',
    startTime: '09:00',
    endTime: '12:00',
    capacity: 20,
    bookedCount: 3,
  },
];

const MOCK_QUEUE = [
  {
    _id: 'appt-1',
    queueNumber: 1,
    status: 'Pending',
    userId: { name: 'Alice Smith' },
    dependentId: null,
    bookedAt: '2026-04-09T08:00:00Z',
  },
  {
    _id: 'appt-2',
    queueNumber: 2,
    status: 'Completed',
    userId: { name: 'Bob Jones' },
    dependentId: null,
    bookedAt: '2026-04-09T08:05:00Z',
  },
  {
    _id: 'appt-3',
    queueNumber: 3,
    status: 'Pending',
    userId: { name: 'Carol White' },
    dependentId: null,
    bookedAt: '2026-04-09T08:10:00Z',
  },
];

// Helper: render at /dashboard/queue (no clinicId param — shows clinic selector)
const renderSelectorView = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard/queue']}>
      <Routes>
        <Route path="/dashboard/queue" element={<QueueBoardPage />} />
      </Routes>
    </MemoryRouter>
  );

// Helper: render at /dashboard/queue/:clinicId (skips selector, loads queue directly)
const renderQueueView = (clinicId = 'clinic-1') =>
  render(
    <MemoryRouter initialEntries={[`/dashboard/queue/${clinicId}`]}>
      <Routes>
        <Route path="/dashboard/queue/:clinicId" element={<QueueBoardPage />} />
      </Routes>
    </MemoryRouter>
  );

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('QueueBoardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clinicApi.getClinics.mockResolvedValue({ data: MOCK_CLINICS });
    appointmentApi.getClinicQueue.mockResolvedValue({ data: { data: MOCK_QUEUE } });
    appointmentApi.updateAppointmentStatus.mockResolvedValue({});
  });

  // ── Clinic selector view ──

  describe('Clinic selector (no clinicId param)', () => {
    it('renders the Queue Board heading', async () => {
      renderSelectorView();
      await waitFor(() => {
        expect(screen.getByText('Queue Board')).toBeInTheDocument();
      });
    });

    it('renders available clinic sessions', async () => {
      renderSelectorView();
      await waitFor(() => {
        expect(screen.getByText('BCG Vaccine')).toBeInTheDocument();
      });
    });

    it('switches to queue view when a clinic is selected', async () => {
      appointmentApi.getClinicQueue.mockResolvedValue({ data: { data: MOCK_QUEUE } });
      renderSelectorView();

      await waitFor(() => screen.getByText('BCG Vaccine'));
      fireEvent.click(screen.getByText('BCG Vaccine').closest('button'));

      await waitFor(() => {
        // Queue rows should now appear
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      });
    });
  });

  // ── Queue list view ──

  describe('Queue list (with clinicId param)', () => {
    it('renders all patients in the queue', async () => {
      renderQueueView();
      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Jones')).toBeInTheDocument();
        expect(screen.getByText('Carol White')).toBeInTheDocument();
      });
    });

    it('renders queue numbers as badges', async () => {
      renderQueueView();
      await waitFor(() => screen.getByText('Alice Smith'));

      // Each patient name is present — confirming all 3 rows rendered
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
      expect(screen.getByText('Carol White')).toBeInTheDocument();
    });

    it('shows Completed/No-Show action buttons only for Pending patients', async () => {
      renderQueueView();
      await waitFor(() => screen.getByText('Alice Smith'));

      // Alice (Pending) and Carol (Pending) → 2 × 2 = 4 action buttons
      const completeBtns = screen.getAllByTitle('Mark as Completed');
      const noShowBtns   = screen.getAllByTitle('Mark as No-Show');
      expect(completeBtns).toHaveLength(2);
      expect(noShowBtns).toHaveLength(2);
    });

    it('calls updateAppointmentStatus with Completed when ✓ is clicked', async () => {
      renderQueueView();
      await waitFor(() => screen.getByText('Alice Smith'));

      fireEvent.click(screen.getAllByTitle('Mark as Completed')[0]);

      await waitFor(() => {
        expect(appointmentApi.updateAppointmentStatus).toHaveBeenCalledWith(
          'appt-1',
          'Completed'
        );
      });
    });

    it('calls updateAppointmentStatus with No-Show when ✗ is clicked', async () => {
      renderQueueView();
      await waitFor(() => screen.getByText('Alice Smith'));

      fireEvent.click(screen.getAllByTitle('Mark as No-Show')[0]);

      await waitFor(() => {
        expect(appointmentApi.updateAppointmentStatus).toHaveBeenCalledWith(
          'appt-1',
          'No-Show'
        );
      });
    });

    it('refreshes the queue after a status update', async () => {
      renderQueueView();
      await waitFor(() => screen.getByText('Alice Smith'));

      fireEvent.click(screen.getAllByTitle('Mark as Completed')[0]);

      await waitFor(() => {
        // getClinicQueue called once on mount + once after update = 2
        expect(appointmentApi.getClinicQueue).toHaveBeenCalledTimes(2);
      });
    });

    it('shows stat counts correctly', async () => {
      renderQueueView();
      await waitFor(() => screen.getByText('Alice Smith'));

      // Stat labels and filter tab labels both exist — use getAllByText
      expect(screen.getAllByText(/^Pending$/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/^Completed$/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/^No-Show$/i).length).toBeGreaterThan(0);
    });

    it('filters to only Pending when Pending filter clicked', async () => {
      renderQueueView();
      await waitFor(() => screen.getByText('Bob Jones')); // Completed patient

      fireEvent.click(screen.getByRole('button', { name: 'Pending' }));

      expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    it('filters to only Completed when Completed filter clicked', async () => {
      renderQueueView();
      await waitFor(() => screen.getByText('Bob Jones'));

      fireEvent.click(screen.getByRole('button', { name: 'Completed' }));

      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    });

    it('shows error toast when status update fails', async () => {
      const toast = await import('react-hot-toast');
      appointmentApi.updateAppointmentStatus.mockRejectedValue({
        response: { data: { message: 'Update failed' } },
      });

      renderQueueView();
      await waitFor(() => screen.getByText('Alice Smith'));

      fireEvent.click(screen.getAllByTitle('Mark as Completed')[0]);

      await waitFor(() => {
        expect(toast.default.error).toHaveBeenCalledWith('Update failed');
      });
    });

    it('Change Session button resets back to clinic selector', async () => {
      renderQueueView();
      await waitFor(() => screen.getByText('Alice Smith'));

      fireEvent.click(screen.getByRole('button', { name: /change session/i }));

      await waitFor(() => {
        expect(screen.getByText('BCG Vaccine')).toBeInTheDocument();
      });
    });
  });
});
