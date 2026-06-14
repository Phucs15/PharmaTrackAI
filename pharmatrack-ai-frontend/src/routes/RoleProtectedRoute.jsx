import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function RoleProtectedRoute({ allowedRoles }) {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
