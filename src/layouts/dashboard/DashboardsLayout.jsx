import React from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const DashboardsLayout = () => {
  return (
    <ProtectedRoute>
      <div>
        <Outlet />
      </div>
    </ProtectedRoute>
  );
};

export default DashboardsLayout;
