import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import type { RoleName } from '@hrms/shared';

/* ─────────────────────────────────────────────────────────────
   Route-level role access control.
   Defines which roles can access each route path.
   Routes not listed here are accessible to all authenticated users.
   ───────────────────────────────────────────────────────────── */
const ROUTE_ROLE_MAP: Record<string, RoleName[]> = {
  '/employees':    ['super_admin', 'hr_admin', 'manager'],
  '/attendance':   ['super_admin', 'hr_admin', 'manager'],
  '/payroll':      ['super_admin', 'hr_admin', 'finance'],
  '/recruitment':  ['super_admin', 'hr_admin', 'recruiter'],
  '/onboarding':   ['super_admin', 'hr_admin', 'manager'],
  '/performance':  ['super_admin', 'hr_admin', 'manager'],
  '/analytics':    ['super_admin', 'hr_admin', 'manager'],
  '/assets':       ['super_admin', 'it_admin'],
  '/monitoring':   ['super_admin', 'hr_admin'],
  '/settings':     ['super_admin', 'hr_admin', 'it_admin'],
};

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  /* Check if the current route has role restrictions */
  const userRole: RoleName = user?.role ?? 'employee';
  const matchedRoute = Object.keys(ROUTE_ROLE_MAP).find((prefix) =>
    location.pathname.startsWith(prefix)
  );

  if (matchedRoute) {
    const allowedRoles = ROUTE_ROLE_MAP[matchedRoute];
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      /* Redirect unauthorised users to dashboard instead of showing admin pages */
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <DashboardLayout />;
};

export default ProtectedRoute;
