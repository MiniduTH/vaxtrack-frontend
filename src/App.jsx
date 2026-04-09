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

// Role-based Route wrapper
const RoleRoute = ({ children, allowedRoles }) => {
  const user = useAuthStore((state) => state.user);
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const DashboardIndex = () => {
  const user = useAuthStore((state) => state.user);
  if (user?.role === 'Admin') return <Navigate to="hospitals" replace />;
  if (user?.role === 'HospitalStaff') return <Navigate to="clinics" replace />;
  return <Navigate to="appointments" replace />;
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
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />

        {/* Dashboard Layout wrapper */}
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
           <Route path="hospitals" element={<RoleRoute allowedRoles={['Admin', 'Public']}><HospitalsPage /></RoleRoute>} />
           <Route path="clinics" element={<RoleRoute allowedRoles={['Admin', 'HospitalStaff', 'Public']}><ClinicsPage /></RoleRoute>} />
           <Route path="records" element={<RecordsPage />} />
           <Route path="history" element={<RoleRoute allowedRoles={['Public']}><HistoryPage /></RoleRoute>} />
           <Route path="side-effects" element={<RoleRoute allowedRoles={['Public']}><MySideEffectsPage /></RoleRoute>} />
           <Route path="side-effects/admin" element={<RoleRoute allowedRoles={['Admin', 'HospitalStaff']}><AdminSideEffectsPage /></RoleRoute>} />
           <Route path="dependents" element={<RoleRoute allowedRoles={['Public']}><DependentsPage /></RoleRoute>} />
           <Route path="vaccines" element={<RoleRoute allowedRoles={['Admin', 'HospitalStaff', 'Public']}><VaccinesPage /></RoleRoute>} />
           <Route path="inventory/batches" element={<RoleRoute allowedRoles={['Admin', 'HospitalStaff']}><BatchesPage /></RoleRoute>} />
           <Route path="inventory/low-stock" element={<RoleRoute allowedRoles={['Admin', 'HospitalStaff']}><InventoryDashboard /></RoleRoute>} />
           <Route path="appointments" element={<AppointmentsPage />} />
           <Route path="find-hospitals" element={<RoleRoute allowedRoles={['Public', 'Admin', 'HospitalStaff']}><HospitalsPage /></RoleRoute>} />
           <Route path="users" element={<RoleRoute allowedRoles={['Admin']}><div className="p-8"><h1>User Management</h1><p>Under construction based on Milestone</p></div></RoleRoute>} />
           <Route path="settings" element={<div className="p-8"><h1>Settings</h1><p>Under construction</p></div>} />
           <Route path="profile" element={<div className="p-8"><h1>My Profile</h1><p>Under construction</p></div>} />

           {/* Fallback dashboard route */}
           <Route index element={<DashboardIndex />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
