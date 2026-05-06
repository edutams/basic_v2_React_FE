import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTenantAuth } from '../../hooks/useTenantAuth';
import Spinner from '../../views/spinner/Spinner';

const ParentProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useTenantAuth();
  const location = useLocation();

  if (isLoading) return <Spinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // roles may come back as array of strings ["parent","user"] or objects [{name:"parent"}]
  const hasParentRole = isParent ||
    (Array.isArray(roles) && roles.some((r) => (typeof r === 'string' ? r : r?.name) === 'parent'));

  if (!hasParentRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ParentProtectedRoute;
