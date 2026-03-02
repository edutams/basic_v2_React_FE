import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const PermissionGate = ({ children, permissions = [], all = false }) => {
  const { user } = useAuth();
  
  // If no permissions are required, allow access
  if (!permissions || permissions.length === 0) {
    return <>{children}</>;
  }

  // Super admin has all permissions
  if (user?.is_super_admin) {
    return <>{children}</>;
  }

  const userPermissions = user?.permissions || [];

  const hasPermission = all
    ? permissions.every((p) => userPermissions.includes(p))
    : permissions.some((p) => userPermissions.includes(p));

  if (hasPermission) {
    return <>{children}</>;
  }

  return null;
};

export default PermissionGate;
