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
  const centralHost = import.meta.env.VITE_API_BASE_URL 
    ? new URL(import.meta.env.VITE_API_BASE_URL).hostname 
    : 'basic_v2.test';
    
  const isTenantSubdomain = hostname !== centralHost && hostname !== 'localhost' && hostname !== '127.0.0.1';

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default TenantProtectedRoute;
