import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './components/layout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import {
  HospitalsPage,
  ClinicsPage,
  NotFoundPage,
  DashboardPage,
  AppointmentsPage,
  BookAppointmentPage,
  QueueBoardPage,
} from './pages';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';


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

          {/* ── Nethmi's routes ── */}
          <Route path="hospitals" element={<HospitalsPage />} />
          <Route path="clinics"   element={<ClinicsPage />} />

          {/* ── Saniru's routes — Appointments ── */}
          <Route path="appointments"      element={<AppointmentsPage />} />
          <Route path="appointments/book" element={<BookAppointmentPage />} />

          {/* Queue board: accessible by HospitalStaff and Admin */}
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
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
