import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import ProtectedRoute from './ProtectedRoute';

/**
 * Wraps ProtectedRoute and additionally guards by user role.
 * 
 * @param {string[]} roles - Allowed roles e.g. ['Admin', 'HospitalStaff']
 * @param {ReactNode} children - Child component to render if authorised
 * 
 * Usage:
 *   <RoleRoute roles={['Admin']}>
 *     <AdminOnlyPage />
 *   </RoleRoute>
 */

const RoleRoute = ({ roles, children }) => {
  const { user } = useAuthStore();

  // First ensure authenticated via ProtectedRoute wrapper
  return (
    <ProtectedRoute>
      {user && roles.includes(user.role) ? (
        children
      ) : (
        // Redirect to dashboard if authenticated but wrong role
        <Navigate to="/dashboard" replace />
      )}
    </ProtectedRoute>
  );
};

export default RoleRoute;
