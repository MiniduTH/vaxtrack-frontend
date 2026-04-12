import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiCalendar, FiPlus, FiArrowRight, FiClock, FiHash,
  FiActivity, FiAlertCircle, FiUsers
} from 'react-icons/fi';
import { StatusBadge, Spinner } from '../../components/common';
import clinicApi from '../../api/clinicApi';
import hospitalApi from '../../api/hospitalApi';
import inventoryApi from '../../api/inventoryApi';
import { getMyAppointments, getAllAppointments } from '../../api/appointmentApi';
import useAuthStore from '../../store/useAuthStore';
import { formatDate } from '../../utils/formatters';

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="relative overflow-hidden bg-card border border-border rounded-3xl p-6 flex flex-col justify-between group hover:shadow-2xl hover:border-primary-500/30 hover:-translate-y-1 transition-all duration-300">
    <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-20 blur-3xl transition-transform duration-500 group-hover:scale-150 ${bg.replace('/10', '')}`} />
    
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner backdrop-blur-sm ${bg} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-7 h-7 ${color}`} />
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-4xl font-black text-foreground tracking-tight mb-2">{value}</p>
      <p className="text-sm font-bold text-secondary-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

// ─── Quick action button ──────────────────────────────────────────────────────

const QuickAction = ({ icon: Icon, label, to, color, bg }) => (
  <Link
    to={to}
    className="group relative flex flex-col items-center gap-3 p-5 rounded-3xl border border-border hover:border-primary-500/30 bg-card overflow-hidden hover:shadow-2xl hover:shadow-primary-500/5 hover:-translate-y-1 transition-all duration-300 flex-1 min-w-[140px]"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 relative z-10`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <span className="text-sm font-bold text-secondary-700 dark:text-slate-300 text-center relative z-10 tracking-tight">{label}</span>
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
      {/* Greeting Header */}
      <div className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-primary-500/10 via-transparent to-transparent border border-primary-500/10 overflow-hidden shadow-sm">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-400/20 rounded-full blur-[80px] pointer-events-none" />
        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight relative z-10 mb-2">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">{user?.name?.split(' ')[0] ?? 'there'}</span> 👋
        </h1>
        <p className="text-secondary-600 dark:text-slate-400 text-base md:text-lg relative z-10 font-medium">
          Here is your personalized vaccination overview and upcoming schedule.
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
                className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6 bg-card border border-border rounded-3xl hover:border-primary-300 dark:hover:border-primary-900/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                {/* Side highlight */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex flex-col items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <FiHash className="w-4 h-4 text-primary-400 mb-0.5" />
                  <span className="text-base font-black text-primary-600 dark:text-primary-400 leading-none">
                    {appt.queueNumber}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-lg md:text-xl truncate mb-1.5">
                    {appt.clinicId?.vaccineType ?? 'Vaccine Session'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5 bg-secondary-100 dark:bg-slate-800 px-2 py-1 rounded-md"><FiCalendar className="w-4 h-4 text-primary-500" /> {appt.clinicId?.date ? formatDate(appt.clinicId.date) : '—'}</span>
                    <span className="flex items-center gap-1.5 bg-secondary-100 dark:bg-slate-800 px-2 py-1 rounded-md"><FiClock className="w-4 h-4 text-warning-500" /> {appt.clinicId?.startTime ? appt.clinicId.startTime : '—'}</span>
                  </div>
                </div>
                <div className="shrink-0 mt-3 sm:mt-0">
                  <StatusBadge status={STATUS_COLOR[appt.status] ?? 'info'} size="lg" className="shadow-sm font-bold uppercase tracking-wider">
                    {appt.status}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Staff Dashboard ──────────────────────────────────────────────────────────

const StaffDashboard = ({ user }) => {
  const [stats, setStats] = useState({ queue: 0, todayClinics: 0, vaccinesGiven: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffStats = async () => {
      try {
        const [apptsRes, clinicsRes] = await Promise.all([
          getAllAppointments().catch(() => ({ data: { data: [] } })),
          clinicApi.getClinics().catch(() => ({ success: false, data: [] }))
        ]);
        
        const allAppts = apptsRes.data?.data || [];
        const allClinics = clinicsRes.success ? clinicsRes.data : [];
        
        const todayStr = new Date().toISOString().split('T')[0];
        const clinicsToday = allClinics.filter(c => c.date?.startsWith(todayStr)).length;
        
        setStats({
          queue: allAppts.filter(a => a.status === 'Pending').length,
          todayClinics: clinicsToday,
          vaccinesGiven: allAppts.filter(a => a.status === 'Completed').length
        });
      } catch (error) {
        console.error("Failed to load staff stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-primary-500/10 via-transparent to-transparent border border-primary-500/10 overflow-hidden shadow-sm">
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-400/20 rounded-full blur-[80px] pointer-events-none" />
        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight relative z-10 mb-2">
          Staff Dashboard — <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-secondary-600 dark:text-slate-400 text-base md:text-lg relative z-10 font-medium">
          Manage clinic sessions, oversee patient workflows, and control the active queue.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={FiUsers}     label="Active Queue" value={loading ? '—' : stats.queue} color="text-primary-600 dark:text-primary-400"  bg="bg-primary-50 dark:bg-primary-500/10"  />
        <StatCard icon={FiCalendar}  label="Clinics Today" value={loading ? '—' : stats.todayClinics} color="text-warning-600 dark:text-warning-400"  bg="bg-warning-50 dark:bg-warning-500/10"  />
        <StatCard icon={FiActivity}  label="Vaccines Given" value={loading ? '—' : stats.vaccinesGiven} color="text-success-600 dark:text-success-400"  bg="bg-success-50 dark:bg-success-500/10"  />
      </div>
    
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Quick Shortcuts</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <QuickAction icon={FiUsers}    label="Queue Board"        to="/dashboard/queue"       color="text-primary-600 dark:text-primary-400"  bg="bg-primary-50 dark:bg-primary-500/10"  />
        <QuickAction icon={FiCalendar} label="Clinic Schedule"    to="/dashboard/clinics"     color="text-success-600 dark:text-success-400"  bg="bg-success-50 dark:bg-success-500/10"  />
        <QuickAction icon={FiActivity} label="All Records"        to="/dashboard/records"     color="text-warning-600 dark:text-warning-400"  bg="bg-warning-50 dark:bg-warning-500/10"  />
      </div>
    </div>

    <div className="bg-card border border-border rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
      <div className="relative z-10 flex-1">
        <h3 className="text-xl font-bold text-foreground mb-1">Start Today's Session</h3>
        <p className="text-secondary-500 dark:text-slate-400 text-sm">
          Navigate to the Queue Board to start managing the active vaccination queue.
        </p>
      </div>
      <Link to="/dashboard/queue" className="relative z-10 shrink-0">
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl hover:-translate-y-1 hover:shadow-lg transition-all flex items-center gap-2">
          Open Queue Board <FiArrowRight />
        </button>
      </Link>
    </div>
    </div>
  );
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({ totalPatients: 0, activeClinics: 0, hospitals: 0, lowStock: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [apptsRes, clinicsRes, hospRes, invRes] = await Promise.all([
          getAllAppointments().catch(() => ({ data: { data: [] } })),
          clinicApi.getClinics().catch(() => ({ success: false, data: [] })),
          hospitalApi.getHospitals().catch(() => ({ success: false, data: [] })),
          inventoryApi.getLowStock().catch(() => ({ data: [] }))
        ]);

        const allAppts = apptsRes.data?.data || [];
        const uniquePatients = new Set(allAppts.map(a => a.userId?._id || a.userId)).size;
        
        setStats({
          totalPatients: uniquePatients || allAppts.length,
          activeClinics: clinicsRes.success ? clinicsRes.data.length : 0,
          hospitals: hospRes.success ? hospRes.data.length : 0,
          lowStock: invRes.data ? invRes.data.length : 0
        });
      } catch (error) {
        console.error("Failed to load admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-primary-500/10 via-transparent to-transparent border border-primary-500/10 overflow-hidden shadow-sm">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-400/20 rounded-full blur-[80px] pointer-events-none" />
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight relative z-10 mb-2 flex items-center gap-3">
          System Admin — <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-secondary-600 dark:text-slate-400 text-base md:text-lg relative z-10 font-medium">
          Complete system overview, resource management, and global metrics control.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiUsers}        label="Total Patients" value={loading ? '—' : stats.totalPatients} color="text-primary-600 dark:text-primary-400"  bg="bg-primary-50 dark:bg-primary-500/10"  />
        <StatCard icon={FiCalendar}     label="Active Clinics" value={loading ? '—' : stats.activeClinics} color="text-success-600 dark:text-success-400"  bg="bg-success-50 dark:bg-success-500/10"  />
        <StatCard icon={FiActivity}     label="Hospitals"      value={loading ? '—' : stats.hospitals} color="text-warning-600 dark:text-warning-400"  bg="bg-warning-50 dark:bg-warning-500/10"  />
        <StatCard icon={FiAlertCircle}  label="Low Stock Alert" value={loading ? '—' : stats.lowStock} color="text-danger-600 dark:text-danger-400"  bg="bg-danger-50 dark:bg-danger-500/10"  />
      </div>

    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Management Modules</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickAction icon={FiUsers}       label="All Appointments"  to="/dashboard/appointments"        color="text-primary-600 dark:text-primary-400"  bg="bg-primary-50 dark:bg-primary-500/10"   />
        <QuickAction icon={FiCalendar}    label="Hospitals"         to="/dashboard/hospitals"           color="text-success-600 dark:text-success-400"  bg="bg-success-50 dark:bg-success-500/10"   />
        <QuickAction icon={FiActivity}    label="Clinics"           to="/dashboard/clinics"             color="text-warning-600 dark:text-warning-400"  bg="bg-warning-50 dark:bg-warning-500/10"   />
        <QuickAction icon={FiAlertCircle} label="Inventory Alerts"  to="/dashboard/inventory"           color="text-danger-500 dark:text-danger-400"    bg="bg-danger-50 dark:bg-danger-500/10"     />
      </div>
    </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  if (user.role === 'Admin') return <AdminDashboard user={user} />;
  if (user.role === 'HospitalStaff') return <StaffDashboard user={user} />;
  return <PublicDashboard user={user} />;
};

export default DashboardPage;
