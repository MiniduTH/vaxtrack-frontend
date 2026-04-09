import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './components/layout';
import { 
  HospitalsPage, ClinicsPage, NotFoundPage, RecordsPage, 
  HistoryPage, MySideEffectsPage, AdminSideEffectsPage,
  LoginPage, RegisterPage, DependentsPage, VaccinesPage,
  BatchesPage, InventoryDashboard, AppointmentsPage 
} from './pages';
import useAuthStore from './store/useAuthStore';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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
        {/* Simple redirect based on auth state */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard/hospitals" : "/login"} replace />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard/hospitals" replace />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard/hospitals" replace />} />

        {/* Dashboard Layout wrapper */}
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
           <Route path="hospitals" element={<HospitalsPage />} />
           <Route path="clinics" element={<ClinicsPage />} />
           <Route path="records" element={<RecordsPage />} />
           <Route path="history" element={<HistoryPage />} />
           <Route path="side-effects" element={<MySideEffectsPage />} />
           <Route path="side-effects/admin" element={<AdminSideEffectsPage />} />
           <Route path="dependents" element={<DependentsPage />} />
           <Route path="vaccines" element={<VaccinesPage />} />
           <Route path="inventory/batches" element={<BatchesPage />} />
           <Route path="inventory/low-stock" element={<InventoryDashboard />} />
           <Route path="appointments" element={<AppointmentsPage />} />
           <Route path="find-hospitals" element={<HospitalsPage />} />

           {/* Fallback dashboard route */}
           <Route index element={<Navigate to="hospitals" replace />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
