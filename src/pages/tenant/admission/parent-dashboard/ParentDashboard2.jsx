import React, { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import { TenantAuthContext } from '@/context/TenantContext/auth';

import MyWards from './component/my-wards';
import Analytics from './component/analytics';
import QuickActions from './component/quick-actions';
import Notifications from './component/notifications';
import CommunicationCenter from './component/communication-center';

const ParentDashboard2 = () => {
  const { user } = useContext(TenantAuthContext);
  const userName = user?.name || 'Mrs. Adenubi';

  return (
    <PageContainer title="Parent Dashboard" description="Parent portal">
      {/* Greeting */}
      <Box mb={2}>
        <Typography fontWeight="800" sx={{ fontSize: '1.4rem', color: '#111827', lineHeight: 1.2 }}>
          Good morning, {userName} 👋
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: '#6B7280', mt: 0.5 }}>
          Here's what's happening with your wards today.
        </Typography>
      </Box>

      {/* Two-column dashboard layout */}
      <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
        {/* ─── MAIN CONTENT (left, ~70%) ─── */}
        <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
          <MyWards />
          <Analytics />
          <CommunicationCenter />
        </Box>

        {/* ─── RIGHT SIDEBAR (~290px fixed) ─── */}
        <Box sx={{ width: 290, flexShrink: 0 }}>
          <QuickActions />
          <Notifications />
        </Box>
      </Box>
    </PageContainer>
  );
};

export default ParentDashboard2;
