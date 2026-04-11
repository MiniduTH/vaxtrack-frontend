import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './components/layout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import useAuthStore from './store/useAuthStore';
import {
  // Shared
  NotFoundPage,

  // Saniru — Appointments & Dashboard
  DashboardPage,
  AppointmentsPage,
  BookAppointmentPage,
  QueueBoardPage,
  QRScannerPage,

  // Nethmi — Hospitals & Clinics
  HospitalsPage,
  ClinicsPage,

  // Kaveen — Records, Dependents, Side Effects, Profile
  RecordsPage,
  DependentsPage,
  MySideEffectsPage,
  AdminSideEffectsPage,
  ProfilePage,

  // Minidu — Vaccines, Batches, Inventory
  VaccinesPage,
  BatchesPage,
  InventoryDashboard,
  HistoryPage,
} from './pages';
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

/**
 * Gateway component for /dashboard/side-effects.
 * Staff and Admin are silently redirected to the admin monitoring page.
 * Public patients see their own reporting form.
 */
const SideEffectsGateway = () => {
  const user = useAuthStore((state) => state.user);
  if (user?.role === 'HospitalStaff' || user?.role === 'Admin') {
    return <Navigate to="/dashboard/side-effects/admin" replace />;
  }
  return <MySideEffectsPage />;
};

function App() {

  return (
    <BrowserRouter>
      {/* Global Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass dark:bg-slate-900 dark:text-white border border-border shadow-medium rounded-xl',
          duration: 4000,
          style: {
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />

      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── Public routes (no auth required) ── */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Protected layout — all authenticated routes live here ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard home */}
          <Route index element={<DashboardPage />} />

          {/* ── Nethmi — Hospitals & Clinics ── */}
          <Route path="hospitals" element={<HospitalsPage />} />
          <Route path="clinics"   element={<ClinicsPage />} />

          {/* ── Saniru — Appointments ── */}
          <Route path="appointments"      element={<AppointmentsPage />} />
          <Route path="appointments/book" element={<BookAppointmentPage />} />

          {/* Queue board: HospitalStaff and Admin only */}
          <Route
            path="queue"
            element={
              <RoleRoute roles={['HospitalStaff', 'Admin']}>
                <QueueBoardPage />
              </RoleRoute>
            }
          />
          <Route
            path="queue/:clinicId"
            element={
              <RoleRoute roles={['HospitalStaff', 'Admin']}>
                <QueueBoardPage />
              </RoleRoute>
            }
          />

          {/* QR Scanner: Staff/Admin only */}
          <Route
            path="scan"
            element={
              <RoleRoute roles={['HospitalStaff', 'Admin']}>
                <QRScannerPage />
              </RoleRoute>
            }
          />

          {/* ── Kaveen — Records, Dependents, Side Effects, Profile ── */}
          <Route path="records"    element={<RecordsPage />} />
          <Route path="dependents" element={<DependentsPage />} />
          <Route path="profile"    element={<ProfilePage />} />

          {/* Side effects: auto-redirect Staff/Admin to the admin view */}
          <Route
            path="side-effects"
            element={<SideEffectsGateway />}
          />
          <Route
            path="side-effects/admin"
            element={
              <RoleRoute roles={['HospitalStaff', 'Admin']}>
                <AdminSideEffectsPage />
              </RoleRoute>
            }
          />

          {/* ── Minidu — Vaccines, Batches, Inventory ── */}
          <Route
            path="vaccines"
            element={
              <RoleRoute roles={['Admin']}>
                <VaccinesPage />
              </RoleRoute>
            }
          />
          <Route
            path="batches"
            element={
              <RoleRoute roles={['HospitalStaff', 'Admin']}>
                <BatchesPage />
              </RoleRoute>
            }
          />
          <Route
            path="inventory"
            element={
              <RoleRoute roles={['HospitalStaff', 'Admin']}>
                <InventoryDashboard />
              </RoleRoute>
            }
          />
          <Route path="history" element={<HistoryPage />} />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
