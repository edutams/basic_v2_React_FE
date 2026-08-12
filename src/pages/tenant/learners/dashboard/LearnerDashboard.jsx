import React, { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import { TenantAuthContext } from '@/context/TenantContext/auth';

import StatCards from './component/statcard';
import Analytics from './component/analytics';
import RightPanel from './component/rightpanel';
import QuickActions from './component/quickactions';

const LearnerDashboard = () => {
  const { user } = useContext(TenantAuthContext);
  const userName = user?.name || 'Alex Johnson';

  return (
    <PageContainer title="Student Dashboard" description="Student portal">
      {/* Greeting Header */}
      <Box mb={2}>
        <Typography
          fontWeight="800"
          sx={{
            fontSize: { xs: '1.15rem', md: '1.4rem' },
            color: '#111827',
            lineHeight: 1.2,
          }}
        >
          Welcome back, {userName} 👋
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', color: '#6B7280', mt: 0.3 }}>
          Here is your academic overview and upcoming activities.
        </Typography>
      </Box>

      {/* Top Stat Cards Section (Wallet card wider) */}
      <StatCards />

      {/* Main Grid: Left 2x2 Analytics vs Right Side Sidebar Panel */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        {/* Main Content Area (Analytics 2x2 grid: Academic & Attendance side-by-side; Results & Assignment side-by-side) */}
        <Box sx={{ flex: '1 1 0', minWidth: 0, width: { xs: '100%', lg: 'auto' } }}>
          <Analytics />
        </Box>

        {/* Right Sidebar (Notifications & Events stacked) */}
        <Box
          sx={{
            width: { xs: '100%', lg: 310 },
            flexShrink: 0,
          }}
        >
          <RightPanel />
        </Box>
      </Box>

      {/* Bottom Quick Actions Section (Full width underneath main section) */}
      <QuickActions />
    </PageContainer>
  );
};

export default LearnerDashboard;