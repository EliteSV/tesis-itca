import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasAnyRole, user } = useAuth();
  const location = useLocation();
  const isSettingsPage = location.pathname === '/settings';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (
    user?.isTemporaryPassword &&
    user?.role === 'estudiante' &&
    !isSettingsPage
  ) {
    return <Navigate to="/settings?changePassword=true" replace />;
  }

  if (
    user?.isProfileIncomplete &&
    user?.role === 'estudiante' &&
    !isSettingsPage
  ) {
    return <Navigate to="/settings" replace />;
  }

  return <>{children}</>;
}





