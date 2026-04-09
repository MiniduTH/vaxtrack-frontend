import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiRefreshCw, FiCheckCircle, FiXCircle,
  FiUser, FiHash, FiClock, FiUsers
} from 'react-icons/fi';
import {
  Button, StatusBadge, Spinner, EmptyState, SearchBar
} from '../../components/common';
import {
  getClinicQueue,
  updateAppointmentStatus,
} from '../../api/appointmentApi';
import clinicApi from '../../api/clinicApi';
import { formatDate } from '../../utils/formatters';

// ─── Status colour map ────────────────────────────────────────────────────────

const STATUS_COLOR = {
  Pending:   'warning',
  Completed: 'success',
  Cancelled: 'neutral',
  'No-Show': 'danger',
};

// ─── Queue row ────────────────────────────────────────────────────────────────

const QueueRow = ({ appt, onStatusChange, updatingId }) => {
  const patient = appt.dependentId
    ? `${appt.dependentId.name} (Dependent)`
    : appt.userId?.name ?? 'Patient';

  const isUpdating = updatingId === appt._id;
  const isPending  = appt.status === 'Pending';

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200
      ${appt.status === 'Completed'
        ? 'border-success-200 bg-success-50/50 dark:border-success-500/20 dark:bg-success-500/5'
        : appt.status === 'No-Show'
        ? 'border-danger-200 bg-danger-50/50 dark:border-danger-500/20 dark:bg-danger-500/5'
        : 'border-border bg-card hover:shadow-soft'
      }`}
    >
      {/* Queue number badge */}
      <div className="shrink-0 w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-500/10 flex flex-col items-center justify-center">
        <FiHash className="w-3 h-3 text-primary-400 dark:text-primary-500" />
        <span className="text-lg font-bold text-primary-600 dark:text-primary-400 leading-none">
          {appt.queueNumber}
        </span>
      </div>

      {/* Patient info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <FiUser className="w-4 h-4 text-secondary-400 dark:text-slate-500 shrink-0" />
          <p className="font-semibold text-foreground truncate">{patient}</p>
        </div>
        <p className="text-xs text-secondary-500 dark:text-slate-400 mt-0.5 ml-6">
          Booked {formatDate(appt.bookedAt)}
        </p>
      </div>

      {/* Status */}
      <div className="shrink-0">
        <StatusBadge status={STATUS_COLOR[appt.status] ?? 'info'} size="sm">
          {appt.status}
        </StatusBadge>
      </div>

      {/* Actions (only for Pending) */}
      {isPending && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onStatusChange(appt._id, 'Completed')}
            disabled={isUpdating}
            title="Mark as Completed"
            className="p-2 rounded-xl text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-500/10 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-success-500"
          >
            {isUpdating ? (
              <Spinner size="sm" />
            ) : (
              <FiCheckCircle className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => onStatusChange(appt._id, 'No-Show')}
            disabled={isUpdating}
            title="Mark as No-Show"
            className="p-2 rounded-xl text-danger-500 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-danger-500"
          >
            <FiXCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Clinic selector (when no clinicId in params) ─────────────────────────────

const ClinicSelector = ({ onSelect }) => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await clinicApi.getClinics();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        // Show only today's and future clinics
        setClinics((res.data || []).filter(
          (c) => new Date(c.date) >= today
        ));
      } catch {
        toast.error('Failed to load clinics');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!clinics.length) return <EmptyState message="No upcoming clinics found." />;

  return (
    <div className="space-y-3">
      <p className="text-sm text-secondary-500 dark:text-slate-400">Select a clinic session to view its queue:</p>
      {clinics.map((clinic) => (
        <button
          key={clinic._id}
          onClick={() => onSelect(clinic)}
          className="w-full text-left p-4 rounded-2xl border border-border hover:border-primary-400 hover:shadow-soft transition-all bg-card"
        >
          <p className="font-semibold text-foreground">{clinic.vaccineType}</p>
          <div className="flex gap-4 mt-1 text-sm text-secondary-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" />{formatDate(clinic.date)}</span>
            <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" />{clinic.startTime} – {clinic.endTime}</span>
            <span className="flex items-center gap-1"><FiUsers className="w-3.5 h-3.5" />{clinic.bookedCount}/{clinic.capacity}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const QueueBoardPage = () => {
  const { clinicId: paramClinicId } = useParams();
  const [selectedClinic, setSelectedClinic] = useState(
    paramClinicId ? { _id: paramClinicId } : null
  );
  const [queue, setQueue]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [updatingId, setUpdating] = useState(null);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('All');

  // ── Fetch queue ──
  const fetchQueue = useCallback(async () => {
    if (!selectedClinic?._id) return;
    setLoading(true);
    try {
      const res = await getClinicQueue(selectedClinic._id);
      setQueue(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  }, [selectedClinic]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  // ── Status update ──
  const handleStatusChange = async (apptId, status) => {
    setUpdating(apptId);
    try {
      await updateAppointmentStatus(apptId, status);
      toast.success(`Marked as ${status}`);
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  // ── Filter & search ──
  const filtered = queue.filter((a) => {
    const matchFilter = filter === 'All' || a.status === filter;
    const name = a.dependentId?.name ?? a.userId?.name ?? '';
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pending   = queue.filter((a) => a.status === 'Pending').length;
  const completed = queue.filter((a) => a.status === 'Completed').length;
  const noShow    = queue.filter((a) => a.status === 'No-Show').length;

  if (!selectedClinic) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Queue Board</h1>
          <p className="text-sm text-secondary-500 dark:text-slate-400 mt-1">Manage patient queue for clinic sessions</p>
        </div>
        <ClinicSelector onSelect={setSelectedClinic} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => setSelectedClinic(null)}
            className="flex items-center gap-1.5 text-sm text-secondary-500 hover:text-foreground dark:text-slate-400 dark:hover:text-white transition-colors mb-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Change Session
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            Queue Board
          </h1>
          <p className="text-sm text-secondary-500 dark:text-slate-400 mt-0.5">
            {selectedClinic.vaccineType} · {formatDate(selectedClinic.date)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={FiRefreshCw}
          onClick={fetchQueue}
          isLoading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending',   count: pending,   color: 'text-warning-600 dark:text-warning-400',  bg: 'bg-warning-50 dark:bg-warning-500/10' },
          { label: 'Completed', count: completed, color: 'text-success-600 dark:text-success-400',  bg: 'bg-success-50 dark:bg-success-500/10' },
          { label: 'No-Show',   count: noShow,    color: 'text-danger-500 dark:text-danger-400',    bg: 'bg-danger-50 dark:bg-danger-500/10'   },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
            <p className="text-xs text-secondary-500 dark:text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search patient name…"
          className="w-full sm:w-64"
        />
        <div className="flex gap-1">
          {['All', 'Pending', 'Completed', 'No-Show'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500
                ${filter === f
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary-600 dark:text-slate-400 hover:bg-secondary-100 dark:hover:bg-slate-800'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Queue list */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState message={filter === 'All' ? 'No patients in queue yet.' : `No ${filter} patients.`} />
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <QueueRow
              key={appt._id}
              appt={appt}
              onStatusChange={handleStatusChange}
              updatingId={updatingId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QueueBoardPage;
