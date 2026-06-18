import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import Spinner from '@/components/shared/spinner/Spinner';
import { usePermissions } from '@/context/TenantContext/permissions';

const TenantProtectedRoute = ({ children, permission = null, anyOf = null }) => {
  const { isAuthenticated, isLoading, user } = useTenantAuth();

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

  return children;
};

export default TenantProtectedRoute;
