import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './components/layout';
import { HospitalsPage, ClinicsPage, NotFoundPage, RecordsPage, HistoryPage, MySideEffectsPage, AdminSideEffectsPage } from './pages';
import DueVaccinationsWidget from './components/dashboard/DueVaccinationsWidget';

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
        {/* Simple redirect for now */}
        <Route path="/" element={<Navigate to="/dashboard/hospitals" replace />} />
        
        {/* Dashboard Layout wrapper */}
        <Route path="/dashboard" element={<MainLayout />}>
           <Route path="hospitals" element={<HospitalsPage />} />
           <Route path="clinics" element={<ClinicsPage />} />
           <Route path="records" element={<RecordsPage />} />
           <Route path="history" element={<HistoryPage />} />
           <Route path="side-effects" element={<MySideEffectsPage />} />
           <Route path="side-effects/admin" element={<AdminSideEffectsPage />} />
           {/* Fallback dashboard route */}
           <Route index element={<Navigate to="/dashboard/hospitals" replace />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
