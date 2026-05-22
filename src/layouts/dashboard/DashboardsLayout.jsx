import React from 'react';
import { Outlet } from 'react-router-dom';
import LandlordProtectedRoute from '@/components/protectedroutes/LandlordProtectedRoute';

const DashboardsLayout = () => {
  return (
    <LandlordProtectedRoute>
      <div>
        <Outlet />
      </div>
    </LandlordProtectedRoute>
  );
};

export default DashboardsLayout;
