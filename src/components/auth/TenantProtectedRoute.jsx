import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useTenantAuth } from '../../hooks/useTenantAuth';
import Spinner from '../../views/spinner/Spinner';

const TenantProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useTenantAuth();
  const location = useLocation();

  if (isLoading) {
    return <Spinner />;
  }

  const hostname = window.location.hostname;
  const centralDomain = 'basic_v2.test';
  const isTenantSubdomain = hostname.endsWith(centralDomain) && hostname !== centralDomain;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default TenantProtectedRoute;
