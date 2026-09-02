import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import Spinner from '@/components/shared/spinner/Spinner';
import { usePermissions } from '@/context/TenantContext/permissions';
import SubscriptionLockedNotice from './SubscriptionLockedNotice';

// Tenant-guard Spatie roles that can manage the school's subscription — same
// list as config/subscription.php's admin_roles on the backend.
const ADMIN_TIER_ROLES = ['super_admin', 'school_admin', 'school_owner', 'school_head'];

const TenantProtectedRoute = ({ children, permission = null, anyOf = null }) => {
  const { isAuthenticated, isLoading, user, roles, subscriptionStatus } = useTenantAuth();

  const { can, canAny } = usePermissions();

  const location = useLocation();

  if (isLoading) {
    return <Spinner />;
  }

  const hostname = window.location.hostname;
  const backendHost = import.meta.env.VITE_API_BASE_URL_LOCAL;
  const centralHost = import.meta.env.VITE_API_BASE_URL
    ? new URL(import.meta.env.VITE_API_BASE_URL).hostname
    : new URL(backendHost).hostname;

  const isTenantSubdomain =
    hostname !== centralHost && hostname !== 'localhost' && hostname !== '127.0.0.1';

  if (!isAuthenticated || !user || !isTenantSubdomain) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !can(permission)) {
    return <Navigate to="/auth/404" replace />;
  }

  if (anyOf && !canAny(anyOf)) {
    return <Navigate to="/auth/404" replace />;
  }

  // Subscription locked (past the free grace period, no active
  // subscription): admin-tier roles still see every real page — the backend
  // gates their actual actions, with a specific reason. Everyone else is
  // limited to the dashboard and gets a deliberately generic notice here.
  const isAdminTier = Array.isArray(roles) &&
    roles.some((r) => ADMIN_TIER_ROLES.includes(typeof r === 'string' ? r : r?.name));
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  if (subscriptionStatus?.tier === 'locked' && !isAdminTier && !isDashboardRoute) {
    return <SubscriptionLockedNotice />;
  }

  return children;
};

export default TenantProtectedRoute;
