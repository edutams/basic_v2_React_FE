import React from 'react';
import { Box, useTheme } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import DashboardHeader from '@/pages/tenant/school-dashboard/AdminDashboard/components/DashboardHeader';

import ClassesOverview from './components/ClassesOverview';
import QuickActions from './components/QuickActions';
import Analytics from './components/Analytics';
import ActivityLog from './components/ActivityLog';
import StatCards from './components/StatCards';

export default function TeacherDashboard() {
  const theme = useTheme();

  return (
    <PageContainer title="Teacher Dashboard" description="Teaching staff portal">


      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.3 }}>
        <StatCards />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' },
            gap: 1.3,
            alignItems: 'start',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.3, minWidth: 0 }}>
            <ClassesOverview />
            <Analytics />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.3, minWidth: 0 }}>
            <QuickActions />
            <ActivityLog />
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}