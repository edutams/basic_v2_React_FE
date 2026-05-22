import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Spinner from '@/components/shared/spinner/Spinner';
import { usePermissions } from '@/context/AgentContext/permissions';

const LandlordProtectedRoute = ({ children, permission = null, anyOf = null }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  const { can, canAny } = usePermissions();

  const location = useLocation();

  if (isLoading) {
    return <Spinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/agent/login" state={{ from: location }} replace />;
  }

  if (permission && !can(permission)) {
    return <Navigate to="/auth/404" replace />;
  }

  if (anyOf && !canAny(anyOf)) {
    return <Navigate to="/auth/404" replace />;
  }

  return children;
};

export default LandlordProtectedRoute;
