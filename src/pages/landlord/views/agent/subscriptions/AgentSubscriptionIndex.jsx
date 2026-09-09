import React, { useState, useEffect, useCallback } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import {
  IconListNumbers,
  IconClockHour4,
  IconCircleCheck,
  IconCircleX,
} from '@tabler/icons-react';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import MiniStat from '@/components/shared/stats/MiniStat';
import LiveStatusBar from '@/components/shared/stats/LiveStatusBar';
import axios from '@/api/landlord/landlord_api';
import AgentSubscriptionList from './AgentSubscriptionList';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Subscriptions',
  },
];

const AUTO_REFRESH_MS = 30000;

const AgentSubscriptionIndex = () => {
  const [value, setValue] = useState(0);
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, expired: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setStatsLoading(true);
    try {
      const res = await axios.get('/v1/landlord/subscriptions/stats');
      if (res.data.status === 'success') {
        setStats(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch subscription stats', error);
    } finally {
      if (!silent) setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Real-time-ish polling so the stats row stays current without a manual
    // reload — "silent" so it doesn't flash the skeleton loader every tick.
    const id = setInterval(() => fetchStats(true), AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchStats]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <PageContainer title="Tenant Subscriptions" description="Manage tenant subscription requests">
      <Breadcrumb title="Tenant Subscriptions" items={BCrumb} />

      {/* Page-level live stats */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
        <MiniStat label="Total Requests" value={stats.total} loading={statsLoading} icon={IconListNumbers} />
        <MiniStat
          label="Pending"
          value={stats.pending}
          loading={statsLoading}
          color="warning.main"
          icon={IconClockHour4}
        />
        <MiniStat
          label="Active"
          value={stats.active}
          loading={statsLoading}
          color="success.main"
          icon={IconCircleCheck}
        />
        <MiniStat
          label="Expired"
          value={stats.expired}
          loading={statsLoading}
          color="error.main"
          icon={IconCircleX}
        />
        <LiveStatusBar loading={statsLoading} lastUpdated={lastUpdated} onRefresh={() => fetchStats()} />
      </Box>

      <ParentCard sx={{ px: 0.5, py: 0, '& .MuiCardContent-root': { p: 0, pt: 0 } }}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2}}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="subscription tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All Requests" id="tab-0" />
              <Tab label="Pending" id="tab-1" />
              <Tab label="Active" id="tab-2" />
              <Tab label="Expired" id="tab-3" />
            </Tabs>
          </Box>
          <Box>
            {value === 0 && <AgentSubscriptionList status="" onMutate={fetchStats} />}
            {value === 1 && <AgentSubscriptionList status="pending" onMutate={fetchStats} />}
            {value === 2 && <AgentSubscriptionList status="active" onMutate={fetchStats} />}
            {value === 3 && <AgentSubscriptionList status="expired" onMutate={fetchStats} />}
          </Box>
        </Box>
      </ParentCard>
    </PageContainer>
  );
};

export default AgentSubscriptionIndex;
