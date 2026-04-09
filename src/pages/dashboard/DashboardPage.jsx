import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiCalendar, FiPlus, FiArrowRight, FiClock, FiHash,
  FiActivity, FiAlertCircle, FiUsers
} from 'react-icons/fi';
import { StatusBadge, Spinner } from '../../components/common';
import { getMyAppointments } from '../../api/appointmentApi';
import useAuthStore from '../../store/useAuthStore';
import { formatDate } from '../../utils/formatters';

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-secondary-500 dark:text-slate-400">{label}</p>
    </div>
  </div>
);

// ─── Quick action button ──────────────────────────────────────────────────────

const QuickAction = ({ icon: Icon, label, to, color, bg }) => (
  <Link
    to={to}
    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border border-border hover:border-primary-300 hover:shadow-medium transition-all duration-200 bg-card group`}
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg} group-hover:scale-110 transition-transform duration-200`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <span className="text-xs font-medium text-secondary-600 dark:text-slate-400 text-center">{label}</span>
  </Link>
);

// ─── Status colors ────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  Pending:   'warning',
  Completed: 'success',
  Cancelled: 'neutral',
  'No-Show': 'danger',
};

// ─── Public / Patient Dashboard ──────────────────────────────────────────────

const PublicDashboard = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyAppointments();
        setAppointments(res.data.data || []);
      } catch {
        toast.error('Failed to load your appointments');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const upcomingAppts = appointments
    .filter((a) => a.status === 'Pending')
    .sort((a, b) => new Date(a.clinicId?.date) - new Date(b.clinicId?.date))
    .slice(0, 3);

  const stats = {
    pending:   appointments.filter((a) => a.status === 'Pending').length,
    completed: appointments.filter((a) => a.status === 'Completed').length,
    total:     appointments.length,
  };

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] ?? 'there'}</span> 👋
        </h1>
        <p className="text-secondary-500 dark:text-slate-400 mt-1 text-sm">
          Here's your vaccination overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={FiClock}     label="Pending"   value={loading ? '—' : stats.pending}   color="text-warning-600 dark:text-warning-400"  bg="bg-warning-50 dark:bg-warning-500/10"  />
        <StatCard icon={FiActivity}  label="Completed" value={loading ? '—' : stats.completed} color="text-success-600 dark:text-success-400"  bg="bg-success-50 dark:bg-success-500/10"  />
        <StatCard icon={FiCalendar}  label="Total"     value={loading ? '—' : stats.total}     color="text-primary-600 dark:text-primary-400"  bg="bg-primary-50 dark:bg-primary-500/10"  />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction icon={FiPlus}     label="Book Appointment"    to="/dashboard/appointments/book"  color="text-primary-600 dark:text-primary-400"  bg="bg-primary-50 dark:bg-primary-500/10"  />
          <QuickAction icon={FiCalendar} label="My Appointments"     to="/dashboard/appointments"       color="text-warning-600 dark:text-warning-400"  bg="bg-warning-50 dark:bg-warning-500/10"  />
          <QuickAction icon={FiActivity} label="Vaccination Records" to="/dashboard/records"            color="text-success-600 dark:text-success-400"  bg="bg-success-50 dark:bg-success-500/10"  />
          <QuickAction icon={FiUsers}    label="My Dependents"       to="/dashboard/dependents"         color="text-secondary-600 dark:text-slate-400"  bg="bg-secondary-100 dark:bg-slate-800"    />
        </div>
      </div>

      {/* Upcoming appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Upcoming Appointments</h2>
          <Link
            to="/dashboard/appointments"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
          >
            View all <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : upcomingAppts.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <FiCalendar className="w-10 h-10 text-secondary-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-secondary-500 dark:text-slate-400 text-sm">No upcoming appointments</p>
            <Link to="/dashboard/appointments/book">
              <button className="btn-primary mt-4 text-sm px-4 py-2">
                Book your first appointment
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppts.map((appt) => (
              <div
                key={appt._id}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:shadow-soft transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/10 flex flex-col items-center justify-center shrink-0">
                  <FiHash className="w-3 h-3 text-primary-400" />
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400 leading-none">
                    {appt.queueNumber}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {appt.clinicId?.vaccineType ?? 'Vaccine Session'}
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-slate-400 mt-0.5">
                    {appt.clinicId?.date ? formatDate(appt.clinicId.date) : '—'}
                    {appt.clinicId?.startTime ? ` · ${appt.clinicId.startTime}` : ''}
                  </p>
                </div>
                <StatusBadge status={STATUS_COLOR[appt.status] ?? 'info'} size="sm">
                  {appt.status}
                </StatusBadge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Staff Dashboard ──────────────────────────────────────────────────────────

const StaffDashboard = ({ user }) => (
  <div className="space-y-8">
    <div>
      <h1 className="text-2xl font-bold text-foreground">
        Staff Dashboard — <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
      </h1>
      <p className="text-secondary-500 dark:text-slate-400 mt-1 text-sm">
        Manage clinic sessions and patient queues
      </p>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <QuickAction icon={FiUsers}    label="Queue Board"        to="/dashboard/queue"       color="text-primary-600 dark:text-primary-400"  bg="bg-primary-50 dark:bg-primary-500/10"  />
      <QuickAction icon={FiCalendar} label="Clinic Schedule"    to="/dashboard/clinics"     color="text-success-600 dark:text-success-400"  bg="bg-success-50 dark:bg-success-500/10"  />
      <QuickAction icon={FiActivity} label="All Records"        to="/dashboard/records"     color="text-warning-600 dark:text-warning-400"  bg="bg-warning-50 dark:bg-warning-500/10"  />
    </div>
    <div className="bg-card border border-border rounded-2xl p-6">
      <p className="text-secondary-500 dark:text-slate-400 text-sm text-center">
        Navigate to <strong>Queue Board</strong> to start managing today's clinic queue.
      </p>
    </div>
  </div>
);

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

const AdminDashboard = ({ user }) => (
  <div className="space-y-8">
    <div>
      <h1 className="text-2xl font-bold text-foreground">
        Admin Dashboard — <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
      </h1>
      <p className="text-secondary-500 dark:text-slate-400 mt-1 text-sm">
        System overview and management
      </p>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <QuickAction icon={FiUsers}       label="All Appointments"  to="/dashboard/appointments"        color="text-primary-600 dark:text-primary-400"  bg="bg-primary-50 dark:bg-primary-500/10"   />
      <QuickAction icon={FiCalendar}    label="Hospitals"         to="/dashboard/hospitals"           color="text-success-600 dark:text-success-400"  bg="bg-success-50 dark:bg-success-500/10"   />
      <QuickAction icon={FiActivity}    label="Clinics"           to="/dashboard/clinics"             color="text-warning-600 dark:text-warning-400"  bg="bg-warning-50 dark:bg-warning-500/10"   />
      <QuickAction icon={FiAlertCircle} label="Inventory Alerts"  to="/dashboard/inventory"           color="text-danger-500 dark:text-danger-400"    bg="bg-danger-50 dark:bg-danger-500/10"     />
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  if (user.role === 'Admin') return <AdminDashboard user={user} />;
  if (user.role === 'HospitalStaff') return <StaffDashboard user={user} />;
  return <PublicDashboard user={user} />;
};

export default DashboardPage;
