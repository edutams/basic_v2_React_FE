import React, { useState, useEffect, useCallback } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { IconListNumbers, IconSchool, IconBuilding, IconCircleCheck } from '@tabler/icons-react';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import MiniStat from '@/components/shared/stats/MiniStat';
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

const AgentSubscriptionIndex = () => {
  const [value, setValue] = useState(0);
  const [stats, setStats] = useState({ total: 0, active: 0, secondary: 0, primary: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [subscriptionCharges, setSubscriptionCharges] = useState('0');

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await axios.get('/v1/landlord/subscriptions/stats/school-type');
      if (res.data.status === 'success') {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription stats', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const loadSubscriptionCharges = async () => {
      try {
        const res = await axios.get('/v1/landlord/subscriptions/subscription-charges');
        setSubscriptionCharges(res?.data?.data?.subscription_charges || '0');
      } catch (error) {
        console.error('Failed to fetch subscription charges', error);
      }
    };
    loadSubscriptionCharges();
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <PageContainer title="Tenant Subscriptions" description="Manage tenant subscription requests">
      <Breadcrumb title="Tenant Subscriptions" items={BCrumb} />

      {/* Page-level stats — same set the tenant side shows on its own subscriptions page */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
        <MiniStat label="Total Requests" value={stats.total} loading={statsLoading} icon={IconListNumbers} />
        <MiniStat
          label="Active"
          value={stats.active}
          loading={statsLoading}
          color="success.main"
          icon={IconCircleCheck}
        />
        <MiniStat
          label="Secondary"
          value={stats.secondary}
          loading={statsLoading}
          color="warning.main"
          icon={IconSchool}
        />
        <MiniStat
          label="Primary"
          value={stats.primary}
          loading={statsLoading}
          color="info.main"
          icon={IconBuilding}
        />
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
            </Tabs>
          </Box>
          <Box>
            {value === 0 && (
              <AgentSubscriptionList status="" onMutate={fetchStats} subscriptionCharges={subscriptionCharges} />
            )}
            {value === 1 && (
              <AgentSubscriptionList status="pending" onMutate={fetchStats} subscriptionCharges={subscriptionCharges} />
            )}
            {value === 2 && (
              <AgentSubscriptionList status="active" onMutate={fetchStats} subscriptionCharges={subscriptionCharges} />
            )}
          </Box>
        </Box>
      </ParentCard>
    </PageContainer>
  );
};

export default AgentSubscriptionIndex;
