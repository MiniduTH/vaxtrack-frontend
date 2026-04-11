import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiCalendar, FiPlus, FiRefreshCw, FiClock, FiMapPin, FiHash
} from 'react-icons/fi';
import {
  Button, StatusBadge, Spinner, EmptyState, Modal, SearchBar
} from '../../components/common';
import {
  getMyAppointments,
  cancelAppointment,
} from '../../api/appointmentApi';
import { formatDate } from '../../utils/formatters';

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  Pending:   'warning',
  Completed: 'success',
  Cancelled: 'neutral',
  'No-Show': 'danger',
};

const AppointmentCard = ({ appt, onCancel }) => {
  const clinic  = appt.clinicId || {};
  const patient = appt.dependentId
    ? `Dependent — ${appt.dependentId.name}`
    : 'Self';

  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center">
              <FiCalendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </span>
            <h3 className="font-semibold text-foreground">
              {clinic.vaccineType ?? 'Vaccine Session'}
            </h3>
          </div>
          <p className="text-sm text-secondary-500 dark:text-slate-400 ml-10">
            Patient: {patient}
          </p>
        </div>
        <StatusBadge status={STATUS_COLOR[appt.status] ?? 'info'}>
          {appt.status}
        </StatusBadge>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
        <Detail icon={FiCalendar} label="Date">
          {clinic.date ? formatDate(clinic.date) : '—'}
        </Detail>
        <Detail icon={FiClock} label="Time">
          {clinic.startTime && clinic.endTime
            ? `${clinic.startTime} – ${clinic.endTime}`
            : '—'}
        </Detail>
        <Detail icon={FiHash} label="Queue #">
          {appt.queueNumber ?? '—'}
        </Detail>
      </div>

      {/* QR Code */}
      {appt.qrCodeUrl && (
        <div className="mb-4 flex items-center gap-3 p-3 bg-secondary-50 dark:bg-slate-800/50 rounded-xl">
          <img
            src={appt.qrCodeUrl}
            alt="QR Code"
            className="w-16 h-16 rounded-lg border border-border object-contain"
          />
          <div>
            <p className="text-xs font-medium text-secondary-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">
              Appointment QR
            </p>
            <p className="text-xs text-secondary-400 dark:text-slate-500">
              Show this at the clinic
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      {appt.status === 'Pending' && (
        <div className="flex justify-end">
          <Button
            variant="danger"
            size="sm"
            onClick={() => onCancel(appt)}
          >
            Cancel Appointment
          </Button>
        </div>
      )}
    </div>
  );
};

const Detail = ({ icon: Icon, label, children }) => (
  <div className="flex items-center gap-2">
    <Icon className="w-4 h-4 text-secondary-400 dark:text-slate-500 shrink-0" />
    <div>
      <p className="text-xs text-secondary-400 dark:text-slate-500">{label}</p>
      <p className="font-medium text-foreground">{children}</p>
    </div>
  </div>
);

// ─── Filter tabs ─────────────────────────────────────────────────────────────

const TABS = ['All', 'Pending', 'Completed', 'Cancelled', 'No-Show'];

// ─── Main Page ────────────────────────────────────────────────────────────────

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('All');
  const [search, setSearch]             = useState('');
  const [cancelTarget, setCancelTarget] = useState(null); // appt object to cancel
  const [cancelling, setCancelling]     = useState(false);

  // ── Fetch ──
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyAppointments();
      setAppointments(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // ── Filter ──
  const filtered = appointments.filter((a) => {
    const matchTab =
      activeTab === 'All' || a.status === activeTab;
    const matchSearch =
      !search ||
      (a.clinicId?.vaccineType ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.dependentId?.name ?? '').toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  // ── Cancel flow ──
  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelAppointment(cancelTarget._id);
      toast.success('Appointment cancelled successfully');
      setCancelTarget(null);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Appointment sub-tab nav */}
      <div className="flex gap-1 border-b border-border">
        <NavLink
          to="/dashboard/appointments"
          end
          className={({ isActive }) =>
            `px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              isActive
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-foreground dark:text-slate-400'
            }`
          }
        >
          My Appointments
        </NavLink>
        <NavLink
          to="/dashboard/appointments/book"
          className={({ isActive }) =>
            `px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              isActive
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-foreground dark:text-slate-400'
            }`
          }
        >
          Book Appointment
        </NavLink>
      </div>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>
          <p className="text-sm text-secondary-500 dark:text-slate-400 mt-1">
            Track and manage your vaccination appointments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchAppointments} icon={FiRefreshCw}>
            Refresh
          </Button>
          <Link to="/dashboard/appointments/book">
            <Button variant="primary" size="sm" icon={FiPlus}>
              Book Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* Search + filter tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by vaccine or dependent name…"
          className="w-full sm:w-72"
        />
        <div className="flex items-center gap-1 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500
                ${activeTab === tab
                  ? 'bg-primary-600 text-white shadow-soft'
                  : 'text-secondary-600 dark:text-slate-400 hover:bg-secondary-100 dark:hover:bg-slate-800'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      {!loading && (
        <div className="flex gap-4 text-sm text-secondary-500 dark:text-slate-400">
          <span>{appointments.filter(a => a.status === 'Pending').length} pending</span>
          <span>·</span>
          <span>{appointments.filter(a => a.status === 'Completed').length} completed</span>
          <span>·</span>
          <span>{filtered.length} shown</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={activeTab === 'All' ? 'No appointments yet' : `No ${activeTab} appointments`}
          description={activeTab === 'All' ? 'You have no appointments yet.' : `No ${activeTab} appointments found.`}
          actionLabel="Book Appointment"
          onAction={() => window.location.assign('/dashboard/appointments/book')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((appt) => (
            <AppointmentCard
              key={appt._id}
              appt={appt}
              onCancel={setCancelTarget}
            />
          ))}
        </div>
      )}

      {/* Cancel confirm modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Appointment"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCancelTarget(null)}>
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={cancelling}
              onClick={handleCancelConfirm}
            >
              Yes, Cancel
            </Button>
          </>
        }
      >
        <p className="text-secondary-600 dark:text-slate-300 text-sm">
          Are you sure you want to cancel your appointment for{' '}
          <span className="font-semibold text-foreground">
            {cancelTarget?.clinicId?.vaccineType ?? 'this session'}
          </span>{' '}
          on{' '}
          <span className="font-semibold text-foreground">
            {cancelTarget?.clinicId?.date ? formatDate(cancelTarget.clinicId.date) : '—'}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default AppointmentsPage;
