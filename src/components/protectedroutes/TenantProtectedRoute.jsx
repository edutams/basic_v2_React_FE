import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import Spinner from '@/components/shared/spinner/Spinner';
import { usePermissions } from '@/context/TenantContext/permissions';
import { isSubscriptionOwner } from '@/utils/roleLabels';

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
  // subscription): SchoolLayout itself already swaps in a full-page,
  // nav-less AccountLockedScreen for anyone who isn't admin-tier, for every
  // route — so by the time this runs, we're always either not locked, or
  // locked-but-admin-tier. The one thing still handled here is the
  // Dashboard special case: the subscription OWNER roles (school_admin/
  // school_owner/school_head — narrower than admin-tier, excludes bursar/
  // super_admin) land on a dashboard they can't act on, so send them
  // straight to /subscriptions instead.
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const isLocked = subscriptionStatus?.tier === 'locked';

  if (isLocked && isDashboardRoute && isSubscriptionOwner(roles)) {
    return <Navigate to="/subscriptions" replace />;
  }

  return children;
};

export default TenantProtectedRoute;
