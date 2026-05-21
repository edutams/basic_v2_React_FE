import React from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/LandlordProtectedRoute';

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
